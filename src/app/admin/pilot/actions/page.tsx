import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"

export const dynamic = "force-dynamic"

export default async function AdminActionsPage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") {
    redirect("/admin/pilot")
  }

  // Action history is tricky because there's no owner action log specifically.
  // We'll display "DATA BELUM TERSEDIA" for completed actions, but fetch PilotError
  // (which is used as GLOBAL_SETTING storage) to show recent config overrides.
  
  const settingsChanges = await prisma.pilotError.findMany({
    where: { errorType: 'GLOBAL_SETTING' },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  return (
    <AdminLayout activeMenu="actions">
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Action History</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Jejak tindakan eksekusi berdasarkan rekomendasi Logaritma</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-gray-900">Histori Rekomendasi vs Eksekusi</h3>
          </div>
          
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
             <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-black uppercase rounded-full tracking-widest">DATA BELUM TERSEDIA</span>
             <p className="text-gray-500 max-w-md">
               Model ActionHistory khusus untuk Owner/Admin belum tersedia di database. 
               Setiap tindakan (seperti mengirim email massal atau mengaktifkan promo) saat ini belum tersimpan jejak evaluasinya.
             </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
          <div className="p-6 border-b border-gray-100 bg-slate-50">
            <h3 className="font-bold text-gray-900">Global Settings Audit Log (Override UI)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Setting (Key)</th>
                  <th className="p-4">Payload (Value)</th>
                  <th className="p-4">Status Eksekusi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {settingsChanges.map(setting => (
                  <tr key={setting.id} className="hover:bg-gray-50/50">
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(setting.createdAt).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 font-bold text-sm text-blue-700">
                      {setting.path}
                    </td>
                    <td className="p-4 text-xs text-gray-500 font-mono">
                      {setting.message}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-emerald-100 text-emerald-700">APPLIED</span>
                    </td>
                  </tr>
                ))}
                {settingsChanges.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500 text-sm">Belum ada perubahan setting.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}
