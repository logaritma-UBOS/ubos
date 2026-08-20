"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { fetchBusinessInsightsData } from "@/actions/businessInsights"
import { BusinessDiagnosis } from "@/lib/engines/businessDiagnosisEngine"
import { BusinessPattern, Confidence } from "@/lib/engines/patternDetectionEngine"
import { RecommendationAction } from "@/lib/engines/recommendationEngineV2"
import { Badge, BadgeVariant } from "@/components/ui/Badge"
import { Card, CardContent } from "@/components/ui/Card"
import { IconWarning, IconIdea, IconInsights, IconChevronDown } from "@/components/ui/Icons"

type InsightResult = {
  diagnoses: BusinessDiagnosis[]
  patterns: BusinessPattern[]
  recommendations: RecommendationAction[]
  confidence: Confidence
  productMixCount: number
}

// Map severity to semantic badge variant
function severityVariant(severity: string): BadgeVariant {
  switch (severity) {
    case "HIGH": return "danger"
    case "MEDIUM": return "warning"
    case "WATCH": return "warning"
    default: return "info"
  }
}

// Map severity to human-readable label
function severityLabel(severity: string): string {
  switch (severity) {
    case "HIGH": return "Perlu Perhatian"
    case "MEDIUM": return "Perlu Ditinjau"
    case "WATCH": return "Pantau"
    default: return "Info"
  }
}

// Map risk level to semantic badge variant
function riskVariant(riskLevel: string): BadgeVariant {
  switch (riskLevel) {
    case "HIGH_RISK": return "danger"
    case "MEDIUM_RISK": return "warning"
    case "LOW_RISK": return "success"
    default: return "neutral"
  }
}

function riskLabel(riskLevel: string): string {
  switch (riskLevel) {
    case "HIGH_RISK": return "Risiko Tinggi"
    case "MEDIUM_RISK": return "Risiko Sedang"
    case "LOW_RISK": return "Risiko Rendah"
    default: return ""
  }
}

export default function BusinessInsightsClient() {
  const [result, setResult] = useState<InsightResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetchBusinessInsightsData()
        if (res.error) {
          setError(res.error)
          return
        }
        if (res.success && res.diagnoses) {
          setResult({
            diagnoses: res.diagnoses as BusinessDiagnosis[],
            patterns: res.patterns as BusinessPattern[],
            recommendations: res.recommendations as RecommendationAction[],
            confidence: res.confidence as Confidence,
            productMixCount: res.productMixCount as number
          })
        }
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24 max-w-md mx-auto relative">
      {/* Header */}
      <div className="bg-primary-700 text-white p-4 pb-6 shrink-0 rounded-b-3xl shadow-sm z-10">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
            ← Beranda
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <IconInsights className="w-7 h-7 text-white/80" />
          <div>
            <h1 className="text-xl font-bold leading-tight">Wawasan Bisnis</h1>
            <p className="text-primary-100 text-xs mt-0.5">Diagnosis performa 30 hari terakhir</p>
          </div>
        </div>
      </div>

      <div className="p-4 -mt-2 relative z-20 space-y-4">
        {/* ERROR STATE */}
        {error && (
          <div className="bg-danger-50 text-danger-700 p-4 rounded-xl text-sm border border-danger-100 font-medium flex items-start gap-2">
            <IconWarning className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-700 rounded-full animate-spin mb-4" />
            <p className="text-gray-500 text-sm font-medium">Menganalisis pola transaksi...</p>
          </div>
        ) : !result ? (
          // EMPTY STATE
          <Card>
            <CardContent className="py-10 text-center">
              <IconInsights className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-900 font-bold mb-1">Gagal memuat data</p>
              <p className="text-gray-500 text-sm">Pastikan ada transaksi dalam 30 hari terakhir.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* LEVEL 1: STATUS BISNIS — Confidence Guard */}
            {result.confidence === "LOW" && (
              <div className="bg-warning-50 border border-warning-200 rounded-xl p-3 flex items-start gap-2">
                <IconWarning className="w-5 h-5 text-warning-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-warning-800">Data Belum Mencukupi</p>
                  <p className="text-xs text-warning-700 mt-0.5">Butuh lebih banyak transaksi untuk membaca pola bisnis secara akurat.</p>
                </div>
              </div>
            )}

            {/* LEVEL 2 + 3 + 4: DIAGNOSIS → EVIDENCE → RECOMMENDATION */}
            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Diagnosis Prioritas</h2>

              {result.diagnoses.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-sm text-gray-500">Tidak ada diagnosis signifikan pada periode ini.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {result.diagnoses.map((diag, idx) => {
                    const relatedRecs = result.recommendations.filter(r => r.relatedDiagnosisId === diag.diagnosisId)

                    return (
                      <Card key={idx}>
                        <CardContent className="p-4">
                          {/* Diagnosis Header */}
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <h3 className="text-sm font-bold text-gray-900 leading-tight flex-1">{diag.title}</h3>
                            <Badge variant={severityVariant(diag.severity)}>
                              {severityLabel(diag.severity)}
                            </Badge>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-gray-600 leading-relaxed mb-3">{diag.description}</p>

                          {/* LEVEL 3: EVIDENCE */}
                          {diag.evidence && diag.evidence.length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-3 mb-3">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Bukti Data</p>
                              <div className="space-y-1.5">
                                {diag.evidence.map((ev, eIdx) => (
                                  <div key={eIdx} className="flex justify-between items-center text-xs">
                                    <span className="text-gray-600">{ev.metric}</span>
                                    <span className={`font-bold tabular-nums ${ev.changePercentage > 0 ? "text-success-600" : ev.changePercentage < 0 ? "text-danger-600" : "text-gray-500"}`}>
                                      {ev.changePercentage > 0 ? "↑" : ev.changePercentage < 0 ? "↓" : "–"}{Math.abs(Math.round(ev.changePercentage))}%
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* LEVEL 4: RECOMMENDATIONS */}
                          {relatedRecs.length > 0 && (
                            <div className="bg-info-50 border border-info-100 rounded-lg p-3">
                              <div className="flex items-center gap-1.5 mb-2">
                                <IconIdea className="w-4 h-4 text-info-600 shrink-0" />
                                <p className="text-[10px] font-bold text-info-800 uppercase tracking-wider">Berdasarkan bukti data, UBOS menyarankan:</p>
                              </div>
                              <div className="space-y-2">
                                {relatedRecs.map((rec) => (
                                  <div key={rec.actionId} className="bg-white/80 p-2.5 rounded-lg border border-info-100">
                                    <div className="flex justify-between items-start gap-2 mb-1">
                                      <p className="text-xs font-bold text-gray-900 leading-tight flex-1">{rec.title}</p>
                                      {rec.riskLevel && (
                                        <Badge variant={riskVariant(rec.riskLevel)}>
                                          {riskLabel(rec.riskLevel)}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-700 leading-relaxed">{rec.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>

            {/* LEVEL 5: TECHNICAL DETAIL — Collapsed Pattern List */}
            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer list-none select-none bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors min-h-[44px]">
                <span className="text-sm font-semibold text-gray-600">Detail Teknis (Data Pola Mentah)</span>
                <IconChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform shrink-0" />
              </summary>
              <div className="mt-1 bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm">
                {result.patterns.length === 0 ? (
                  <p className="text-xs text-gray-500">Belum ada sinyal yang terdeteksi.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {result.patterns.map((p, pIdx) => (
                      <li key={pIdx} className="text-xs text-gray-600 flex justify-between">
                        <span className="font-medium">{p.patternId.replace(/_/g, " ")}</span>
                        <span className="text-gray-400">{p.severity}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </details>
          </>
        )}
      </div>
    </div>
  )
}
