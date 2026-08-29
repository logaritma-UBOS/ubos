import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"

export const dynamic = "force-dynamic"

async function setTarget(formData: FormData) {
  "use server"
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") throw new Error("Unauthorized")
  
  const key = formData.get("key")?.toString()
  const value = formData.get("value")?.toString()
  if (key && value && parseFloat(value) > 0) {
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value, updatedAt: new Date(), updatedBy: "OWNER" },
      create: { key, value, description: "Target \\", updatedBy: "OWNER" }
    })
    revalidatePath("/admin/pilot/system")
    revalidatePath("/admin/pilot")
  }
}

export default async function SystemPage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") return <div className="p-8">Unauthorized</div>

  const settings = await prisma.systemSetting.findMany({
    where: { key: { in: ["owner_target_registered_users", "owner_target_activated_users", "owner_target_paid_users"] } }
  })
  
  const getT = (k: string) => settings.find(s => s.key === k)?.value || ""

  return (
    <AdminLayout activeMenu="system">
      <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-full">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">System Health & Targets</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Pengaturan konfigurasi backend Owner</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">UBOS Targets (KPI)</h2>
          <div className="space-y-6">
            {["owner_target_registered_users", "owner_target_activated_users", "owner_target_paid_users"].map((k) => (
              <form action={setTarget} key={k} className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{k.replace('owner_target_', '').replace(/_/g, ' ')}</label>
                  <input type="number" name="value" defaultValue={getT(k)} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50" placeholder="Cth: 1000" />
                  <input type="hidden" name="key" value={k} />
                </div>
                <button type="submit" className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl whitespace-nowrap">Simpan Target</button>
              </form>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
