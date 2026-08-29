import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"

export const dynamic = "force-dynamic"

export default async function AdminRevenuePage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") {
    redirect("/admin/pilot")
  }
  
  return (
    <AdminLayout activeMenu="revenue">
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Revenue & Subscriptions</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Laporan MRR dan Lifetime Sales dari SaaS UBOS</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-16 text-center flex flex-col items-center justify-center space-y-4">
             <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-black uppercase rounded-full tracking-widest">DATA BELUM TERSEDIA</span>
             <h3 className="text-xl font-bold text-gray-900 mt-2">Modul Subscription Belum Aktif</h3>
             <p className="text-gray-500 max-w-lg mx-auto">
               Sistem UBOS saat ini berstatus gratis atau model tabel Subscription, Payment, Plan, dan Invoice belum dibuat di dalam database (Prisma Schema).
               <br/><br/>
               MRR (Monthly Recurring Revenue), Churn Rate, dan Active Subscribers belum dapat dihitung. Jangan gunakan data dummy untuk section ini.
             </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-50 grayscale pointer-events-none">
          <div className="bg-white p-6 rounded-2xl border border-gray-200">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">MRR</p>
             <p className="text-3xl font-black text-gray-300">Rp 0</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Active Subscribers</p>
             <p className="text-3xl font-black text-gray-300">0</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Lifetime Sales</p>
             <p className="text-3xl font-black text-gray-300">Rp 0</p>
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}
