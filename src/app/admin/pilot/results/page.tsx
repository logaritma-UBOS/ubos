import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"

export const dynamic = "force-dynamic"

async function evaluateAction(formData: FormData) {
  "use server"
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") throw new Error("Unauthorized")

  const id = formData.get("id")?.toString()
  const actualAfterStr = formData.get("actualAfter")?.toString()
  const actualAfter = actualAfterStr ? parseFloat(actualAfterStr) : null

  if (id && actualAfter !== null && !isNaN(actualAfter)) {
    const action = await prisma.ownerAction.findUnique({ where: { id } })
    if (action && action.actualBefore !== null && action.target !== null && (action.status === "EXECUTED" || action.status === "EVALUATED")) {
      const { actualBefore, target, direction } = action
      let evaluation = "INCONCLUSIVE"
      let status = "EVALUATED"

      if (direction === "HIGHER_IS_BETTER" || !direction) {
        if (actualAfter >= target) evaluation = "SUCCESS"
        else if (actualAfter > actualBefore) evaluation = "IMPROVED"
        else if (actualAfter === actualBefore) evaluation = "NO_CHANGE"
        else evaluation = "FAILED"
      } else {
        if (actualAfter <= target) evaluation = "SUCCESS"
        else if (actualAfter < actualBefore) evaluation = "IMPROVED"
        else if (actualAfter === actualBefore) evaluation = "NO_CHANGE"
        else evaluation = "FAILED"
      }
      
      const gapAfter = direction === "LOWER_IS_BETTER" ? actualAfter - target : target - actualAfter;

      await prisma.ownerAction.update({
        where: { id },
        data: {
          actualAfter,
          gapAfter,
          status,
          evaluation,
          evaluatedAt: new Date(),
        }
      })
      revalidatePath("/admin/pilot/results")
    }
  }
}

export default async function AdminResultsPage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") {
    redirect("/admin/pilot")
  }

  // Fetch actions that are EXECUTED or EVALUATED
  const actions = await prisma.ownerAction.findMany({
    where: { status: { in: ["EXECUTED", "EVALUATED"] } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <AdminLayout activeMenu="results">
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Hasil Tindakan</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Evaluasi apakah keputusan Owner menyelesaikan gap (Logaritma Method)</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-gray-900">Evaluasi Gap & Result</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <th className="p-4">Masalah & Metrik</th>
                  <th className="p-4">Target & Sebelum</th>
                  <th className="p-4">Tindakan Owner</th>
                  <th className="p-4">Aktual Setelah (After)</th>
                  <th className="p-4">Evaluasi Sistem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {actions.map(action => {
                  let evalColor = "bg-gray-100 text-gray-600 border-gray-200"
                  if (action.evaluation === "SUCCESS") evalColor = "bg-emerald-50 text-emerald-700 border-emerald-200"
                  else if (action.evaluation === "IMPROVED") evalColor = "bg-blue-50 text-blue-700 border-blue-200"
                  else if (action.evaluation === "FAILED") evalColor = "bg-rose-50 text-rose-700 border-rose-200"
                  else if (action.evaluation === "NO_CHANGE") evalColor = "bg-amber-50 text-amber-700 border-amber-200"

                  const isExecuted = action.status === "EXECUTED"

                  return (
                    <tr key={action.id} className="hover:bg-gray-50/50 align-top">
                      <td className="p-4">
                        <p className="font-bold text-sm text-gray-900 mb-1">{action.metric}</p>
                        <p className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md inline-block uppercase">{action.severity || "NORMAL"} PRIORITY</p>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 text-xs text-gray-600">
                          <p>Target: <span className="font-bold text-gray-900">{action.target}</span></p>
                          <p>Before: <span className="font-bold text-gray-900">{action.actualBefore}</span></p>
                          <p>Gap Before: <span className="font-bold text-rose-600">{action.gapBefore}</span></p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-800 font-medium mb-1">{action.recommendation}</p>
                        <p className="text-[10px] text-gray-500 italic">Expected: {action.expectedResult}</p>
                        <p className="text-[10px] text-gray-400 mt-2 block">Dieksekusi: {action.executedAt ? new Date(action.executedAt).toLocaleString('id-ID') : "-"}</p>
                      </td>
                      <td className="p-4 min-w-[200px]">
                        {isExecuted ? (
                          <form action={evaluateAction} className="flex gap-2">
                            <input type="hidden" name="id" value={action.id} />
                            <input type="number" step="any" name="actualAfter" placeholder="Input Data Baru" required className="w-full text-xs p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            <button type="submit" className="bg-blue-600 text-white text-xs px-3 py-2 rounded-lg font-bold hover:bg-blue-700">Ukur</button>
                          </form>
                        ) : (
                          <div className="flex flex-col gap-1 text-xs text-gray-600">
                            <p>After: <span className="font-bold text-gray-900">{action.actualAfter}</span></p>
                            <p>Gap After: <span className="font-bold text-rose-600">{action.gapAfter}</span></p>
                            <p>Change: <span className="font-bold text-blue-600">
                              {(action.actualAfter ?? 0) - (action.actualBefore ?? 0)}
                            </span></p>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {isExecuted ? (
                          <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-md bg-purple-50 text-purple-700 border border-purple-200 block w-max">
                            WAITING RESULT
                          </span>
                        ) : (
                          <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-md border block w-max ${evalColor}`}>
                            {action.evaluation}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {actions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500 text-sm">Belum ada tindakan yang dieksekusi. Selesaikan Action terlebih dahulu.</td>
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

