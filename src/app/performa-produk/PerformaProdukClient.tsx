"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { fetchProductPerformanceData, PeriodFilter } from "@/actions/productPerformance"
import { calculateProductPerformance, generateRecommendationContext, ProductPerformanceMetric } from "@/lib/engines/productPerformanceEngine"

export default function PerformaProdukClient() {
  const [period, setPeriod] = useState<PeriodFilter>("7_DAYS")
  const [metrics, setMetrics] = useState<ProductPerformanceMetric[]>([])
  const [context, setContext] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetchProductPerformanceData(period)
        if (res.error) {
          setError(res.error)
          return
        }

        if (res.result) {
          setMetrics(res.result)
          setContext(generateRecommendationContext(res.result))
        }
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [period])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20 max-w-md mx-auto relative">
      <div className="bg-blue-700 text-white p-4 pb-6 shrink-0 rounded-b-3xl shadow-sm z-10">
        <div className="flex justify-between items-center mb-4">
          <Link href="/" className="text-white text-sm font-semibold opacity-90 hover:opacity-100">
            ← Beranda
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-1">Performa Produk</h1>
        <p className="text-blue-100 text-sm">Analisis penjualan dan tren historis.</p>
      </div>

      <div className="p-4 -mt-4 relative z-20">
        {/* Period Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 mb-6 flex gap-2 overflow-x-auto no-scrollbar">
          {(["TODAY", "7_DAYS", "30_DAYS"] as PeriodFilter[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-colors min-w-[80px] ${
                period === p ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {p === "TODAY" ? "Hari Ini" : p === "7_DAYS" ? "7 Hari" : "30 Hari"}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm mb-6 border border-red-100 font-medium">
            Error: {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 text-sm font-medium">Menganalisis performa...</p>
          </div>
        ) : metrics.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-gray-900 font-bold mb-1">Belum ada data penjualan</p>
            <p className="text-gray-500 text-sm">Transaksi produk di periode ini akan muncul di sini.</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* INSIGHT CARDS */}
            <div className="space-y-3">
              {context?.topSellingProduct && (
                <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-xl shadow-sm border border-blue-100">
                  <div className="flex gap-3 items-start">
                    <div className="text-2xl mt-1">🔥</div>
                    <div>
                      <p className="text-xs text-blue-600 font-bold mb-1 uppercase tracking-wide">Paling Laku</p>
                      <p className="text-gray-900 font-bold leading-tight mb-1">
                        {context.topSellingProduct.productName} paling banyak terjual.
                      </p>
                      <p className="text-gray-500 text-xs">
                        Terjual {context.topSellingProduct.salesVolume} porsi ({Math.round(context.topSellingProduct.revenueContribution)}% dari total omzet).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {context?.highestProfitProduct && (
                <div className="bg-gradient-to-r from-green-50 to-white p-4 rounded-xl shadow-sm border border-green-100">
                  <div className="flex gap-3 items-start">
                    <div className="text-2xl mt-1">💰</div>
                    <div>
                      <p className="text-xs text-green-600 font-bold mb-1 uppercase tracking-wide">Paling Untung</p>
                      <p className="text-gray-900 font-bold leading-tight mb-1">
                        {context.highestProfitProduct.productName} memberikan untung kotor terbesar.
                      </p>
                      <p className="text-gray-500 text-xs">
                        Margin {context.highestProfitProduct.margin}%.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {context?.decliningProducts?.length > 0 && (
                <div className="bg-gradient-to-r from-orange-50 to-white p-4 rounded-xl shadow-sm border border-orange-100">
                  <div className="flex gap-3 items-start">
                    <div className="text-2xl mt-1">⚠️</div>
                    <div>
                      <p className="text-xs text-orange-600 font-bold mb-1 uppercase tracking-wide">Perlu Perhatian</p>
                      <p className="text-gray-900 font-bold leading-tight mb-1">
                        Penjualan {context.decliningProducts[0].productName} sedang turun.
                      </p>
                      <p className="text-gray-500 text-xs">
                        Turun {Math.abs(Math.round(context.decliningProducts[0].trendPercentage))}% dibanding periode sebelumnya.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PRODUCT LIST ACCORDION */}
            <div>
              <h2 className="text-gray-900 font-bold mb-3 flex items-center justify-between">
                <span>Rincian Produk</span>
                <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{metrics.length} Produk</span>
              </h2>
              
              <div className="space-y-3">
                {metrics.map(product => (
                  <details key={product.productId} className="bg-white rounded-xl shadow-sm border border-gray-100 group overflow-hidden">
                    <summary className="p-4 flex justify-between items-center cursor-pointer list-none select-none hover:bg-gray-50 transition-colors">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-bold text-gray-900 truncate">{product.productName}</p>
                          {product.trend === "UP" && <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">↑ NAIK</span>}
                          {product.trend === "DOWN" && <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded-full">↓ TURUN</span>}
                        </div>
                        <p className="text-xs text-gray-500">
                          Terjual {product.salesVolume} unit
                        </p>
                      </div>
                      <div className="text-right flex items-center gap-3 shrink-0">
                        <div>
                          <p className="text-sm font-bold text-blue-700">Rp {product.revenue.toLocaleString('id-ID')}</p>
                          <p className="text-xs text-gray-400">Omzet</p>
                        </div>
                        <div className="w-6 h-6 flex items-center justify-center bg-gray-50 rounded-full text-gray-400 group-open:rotate-180 transition-transform">
                          ▼
                        </div>
                      </div>
                    </summary>
                    
                    <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50/50">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-white p-3 rounded-lg border border-gray-100">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Untung Kotor</p>
                          <p className="text-sm font-bold text-green-700">Rp {product.grossProfit.toLocaleString('id-ID')}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-gray-100">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Margin</p>
                          <p className="text-sm font-bold text-gray-900">{product.margin}%</p>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg border border-gray-100 divide-y divide-gray-50">
                        <div className="flex justify-between p-2.5 text-xs">
                          <span className="text-gray-500">HPP / Modal Item</span>
                          <span className="font-semibold text-gray-900">Rp {product.hpp.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between p-2.5 text-xs">
                          <span className="text-gray-500">Tren Penjualan</span>
                          <span className={`font-semibold ${product.trendPercentage > 0 ? 'text-green-600' : product.trendPercentage < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                            {product.trendPercentage > 0 ? '+' : ''}{Math.round(product.trendPercentage)}%
                          </span>
                        </div>
                        <div className="flex justify-between p-2.5 text-xs">
                          <span className="text-gray-500">Kontribusi Omzet</span>
                          <span className="font-semibold text-gray-900">{Math.round(product.revenueContribution)}%</span>
                        </div>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  )
}
