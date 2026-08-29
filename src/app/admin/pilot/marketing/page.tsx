import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import { formatNumber } from "@/lib/format"

export const dynamic = "force-dynamic"

export default async function AdminMarketingPage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") {
    redirect("/admin/pilot")
  }

  const totalUsers = await prisma.user.count()
  const totalBusinesses = await prisma.business.count()
  const businessesWithSales = await prisma.sale.groupBy({ by: ['businessId'] }).then(res => res.length)
  
  return (
    <AdminLayout activeMenu="marketing">
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Marketing Funnel</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Konversi berdasarkan sumber data nyata</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">User Funnel</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="font-bold text-gray-700">1. Visitor Web</span>
                <span className="font-black text-rose-500 text-sm">DATA BELUM TERSEDIA</span>
              </div>
              <div className="w-0.5 h-4 bg-gray-200 mx-auto"></div>
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                <span className="font-bold text-blue-900">2. Register (User)</span>
                <span className="font-black text-blue-700">{formatNumber(totalUsers)}</span>
              </div>
              <div className="w-0.5 h-4 bg-gray-200 mx-auto"></div>
              <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="font-bold text-emerald-900">3. Activation (Business)</span>
                <span className="font-black text-emerald-700">{formatNumber(totalBusinesses)}</span>
              </div>
              <div className="w-0.5 h-4 bg-gray-200 mx-auto"></div>
              <div className="flex justify-between items-center p-4 bg-amber-50 rounded-xl border border-amber-100">
                <span className="font-bold text-amber-900">4. First Transaction</span>
                <span className="font-black text-amber-700">{formatNumber(businessesWithSales)}</span>
              </div>
              <div className="w-0.5 h-4 bg-gray-200 mx-auto"></div>
              <div className="flex justify-between items-center p-4 bg-fuchsia-50 rounded-xl border border-fuchsia-100">
                <span className="font-bold text-fuchsia-900">5. Paid Subscription</span>
                <span className="font-black text-rose-500 text-sm">DATA BELUM TERSEDIA</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Attribution Source</h3>
            <div className="flex flex-col items-center justify-center h-[300px] text-center space-y-3">
              <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-black uppercase rounded-full tracking-widest">Tracking Missing</span>
              <p className="text-gray-500 font-medium max-w-sm">
                Sistem saat ini belum mencatat UTM source atau referer dari visitor/pendaftar. 
                <br/><br/>
                <span className="text-gray-900 font-bold">Rekomendasi Logaritma:</span> 
                Tambahkan query param tracking di halaman depan dan teruskan ke proses Registrasi.
              </p>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}
