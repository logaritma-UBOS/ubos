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
  const allBusinesses = await prisma.business.findMany({
    include: {
      products: { select: { id: true } },
      ingredients: { select: { id: true } },
      sales: { select: { id: true } }
    }
  })
  
  const totalBusinesses = allBusinesses.length
  let businessesWithData = 0
  let businessesWithTx = 0
  
  for (const b of allBusinesses) {
    if (b.products.length > 0 || b.ingredients.length > 0) businessesWithData++
    if (b.sales.length > 0) businessesWithTx++
  }

  const events = await prisma.pilotEvent.findMany({ select: { businessId: true, eventName: true } })
  const hasHppMap = new Set(events.filter(e => e.eventName === "hpp_calculated").map(e => e.businessId))
  const hasPosMap = new Set(events.filter(e => e.eventName === "pos_transaction_completed").map(e => e.businessId))
  
  let hppCount = 0
  let posCount = 0
  
  for (const b of allBusinesses) {
    if (hasHppMap.has(b.id)) hppCount++
    if (hasPosMap.has(b.id) || b.sales.length > 0) posCount++
  }
  
  return (
    <AdminLayout activeMenu="marketing">
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Marketing Funnel</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Konversi berdasarkan sumber data nyata (Journey Valid)</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">SaaS Funnel</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="font-bold text-gray-700">1. Visitor Web (Traffic)</span>
                <span className="font-black text-rose-500 text-sm">DATA BELUM TERSEDIA</span>
              </div>
              <div className="w-0.5 h-4 bg-gray-200 mx-auto"></div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="font-bold text-gray-700">2. Landing Page View</span>
                <span className="font-black text-rose-500 text-sm">DATA BELUM TERSEDIA</span>
              </div>
              <div className="w-0.5 h-4 bg-gray-200 mx-auto"></div>
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                <span className="font-bold text-blue-900">3. Register (User Base)</span>
                <span className="font-black text-blue-700">{formatNumber(totalUsers)}</span>
              </div>
              <div className="w-0.5 h-4 bg-gray-200 mx-auto"></div>
              <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="font-bold text-emerald-900">4. Business Created</span>
                <span className="font-black text-emerald-700">{formatNumber(totalBusinesses)}</span>
              </div>
              <div className="w-0.5 h-4 bg-gray-200 mx-auto"></div>
              <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <span className="font-bold text-indigo-900">5. First Data (Setup)</span>
                <span className="font-black text-indigo-700">{formatNumber(businessesWithData)}</span>
              </div>
              <div className="w-0.5 h-4 bg-gray-200 mx-auto"></div>
              <div className="flex justify-between items-center p-4 bg-amber-50 rounded-xl border border-amber-100">
                <span className="font-bold text-amber-900">6. First HPP</span>
                <span className="font-black text-amber-700">{formatNumber(hppCount)}</span>
              </div>
              <div className="w-0.5 h-4 bg-gray-200 mx-auto"></div>
              <div className="flex justify-between items-center p-4 bg-rose-50 rounded-xl border border-rose-100">
                <span className="font-bold text-rose-900">7. First POS Tx</span>
                <span className="font-black text-rose-700">{formatNumber(posCount)}</span>
              </div>
              <div className="w-0.5 h-4 bg-gray-200 mx-auto"></div>
              <div className="flex justify-between items-center p-4 bg-fuchsia-50 rounded-xl border border-fuchsia-100">
                <span className="font-bold text-fuchsia-900">8. Paid Subscription</span>
                <span className="font-black text-rose-500 text-sm">DATA BELUM TERSEDIA</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Attribution Source</h3>
            <div className="flex flex-col items-center justify-center h-[300px] text-center space-y-3">
              <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-black uppercase rounded-full tracking-widest">DATA BELUM TERSEDIA</span>
              <p className="text-gray-500 font-medium max-w-sm">
                Sistem saat ini belum mencatat UTM source (campaign, medium, source) atau referer dari visitor/pendaftar. 
                <br/><br/>
                <span className="text-gray-900 font-bold">Rekomendasi Owner:</span> 
                Tambahkan query param tracking di halaman depan dan teruskan state tersebut ke flow registrasi NextAuth.
              </p>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}
