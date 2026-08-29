import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import { formatNumber } from "@/lib/format"

export const dynamic = "force-dynamic"

export default async function GrowthIntelligencePage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") return <div className="p-8">Unauthorized</div>

  return (
    <AdminLayout activeMenu="growth">
      <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-full">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Growth Intelligence</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Metrics pertumbuhan utama UBOS</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm">Menunggu implementasi data time-series (snapshot historikal) untuk menampilkan grafik retention & MoM growth secara akurat.</p>
        </div>
      </div>
    </AdminLayout>
  )
}
