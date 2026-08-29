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

  // Fetch actions
  const actions = await prisma.ownerAction.findMany({
    orderBy: { createdAt: 'desc' },
  })

  // Fetch System Settings audit log
  const settingsChanges = await prisma.systemSetting.findMany({
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <AdminLayout activeMenu="actions">
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Owner Action History</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Jejak eksekusi keputusan berbasis data (Metode Logaritma)</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-gray-900">Histori Keputusan & Evaluasi</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <th className="p-4">Tanggal (Accepted)</th>
                  <th className="p-4">Metric / Problem</th>
                  <th className="p-4">Action / Recommendation</th>
                  <th className="p-4">Expected Result</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Evaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {actions.map(action => {
                  let statusColor = "bg-gray-100 text-gray-600"
                  if (action.status === "SUCCESS") statusColor = "bg-emerald-100 text-emerald-700"
                  if (action.status === "ACCEPTED") statusColor = "bg-blue-100 text-blue-700"
                  if (action.status === "EXECUTED") statusColor = "bg-amber-100 text-amber-700"
                  if (action.status === "FAILED") statusColor = "bg-rose-100 text-rose-700"

                  return (
                    <tr key={action.id} className="hover:bg-gray-50/50">
                      <td className="p-4 text-xs text-gray-600">
                        {action.acceptedAt ? new Date(action.acceptedAt).toLocaleString('id-ID') : "-"}
                      </td>
                      <td className="p-4 font-bold text-sm text-gray-900">
                        {action.metric}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {action.recommendation}
                      </td>
                      <td className="p-4 text-xs text-gray-500">
                        {action.expectedResult}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${statusColor}`}>
                          {action.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-bold text-gray-500">
                        {action.evaluation || "EVALUATION BELUM TERSEDIA"}
                      </td>
                    </tr>
                  )
                })}
                {actions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500 text-sm">Belum ada action yang di-accept oleh owner.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
          <div className="p-6 border-b border-gray-100 bg-slate-50">
            <h3 className="font-bold text-gray-900">System Settings Audit</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <th className="p-4">Last Updated</th>
                  <th className="p-4">Setting (Key)</th>
                  <th className="p-4">Payload (Value)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {settingsChanges.map(setting => (
                  <tr key={setting.id} className="hover:bg-gray-50/50">
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(setting.updatedAt).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 font-bold text-sm text-blue-700">
                      {setting.key}
                    </td>
                    <td className="p-4 text-xs text-gray-500 font-mono">
                      {setting.value}
                    </td>
                  </tr>
                ))}
                {settingsChanges.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-gray-500 text-sm">Belum ada System Setting yang tersimpan.</td>
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
