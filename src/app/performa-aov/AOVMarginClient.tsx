"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { fetchAOVMarginData, AOVMarginPeriodFilter } from "@/actions/aovMargin"
import { calculateAOVMarginAnalysis, AOVMarginAnalysisResult, ProductMixQuadrant } from "@/lib/engines/aovMarginEngine"

export default function AOVMarginClient() {
  const [period, setPeriod] = useState<AOVMarginPeriodFilter>("30_DAYS")
  const [result, setResult] = useState<AOVMarginAnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetchAOVMarginData(period)
        if (res.error) {
          setError(res.error)
          return
        }

        if (res.currentSales && res.previousSales && res.activeDays) {
          // The engine aggregates everything server-side logic in a headless way.
          // Because Server Actions can't pass complex maps back and forth efficiently,
          // the standard pattern here is feeding the raw secure query output to the engine locally in the client layer
          // just to produce the output object, but absolutely NO separate Math.max/reduce logic is written directly here.
          const calculated = calculateAOVMarginAnalysis(res.currentSales as any, res.previousSales as any, res.activeDays)
          setResult(calculated)
        }
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [period])

  const getQuadrantInfo = (q: ProductMixQuadrant) => {
    switch (q) {
      case "PAHLAWAN_BISNIS": return { label: "Pahlawan Bisnis", color: "bg-blue-100 text-blue-800", desc: "Omzet tinggi, Margin tinggi" }
      case "VOLUME_TINGGI_MARGIN_PERHATIAN": return { label: "Cek Margin", color: "bg-orange-100 text-orange-800", desc: "Omzet tinggi, Margin rendah" }
      case "MARGIN_BAGUS_VOLUME_PERHATIAN": return { label: "Cek Volume", color: "bg-yellow-100 text-yellow-800", desc: "Margin tinggi, Omzet rendah" }
      case "PERLU_EVALUASI": return { label: "Perlu Evaluasi", color: "bg-red-100 text-red-800", desc: "Omzet rendah, Margin rendah" }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20 max-w-md mx-auto relative">
      <div className="bg-indigo-700 text-white p-4 pb-6 shrink-0 rounded-b-3xl shadow-sm z-10">
        <div className="flex justify-between items-center mb-4">
          <Link href="/" className="text-white text-sm font-semibold opacity-90 hover:opacity-100">
            ← Beranda
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-1">AOV & Margin</h1>
        <p className="text-indigo-100 text-sm">Analisis kualitas dan profitabilitas pesanan.</p>
      </div>

      <div className="p-4 -mt-4 relative z-20">
        {/* Period Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 mb-6 flex gap-2 overflow-x-auto no-scrollbar">
          {(["TODAY", "7_DAYS", "30_DAYS"] as AOVMarginPeriodFilter[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-colors min-w-[80px] ${
                period === p ? "bg-indigo-100 text-indigo-700" : "text-gray-500 hover:bg-gray-50"
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
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-700 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 text-sm font-medium">Menganalisis margin...</p>
          </div>
        ) : !result ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
            <div className="text-4xl mb-3">🛒</div>
            <p className="text-gray-900 font-bold mb-1">Gagal memuat data</p>
          </div>
        ) : (
          <div className="space-y-6">

            {/* CONFIDENCE & INSIGHTS */}
            <div className="space-y-3">
              {result.confidence === "LOW" && (
                <div className="bg-gray-100 text-gray-700 p-3 rounded-lg text-xs font-semibold flex items-center gap-2 border border-gray-200">
                  <span className="text-lg">⚠️</span> Data masih terlalu sedikit untuk tren stabil.
                </div>
              )}
              {result.insights.map((insight, idx) => (
                <div key={idx} className="bg-gradient-to-r from-indigo-50 to-white p-4 rounded-xl shadow-sm border border-indigo-100 flex gap-3 items-start">
                  <div className="text-xl mt-0.5">💡</div>
                  <p className="text-gray-900 font-bold leading-tight text-sm">
                    {insight}
                  </p>
                </div>
              ))}
            </div>

            {/* AOV & MARGIN CARDS */}
            <div className="grid grid-cols-2 gap-3">
              {/* AOV CARD */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Rata-rata Belanja</p>
                  <p className="text-xl font-bold text-gray-900">Rp {result.currentAOV.toLocaleString('id-ID')}</p>
                </div>
                <div className="mt-3">
                  {result.aovChangePercentage > 0 ? (
                    <p className="text-xs font-bold text-green-600 flex items-center gap-1">
                      <span>↑</span> {Math.abs(Math.round(result.aovChangePercentage))}% dari sblmnya
                    </p>
                  ) : result.aovChangePercentage < 0 ? (
                    <p className="text-xs font-bold text-red-600 flex items-center gap-1">
                      <span>↓</span> {Math.abs(Math.round(result.aovChangePercentage))}% dari sblmnya
                    </p>
                  ) : (
                    <p className="text-xs font-bold text-gray-400 flex items-center gap-1">
                      <span>-</span> Stabil
                    </p>
                  )}
                </div>
              </div>

              {/* MARGIN CARD */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Margin Kotor</p>
                  <p className="text-xl font-bold text-indigo-700">{result.currentMargin}%</p>
                </div>
                <div className="mt-3">
                  {result.marginChangePercentage > 0 ? (
                    <p className="text-xs font-bold text-green-600 flex items-center gap-1">
                      <span>↑</span> {Math.abs(Math.round(result.marginChangePercentage))}% dari sblmnya
                    </p>
                  ) : result.marginChangePercentage < 0 ? (
                    <p className="text-xs font-bold text-red-600 flex items-center gap-1">
                      <span>↓</span> {Math.abs(Math.round(result.marginChangePercentage))}% dari sblmnya
                    </p>
                  ) : (
                    <p className="text-xs font-bold text-gray-400 flex items-center gap-1">
                      <span>-</span> Stabil
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* PRODUCT MIX ACCORDION */}
            <div>
              <h2 className="text-gray-900 font-bold mb-3">Analisis Produk (Product Mix)</h2>
              <div className="space-y-3">
                {result.productMix.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4 bg-white rounded-xl border border-gray-100">
                    Tidak ada produk terjual pada periode ini.
                  </p>
                ) : (
                  result.productMix.map(p => {
                    const info = getQuadrantInfo(p.quadrant)
                    return (
                      <details key={p.productId} className="bg-white rounded-xl shadow-sm border border-gray-100 group overflow-hidden">
                        <summary className="p-4 flex justify-between items-center cursor-pointer list-none select-none hover:bg-gray-50 transition-colors">
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900 mb-1">{p.productName}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${info.color}`}>
                              {info.label}
                            </span>
                          </div>
                          <div className="text-right flex items-center gap-3 shrink-0">
                            <div>
                              <p className="text-sm font-bold text-gray-900">Rp {p.revenue.toLocaleString('id-ID')}</p>
                              <p className="text-xs font-bold text-indigo-600 text-right mt-0.5">Margin {p.margin}%</p>
                            </div>
                            <div className="w-6 h-6 flex items-center justify-center bg-gray-50 rounded-full text-gray-400 group-open:rotate-180 transition-transform">
                              ▼
                            </div>
                          </div>
                        </summary>
                        <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50/50">
                          <p className="text-xs text-gray-600">
                            <strong>Analisis:</strong> {info.desc}.
                          </p>
                        </div>
                      </details>
                    )
                  })
                )}
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  )
}
