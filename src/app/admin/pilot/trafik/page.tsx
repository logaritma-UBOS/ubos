import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function TrafikPage() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

  // Analitik Asli
  const visits = await prisma.visitorAnalytics.count({
    where: { createdAt: { gte: firstDay } }
  });

  const rawReferrers = await prisma.visitorAnalytics.groupBy({
    by: ['referrer'],
    where: { createdAt: { gte: firstDay }, referrer: { not: null } },
    _count: { referrer: true },
    orderBy: { _count: { referrer: 'desc' } }
  });

  const signups = await prisma.user.count({
    where: { createdAt: { gte: firstDay } }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/admin/pilot" className="text-blue-600 text-sm font-bold mb-6 inline-block">&larr; Kembali ke Dashboard</Link>
        <h1 className="text-3xl font-black text-gray-900 mb-6">Metrik Trafik & Akuisisi</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Total Kunjungan Web</h3>
            <p className="text-4xl font-black text-blue-600">{formatNumber(visits)}</p>
            <p className="text-xs text-gray-500 mt-2">Bulan ini (direkam via Tracker Asli)</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Pendaftar Baru</h3>
            <p className="text-4xl font-black text-emerald-600">{formatNumber(signups)}</p>
            <p className="text-xs text-gray-500 mt-2">User yang membuat akun bulan ini</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Sumber Pengunjung (Referrer)</h3>
          {rawReferrers.length === 0 ? (
            <p className="text-gray-500 text-sm italic">Belum ada data sumber referal pihak ketiga.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold rounded-tl-lg">URL Sumber</th>
                    <th className="px-4 py-3 font-semibold rounded-tr-lg">Jumlah Kunjungan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rawReferrers.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-700">{r.referrer === "" ? "(Direct / Langsung)" : r.referrer}</td>
                      <td className="px-4 py-3 font-bold text-blue-600">{r._count.referrer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}