import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function HasilPage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") redirect("/admin/pilot")

  const results = await prisma.ownerAction.findMany({
    where: { status: { in: ["EXECUTED", "EVALUATED"] } },
    orderBy: { updatedAt: 'desc' },
    take: 20
  })

  return (
    <AdminLayout activeMenu="results">
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase">Hasil Evaluasi</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Pembelajaran dari aksi dan kampanye yang telah dijalankan.</p>
        </div>

        {results.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
            <h2 className="text-slate-500 font-bold">Belum Ada Hasil</h2>
            <p className="text-sm text-slate-400 mt-2">Jalankan aksi atau kampanye terlebih dahulu untuk melihat hasil evaluasi.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-bold text-slate-600">Aksi yang Dijalankan</th>
                  <th className="p-4 font-bold text-slate-600">Ekspektasi</th>
                  <th className="p-4 font-bold text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={r.id} className="border-b border-slate-100 last:border-0">
                    <td className="p-4 font-medium text-slate-900">{r.recommendation}</td>
                    <td className="p-4 text-slate-600">{r.expectedResult}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${r.status === 'EVALUATED' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                        {r.status === 'EVALUATED' ? 'Dievaluasi' : 'Dieksekusi (Menunggu Evaluasi)'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
