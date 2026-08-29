import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import { formatNumber } from "@/lib/format"
import { getStartOfDayUTC } from "@/lib/engines/timeEngine"

export const dynamic = "force-dynamic"

export default async function UserIntelligencePage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") return <div className="p-8">Unauthorized</div>

  const now = new Date()
  const tz = "Asia/Jakarta"
  const today = getStartOfDayUTC(tz, now)
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)

  // Fetch base data
  const totalUsers = await prisma.user.count()
  const usersNew = await prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } })
  const allBusinesses = await prisma.business.findMany({ select: { id: true, userId: true } })
  const activeEvents = await prisma.pilotEvent.findMany({ where: { createdAt: { gte: sevenDaysAgo } }, select: { businessId: true } })
  const activeEvents14 = await prisma.pilotEvent.findMany({ where: { createdAt: { gte: fourteenDaysAgo } }, select: { businessId: true } })

  const businessIdsActive7d = new Set(activeEvents.map(e => e.businessId).filter(Boolean))
  const businessIdsActive14d = new Set(activeEvents14.map(e => e.businessId).filter(Boolean))

  const usersWithBusiness = new Set(allBusinesses.map(b => b.userId))
  
  let activated = usersWithBusiness.size
  let notActivated = totalUsers - activated
  
  let activeUsers = 0
  let inactiveUsers = 0
  let churnRiskUsers = 0

  // We consider a user ACTIVE if ANY of their businesses are active in 7d
  // INACTIVE if they have a business but NO businesses active in 7d
  // CHURN RISK if they have a business but NO businesses active in 14d

  const userBusinessMap = new Map<string, string[]>()
  allBusinesses.forEach(b => {
    if (!userBusinessMap.has(b.userId)) userBusinessMap.set(b.userId, [])
    userBusinessMap.get(b.userId)!.push(b.id)
  })

  userBusinessMap.forEach((businessIds) => {
    const isActive7d = businessIds.some(id => businessIdsActive7d.has(id))
    const isActive14d = businessIds.some(id => businessIdsActive14d.has(id))
    
    if (isActive7d) {
      activeUsers++
    } else {
      if (isActive14d) {
        inactiveUsers++ // Inactive 7d but active 14d
      } else {
        churnRiskUsers++ // Inactive >14d
      }
    }
  })

  return (
    <AdminLayout activeMenu="users">
      <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-full">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">User Intelligence</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Siapa yang perlu diperhatikan Owner sekarang?</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Total Registered</p>
            <p className="text-2xl font-black text-slate-900">{formatNumber(totalUsers)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-blue-500">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">User Baru (7H)</p>
            <p className="text-2xl font-black text-blue-600">{formatNumber(usersNew)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-amber-500">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Not Activated</p>
            <p className="text-2xl font-black text-amber-600">{formatNumber(notActivated)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-emerald-500">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Active (7H)</p>
            <p className="text-2xl font-black text-emerald-600">{formatNumber(activeUsers)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-orange-500">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Inactive (7-14H)</p>
            <p className="text-2xl font-black text-orange-600">{formatNumber(inactiveUsers)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-rose-500">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Churn Risk (&gt;14H)</p>
            <p className="text-2xl font-black text-rose-600">{formatNumber(churnRiskUsers)}</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
