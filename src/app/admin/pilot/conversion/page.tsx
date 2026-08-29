import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"

export const dynamic = "force-dynamic"

export default async function AdminConversionPage() {
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
  const hasHppMap = new Set(events.filter(e => e.eventName === "hpp_created").map(e => e.businessId))
  const hasPosMap = new Set(events.filter(e => e.eventName === "pos_transaction_completed").map(e => e.businessId))
  
  let hppCount = 0
  let posCount = 0
  
  for (const b of allBusinesses) {
    if (hasHppMap.has(b.id)) hppCount++
    if (hasPosMap.has(b.id) || b.sales.length > 0) posCount++
  }

  const getRate = (a: number, b: number) => {
    if (b === 0) return "N/A"
    return `${Math.round((a / b) * 100)}%`
  }
  
  return (
    <AdminLayout activeMenu="conversion">
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Conversion Analysis</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Layer analisis konversi dari hulu ke hilir</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Visitor → Lead</p>
            <p className="text-4xl font-black text-gray-900">N/A</p>
            <p className="text-[10px] font-bold text-rose-500 mt-2 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full uppercase">DATA BELUM TERSEDIA</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Lead → Register</p>
            <p className="text-4xl font-black text-gray-900">N/A</p>
            <p className="text-[10px] font-bold text-rose-500 mt-2 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full uppercase">DATA BELUM TERSEDIA</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Register → Business</p>
            <p className="text-4xl font-black text-gray-900">{getRate(totalBusinesses, totalUsers)}</p>
            <p className="text-xs font-bold text-blue-600 mt-2 bg-blue-50 px-3 py-1 rounded-full">{totalBusinesses} / {totalUsers}</p>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Business → Activation</p>
            <p className="text-4xl font-black text-gray-900">{getRate(businessesWithData, totalBusinesses)}</p>
            <p className="text-xs font-bold text-amber-600 mt-2 bg-amber-50 px-3 py-1 rounded-full">{businessesWithData} / {totalBusinesses}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Activation → 1st HPP</p>
            <p className="text-4xl font-black text-gray-900">{getRate(hppCount, businessesWithData)}</p>
            <p className="text-xs font-bold text-emerald-600 mt-2 bg-emerald-50 px-3 py-1 rounded-full">{hppCount} / {businessesWithData}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">1st HPP → 1st POS</p>
            <p className="text-4xl font-black text-gray-900">{getRate(posCount, hppCount)}</p>
            <p className="text-xs font-bold text-rose-600 mt-2 bg-rose-50 px-3 py-1 rounded-full">{posCount} / {hppCount}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Monetization Conversion</h3>
          <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50 p-6 rounded-2xl border border-gray-200 gap-4">
            <div className="text-center md:text-left">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Activation → Paid</span>
              <span className="font-bold text-gray-900 text-lg">Subscription Conversion</span>
            </div>
            <span className="font-black text-rose-500 bg-rose-50 border border-rose-100 px-4 py-2 rounded-xl text-center">DATA BELUM TERSEDIA</span>
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}

