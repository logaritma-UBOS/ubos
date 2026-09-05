import { getRelationshipAnalytics } from "@/actions/pilotAnalytics";
import Link from "next/link";
import { formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PerformaRelationshipPage() {
  const data = await getRelationshipAnalytics();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 mb-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Link href="/admin/pilot" className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1">
              &larr; Kembali ke Beranda
            </Link>
            <h1 className="text-xl font-bold text-slate-900">Performa Relationship</h1>
            <p className="text-slate-500 text-xs mt-0.5">Analisis retensi tenant VIP, interaksi kampanye, dan masukan.</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">Aksi Intervensi</p>
            <p className="text-blue-600 font-black text-2xl mb-1">{formatNumber(data.totalOwnerActions)}</p>
            <p className="text-slate-500 text-xs">Total intervensi manual Owner</p>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">Kampanye Aktif</p>
            <p className="text-slate-900 font-black text-2xl mb-1">{formatNumber(data.activeCampaigns)}</p>
            <p className="text-slate-500 text-xs">Program retensi yang berjalan</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">Feedback Diterima</p>
            <p className="text-amber-600 font-black text-2xl mb-1">{formatNumber(data.totalFeedback)}</p>
            <p className="text-slate-500 text-xs">Tiket keluhan & saran tenant</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800">Feedback Terbaru</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {data.recentFeedbacks.map((f) => (
              <div key={f.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    f.category === 'BUG' ? 'bg-red-100 text-red-700' :
                    f.category === 'FEATURE' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {f.category}
                  </span>
                  <span className="text-xs text-slate-400">{new Date(f.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
                <p className="text-sm text-slate-800 font-medium mb-1">{f.content}</p>
                <p className="text-xs text-slate-500">Dari: {f.business?.name || "Anonim"}</p>
              </div>
            ))}
            {data.recentFeedbacks.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm">Belum ada feedback dari tenant.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
