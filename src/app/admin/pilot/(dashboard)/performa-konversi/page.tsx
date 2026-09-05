import { getKonversiAnalytics } from "@/actions/pilotAnalytics";
import Link from "next/link";
import { formatNumber, formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PerformaKonversiPage() {
  const data = await getKonversiAnalytics();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 mb-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Link href="/admin/pilot" className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1">
              &larr; Kembali ke Beranda
            </Link>
            <h1 className="text-xl font-bold text-slate-900">Performa Konversi</h1>
            <p className="text-slate-500 text-xs mt-0.5">Analisis funnel pendaftaran, upgrade premium, dan revenue.</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">Total Revenue</p>
            <p className="text-emerald-600 font-black text-2xl mb-1">{formatRupiah(data.totalRevenue)}</p>
            <p className="text-slate-500 text-xs">Akumulasi pendapatan bersih</p>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">Tingkat Konversi</p>
            <p className="text-slate-900 font-black text-2xl mb-1">{data.conversionRate.toFixed(1)}%</p>
            <p className="text-slate-500 text-xs">Rasio Free to Premium</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">Pengguna Premium</p>
            <p className="text-slate-900 font-black text-2xl mb-1">{formatNumber(data.premiumUsersCount)} <span className="text-sm font-medium text-slate-400">/ {formatNumber(data.totalUsers)}</span></p>
            <p className="text-slate-500 text-xs">Total tenant berbayar aktif</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-800 mb-4">Funnel Analitik</h3>
          <div className="relative">
            <div className="flex flex-col gap-2 relative z-10">
              <div className="bg-slate-100 p-4 rounded-lg border border-slate-200 flex justify-between items-center w-full">
                <span className="font-bold text-slate-700">1. Registrasi Akun</span>
                <span className="font-black text-slate-900">{formatNumber(data.totalUsers)} user</span>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex justify-between items-center w-11/12 mx-auto">
                <span className="font-bold text-blue-700">2. Buat Bisnis (Toko)</span>
                <span className="font-black text-blue-900">{formatNumber(data.totalBusinesses)} bisnis</span>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 flex justify-between items-center w-10/12 mx-auto">
                <span className="font-bold text-emerald-700">3. Upgrade Premium</span>
                <span className="font-black text-emerald-900">{formatNumber(data.premiumUsersCount)} user</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
