import { cookies } from "next/headers"
import AdminLayout from "@/components/admin/AdminLayout"
export const dynamic = "force-dynamic"
export default async function OffersPage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") return <div className="p-8">Unauthorized</div>
  return (
    <AdminLayout activeMenu="offers">
      <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-full">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Offer & Upgrade Control</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Monetisasi dan manajemen paket langganan UBOS</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm">Model Subscription belum tersedia di database. (N/A)</p>
        </div>
      </div>
    </AdminLayout>
  )
}
