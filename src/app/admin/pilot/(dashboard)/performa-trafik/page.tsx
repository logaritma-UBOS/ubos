import { getTrafikAnalytics } from "@/actions/pilotAnalytics";
import Link from "next/link";
import { formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PerformaTrafikPage() {
  const data = await getTrafikAnalytics();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 mb-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Link href="/admin/pilot" className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1">
              &larr; Kembali ke Beranda
            </Link>
            <h1 className="text-xl font-bold text-slate-900">Performa Trafik</h1>
            <p className="text-slate-500 text-xs mt-0.5">Analisis pengunjung, sumber akuisisi, dan retensi sesi SaaS.</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-8 space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl shrink-0">🌍</div>
            <div>
              <p className="text-xs text-blue-600 font-bold mb-1 uppercase tracking-wider">Total Kunjungan</p>
              <p className="text-slate-900 font-bold text-2xl mb-1">{formatNumber(data.totalVisits)}</p>
              <p className="text-slate-500 text-xs">Jejak halaman yang terekam sistem</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-2xl shrink-0">📍</div>
            <div>
              <p className="text-xs text-indigo-600 font-bold mb-1 uppercase tracking-wider">Halaman Unik</p>
              <p className="text-slate-900 font-bold text-2xl mb-1">{formatNumber(data.uniquePaths)}</p>
              <p className="text-slate-500 text-xs">Rute yang paling sering diakses</p>
            </div>
          </div>
        </div>

        {/* Top Paths */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800">Top Halaman Diakses</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {data.topPaths.map((p, i) => (
              <div key={i} className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors">
                <span className="font-medium text-slate-700 text-sm">{p.path}</span>
                <span className="bg-slate-100 text-slate-600 font-bold text-xs px-3 py-1 rounded-full">{p._count.path} klik</span>
              </div>
            ))}
            {data.topPaths.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm">Belum ada data trafik.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
