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
import { logoutUser } from "@/actions/auth"

import LandingPage from "@/components/LandingPage"

export default async function Home() {
  const session = await auth()
  if (!session?.user?.id) {
    return <LandingPage />
  }

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

  const hourStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta", hour: "numeric", hour12: false });
  const currentHour = parseInt(hourStr, 10);
  let greeting = "Selamat Malam";
  if (currentHour >= 5 && currentHour < 11) greeting = "Selamat Pagi";
  else if (currentHour >= 11 && currentHour < 15) greeting = "Selamat Siang";
  else if (currentHour >= 15 && currentHour < 18) greeting = "Selamat Sore";

  return (
    <div className="min-h-screen bg-gray-50 pb-24 max-w-md md:max-w-3xl lg:max-w-5xl mx-auto relative">
      {/* Header */}
      <div className="bg-primary-700 text-white p-4 md:p-6 pb-12 md:pb-16 rounded-b-3xl md:rounded-b-[48px] flex justify-between items-start shadow-md">
        <div>
          <p className="text-primary-100 text-xs md:text-sm font-medium mb-1">{greeting}</p>
          <h1 className="text-xl md:text-3xl font-bold leading-tight">{business.name}</h1>
        </div>
        <form action={logoutUser}>
          <button type="submit" className="text-primary-100 hover:text-white text-xs md:text-sm bg-primary-800/50 hover:bg-primary-800 px-3 py-1.5 md:px-4 md:py-2 rounded-full transition-colors font-semibold border border-primary-600">
            Logout
          </button>
        </form>
      </div>

      <div className="px-4 md:px-8 -mt-6 md:-mt-8 space-y-4 md:space-y-6">

        {/* TOP CARDS GRID FOR DESKTOP */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-4 md:space-y-6 flex flex-col h-full">
            {/* LEVEL 1: Status Operasional Hari Ini */}
            <Card className="shadow-lg border-0 h-full">
              <CardContent className="p-4 md:p-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Omzet Hari Ini</p>
                <div className="flex items-end justify-between mb-4">
                  <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Rp {sudahMasuk.toLocaleString("id-ID")}</h2>
                  <div className="bg-success-50 p-2 rounded-full">
                    <IconCash className="w-5 h-5 text-success-600" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all ${progressPct >= 100 ? "bg-success-600" : progressPct >= 60 ? "bg-primary-600" : "bg-warning-500"}`}
                      style={{ width: `${progressPct}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] md:text-xs">
                    <span className="font-semibold text-gray-500">{progressPct}% dari target harian</span>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">Target: Rp {targetHarian.toLocaleString("id-ID")}</span>
                      <Link href="/pengaturan/target" className="text-primary-600 font-bold hover:underline">Ubah</Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 md:space-y-6 flex flex-col h-full">
            {/* LEVEL 2: Rekomendasi Tindakan Utama */}
            {rekomendasiUtama && (
              <Card className="h-full">
                <CardContent className="p-4 md:p-6 h-full flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <IconInsights className="w-5 h-5 text-info-600" />
                    <p className="text-[10px] md:text-xs font-bold text-info-700 uppercase tracking-wider">Yang Perlu Dilakukan</p>
                    <div className="ml-auto">
                      <Badge variant={confidence === "HIGH" ? "success" : confidence === "MEDIUM" ? "warning" : "neutral"}>
                        Data {confidence}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm md:text-base font-bold text-gray-900 leading-snug mb-2">{rekomendasiUtama.actionText}</p>
                  {rekomendasiUtama.causeText && (
                    <p className="text-xs md:text-sm text-gray-500 leading-relaxed mb-2">{rekomendasiUtama.causeText}</p>
                  )}
                  {rekomendasiUtama.expectedResult && (
                    <p className="text-xs md:text-sm text-success-700 font-bold mt-auto pt-2">Target: {rekomendasiUtama.expectedResult}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* LEVEL 1: Peringatan Stok Kritis */}
          {lowStockItems && lowStockItems.length > 0 && (
            <div className="bg-danger-50 border border-danger-200 rounded-xl p-4 flex items-start gap-3">
              <IconWarning className="w-5 h-5 text-danger-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm md:text-base font-bold text-danger-800 mb-1">Stok Habis ({lowStockItems.length} bahan)</p>
                <p className="text-xs md:text-sm text-danger-700 leading-relaxed">{lowStockItems.join(", ")}</p>
                <Link href="/katalog" className="text-xs md:text-sm font-bold text-danger-700 underline mt-2 inline-block">Lihat Katalog →</Link>
              </div>
            </div>
          )}

          {/* LEVEL 2: Gap Transaksi (secondary, compact) */}
          {masihKurang > 0 && (
            <div className="flex gap-4">
              <div className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center flex flex-col justify-center">
                <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider mb-1">Masih Kurang</p>
                <p className="text-sm md:text-lg font-bold text-danger-600">Rp {masihKurang.toLocaleString("id-ID")}</p>
              </div>
              <div className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center flex flex-col justify-center">
                <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider mb-1">Butuh Transaksi</p>
                <p className="text-sm md:text-lg font-bold text-gray-900">{butuhTransaksiSisa}x</p>
              </div>
            </div>
          )}
        </div>

        {/* LEVEL 3: Shortcut Navigasi */}
        <div>
          <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Menu Utama</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            <Link href="/kasir" className="bg-primary-700 text-white p-4 md:p-6 rounded-xl flex flex-col items-center justify-center gap-2 shadow-sm min-h-[80px] md:min-h-[100px] hover:bg-primary-800 transition-colors">
              <IconCash className="w-6 h-6 md:w-8 md:h-8" />
              <span className="text-sm md:text-base font-bold">Kasir POS</span>
            </Link>
            <Link href="/wawasan-bisnis" className="bg-info-600 text-white p-4 md:p-6 rounded-xl flex flex-col items-center justify-center gap-2 shadow-sm min-h-[80px] md:min-h-[100px] hover:bg-info-700 transition-colors">
              <IconInsights className="w-6 h-6 md:w-8 md:h-8" />
              <span className="text-sm md:text-base font-bold text-center leading-tight">Wawasan Bisnis</span>
            </Link>
            <Link href="/katalog" className="bg-white p-4 md:p-6 rounded-xl flex flex-col items-center justify-center gap-2 shadow-sm border border-gray-100 min-h-[80px] md:min-h-[100px] hover:bg-gray-50 transition-colors">
              <IconCatalog className="w-6 h-6 md:w-8 md:h-8 text-gray-600" />
              <span className="text-sm md:text-base font-bold text-gray-800">Katalog</span>
            </Link>
            <Link href="/riwayat" className="bg-white p-4 md:p-6 rounded-xl flex flex-col items-center justify-center gap-2 shadow-sm border border-gray-100 min-h-[80px] md:min-h-[100px] hover:bg-gray-50 transition-colors">
              <IconHistory className="w-6 h-6 md:w-8 md:h-8 text-gray-600" />
              <span className="text-sm md:text-base font-bold text-gray-800">Riwayat</span>
            </Link>
            <Link href="/performa-produk" className="bg-white p-4 md:p-6 rounded-xl flex flex-col items-center justify-center gap-2 shadow-sm border border-gray-100 min-h-[80px] md:min-h-[100px] hover:bg-gray-50 transition-colors text-center">
              <IconTrendingUp className="w-6 h-6 md:w-8 md:h-8 text-gray-600" />
              <span className="text-sm md:text-base font-bold text-gray-800 leading-tight">Performa Produk</span>
            </Link>
            <Link href="/performa-aov" className="bg-white p-4 md:p-6 rounded-xl flex flex-col items-center justify-center gap-2 shadow-sm border border-gray-100 min-h-[80px] md:min-h-[100px] hover:bg-gray-50 transition-colors text-center">
              <IconInsights className="w-6 h-6 md:w-8 md:h-8 text-gray-600" />
              <span className="text-sm md:text-base font-bold text-gray-800 leading-tight">AOV &amp; Margin</span>
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
      <div className="fixed bottom-0 w-full max-w-md md:max-w-3xl lg:max-w-5xl mx-auto bg-white border-t border-gray-100 flex justify-around py-2 md:py-3 z-10 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] left-1/2 -translate-x-1/2">
        <Link href="/" className="flex flex-col items-center text-primary-700 min-w-[56px] md:min-w-[72px] py-1 hover:bg-gray-50 rounded-lg transition-colors">
          <IconHome className="w-6 h-6 md:w-7 md:h-7" />
          <span className="text-[10px] md:text-xs font-bold mt-1">Beranda</span>
        </Link>
        <Link href="/katalog" className="flex flex-col items-center text-gray-400 min-w-[56px] md:min-w-[72px] py-1 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
          <IconCatalog className="w-6 h-6 md:w-7 md:h-7" />
          <span className="text-[10px] md:text-xs font-semibold mt-1">Katalog</span>
        </Link>
        <Link href="/kasir" className="flex flex-col items-center text-gray-400 min-w-[56px] md:min-w-[72px] py-1 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
          <IconCash className="w-6 h-6 md:w-7 md:h-7" />
          <span className="text-[10px] md:text-xs font-semibold mt-1">Kasir</span>
        </Link>
        <Link href="/riwayat" className="flex flex-col items-center text-gray-400 min-w-[56px] md:min-w-[72px] py-1 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
          <IconHistory className="w-6 h-6 md:w-7 md:h-7" />
          <span className="text-[10px] md:text-xs font-semibold mt-1">Riwayat</span>
        </Link>
      </div>
    </div>
  )
}
