import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"
import { prisma } from "@/lib/prisma"
import { formatNumber } from "@/lib/format"
import { getDashboardIntelligence } from "@/lib/owner/opportunityEngine"

export const dynamic = "force-dynamic"

export default async function PelangganPage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") redirect("/admin/pilot")

  const intel = await getDashboardIntelligence()

  return (
    <AdminLayout activeMenu="users">
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase">Pelanggan</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Kondisi akuisisi dan retensi pengguna aplikasi.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Terdaftar</p>
            <p className="text-2xl font-black text-slate-800">{formatNumber(intel.totalUsers)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-[10px] uppercase font-bold text-slate-400">Telah Buat Bisnis (Aktivasi)</p>
            <p className="text-2xl font-black text-emerald-600">{formatNumber(intel.activatedUsers)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-[10px] uppercase font-bold text-slate-400">Aktif (7 Hari Terakhir)</p>
            <p className="text-2xl font-black text-blue-600">{formatNumber(intel.activeUsers)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-[10px] uppercase font-bold text-slate-400">Pasif / Risiko Churn</p>
            <p className="text-2xl font-black text-rose-600">{formatNumber(intel.inactiveUsers)}</p>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-xl">
          <h2 className="font-bold mb-2 uppercase text-sm tracking-widest text-slate-400">Kesimpulan Pelanggan</h2>
          <p className="text-sm leading-relaxed">
            Terdapat {formatNumber(intel.stuckAfterRegister)} pelanggan yang sudah mendaftar tetapi terhenti sebelum membuat bisnis. Selain itu, {formatNumber(intel.inactiveUsers)} bisnis saat ini dalam kondisi pasif dan tidak mencatat aktivitas dalam 14 hari terakhir. Prioritaskan kampanye edukasi dan retensi untuk grup ini.
          </p>
        </div>
      </div>
    </AdminLayout>
  )
}
