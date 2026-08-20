export const dynamic = "force-dynamic"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { runLogaritmaEngine } from "@/lib/engines/logaritmaEngine"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { IconHome, IconCatalog, IconHistory, IconInsights, IconWarning, IconCash, IconTrendingUp } from "@/components/ui/Icons"
import { trackEvent } from "@/actions/analytics"

export default async function Home() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
    include: { goals: true }
  })

  if (!business) redirect("/onboarding")

  trackEvent(business.id, "dashboard_viewed").catch(() => {})

  const {
    targetHarian,
    sudahMasuk,
    masihKurang,
    butuhTransaksiSisa,
    aovAktual,
    rekomendasiUtama,
    confidence,
    lowStockItems
  } = await runLogaritmaEngine(business.id)

  const progressPct = targetHarian > 0 ? Math.min(100, Math.round((sudahMasuk / targetHarian) * 100)) : 0

  return (
    <div className="min-h-screen bg-gray-50 pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-primary-700 text-white p-4 pb-10 rounded-b-3xl">
        <p className="text-primary-100 text-xs font-medium mb-1">Pusat Kendali</p>
        <h1 className="text-xl font-bold leading-tight">{business.name}</h1>
      </div>

      <div className="px-4 -mt-6 space-y-3">

        {/* LEVEL 1: Status Operasional Hari Ini */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Omzet Hari Ini</p>
                <p className="text-2xl font-bold text-gray-900">Rp {sudahMasuk.toLocaleString("id-ID")}</p>
              </div>
              <IconCash className="w-8 h-8 text-primary-600" />
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full transition-all ${progressPct >= 100 ? "bg-success-600" : progressPct >= 60 ? "bg-primary-600" : "bg-warning-500"}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-semibold text-gray-500 items-center mt-2">
              <p>{progressPct}% dari target harian</p>
              <div className="flex items-center gap-1.5">
                <p>Target: Rp {targetHarian.toLocaleString("id-ID")}</p>
                <Link href="/pengaturan/target" className="text-primary-600 bg-primary-50 px-2 py-0.5 rounded text-[10px] hover:bg-primary-100 transition-colors">Ubah</Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LEVEL 1: Peringatan Stok Kritis */}
        {lowStockItems && lowStockItems.length > 0 && (
          <div className="bg-danger-50 border border-danger-200 rounded-xl p-3 flex items-start gap-2.5">
            <IconWarning className="w-5 h-5 text-danger-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-danger-800 mb-1">Stok Habis ({lowStockItems.length} bahan)</p>
              <p className="text-xs text-danger-700 leading-relaxed">{lowStockItems.join(", ")}</p>
              <Link href="/katalog" className="text-xs font-bold text-danger-700 underline mt-1 inline-block">Lihat Katalog →</Link>
            </div>
          </div>
        )}

        {/* LEVEL 2: Rekomendasi Tindakan Utama */}
        {rekomendasiUtama && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <IconInsights className="w-4 h-4 text-info-600" />
                <p className="text-[10px] font-bold text-info-700 uppercase tracking-wider">Yang Perlu Dilakukan</p>
                <div className="ml-auto">
                  <Badge variant={confidence === "HIGH" ? "success" : confidence === "MEDIUM" ? "warning" : "neutral"}>
                    Data {confidence}
                  </Badge>
                </div>
              </div>
              <p className="text-sm font-bold text-gray-900 leading-snug mb-1">{rekomendasiUtama.actionText}</p>
              {rekomendasiUtama.causeText && (
                <p className="text-xs text-gray-500 leading-relaxed">{rekomendasiUtama.causeText}</p>
              )}
              {rekomendasiUtama.expectedResult && (
                <p className="text-xs text-success-700 font-bold mt-2">Target: {rekomendasiUtama.expectedResult}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* LEVEL 2: Gap Transaksi (secondary, compact) */}
        {masihKurang > 0 && (
          <div className="flex gap-3">
            <div className="flex-1 bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Masih Kurang</p>
              <p className="text-sm font-bold text-danger-600">Rp {masihKurang.toLocaleString("id-ID")}</p>
            </div>
            <div className="flex-1 bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Butuh Transaksi</p>
              <p className="text-sm font-bold text-gray-900">{butuhTransaksiSisa}x</p>
            </div>
          </div>
        )}

        {/* LEVEL 3: Shortcut Navigasi */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-0.5">Menu Utama</p>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/kasir" className="bg-primary-700 text-white p-4 rounded-xl flex flex-col items-center justify-center gap-1.5 shadow-sm min-h-[72px] hover:bg-primary-800 transition-colors">
              <IconCash className="w-6 h-6" />
              <span className="text-sm font-bold">Kasir POS</span>
            </Link>
            <Link href="/wawasan-bisnis" className="bg-info-600 text-white p-4 rounded-xl flex flex-col items-center justify-center gap-1.5 shadow-sm min-h-[72px] hover:bg-info-700 transition-colors">
              <IconInsights className="w-6 h-6" />
              <span className="text-sm font-bold">Wawasan Bisnis</span>
            </Link>
            <Link href="/katalog" className="bg-white p-4 rounded-xl flex flex-col items-center justify-center gap-1.5 shadow-sm border border-gray-100 min-h-[72px] hover:bg-gray-50 transition-colors">
              <IconCatalog className="w-6 h-6 text-gray-600" />
              <span className="text-sm font-bold text-gray-800">Katalog</span>
            </Link>
            <Link href="/riwayat" className="bg-white p-4 rounded-xl flex flex-col items-center justify-center gap-1.5 shadow-sm border border-gray-100 min-h-[72px] hover:bg-gray-50 transition-colors">
              <IconHistory className="w-6 h-6 text-gray-600" />
              <span className="text-sm font-bold text-gray-800">Riwayat</span>
            </Link>
            <Link href="/performa-produk" className="bg-white p-4 rounded-xl flex flex-col items-center justify-center gap-1.5 shadow-sm border border-gray-100 min-h-[72px] hover:bg-gray-50 transition-colors">
              <IconTrendingUp className="w-6 h-6 text-gray-600" />
              <span className="text-sm font-bold text-gray-800">Performa Produk</span>
            </Link>
            <Link href="/performa-aov" className="bg-white p-4 rounded-xl flex flex-col items-center justify-center gap-1.5 shadow-sm border border-gray-100 min-h-[72px] hover:bg-gray-50 transition-colors">
              <IconInsights className="w-6 h-6 text-gray-600" />
              <span className="text-sm font-bold text-gray-800">AOV &amp; Margin</span>
            </Link>
          </div>
        </div>

        {/* SECONDARY: Target Harian (de-emphasize) */}
        <details className="group">
          <summary className="flex justify-between items-center cursor-pointer list-none select-none text-xs text-gray-400 font-semibold px-1 py-2 hover:text-gray-600 transition-colors min-h-[44px]">
            <span>Detail Target Harian</span>
            <span className="group-open:rotate-180 transition-transform inline-block">▼</span>
          </summary>
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-gray-500 font-semibold">TARGET HARIAN</p>
                <p className="text-sm font-bold text-gray-900">Rp {targetHarian.toLocaleString("id-ID")}</p>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs text-gray-500">Masih Kurang</p>
                  <Link href="/kenapa" className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-bold hover:bg-gray-200">Kenapa?</Link>
                </div>
                <p className="text-sm font-bold text-danger-600">Rp {masihKurang.toLocaleString("id-ID")}</p>
              </div>
            </CardContent>
          </Card>
        </details>

      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full max-w-md mx-auto bg-white border-t border-gray-100 flex justify-around py-2 z-10 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
        <Link href="/" className="flex flex-col items-center text-primary-700 min-w-[56px] py-1">
          <IconHome className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-0.5">Beranda</span>
        </Link>
        <Link href="/katalog" className="flex flex-col items-center text-gray-400 min-w-[56px] py-1 hover:text-gray-700 transition-colors">
          <IconCatalog className="w-6 h-6" />
          <span className="text-[10px] font-semibold mt-0.5">Katalog</span>
        </Link>
        <Link href="/kasir" className="flex flex-col items-center text-gray-400 min-w-[56px] py-1 hover:text-gray-700 transition-colors">
          <IconCash className="w-6 h-6" />
          <span className="text-[10px] font-semibold mt-0.5">Kasir</span>
        </Link>
        <Link href="/riwayat" className="flex flex-col items-center text-gray-400 min-w-[56px] py-1 hover:text-gray-700 transition-colors">
          <IconHistory className="w-6 h-6" />
          <span className="text-[10px] font-semibold mt-0.5">Riwayat</span>
        </Link>
      </div>
    </div>
  )
}
