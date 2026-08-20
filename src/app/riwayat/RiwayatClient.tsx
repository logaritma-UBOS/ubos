"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getTransactionHistory } from "@/actions/history"
import { getPendingTransactions } from "@/lib/adapters/offlineQueueAdapter"
import { calculateHistoryMetrics } from "@/lib/engines/historyEngine"

type SaleItem = {
  id: string
  quantity: number
  priceAtSale: number
  product: { name: string }
}

type Sale = {
  id: string
  clientTransactionId: string
  totalAmount: number
  createdAt: Date
  saleItems: SaleItem[]
  status: "SYNCED" | "PENDING"
}

export default function RiwayatClient() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getTransactionHistory()
        if (!res.data) return

        const dbSales: Sale[] = res.data.map((s: any) => ({
          ...s,
          status: "SYNCED"
        }))

        const queue = getPendingTransactions()
        const pendingSales: Sale[] = queue.map((q: any) => ({
          id: q.clientTransactionId,
          clientTransactionId: q.clientTransactionId,
          totalAmount: q.total,
          createdAt: new Date(q.timestamp),
          saleItems: q.cart.map((c: any) => ({
            id: Math.random().toString(),
            quantity: c.quantity,
            priceAtSale: c.price,
            product: { name: "Produk (Offline)" }
          })),
          status: "PENDING"
        }))

        // Merge and sort
        const merged = [...pendingSales, ...dbSales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setSales(merged)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Delegasikan perhitungan bisnis ke Engine (Single Source of Truth)
  const metrics = calculateHistoryMetrics(sales)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20 max-w-md mx-auto">
      <div className="bg-blue-700 text-white p-4 pb-6 shrink-0 rounded-b-3xl">
        <Link href="/" className="text-white text-sm font-semibold mb-4 inline-block">← Beranda</Link>
        <h1 className="text-xl font-bold">Riwayat Transaksi</h1>
      </div>
      
      <div className="p-4 -mt-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex justify-between">
          <div>
            <p className="text-xs text-gray-500 font-semibold mb-1">Total Transaksi</p>
            <p className="text-lg font-bold text-gray-900">{metrics.totalTransaksi}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold mb-1">Total Omzet</p>
            <p className="text-lg font-bold text-blue-700">Rp {metrics.totalOmzet.toLocaleString('id-ID')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold mb-1">AOV</p>
            <p className="text-lg font-bold text-green-700">Rp {metrics.aov.toLocaleString('id-ID')}</p>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 mt-10">Memuat data...</p>
        ) : (
          <div className="space-y-3">
            {sales.map(sale => (
              <details key={sale.id} className="bg-white rounded-xl shadow-sm border border-gray-100 group">
                <summary className="p-4 flex justify-between items-center cursor-pointer list-none">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-gray-900">
                        {new Date(sale.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {sale.status === "PENDING" ? (
                        <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded-full">PENDING</span>
                      ) : (
                        <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">SYNCED</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{new Date(sale.createdAt).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900">Rp {sale.totalAmount.toLocaleString('id-ID')}</p>
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </div>
                </summary>
                <div className="px-4 pb-4 border-t border-gray-50 pt-2">
                  <p className="text-xs font-bold text-gray-400 mb-2">Item Terjual:</p>
                  {sale.saleItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm mb-1">
                      <p className="text-gray-700">{item.quantity}x {item.product.name}</p>
                      <p className="text-gray-900 font-semibold">Rp {(item.priceAtSale * item.quantity).toLocaleString('id-ID')}</p>
                    </div>
                  ))}
                </div>
              </details>
            ))}
            {sales.length === 0 && (
              <p className="text-center text-gray-500 mt-10">Belum ada transaksi.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
