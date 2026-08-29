import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"

export const dynamic = "force-dynamic"

async function executeAction(formData: FormData) {
  "use server"
  const id = formData.get("id")?.toString()
  if (id) {
    await prisma.ownerAction.update({
      where: { id },
      data: {
        status: "EXECUTED",
        executedAt: new Date()
      }
    })
    revalidatePath("/admin/pilot/actions")
  }
}

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

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-gray-900">Histori Keputusan & Evaluasi Hasil</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <th className="p-4">Tanggal Action</th>
                  <th className="p-4">Tantangan (Metric/Problem)</th>
                  <th className="p-4">Tindakan Owner</th>
                  <th className="p-4">Hasil (Before vs After)</th>
                  <th className="p-4">Status & Evaluasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {actions.map(action => {
                  let statusColor = "bg-gray-100 text-gray-600"
                  if (action.status === "SUCCESS") statusColor = "bg-emerald-100 text-emerald-700"
                  else if (action.status === "ACCEPTED") statusColor = "bg-blue-100 text-blue-700"
                  else if (action.status === "EXECUTED") statusColor = "bg-amber-100 text-amber-700"
                  else if (action.status === "FAILED") statusColor = "bg-rose-100 text-rose-700"
                  else if (action.status === "WAITING EXECUTION") statusColor = "bg-purple-100 text-purple-700"

                  const hasAfter = action.actualAfter !== null && action.actualAfter !== undefined
                  const hasBefore = action.actualBefore !== null && action.actualBefore !== undefined

                  return (
                    <tr key={action.id} className="hover:bg-gray-50/50 align-top">
                      <td className="p-4 text-xs text-gray-600">
                        {action.acceptedAt ? new Date(action.acceptedAt).toLocaleString('id-ID') : "-"}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-sm text-gray-900 mb-1">{action.metric}</p>
                        <p className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md inline-block">Target: {action.target}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-800 font-medium mb-1">{action.recommendation}</p>
                        <p className="text-[10px] text-gray-500 italic">Expectation: {action.expectedResult}</p>
                        {action.status === "ACCEPTED" && (
                          <form action={executeAction} className="mt-2">
                            <input type="hidden" name="id" value={action.id} />
                            <button type="submit" className="text-[10px] bg-gray-900 hover:bg-black text-white px-3 py-1.5 rounded-lg font-bold shadow-sm">Tandai Telah Dieksekusi</button>
                          </form>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <p className="text-xs text-gray-600">Before: <span className="font-bold">{hasBefore ? action.actualBefore : "N/A"}</span></p>
                          <p className="text-xs text-gray-600">After: <span className="font-bold">{hasAfter ? action.actualAfter : "PENDING"}</span></p>
                          {(hasBefore && hasAfter) ? (
                            <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block w-max mt-1">
                              Gap Change: {(action.actualAfter as number) - (action.actualBefore as number)}
                            </p>
                          ) : (
                            <p className="text-[10px] text-gray-400 mt-1">Menunggu pengumpulan data...</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-md ${statusColor} block w-max mb-2`}>
                          {action.status}
                        </span>
                        <p className="text-xs font-bold text-gray-700">
                          {action.evaluation || "-"}
                        </p>
                      </td>
                    </tr>
                  )
                })}
                {actions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500 text-sm">Belum ada action yang di-accept oleh owner.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-8">
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
