import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import { formatNumber } from "@/lib/format"

export const dynamic = "force-dynamic"

export default async function ActivationIntelligencePage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") return <div className="p-8">Unauthorized</div>

  const totalUsers = await prisma.user.count()
  const allBusinesses = await prisma.business.findMany({
    select: { id: true, userId: true, products: { select: { id: true }, take: 1 }, ingredients: { select: { id: true }, take: 1 } }
  })
  
  // Data Created = has products or ingredients
  const usersWithBusiness = new Set<string>()
  const usersWithData = new Set<string>()
  
  allBusinesses.forEach(b => {
    usersWithBusiness.add(b.userId)
    if (b.products.length > 0 || b.ingredients.length > 0) {
      usersWithData.add(b.userId)
    }
  })
  
  // Core Activity = HPP or POS event created
  const coreEvents = await prisma.pilotEvent.findMany({
    where: { eventName: { in: ['hpp_created', 'pos_transaction_completed'] } },
    select: { businessId: true }
  })
  const businessesWithCoreActivity = new Set(coreEvents.map(e => e.businessId).filter(Boolean))
  
  const usersWithCoreActivity = new Set<string>()
  const userBusinessMap = new Map<string, string[]>()
  allBusinesses.forEach(b => {
    if (!userBusinessMap.has(b.userId)) userBusinessMap.set(b.userId, [])
    userBusinessMap.get(b.userId)!.push(b.id)
  })
  
  userBusinessMap.forEach((bIds, uId) => {
    if (bIds.some(id => businessesWithCoreActivity.has(id))) {
      usersWithCoreActivity.add(uId)
    }
  })

  const valRegistered = totalUsers
  const valBusiness = usersWithBusiness.size
  const valData = usersWithData.size
  const valCore = usersWithCoreActivity.size
  
  const rateBusiness = valRegistered > 0 ? (valBusiness / valRegistered) * 100 : 0
  const rateData = valBusiness > 0 ? (valData / valBusiness) * 100 : 0
  const rateCore = valData > 0 ? (valCore / valData) * 100 : 0
  
  const dropBusiness = 100 - rateBusiness
  const dropData = 100 - rateData
  const dropCore = 100 - rateCore
  
  let biggestDropStr = "N/A"
  let biggestDropVal = 0
  if (dropBusiness > biggestDropVal) { biggestDropVal = dropBusiness; biggestDropStr = "Registered -> Business Created" }
  if (dropData > biggestDropVal) { biggestDropVal = dropData; biggestDropStr = "Business Created -> Data Created" }
  if (dropCore > biggestDropVal) { biggestDropVal = dropCore; biggestDropStr = "Data Created -> Core Activity" }

  return (
    <AdminLayout activeMenu="activation">
      <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-full">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Activation Intelligence</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Analisis Funnel Aktivasi UBOS</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Activation Funnel</h2>
          
          <div className="space-y-4">
            {/* Registered */}
            <div>
              <div className="flex justify-between items-end mb-1">
                <p className="text-xs font-bold text-slate-500 uppercase">1. Registered Users</p>
                <p className="text-lg font-black text-slate-900">{formatNumber(valRegistered)}</p>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: '100%' }}></div></div>
            </div>
            
            {/* Business */}
            <div>
              <div className="flex justify-between items-end mb-1">
                <p className="text-xs font-bold text-slate-500 uppercase">2. Business Created</p>
                <div className="text-right">
                  <p className="text-lg font-black text-slate-900">{formatNumber(valBusiness)}</p>
                  <p className="text-[10px] font-bold text-rose-500">Drop: {dropBusiness.toFixed(1)}%</p>
                </div>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${rateBusiness}%` }}></div></div>
            </div>
            
            {/* Data */}
            <div>
              <div className="flex justify-between items-end mb-1">
                <p className="text-xs font-bold text-slate-500 uppercase">3. Data Created</p>
                <div className="text-right">
                  <p className="text-lg font-black text-slate-900">{formatNumber(valData)}</p>
                  <p className="text-[10px] font-bold text-rose-500">Drop: {dropData.toFixed(1)}%</p>
                </div>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${rateData}%` }}></div></div>
            </div>
            
            {/* Core */}
            <div>
              <div className="flex justify-between items-end mb-1">
                <p className="text-xs font-bold text-slate-500 uppercase">4. Core Activity (HPP/POS)</p>
                <div className="text-right">
                  <p className="text-lg font-black text-slate-900">{formatNumber(valCore)}</p>
                  <p className="text-[10px] font-bold text-rose-500">Drop: {dropCore.toFixed(1)}%</p>
                </div>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${rateCore}%` }}></div></div>
            </div>
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl">
          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-1">Diagnosis</p>
          <p className="text-sm font-bold text-rose-900">Drop terbesar terjadi pada: {biggestDropStr} ({biggestDropVal.toFixed(1)}%)</p>
          <p className="text-xs text-rose-700 mt-2">Fokuskan perbaikan UX dan marketing automation pada titik ini.</p>
        </div>
      </div>
    </AdminLayout>
  )
}
