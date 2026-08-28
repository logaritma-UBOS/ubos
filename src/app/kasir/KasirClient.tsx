"use client"
import { formatNumber, formatRupiah } from '@/lib/format';

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { checkoutSale } from "@/actions/pos"
import { quickAddCustomer } from "@/actions/customer"
import { getPendingTransactions, getPendingCount, setPendingTransactions, savePendingTransaction } from "@/lib/adapters/offlineQueueAdapter"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { IconHome, IconCatalog, IconCash, IconMinus, IconPlus, IconTrash } from "@/components/ui/Icons"

type Product = {
  id: string
  name: string
  sellPrice: number
  imageUrl?: string | null
}

type CartItem = Product & { quantity: number }

type CheckoutStep = "CART" | "PAYMENT" | "SUCCESS"

type PaymentMethod = "CASH" | "QRIS" | "TRANSFER" | "DEBIT_CREDIT"

export default function KasirClient({ products, customers }: { products: any[], customers: any[] }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [syncCount, setSyncCount] = useState(0)
  const [showCartDetail, setShowCartDetail] = useState(false)

  // Payment State
  const [step, setStep] = useState<CheckoutStep>("CART")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH")
  const [paidAmount, setPaidAmount] = useState<number>(0)
  const [paidAmountText, setPaidAmountText] = useState<string>("")
  const [transactionSummary, setTransactionSummary] = useState<any>(null)
  
  // Customer State
  const [localCustomers, setLocalCustomers] = useState(customers)
  const [searchCustomer, setSearchCustomer] = useState("")
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  
  // Promo State
  const [promoCodeInput, setPromoCodeInput] = useState("")
  const [appliedPromo, setAppliedPromo] = useState<any>(null)
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)
  
  // Quick Add Customer State
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false)
  const [newCustomerName, setNewCustomerName] = useState("")
  const [newCustomerPhone, setNewCustomerPhone] = useState("")
  const [isAddingCustomer, setIsAddingCustomer] = useState(false)
  
  // Kasir POS Search State
  const [posSearch, setPosSearch] = useState('');
  
  const filteredPosItems = useMemo(() => {
    if (!posSearch.trim()) return products;
    return products.filter(item => 
      item.name.toLowerCase().includes(posSearch.toLowerCase())
    );
  }, [products, posSearch]);

  const filteredCustomers = localCustomers.filter((c: any) => 
    c.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
    (c.phone && c.phone.includes(searchCustomer))
  )

  const handleQuickAddCustomer = async () => {
    if (!newCustomerName) return alert("Nama pelanggan harus diisi")
    setIsAddingCustomer(true)
    try {
      const res = await quickAddCustomer(newCustomerName, newCustomerPhone)
      if (res.error) {
        alert(res.error)
      } else if (res.customer) {
        setLocalCustomers([...localCustomers, res.customer])
        setSelectedCustomerId(res.customer.id)
        setShowAddCustomerForm(false)
        setNewCustomerName("")
        setNewCustomerPhone("")
        setSearchCustomer("")
        setShowCustomerDropdown(false)
      }
    } catch (e) {
      alert("Terjadi kesalahan sistem")
    }
    setIsAddingCustomer(false)
  }

  useEffect(() => {
    setSyncCount(getPendingCount())
  }, [])

  const updateSyncCount = () => setSyncCount(getPendingCount())

  const subtotal = cart.reduce((sum, item) => sum + (item.sellPrice * item.quantity), 0)
  const total = Math.max(0, subtotal - promoDiscount)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  
  const handleApplyPromo = async () => {
    if (!promoCodeInput) return;
    setIsApplyingPromo(true);
    const { validatePromoCode } = await import("@/actions/promo");
    const res = await validatePromoCode(promoCodeInput, subtotal, selectedCustomerId || undefined);
    setIsApplyingPromo(false);
    
    if (res.error) {
      alert(res.error);
      setAppliedPromo(null);
      setPromoDiscount(0);
    } else {
      setAppliedPromo(res.promo);
      setPromoDiscount(res.discountAmount || 0);
    }
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoDiscount(0);
    setPromoCodeInput("");
  }
  
  // Update paid amount when total changes and payment method is not cash
  useEffect(() => {
    if (paymentMethod !== "CASH") {
      setPaidAmount(total)
    }
  }, [total, paymentMethod])

  // --- Cart Mutations ---
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id)
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p)
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const decreaseQuantity = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === productId)
      if (existing && existing.quantity > 1) {
        return prev.map(p => p.id === productId ? { ...p, quantity: p.quantity - 1 } : p)
      }
      return prev.filter(p => p.id !== productId)
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(p => p.id !== productId))
  }

  const handleUpdateQty = (productId: string, newQty: number) => {
    if (isNaN(newQty) || newQty <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prev => {
        const existing = prev.find(p => p.id === productId)
        if (existing) {
          return prev.map(p => p.id === productId ? { ...p, quantity: newQty } : p)
        }
        return prev
      })
    }
  };

  // --- Checkout Flow ---
  const syncTransactions = async () => {
    const queue = getPendingTransactions()
    if (queue.length === 0) return
    const newQueue = []
    for (const trx of queue) {
      try {
        const res = await checkoutSale(trx.cart, trx.clientTransactionId, trx.paymentMethod, trx.paidAmount, trx.customerId, trx.promoCode)
        if (res.error) {
          console.error("Gagal sinkronisasi", trx.clientTransactionId, res.error)
          newQueue.push(trx)
        }
      } catch (e) {
        newQueue.push(trx)
      }
    }
    setPendingTransactions(newQueue)
    updateSyncCount()
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return
    
    if (paymentMethod === "CASH" && paidAmount < total) {
      alert("Uang tunai kurang dari total belanja")
      return
    }

    setIsProcessing(true)
    const clientTransactionId = `trx-${Date.now()}-${Math.random().toString(36).substring(7)}`

    // Persiapkan data summary untuk success screen
    const summary = {
      clientTransactionId,
      date: new Date(),
      items: [...cart],
      total,
      paymentMethod,
      paidAmount: paymentMethod === "CASH" ? paidAmount : total,
      change: paymentMethod === "CASH" ? paidAmount - total : 0
    }

    try {
      // Coba online
      const mappedCart = cart.map(c => ({ productId: c.id, quantity: c.quantity, price: c.sellPrice }))
      const res = await checkoutSale(mappedCart, clientTransactionId, paymentMethod, paidAmount, selectedCustomerId || undefined, appliedPromo?.code)
      if (res.error) {
        alert(res.error)
        setIsProcessing(false)
        return
      }
    } catch (e) {
      // Jika offline, masuk queue
      savePendingTransaction({
        clientTransactionId,
        cart: cart.map(c => ({ productId: c.id, quantity: c.quantity, price: c.sellPrice })),
        totalAmount: total,
        paymentMethod,
        paidAmount,
        timestamp: new Date().toISOString(),
        customerId: selectedCustomerId || undefined,
        promoCode: appliedPromo?.code
      })
    }

    updateSyncCount()
    
    // Clear and Show Success
    setTransactionSummary(summary)
    setCart([])
    setShowCartDetail(false)
    setStep("SUCCESS")
    setIsProcessing(false)
    setPaidAmountText("")
    setPaidAmount(0)
    
    // Sinkronisasi asinkron
    syncTransactions()
  }

  const handleQuickCash = (amount: number) => {
    setPaidAmount(amount)
    setPaidAmountText(amount.toString())
  }

  const handlePaidAmountChange = (val: string) => {
    const num = parseInt(val.replace(/\D/g, "") || "0")
    setPaidAmountText(num ? num.toString() : "")
    setPaidAmount(num)
  }

  const resetToCart = () => {
    setStep("CART")
    setPaymentMethod("CASH")
    setTransactionSummary(null)
  }

  // --- RENDER VIEWS ---

  if (step === "SUCCESS" && transactionSummary) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col max-w-md md:max-w-2xl lg:max-w-3xl mx-auto px-4 py-8 relative">
        <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Transaksi Berhasil</h2>
          <p className="text-gray-500 mb-6 text-sm">{transactionSummary.clientTransactionId}</p>

          <div className="w-full border-t border-dashed border-gray-200 py-4 mb-4">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>Waktu</span>
              <span>{formatNumber(transactionSummary.date)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mb-3">
              <span>Metode</span>
              <span className="font-semibold text-gray-700">{transactionSummary.paymentMethod}</span>
            </div>
            
            <div className="space-y-3 mt-4">
              {transactionSummary.items.map((item: CartItem) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-gray-500">{item.quantity} x {formatRupiah(item.sellPrice)}</p>
                  </div>
                  <p className="font-medium text-gray-900 text-right">{formatRupiah((item.quantity * item.sellPrice))}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full bg-gray-50 rounded-2xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 font-medium">Subtotal</span>
              <span className="text-gray-900 font-semibold">{formatRupiah(transactionSummary.total)}</span>
            </div>
            {transactionSummary.paymentMethod === "CASH" && (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 font-medium">Tunai Diterima</span>
                  <span className="text-gray-900">{formatRupiah(transactionSummary.paidAmount)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-2">
                  <span className="text-gray-800 font-bold">Kembalian</span>
                  <span className="text-primary-700 font-bold text-lg">{formatRupiah(transactionSummary.change)}</span>
                </div>
              </>
            )}
            {transactionSummary.paymentMethod !== "CASH" && (
              <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-2">
                <span className="text-gray-800 font-bold">Total Pembayaran</span>
                <span className="text-primary-700 font-bold text-lg">{formatRupiah(transactionSummary.total)}</span>
              </div>
            )}
          </div>

          <div className="w-full flex flex-col gap-3">
            <Link 
              href={`/kasir/struk/${transactionSummary.clientTransactionId}`} 
              className="w-full py-4 text-lg rounded-xl text-center font-semibold bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              Cetak Struk
            </Link>
            <Button onClick={resetToCart} variant="primary" className="w-full py-4 text-lg rounded-xl">
              Transaksi Baru
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (step === "PAYMENT") {
    const isCashValid = paymentMethod !== "CASH" || paidAmount >= total;
    
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col max-w-md md:max-w-2xl lg:max-w-3xl mx-auto relative">
        <div className="bg-white border-b p-4 flex items-center gap-3 sticky top-0 z-20">
          <button onClick={() => setStep("CART")} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="text-lg font-bold">Pembayaran</h1>
        </div>
        
        <div className="flex-1 px-4 pt-4 md:px-6 md:pt-6 pb-32 md:pb-40 overflow-y-auto">
          {/* Order Total */}
          <div className="bg-primary-700 text-white rounded-2xl p-6 flex flex-col items-center justify-center mb-6 shadow-sm">
            <p className="text-primary-100 font-medium mb-1">Total Tagihan</p>
            <p className="text-4xl font-bold tracking-tight">{formatRupiah(total)}</p>
          </div>

          {/* Customer Picker */}
          <div className="mb-6 relative z-30">
            <h3 className="font-bold text-gray-800 mb-3">Pelanggan (Opsional)</h3>
            <div className="relative">
              {selectedCustomerId ? (
                <div className="flex items-center justify-between bg-primary-50 border border-primary-200 rounded-xl p-3">
                  <div>
                    <p className="font-bold text-primary-900">{localCustomers.find((c: any) => c.id === selectedCustomerId)?.name}</p>
                    <p className="text-sm text-primary-700">{localCustomers.find((c: any) => c.id === selectedCustomerId)?.phone || "Tanpa Nomor HP"}</p>
                  </div>
                  <button onClick={() => setSelectedCustomerId(null)} className="text-danger-500 font-medium hover:bg-danger-50 p-2 rounded-lg">Batal</button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={searchCustomer}
                    onChange={(e) => {
                      setSearchCustomer(e.target.value)
                      setShowCustomerDropdown(true)
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    placeholder="Cari nama atau nomor WA..."
                    className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {showCustomerDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-20">
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((c: any) => (
                          <div 
                            key={c.id} 
                            onClick={() => {
                              setSelectedCustomerId(c.id)
                              setShowCustomerDropdown(false)
                              setSearchCustomer("")
                            }}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          >
                            <p className="font-medium text-gray-900">{c.name}</p>
                            {c.phone && <p className="text-xs text-gray-500">{c.phone}</p>}
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-sm text-gray-500 text-center">Tidak ditemukan.</div>
                      )}
                      {/* Always show + Pelanggan Baru at the bottom if not showing form */}
                      {!showAddCustomerForm && (
                         <div className="p-3 bg-gray-50 border-t flex justify-between items-center text-sm">
                           <span className="text-gray-500">Bukan di daftar?</span>
                           <button onClick={() => setShowAddCustomerForm(true)} className="text-primary-600 font-medium">+ Pelanggan Baru</button>
                         </div>
                      )}
                      {showAddCustomerForm && (
                        <div className="p-4 bg-primary-50 border-t">
                          <p className="text-sm font-bold text-primary-900 mb-2">Tambah Pelanggan Baru</p>
                          <input 
                            type="text" 
                            placeholder="Nama Lengkap" 
                            value={newCustomerName}
                            onChange={e => setNewCustomerName(e.target.value)}
                            className="w-full text-sm border border-gray-200 rounded-lg p-2 mb-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          />
                          <input 
                            type="text" 
                            placeholder="Nomor WA (Opsional)" 
                            value={newCustomerPhone}
                            onChange={e => setNewCustomerPhone(e.target.value)}
                            className="w-full text-sm border border-gray-200 rounded-lg p-2 mb-3 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          />
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setShowAddCustomerForm(false)} className="text-xs text-gray-500 px-3 py-1">Batal</button>
                            <button 
                              onClick={handleQuickAddCustomer}
                              disabled={isAddingCustomer} 
                              className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
                            >
                              {isAddingCustomer ? "Menyimpan..." : "Simpan & Pilih"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  </>
                )}
              </div>
            </div>

            {/* Promo Section */}
            <div className="mb-6 relative z-10">
              <h3 className="font-bold text-gray-800 mb-3">Promo & Diskon</h3>
              {appliedPromo ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3">
                  <div>
                    <p className="font-bold text-green-900">Kode: {appliedPromo.code}</p>
                    <p className="text-sm text-green-700">Diskon: {formatRupiah(promoDiscount)}</p>
                  </div>
                  <button onClick={handleRemovePromo} className="text-danger-500 font-medium hover:bg-danger-50 p-2 rounded-lg">Hapus</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                    placeholder="Masukkan kode promo..."
                    className="flex-1 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 uppercase"
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={!promoCodeInput || isApplyingPromo}
                    className="bg-primary-600 text-white font-bold px-4 rounded-xl disabled:opacity-50"
                  >
                    {isApplyingPromo ? "Cek..." : "Terapkan"}
                  </button>
                </div>
              )}
            </div>
    
            {/* Payment Methods */}
            <h3 className="font-bold text-gray-800 mb-3">Metode Pembayaran</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {(["CASH", "QRIS", "TRANSFER", "DEBIT_CREDIT"] as PaymentMethod[]).map(method => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`py-3 px-2 rounded-xl border text-sm font-bold flex flex-col items-center gap-2 transition-all ${
                  paymentMethod === method 
                    ? "bg-primary-50 border-primary-500 text-primary-700 ring-1 ring-primary-500" 
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {method === "CASH" && <IconCash className="w-6 h-6" />}
                {method === "QRIS" && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" /></svg>}
                {method === "TRANSFER" && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>}
                {method === "DEBIT_CREDIT" && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>}
                <span>{method === "DEBIT_CREDIT" ? "Kartu" : method}</span>
              </button>
            ))}
          </div>

          {/* Cash Input Section */}
          {paymentMethod === "CASH" && (
            <div className="bg-white rounded-2xl border p-4 md:p-6 mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Uang Diterima (Rp)</label>
              <input
                type="text"
                inputMode="numeric"
                value={paidAmountText}
                onChange={(e) => handlePaidAmountChange(e.target.value)}
                placeholder="0"
                className="w-full text-2xl md:text-3xl font-bold bg-gray-50 border border-gray-200 rounded-xl p-3 md:p-4 mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button onClick={() => handleQuickCash(total)} className="py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-800 transition-colors">Uang Pas</button>
                <button onClick={() => handleQuickCash(20000)} className="py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-800 transition-colors">20.000</button>
                <button onClick={() => handleQuickCash(50000)} className="py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-800 transition-colors">50.000</button>
                <button onClick={() => handleQuickCash(100000)} className="py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-800 transition-colors">100.000</button>
              </div>
              
              <div className="mt-6 border-t border-gray-100 pt-4 flex justify-between items-center">
                <span className="text-gray-600 font-medium">Kembalian</span>
                <span className={`text-xl font-bold ${paidAmount >= total ? "text-primary-700" : "text-danger-600"}`}>
                  Rp {paidAmount >= total ?formatNumber( (paidAmount - total)) : "0"}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-white border-t z-10 w-full max-w-md md:max-w-2xl lg:max-w-3xl mx-auto">
          <Button
            onClick={handleCheckout}
            disabled={isProcessing || !isCashValid}
            variant="primary"
            className="w-full py-4 text-lg rounded-xl shadow-lg"
          >
            {isProcessing ? "Memproses..." : "Konfirmasi Pembayaran"}
          </Button>
        </div>
      </div>
    )
  }

  // --- CART VIEW (Default) ---
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
      <div className="flex-1 px-4 pt-4 md:px-6 md:pt-6 pb-52 md:pb-52 overflow-y-auto">
        
        {/* Kasir Search Input */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={posSearch}
              onChange={(e) => setPosSearch(e.target.value)}
              placeholder="Cari menu transaksi..."
              className="w-full pl-11 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-all"
            />
            {posSearch && (
              <button
                type="button"
                onClick={() => setPosSearch('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {filteredPosItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <IconCatalog className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-semibold">
              {posSearch ? `Tidak ada menu transaksi yang cocok dengan "${posSearch}".` : "Katalog produk masih kosong."}
            </p>
            {!posSearch && <Link href="/katalog" className="text-primary-600 font-bold text-sm mt-2">Tambah Produk +</Link>}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filteredPosItems.map(prod => {
              const inCart = cart.find(c => c.id === prod.id)
              const cartQty = inCart ? inCart.quantity : 0

              return (
                <div
                  key={prod.id}
                  onClick={() => {
                    if (cartQty === 0) addToCart(prod);
                  }}
                  className={`bg-white rounded-xl shadow-sm border text-left transition-all overflow-hidden flex flex-col h-full cursor-pointer ${
                    inCart
                      ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm"
                      : "border-gray-100 hover:border-gray-300 active:bg-gray-50"
                  }`}
                >
                  {prod.imageUrl ? (
                    <div className="w-full aspect-[4/3] md:aspect-square relative bg-gray-100 shrink-0">
                      <Image src={prod.imageUrl} alt={prod.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-full aspect-[4/3] md:aspect-square bg-gray-100 flex items-center justify-center shrink-0">
                      <IconCatalog className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  <div className="p-3 flex-1 flex flex-col justify-between w-full">
                    <div>
                      <p className="font-bold text-gray-900 leading-tight text-sm mb-1.5 line-clamp-2">{prod.name}</p>
                      <p className="text-sm font-semibold text-emerald-600 mb-2">{formatRupiah(prod.sellPrice)}</p>
                    </div>

                    <div className="mt-auto border-t border-gray-100 pt-2">
                      {cartQty === 0 ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(prod);
                          }}
                          className="w-full py-1.5 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 text-xs font-semibold rounded-lg border border-gray-200 transition-colors flex items-center justify-center gap-1"
                        >
                          <span>+ Tambah</span>
                        </button>
                      ) : (
                        <div 
                          onClick={(e) => e.stopPropagation()} 
                          className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-0.5"
                        >
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(prod.id, cartQty - 1)}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-md text-gray-700 font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm text-sm"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={cartQty}
                            onChange={(e) => handleUpdateQty(prod.id, parseInt(e.target.value) || 0)}
                            onFocus={(e) => e.target.select()}
                            className="w-12 text-center text-sm font-bold text-gray-900 bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(prod.id, cartQty + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-emerald-600 text-white rounded-md font-bold hover:bg-emerald-700 transition-colors shadow-sm text-sm"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Cart Bottom Sheet */}
      <div className="fixed bottom-[56px] md:bottom-[72px] left-0 right-0 w-full max-w-md md:max-w-3xl lg:max-w-5xl mx-auto px-4 md:px-6 z-10 left-1/2 -translate-x-1/2">
        <div className="bg-white rounded-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.12)] border border-gray-200">
          
          {/* Cart Detail (Expandable) */}
          {showCartDetail && cart.length > 0 && (
            <div className="px-4 md:px-6 pt-3 pb-2 border-b border-gray-100 max-h-48 md:max-h-72 overflow-y-auto">
              <div className="space-y-2 md:space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-2 md:gap-4">
                    <p className="flex-1 text-xs md:text-sm font-medium text-gray-800 leading-tight">{item.name}</p>
                    <p className="text-xs md:text-sm font-bold text-gray-500 shrink-0 w-20 text-right">{formatRupiah((item.sellPrice * item.quantity))}</p>
                    <div className="flex items-center gap-1 md:gap-2 shrink-0">
                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <IconMinus className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-700" />
                      </button>
                      <span className="w-6 md:w-8 text-center text-xs md:text-sm font-bold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => addToCart(item)}
                        className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary-100 flex items-center justify-center hover:bg-primary-200 transition-colors"
                      >
                        <IconPlus className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary-700" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-danger-50 flex items-center justify-center hover:bg-danger-100 transition-colors ml-1 md:ml-2"
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
                    <p className="text-base md:text-lg font-bold text-gray-900">{formatRupiah(total)}</p>
                  </>
                )}
              </div>
            </button>
            <Button
              onClick={() => setStep("PAYMENT")}
              disabled={cart.length === 0}
              variant="primary"
              className="shrink-0 shadow-md py-2 px-6 md:py-3 md:px-8 md:text-lg"
            >
              Bayar
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
