import { cookies } from "next/headers"
import AdminLayout from "@/components/admin/AdminLayout"

export const dynamic = "force-dynamic"

export default async function MarketingControlPage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") return <div className="p-8">Unauthorized</div>

  const opportunities = [
    { segment: "NOT_ACTIVATED", trigger: "User terdaftar > 1 hari tapi belum buat bisnis", action: "Kirim WA Reminder Onboarding", priority: "HIGH" },
    { segment: "INACTIVE", trigger: "Pernah aktif tapi tidak login 7 hari", action: "Kirim Weekly Insight WA", priority: "MEDIUM" },
    { segment: "ACTIVE", trigger: "Sudah aktif, fitur POS terpakai rutin", action: "Tawarkan Upgrade/Premium (Coming Soon)", priority: "LOW" }
  ]

  return (
    <AdminLayout activeMenu="marketing">
      <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-full">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Marketing Control</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Peluang intervensi marketing berdasarkan segment pengguna</p>
        </div>
        
        <div className="grid gap-4">
          {opportunities.map((opp, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Segment: {opp.segment}</p>
                <p className="text-lg font-black text-slate-900">{opp.trigger}</p>
                <p className="text-sm text-slate-600 font-medium mt-1">Rekomendasi: <span className="text-blue-600 font-bold">{opp.action}</span></p>
              </div>
              <div>
                <span className={"px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest "}>
                  Priority: {opp.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
