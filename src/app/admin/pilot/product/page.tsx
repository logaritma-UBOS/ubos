import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"
import { getDashboardIntelligence } from "@/lib/owner/opportunityEngine"

export const dynamic = "force-dynamic"

export default async function ProdukPage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") redirect("/admin/pilot")

  const intel = await getDashboardIntelligence()

  return (
    <AdminLayout activeMenu="product">
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase">Performa Produk (Fitur)</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Tingkat penggunaan fitur-fitur utama UBOS oleh pelanggan.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <p className="text-[10px] uppercase font-bold text-slate-400">Adopsi HPP & Resep</p>
            <p className="text-2xl font-black text-slate-800">{intel.hppAdoption.toFixed(1)}%</p>
            <p className="text-xs text-slate-500 mt-1">Dari total bisnis</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <p className="text-[10px] uppercase font-bold text-slate-400">Adopsi POS Kasir</p>
            <p className="text-2xl font-black text-slate-800">{intel.posAdoption.toFixed(1)}%</p>
            <p className="text-xs text-slate-500 mt-1">Dari total bisnis</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <p className="text-[10px] uppercase font-bold text-slate-400">Adopsi Katalog</p>
            <p className="text-2xl font-black text-slate-800">{intel.catalogAdoption.toFixed(1)}%</p>
            <p className="text-xs text-slate-500 mt-1">Dari total bisnis</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
