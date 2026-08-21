"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { checkoutSale } from "@/actions/pos"
import { getPendingTransactions, getPendingCount, setPendingTransactions, savePendingTransaction } from "@/lib/adapters/offlineQueueAdapter"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { IconHome, IconCatalog, IconCash, IconMinus, IconPlus, IconTrash } from "@/components/ui/Icons"

type Product = {
  id: string
  name: string
  sellPrice: number
}

type CartItem = Product & { quantity: number }

export default function KasirClient({ products }: { products: Product[] }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [syncCount, setSyncCount] = useState(0)
  const [showCartDetail, setShowCartDetail] = useState(false)

  const updateSyncCount = () => setSyncCount(getPendingCount())

  const total = cart.reduce((sum, item) => sum + (item.sellPrice * item.quantity), 0)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  // ─── Cart Mutations ───────────────────────────────────────
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === product.id)
      if (existing) {
        return prev.map(c => c.id === product.id ? { ...c, quantity: c.quantity + 1 } : c)
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const decreaseQuantity = (productId: string) => {
    setCart(prev => {
      const item = prev.find(c => c.id === productId)
      if (!item) return prev
      if (item.quantity <= 1) return prev.filter(c => c.id !== productId) // Auto-remove at 0
      return prev.map(c => c.id === productId ? { ...c, quantity: c.quantity - 1 } : c)
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(c => c.id !== productId))
  }
  // ─────────────────────────────────────────────────────────

  const syncTransactions = async () => {
    const queue = getPendingTransactions()
    if (queue.length === 0) return

    const remainingQueue = []
    for (const tx of queue) {
      try {
        const res = await checkoutSale(tx.cart, tx.total, tx.clientTransactionId)
        if (res?.error) {
          console.error("Sync error:", res.error)
          remainingQueue.push(tx)
        }
      } catch (e) {
        console.error("Network error during sync", e)
        remainingQueue.push(tx)
      }
    }
    setPendingTransactions(remainingQueue)
    updateSyncCount()
  }

  useEffect(() => {
    updateSyncCount()
    syncTransactions()
  }, [])

  const handleCheckout = async () => {
    if (cart.length === 0) return
    setIsProcessing(true)

    // 1. Buat UUID unik untuk Idempotency
    const clientTransactionId = crypto.randomUUID()

    const formattedCart = cart.map(c => ({
      productId: c.id,
      quantity: c.quantity,
      price: c.sellPrice
    }))

    // 2. Simpan ke Local Storage DULU melalui Adapter (Offline-First)
    const payload = { cart: formattedCart, total, clientTransactionId, timestamp: new Date().toISOString() }
    savePendingTransaction(payload)
    updateSyncCount()

    setCart([])
    setShowCartDetail(false)
    setIsProcessing(false)

    // 3. Coba Sinkronisasi Asinkron
    syncTransactions()
    alert("Transaksi tersimpan! (Offline & Sync)")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md md:max-w-3xl lg:max-w-5xl mx-auto relative">
      {/* Header */}
      <div className="bg-primary-700 text-white p-4 sticky top-0 z-20 flex justify-between items-center shadow-sm">
        <h1 className="text-lg font-bold">Kasir POS</h1>
        {syncCount > 0 && (
          <Badge variant="warning">Sync ({syncCount})</Badge>
        )}
      </div>

      {/* Product Grid */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto pb-52">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <IconCatalog className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-semibold">Katalog produk masih kosong.</p>
            <Link href="/katalog" className="text-primary-600 font-bold text-sm mt-2">Tambah Produk →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {products.map(prod => {
              const inCart = cart.find(c => c.id === prod.id)
              return (
                <button
                  key={prod.id}
                  onClick={() => addToCart(prod)}
                  className={`bg-white p-3.5 md:p-4 rounded-xl shadow-sm border text-left transition-all min-h-[72px] md:min-h-[88px] flex flex-col justify-between ${
                    inCart
                      ? "border-primary-400 ring-1 ring-primary-400 bg-primary-50"
                      : "border-gray-100 hover:border-primary-300 active:bg-primary-50"
                  }`}
                >
                  <p className="font-bold text-gray-900 leading-tight text-sm md:text-base mb-1.5 md:mb-2">{prod.name}</p>
                  <div className="flex justify-between items-center w-full">
                    <p className="text-sm md:text-base font-semibold text-primary-700">Rp {prod.sellPrice.toLocaleString("id-ID")}</p>
                    {inCart && (
                      <span className="bg-primary-700 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full">{inCart.quantity}</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Cart & Checkout Floating Bottom Sheet */}
      <div className="fixed bottom-[56px] md:bottom-[72px] left-0 right-0 w-full max-w-md md:max-w-3xl lg:max-w-5xl mx-auto px-4 md:px-6 z-10 left-1/2 -translate-x-1/2">
        <div className="bg-white rounded-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.12)] border border-gray-200">

          {/* Cart Detail (Expandable) */}
          {showCartDetail && cart.length > 0 && (
            <div className="px-4 md:px-6 pt-3 pb-2 border-b border-gray-100 max-h-48 md:max-h-72 overflow-y-auto">
              <div className="space-y-2 md:space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-2 md:gap-4">
                    <p className="flex-1 text-xs md:text-sm font-medium text-gray-800 leading-tight">{item.name}</p>
                    <p className="text-xs md:text-sm font-bold text-gray-500 shrink-0 w-20 text-right">Rp {(item.sellPrice * item.quantity).toLocaleString("id-ID")}</p>
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 md:gap-2 shrink-0">
                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                        aria-label="Kurangi"
                      >
                        <IconMinus className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-700" />
                      </button>
                      <span className="w-6 md:w-8 text-center text-xs md:text-sm font-bold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => addToCart(item)}
                        className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary-100 flex items-center justify-center hover:bg-primary-200 transition-colors"
                        aria-label="Tambah"
                      >
                        <IconPlus className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary-700" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-danger-50 flex items-center justify-center hover:bg-danger-100 transition-colors ml-1 md:ml-2"
                        aria-label="Hapus"
                      >
                        <IconTrash className="w-3.5 h-3.5 md:w-4 md:h-4 text-danger-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cart Summary Row */}
          <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4">
            <button
              onClick={() => setShowCartDetail(v => !v)}
              className="flex items-center gap-2 md:gap-4 flex-1 min-h-[44px] md:min-h-[56px] text-left hover:bg-gray-50 p-2 md:px-4 rounded-xl transition-colors"
              disabled={cart.length === 0}
            >
              <div className="bg-primary-100 rounded-lg w-9 h-9 md:w-12 md:h-12 flex items-center justify-center shrink-0">
                <IconCash className="w-5 h-5 md:w-6 md:h-6 text-primary-700" />
              </div>
              <div>
                {cart.length === 0 ? (
                  <p className="text-sm md:text-base text-gray-400 font-medium">Belum ada item</p>
                ) : (
                  <>
                    <p className="text-xs md:text-sm text-gray-500 font-medium">{totalItems} item dipilih</p>
                    <p className="text-base md:text-lg font-bold text-gray-900">Rp {total.toLocaleString("id-ID")}</p>
                  </>
                )}
              </div>
            </button>
            <Button
              onClick={handleCheckout}
              disabled={cart.length === 0 || isProcessing}
              variant="primary"
              className="shrink-0 shadow-md py-2 px-6 md:py-3 md:px-8 md:text-lg"
            >
              {isProcessing ? "Memproses..." : "Bayar"}
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full max-w-md md:max-w-3xl lg:max-w-5xl mx-auto bg-white border-t border-gray-100 flex justify-around py-2 md:py-3 z-20 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] left-1/2 -translate-x-1/2">
        <Link href="/" className="flex flex-col items-center text-gray-400 min-w-[56px] md:min-w-[72px] py-1 hover:bg-gray-50 rounded-lg transition-colors">
          <IconHome className="w-6 h-6 md:w-7 md:h-7" />
          <span className="text-[10px] md:text-xs font-semibold mt-1">Beranda</span>
        </Link>
        <Link href="/katalog" className="flex flex-col items-center text-gray-400 min-w-[56px] md:min-w-[72px] py-1 hover:bg-gray-50 rounded-lg transition-colors">
          <IconCatalog className="w-6 h-6 md:w-7 md:h-7" />
          <span className="text-[10px] md:text-xs font-semibold mt-1">Katalog</span>
        </Link>
        <Link href="/kasir" className="flex flex-col items-center text-primary-700 min-w-[56px] md:min-w-[72px] py-1 hover:bg-gray-50 rounded-lg transition-colors">
          <IconCash className="w-6 h-6 md:w-7 md:h-7" />
          <span className="text-[10px] md:text-xs font-bold mt-1">Kasir</span>
        </Link>
      </div>
    </div>
  )
}
