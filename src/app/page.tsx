import { formatNumber, formatRupiah } from '@/lib/format';
export const dynamic = "force-dynamic"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { runLogaritmaEngine } from "@/lib/engines/logaritmaEngine"
import { Card, CardContent } from "@/components/ui/Card"
import { IconHome, IconCatalog, IconHistory, IconInsights, IconWarning, IconCash, IconTrendingUp } from "@/components/ui/Icons"
import { trackEvent } from "@/actions/analytics"
import { logoutUser } from "@/actions/auth"
import LandingPage from "@/components/LandingPage"

// Maps recommendation type → contextual CTA label + destination
function getContextualCTA(type: string | undefined): { label: string; href: string } {
  switch (type) {
    case "AOV":       return { label: "Buka Kasir & Up-Sell", href: "/kasir" }
    case "TRANSACTION": return { label: "Buat Promo Sekarang", href: "/promo" }
    case "STOCK":     return { label: "Cek & Tambah Stok", href: "/katalog" }
    case "MARGIN":    return { label: "Periksa HPP Produk", href: "/katalog" }
    case "DATA":      return { label: "Catat Transaksi", href: "/kasir" }
    case "SUCCESS":   return { label: "Lihat Performa", href: "/wawasan-bisnis" }
    default:          return { label: "Buka Kasir", href: "/kasir" }
  }
}

// Progress psychology text based on progress %
function getProgressMessage(pct: number, masihKurang: number): string {
  if (pct === 0)   return "Belum ada transaksi. Fokus dapatkan penjualan pertama."
  if (pct < 35)    return `Sudah mulai. Tinggal ${formatRupiah(masihKurang)} lagi menuju target.`
  if (pct < 60)    return `Berjalan baik. Sudah separuh jalan, tinggal ${formatRupiah(masihKurang)}.`
  if (pct < 80)    return `Hampir sampai! Tinggal ${formatRupiah(masihKurang)} lagi.`
  if (pct < 100)   return `Sangat dekat! Kurang ${formatRupiah(masihKurang)} untuk mencapai target.`
  return "🎉 Target hari ini tercapai. Pertahankan!"
}

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

  const cta = getContextualCTA(rekomendasiUtama?.type)
  const progressMsg = getProgressMessage(progressPct, masihKurang)

  // Confidence UI config
  const confidenceConfig = {
    HIGH: {
      dot: "bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]",
      label: "Analisis Cukup Kuat",
      color: "text-success-700",
      explanation: "Data transaksi sudah cukup untuk diagnosis yang akurat.",
    },
    MEDIUM: {
      dot: "bg-warning-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
      label: "Analisis Sementara",
      color: "text-warning-700",
      explanation: "Rekomendasi berdasarkan pola awal. Makin banyak transaksi, makin akurat.",
    },
    LOW: {
      dot: "bg-gray-400",
      label: "Data Belum Cukup",
      color: "text-gray-500",
      explanation: "Catat lebih banyak transaksi agar UBOS bisa mendiagnosa bisnis Anda.",
    },
  }
  const conf = confidenceConfig[confidence as keyof typeof confidenceConfig] ?? confidenceConfig.LOW

  return (
    <div className="min-h-screen bg-gray-50 pb-32 overflow-x-hidden">
      <div className="w-full max-w-md md:max-w-5xl lg:max-w-7xl mx-auto px-4 md:px-8 lg:px-10 py-4 md:py-8 box-border">

        {/* HEADER */}
        <div className="flex justify-between items-start pt-2 mb-5 md:mb-8 lg:mb-10">
          <div>
            <div className="mb-2 flex items-center">
              <Image src="/logo-ubos.png" alt="UBOS Logo" width={100} height={32} className="h-8 w-auto object-contain" priority />
            </div>
            <h2 className="text-sm font-bold text-gray-700">{business.name}</h2>
            <p className="text-xs text-gray-400 font-medium">{greeting} 👋</p>
          </div>

          <details className="relative group">
            <summary className="list-none cursor-pointer">
              <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-gray-500 border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[18px] h-[18px]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
            </summary>
            <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 p-1 z-50">
              <form action={logoutUser}>
                <button type="submit" className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  Logout Akun
                </button>
              </form>
            </div>
          </details>
        </div>

        {/* DESKTOP/MOBILE 2-COLUMN LAYOUT */}
        <div className="flex flex-col lg:flex-row lg:gap-8 items-start">

          {/* ===== SIDEBAR NAVIGASI (Desktop Kiri, Mobile Stack Bawah) ===== */}
          <div className="w-full lg:w-[220px] xl:w-60 shrink-0 order-2 lg:order-1 space-y-6 lg:space-y-4 mt-8 lg:mt-0 pb-12 lg:pb-0 lg:sticky lg:top-8">
            
            {/* JUALAN */}
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.12em] mb-3 lg:mb-2 px-1 lg:px-3">Jualan</p>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-1">
                <Link href="/kasir" className="bg-white lg:bg-transparent hover:bg-emerald-50 lg:hover:bg-gray-100 border border-emerald-200 lg:border-transparent text-emerald-900 lg:text-gray-700 p-4 lg:p-2.5 rounded-2xl lg:rounded-xl flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-2 lg:gap-3 shadow-sm lg:shadow-none transition-all active:scale-95 text-center lg:text-left">
                  <div className="w-10 h-10 lg:w-8 lg:h-8 bg-emerald-100 lg:bg-gray-100 rounded-xl lg:rounded-lg flex items-center justify-center shrink-0">
                    <IconCash className="w-5 h-5 lg:w-4.5 lg:h-4.5 text-emerald-600 lg:text-gray-600" />
                  </div>
                  <span className="text-sm lg:text-[13px] font-black lg:font-semibold tracking-tight lg:tracking-normal">Kasir POS</span>
                </Link>
                <Link href="/riwayat" className="bg-white lg:bg-transparent hover:bg-gray-50 lg:hover:bg-gray-100 border border-gray-200 lg:border-transparent text-gray-800 lg:text-gray-700 p-4 lg:p-2.5 rounded-2xl lg:rounded-xl flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-2 lg:gap-3 shadow-sm lg:shadow-none transition-all active:scale-95 text-center lg:text-left">
                  <div className="w-10 h-10 lg:w-8 lg:h-8 bg-gray-100 lg:bg-gray-100 rounded-xl lg:rounded-lg flex items-center justify-center shrink-0">
                    <IconHistory className="w-5 h-5 lg:w-4.5 lg:h-4.5 text-gray-600 lg:text-gray-600" />
                  </div>
                  <span className="text-sm lg:text-[13px] font-black lg:font-semibold tracking-tight lg:tracking-normal">Riwayat</span>
                </Link>
              </div>
            </div>

            {/* KELOLA */}
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.12em] mb-3 lg:mb-2 px-1 lg:px-3">Kelola</p>
              <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 lg:gap-1">
                <Link href="/katalog" className="bg-white lg:bg-transparent hover:bg-gray-50 lg:hover:bg-gray-100 p-4 lg:p-2.5 rounded-2xl lg:rounded-xl border border-gray-200 lg:border-transparent text-gray-700 flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-2 lg:gap-3 shadow-sm lg:shadow-none transition-all active:scale-95 text-center lg:text-left">
                  <div className="lg:w-8 lg:h-8 lg:bg-gray-100 lg:rounded-lg flex items-center justify-center shrink-0">
                    <IconCatalog className="w-5 h-5 lg:w-4.5 lg:h-4.5 text-gray-500 lg:text-gray-600" />
                  </div>
                  <span className="text-[10px] lg:text-[13px] font-bold lg:font-medium tracking-tight lg:tracking-normal">Katalog</span>
                </Link>
                <Link href="/pelanggan" className="bg-white lg:bg-transparent hover:bg-gray-50 lg:hover:bg-gray-100 p-4 lg:p-2.5 rounded-2xl lg:rounded-xl border border-gray-200 lg:border-transparent text-gray-700 flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-2 lg:gap-3 shadow-sm lg:shadow-none transition-all active:scale-95 text-center lg:text-left">
                  <div className="lg:w-8 lg:h-8 lg:bg-gray-100 lg:rounded-lg flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 lg:w-4.5 lg:h-4.5 text-gray-500 lg:text-gray-600"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                  </div>
                  <span className="text-[10px] lg:text-[13px] font-bold lg:font-medium tracking-tight lg:tracking-normal">Pelanggan</span>
                </Link>
                <Link href="/pengeluaran" className="bg-white lg:bg-transparent hover:bg-gray-50 lg:hover:bg-gray-100 p-4 lg:p-2.5 rounded-2xl lg:rounded-xl border border-gray-200 lg:border-transparent text-gray-700 flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-2 lg:gap-3 shadow-sm lg:shadow-none transition-all active:scale-95 text-center lg:text-left">
                  <div className="lg:w-8 lg:h-8 lg:bg-gray-100 lg:rounded-lg flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 lg:w-4.5 lg:h-4.5 text-gray-500 lg:text-gray-600"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                  </div>
                  <span className="text-[10px] lg:text-[13px] font-bold lg:font-medium tracking-tight lg:tracking-normal truncate lg:w-full">Pengeluaran</span>
                </Link>
              </div>
            </div>

            {/* TUMBUH */}
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.12em] mb-3 lg:mb-2 px-1 lg:px-3">Tumbuh</p>
              <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 lg:gap-1">
                <Link href="/promo" className="bg-white lg:bg-transparent hover:bg-gray-50 lg:hover:bg-gray-100 p-4 lg:p-2.5 rounded-2xl lg:rounded-xl border border-gray-200 lg:border-transparent text-gray-700 flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-2 lg:gap-3 shadow-sm lg:shadow-none transition-all active:scale-95 text-center lg:text-left">
                  <div className="lg:w-8 lg:h-8 lg:bg-gray-100 lg:rounded-lg flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 lg:w-4.5 lg:h-4.5 text-gray-500 lg:text-gray-600"><path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" /></svg>
                  </div>
                  <span className="text-[10px] lg:text-[13px] font-bold lg:font-medium tracking-tight lg:tracking-normal">Promo</span>
                </Link>
                <Link href="/marketing" className="bg-white lg:bg-transparent hover:bg-gray-50 lg:hover:bg-gray-100 p-4 lg:p-2.5 rounded-2xl lg:rounded-xl border border-gray-200 lg:border-transparent text-gray-700 flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-2 lg:gap-3 shadow-sm lg:shadow-none transition-all active:scale-95 text-center lg:text-left">
                  <div className="lg:w-8 lg:h-8 lg:bg-gray-100 lg:rounded-lg flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 lg:w-4.5 lg:h-4.5 text-gray-500 lg:text-gray-600"><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-3.102-.069m0-10.44c.253-.962.584-1.892.985-2.783.247-.55.06-1.21-.463-1.511l-.657-.38c-.551-.318-1.26-.117-1.527.461a20.845 20.845 0 00-1.44 4.282m3.102-.069a18.03 18.03 0 00-3.102.069" /></svg>
                  </div>
                  <span className="text-[10px] lg:text-[13px] font-bold lg:font-medium tracking-tight lg:tracking-normal">Marketing</span>
                </Link>
                <Link href="/konten" className="bg-white lg:bg-transparent hover:bg-gray-50 lg:hover:bg-gray-100 p-4 lg:p-2.5 rounded-2xl lg:rounded-xl border border-gray-200 lg:border-transparent text-gray-700 flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-2 lg:gap-3 shadow-sm lg:shadow-none transition-all active:scale-95 text-center lg:text-left">
                  <div className="lg:w-8 lg:h-8 lg:bg-gray-100 lg:rounded-lg flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 lg:w-4.5 lg:h-4.5 text-gray-500 lg:text-gray-600"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>
                  </div>
                  <span className="text-[10px] lg:text-[13px] font-bold lg:font-medium tracking-tight lg:tracking-normal">Konten</span>
                </Link>
              </div>
            </div>

            {/* PAHAMI BISNIS */}
            <div id="menu-lainnya">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.12em] mb-3 lg:mb-2 px-1 lg:px-3">Pahami Bisnis</p>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-1">
                <Link href="/wawasan-bisnis" className="col-span-2 lg:col-span-1 bg-white lg:bg-transparent hover:bg-blue-50 lg:hover:bg-gray-100 border border-blue-200 lg:border-transparent text-blue-900 lg:text-gray-700 p-4 lg:p-2.5 rounded-2xl lg:rounded-xl flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-2 lg:gap-3 shadow-sm lg:shadow-none transition-all active:scale-95 text-center lg:text-left">
                  <div className="w-8 h-8 lg:bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    <IconInsights className="w-4 h-4 lg:w-4.5 lg:h-4.5 text-blue-600 lg:text-gray-600" />
                  </div>
                  <span className="text-xs lg:text-[13px] font-bold lg:font-medium tracking-tight lg:tracking-normal">Analisis Bisnis</span>
                </Link>
                <Link href="/performa-produk" className="bg-white lg:bg-transparent hover:bg-gray-50 lg:hover:bg-gray-100 p-4 lg:p-2.5 rounded-2xl lg:rounded-xl border border-gray-200 lg:border-transparent text-gray-700 flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-2 lg:gap-3 shadow-sm lg:shadow-none transition-all active:scale-95 text-center lg:text-left">
                  <div className="w-8 h-8 lg:bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    <IconTrendingUp className="w-4 h-4 lg:w-4.5 lg:h-4.5 text-gray-600" />
                  </div>
                  <span className="text-xs lg:text-[13px] font-bold lg:font-medium tracking-tight lg:tracking-normal">Performa</span>
                </Link>
                <Link href="/performa-aov" className="bg-white lg:bg-transparent hover:bg-gray-50 lg:hover:bg-gray-100 p-4 lg:p-2.5 rounded-2xl lg:rounded-xl border border-gray-200 lg:border-transparent text-gray-700 flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-2 lg:gap-3 shadow-sm lg:shadow-none transition-all active:scale-95 text-center lg:text-left">
                  <div className="w-8 h-8 lg:bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 lg:w-4.5 lg:h-4.5 text-gray-600"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <span className="text-xs lg:text-[13px] font-bold lg:font-medium tracking-tight lg:tracking-normal truncate lg:w-full">Rata-rata Belanja</span>
                </Link>
              </div>
            </div>

          </div>

          {/* ===== MAIN CONTENT (Desktop Kanan, Mobile Atas) ===== */}
          <div className="w-full lg:flex-1 order-1 lg:order-2 space-y-4 lg:space-y-6">

            {/* ── SECTION 1: TARGET & HEALTH MONITOR ── */}
            {/* MOBILE VIEW (< lg) */}
            <div className="lg:hidden bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.12em]">Kondisi Bisnis Hari Ini</p>
                <Link href="/pengaturan/target" className="text-[10px] font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-2.5 rounded-lg border border-primary-100 transition-colors min-h-[44px] inline-flex items-center">Ubah Target</Link>
              </div>

              {/* Target */}
              <div className="flex justify-between items-baseline pb-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-400">Target Harian</p>
                <p className="text-sm font-bold text-gray-600">{formatRupiah(targetHarian)}</p>
              </div>

              {/* Actual (dominant) */}
              <div className="py-3 md:py-4">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.12em] mb-1">Tercapai</p>
                <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight tabular-nums">{formatRupiah(sudahMasuk)}</h2>

                {/* Progress bar + psychology message */}
                <div className="mt-3 space-y-1.5">
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${progressPct >= 100 ? "bg-success-500" : progressPct >= 60 ? "bg-primary-500" : progressPct >= 1 ? "bg-warning-500" : "bg-gray-200"}`}
                      style={{ width: `${Math.max(progressPct, 0)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">{progressMsg}</p>
                </div>
              </div>

              {/* Gap */}
              {masihKurang > 0 && (
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <div className="flex-1 bg-red-50 rounded-xl p-3 border border-red-100">
                    <p className="text-[9px] font-black text-red-500 uppercase tracking-[0.12em] mb-1">Kekurangan</p>
                    <p className="text-base font-black text-red-600 tabular-nums">-{formatRupiah(masihKurang)}</p>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.12em] mb-1">Butuh Transaksi</p>
                    <p className="text-base font-black text-gray-800">{butuhTransaksiSisa}x lagi</p>
                  </div>
                </div>
              )}
            </div>

            {/* DESKTOP VIEW (>= lg) */}
            <div className="hidden lg:grid grid-cols-3 gap-5">
              {/* TARGET */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.12em]">Target Harian</p>
                    <Link href="/pengaturan/target" className="text-gray-400 hover:text-primary-600 transition-colors" title="Ubah Target">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M2.695 14.763l-1.262 3.152a.5.5 0 00.65.65l3.152-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                      </svg>
                    </Link>
                  </div>
                  <p className="text-2xl font-black text-gray-900 tabular-nums">{formatRupiah(targetHarian)}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">Bulan ini: {formatRupiah(targetHarian * 30)}</p>
                </div>
              </div>

              {/* ACTUAL / TERCAPAI */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.12em] mb-2">Tercapai</p>
                  <p className="text-2xl font-black text-gray-900 tabular-nums">{formatRupiah(sudahMasuk)} <span className="text-sm font-bold text-gray-400">({progressPct}%)</span></p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${progressPct >= 100 ? "bg-success-500" : progressPct >= 60 ? "bg-primary-500" : progressPct >= 1 ? "bg-warning-500" : "bg-gray-200"}`}
                      style={{ width: `${Math.max(progressPct, 0)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed truncate">{progressMsg}</p>
                </div>
              </div>

              {/* GAP */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.12em] mb-2">Kekurangan (Gap)</p>
                  <p className={`text-2xl font-black tabular-nums ${masihKurang > 0 ? "text-red-600" : "text-success-600"}`}>
                    {masihKurang > 0 ? `-${formatRupiah(masihKurang)}` : "✓ Tercapai"}
                  </p>
                </div>
                {masihKurang > 0 ? (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">Butuh <span className="font-bold text-gray-800">{butuhTransaksiSisa}x</span> transaksi lagi</p>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">Luar biasa! Target terlampaui.</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── CARD 2: PERINGATAN STOK ── */}
            {lowStockItems && lowStockItems.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
                <IconWarning className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-amber-900 mb-1">Stok Menipis ({lowStockItems.length} item)</p>
                  <p className="text-xs text-amber-800 leading-relaxed mb-3 break-words">{lowStockItems.join(", ")}</p>
                  <Link href="/katalog" className="inline-block text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors">Cek Stok &rarr;</Link>
                </div>
              </div>
            )}

            {/* ── CARD 3: PRIORITAS HARI INI (Diagnosis → Evidence → Action) ── */}
            {rekomendasiUtama && (
              <div className={`rounded-3xl p-6 relative overflow-hidden ${
                rekomendasiUtama.type === "SUCCESS"
                  ? "bg-success-50 border border-success-200"
                  : "bg-blue-50 border border-blue-200"
              }`}>
                {/* Background accent */}
                <div className="absolute top-0 right-0 p-5 opacity-[0.06] pointer-events-none select-none">
                  <IconInsights className="w-28 h-28 text-blue-900" />
                </div>

                <div className="relative z-10">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{rekomendasiUtama.type === "SUCCESS" ? "✅" : "🔥"}</span>
                      <p className="text-[10px] font-black text-blue-700 uppercase tracking-[0.12em]">Prioritas Hari Ini</p>
                    </div>
                    {/* Contextual confidence badge */}
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/70 border border-white/80 shadow-sm shrink-0`}>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${conf.dot}`}></span>
                      <span className={`text-[9px] font-bold ${conf.color}`}>{conf.label}</span>
                    </div>
                  </div>

                  {/* Action text — DOMINANT */}
                  <h3 className="text-xl font-black text-gray-900 leading-snug mb-5">
                    {rekomendasiUtama.actionText}
                  </h3>

                  {/* Evidence block — "Kenapa?" as supporting proof */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 lg:p-5 border border-white shadow-sm mb-5">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.12em] mb-2 lg:mb-3">Kenapa?</p>
                    <p className="text-sm lg:text-base font-medium text-gray-700 leading-relaxed mb-3 lg:mb-4">
                      {rekomendasiUtama.causeText}
                    </p>
                    {/* Data chain as evidence */}
                    <div className="grid grid-cols-3 gap-2 lg:gap-4 pt-3 lg:pt-4 border-t border-gray-100">
                      <div className="text-center lg:text-left">
                        <p className="text-[9px] text-gray-400 font-semibold uppercase lg:mb-1">Target</p>
                        <p className="text-xs lg:text-sm font-black text-gray-700 tabular-nums">{formatRupiah(targetHarian)}</p>
                      </div>
                      <div className="text-center lg:text-left">
                        <p className="text-[9px] text-gray-400 font-semibold uppercase lg:mb-1">Actual</p>
                        <p className="text-xs lg:text-sm font-black text-gray-700 tabular-nums">{formatRupiah(sudahMasuk)}</p>
                      </div>
                      <div className="text-center lg:text-left">
                        <p className="text-[9px] text-gray-400 font-semibold uppercase lg:mb-1">Gap</p>
                        <p className={`text-xs lg:text-sm font-black tabular-nums ${masihKurang > 0 ? "text-red-600" : "text-success-600"}`}>{masihKurang > 0 ? `-${formatRupiah(masihKurang)}` : "✓ Tercapai"}</p>
                      </div>
                    </div>
                    {/* Confidence explanation */}
                    <p className="text-[10px] text-gray-400 mt-3 pt-2 lg:mt-4 lg:pt-3 border-t border-gray-100 leading-relaxed">{conf.explanation}</p>
                  </div>

                  {/* Expected result + Contextual CTA */}
                  <div className="flex items-center justify-between gap-3">
                    {rekomendasiUtama.expectedResult && (
                      <p className="text-xs text-blue-700 font-bold flex items-center gap-1.5 min-w-0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 text-blue-500">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                        <span className="truncate">{rekomendasiUtama.expectedResult}</span>
                      </p>
                    )}
                    <Link
                      href={cta.href}
                      className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 active:scale-95 transition-all whitespace-nowrap"
                    >
                      {cta.label}
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION — safe area + full clearance */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-sm border-t border-gray-200 flex justify-around items-center h-[68px] z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <Link href="/" className="flex flex-col items-center justify-center w-[20%] h-full text-emerald-600">
          <IconHome className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-0.5">Beranda</span>
        </Link>
        <Link href="/katalog" className="flex flex-col items-center justify-center w-[20%] h-full text-gray-400 hover:text-gray-700">
          <IconCatalog className="w-6 h-6" />
          <span className="text-[10px] font-semibold mt-0.5">Katalog</span>
        </Link>

        {/* KASIR — floating button */}
        <div className="relative w-[20%] flex justify-center -mt-7">
          <Link href="/kasir" className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full flex flex-col items-center justify-center text-white shadow-xl shadow-emerald-500/30 border-[3px] border-white active:scale-95 transition-all">
            <IconCash className="w-6 h-6" />
          </Link>
        </div>

        <Link href="/riwayat" className="flex flex-col items-center justify-center w-[20%] h-full text-gray-400 hover:text-gray-700">
          <IconHistory className="w-6 h-6" />
          <span className="text-[10px] font-semibold mt-0.5">Riwayat</span>
        </Link>
        <a href="#menu-lainnya" className="flex flex-col items-center justify-center w-[20%] h-full text-gray-400 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
          <span className="text-[10px] font-semibold mt-0.5">Lainnya</span>
        </a>
      </div>
    </div>
  )
}
