import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import Link from "next/link"

export const dynamic = "force-dynamic"

async function executeAction(formData: FormData) {
  "use server"
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") throw new Error("Unauthorized")

  const id = formData.get("id")?.toString()
  if (id) {
    const existing = await prisma.ownerAction.findUnique({ where: { id } })
    if (existing?.status === "ACCEPTED") {
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
            <h3 className="font-bold text-gray-900">Daftar Tindakan Owner</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <th className="p-4">Waktu (Diterima / Eksekusi)</th>
                  <th className="p-4">Problem (Metric)</th>
                  <th className="p-4">Before & Target</th>
                  <th className="p-4">Rekomendasi Tindakan</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {actions.map(action => {
                  let statusColor = "bg-gray-100 text-gray-600"
                  if (action.status === "EVALUATED") statusColor = "bg-blue-100 text-blue-700"
                  else if (action.status === "ACCEPTED") statusColor = "bg-amber-100 text-amber-700"
                  else if (action.status === "EXECUTED") statusColor = "bg-purple-100 text-purple-700"
                  else if (action.status === "FAILED") statusColor = "bg-rose-100 text-rose-700"

                  return (
                    <tr key={action.id} className="hover:bg-gray-50/50 align-top">
                      <td className="p-4 text-xs text-gray-600">
                        <p>ACC: {action.acceptedAt ? new Date(action.acceptedAt).toLocaleString('id-ID') : "-"}</p>
                        <p className="mt-1">EXE: {action.executedAt ? new Date(action.executedAt).toLocaleString('id-ID') : "-"}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-sm text-gray-900 mb-1">{action.metric}</p>
                        <span className="text-[9px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full uppercase">{action.severity || "NORMAL"}</span>
                      </td>
                      <td className="p-4 text-xs text-gray-700">
                        <p>Target: <span className="font-bold">{action.target}</span></p>
                        <p>Before: <span className="font-bold">{action.actualBefore}</span></p>
                        <p className="text-gray-400 mt-1">Gap: {action.gapBefore}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-800 font-medium mb-1">{action.recommendation}</p>
                        <p className="text-[10px] text-gray-500 italic mb-2">Expectation: {action.expectedResult}</p>
                        
                        {action.status === "ACCEPTED" && (
                          <form action={executeAction} className="mt-2">
                            <input type="hidden" name="id" value={action.id} />
                            <button type="submit" className="text-[10px] bg-gray-900 hover:bg-black text-white px-3 py-2 rounded-lg font-bold shadow-sm transition-transform active:scale-95">Tandai Telah Dieksekusi</button>
                          </form>
                        )}
                        {action.status === "EXECUTED" && (
                          <Link href="/admin/pilot/results" className="text-[10px] inline-block bg-purple-50 text-purple-700 border border-purple-200 px-3 py-2 rounded-lg font-bold hover:bg-purple-100 transition-colors">
                            Ukur Hasil (Evaluasi) →
                          </Link>
                        )}
                        {action.status === "EVALUATED" && (
                          <span className="text-[10px] font-bold text-blue-600 block">Selesai Dievaluasi: {action.evaluation}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-md ${statusColor} block w-max`}>
                          {action.status === "EXECUTED" ? "WAITING RESULT" : action.status}
                        </span>
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
      </div>
    </AdminLayout>
  )
}

