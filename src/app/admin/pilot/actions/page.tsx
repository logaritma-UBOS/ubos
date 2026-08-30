import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

async function executeAction(formData: FormData) {
  "use server"
  const id = formData.get("id")?.toString()
  if (!id) return
  await prisma.ownerAction.update({
    where: { id },
    data: { status: "EXECUTED" }
  })
  revalidatePath("/admin/pilot/actions")
}

export default async function AksiPage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") redirect("/admin/pilot")

  const actions = await prisma.ownerAction.findMany({
    where: { status: { in: ["ACCEPTED", "PENDING"] } },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <AdminLayout activeMenu="actions">
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase">Aksi Menunggu</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Daftar keputusan yang sudah diambil namun belum dieksekusi.</p>
        </div>

        {actions.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
            <h2 className="text-slate-500 font-bold">Tidak Ada Aksi Menunggu</h2>
            <p className="text-sm text-slate-400 mt-2">Semua masalah sudah ditangani atau belum ada peluang baru.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {actions.map(a => (
              <div key={a.id} className="bg-white p-5 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">{a.metric} - {a.actionType}</p>
                  <p className="font-bold text-slate-900">{a.recommendation}</p>
                  <p className="text-sm text-slate-500 mt-1">Target: {a.expectedResult}</p>
                </div>
                <form action={executeAction}>
                  <input type="hidden" name="id" value={a.id} />
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase px-4 py-2 rounded transition-colors">
                    Tandai Selesai
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
