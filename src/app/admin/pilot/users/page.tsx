import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import { formatNumber } from "@/lib/format"
import { getStartOfDayUTC } from "@/lib/engines/timeEngine"

export const dynamic = "force-dynamic"

export default async function UserIntelligencePage({ searchParams }: { searchParams: { state?: string, risk?: string } }) {
  const filterState = searchParams.state;
  const filterRisk = searchParams.risk;
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
  const allBusinesses = await prisma.business.findMany({ select: { id: true, userId: true, name: true } })
  const activeEvents = await prisma.pilotEvent.findMany({ where: { createdAt: { gte: sevenDaysAgo } }, select: { businessId: true } })
  const activeEvents14 = await prisma.pilotEvent.findMany({ where: { createdAt: { gte: fourteenDaysAgo } }, select: { businessId: true } })

  const businessIdsActive7d = new Set(activeEvents.map((e: any) => e.businessId).filter(Boolean))
  const businessIdsActive14d = new Set(activeEvents14.map((e: any) => e.businessId).filter(Boolean))

  const usersWithBusiness = new Set(allBusinesses.map((b: any) => b.userId))
  
  let activated = usersWithBusiness.size
  let notActivated = totalUsers - activated
  
  let activeUsersCount = 0
  let inactiveUsersCount = 0
  let churnRiskUsersCount = 0

  const userBusinessMap = new Map<string, any[]>()
  allBusinesses.forEach((b: any) => {
    if (!userBusinessMap.has(b.userId)) userBusinessMap.set(b.userId, [])
    userBusinessMap.get(b.userId)!.push(b)
  })

  userBusinessMap.forEach((businesses, userId) => {
    const isActive7d = businesses.some((b: any) => businessIdsActive7d.has(b.id))
    const isActive14d = businesses.some((b: any) => businessIdsActive14d.has(b.id))
    
    if (isActive7d) {
      activeUsersCount++
    } else {
      if (isActive14d) {
        inactiveUsersCount++ 
      } else {
        churnRiskUsersCount++ 
      }
    }
  })

  // Fetch Detailed Users List
  const users = await prisma.user.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' },
    include: {
      businesses: {
        include: {
          pilotEvents: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      }
    }
  });

  const detailedUsers = users.map((user: any) => {
    let state = "REGISTERED";
    let lastActivity: Date | null = user.createdAt;
    let featureUsage = { hpp: false, pos: false, catalog: false };
    
    if (user.businesses && user.businesses.length > 0) {
      state = "NOT_ACTIVATED";
      
      const allEvents: any[] = user.businesses.flatMap((b: any) => b.pilotEvents).sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
      if (allEvents.length > 0) {
        lastActivity = allEvents[0].createdAt;
        const daysSinceLastActivity = lastActivity ? Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)) : 0;
        
        featureUsage.hpp = allEvents.some((e: any) => e.eventName === 'hpp_created');
        featureUsage.pos = allEvents.some((e: any) => e.eventName === 'pos_transaction_completed');
        featureUsage.catalog = allEvents.some((e: any) => e.eventName === 'catalog_updated');

        if (daysSinceLastActivity <= 7) {
          state = "ACTIVE";
        } else if (daysSinceLastActivity <= 14) {
          state = "INACTIVE";
        } else {
          state = "CHURN_RISK";
        }
      }
    }

    let recommendedAction = "Kirim Welcome / Panduan Bikin Bisnis";
    let riskLevel = "LOW";

    if (state === "NOT_ACTIVATED" || (state === "ACTIVE" && (!featureUsage.hpp || !featureUsage.pos))) {
      recommendedAction = "Activation Campaign: Dorong HPP & Transaksi Pertama";
      riskLevel = "MEDIUM";
    } else if (state === "INACTIVE") {
      recommendedAction = "Re-engagement Message: Kembalikan Aktivitas";
      riskLevel = "HIGH";
    } else if (state === "CHURN_RISK") {
      recommendedAction = "Churn Prevention: Penawaran Khusus / Cek Kendala";
      riskLevel = "CRITICAL";
    } else if (state === "ACTIVE" && featureUsage.pos) {
      recommendedAction = "Power User Opportunity: Premium Upgrade / Testimonial";
      riskLevel = "LOW";
    }

    return {
      ...user,
      state,
      lastActivity,
      featureUsage,
      recommendedAction,
      riskLevel
    };
  });

  
  let filteredUsers = detailedUsers;
  if (filterState) filteredUsers = filteredUsers.filter(u => u.state === filterState);
  if (filterRisk) filteredUsers = filteredUsers.filter(u => u.riskLevel === filterRisk);

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
            <p className="text-2xl font-black text-emerald-600">{formatNumber(activeUsersCount)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-orange-500">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Inactive (7-14H)</p>
            <p className="text-2xl font-black text-orange-600">{formatNumber(inactiveUsersCount)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-rose-500">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Churn Risk (&gt;14H)</p>
            <p className="text-2xl font-black text-rose-600">{formatNumber(churnRiskUsersCount)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
            <h2 className="text-sm font-black tracking-widest uppercase">Detailed User State (Top 100)</h2>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4 mt-6">
            <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center mr-2">Filter:</span>
            <a href="/admin/pilot/users" className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${(!filterState && !filterRisk) ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-600'}`}>All</a>
            <a href="/admin/pilot/users?state=ACTIVE" className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${filterState === 'ACTIVE' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'}`}>Active</a>
            <a href="/admin/pilot/users?state=INACTIVE" className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${filterState === 'INACTIVE' ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-700'}`}>Inactive</a>
            <a href="/admin/pilot/users?state=CHURN_RISK" className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${filterState === 'CHURN_RISK' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-700'}`}>Churn Risk</a>
            <a href="/admin/pilot/users?state=NOT_ACTIVATED" className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${filterState === 'NOT_ACTIVATED' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700'}`}>Not Activated</a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-4 py-3">Who</th>
                  <th className="px-4 py-3">State</th>
                  <th className="px-4 py-3">Last Activity</th>
                  <th className="px-4 py-3">Feature Usage</th>
                  <th className="px-4 py-3">Risk</th>
                  <th className="px-4 py-3 min-w-[200px]">Action Recommended</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-slate-500">Tidak ada user yang cocok dengan filter ini.</td></tr> : filteredUsers.map((user: any) => (
                  <tr key={user.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                      {user.businesses && user.businesses.length > 0 && (
                        <p className="text-[9px] text-blue-600 mt-1 uppercase tracking-widest">{user.businesses[0].name}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        user.state === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' :
                        user.state === 'REGISTERED' ? 'bg-slate-100 text-slate-700' :
                        user.state === 'NOT_ACTIVATED' ? 'bg-amber-50 text-amber-700' :
                        user.state === 'INACTIVE' ? 'bg-orange-50 text-orange-700' :
                        'bg-rose-50 text-rose-700'
                      }`}>
                        {user.state}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs text-slate-700">{user.lastActivity?.toLocaleDateString('id-ID')}</p>
                    </td>
                    <td className="px-4 py-4 space-y-1 text-[9px] font-bold tracking-widest uppercase">
                      {user.businesses && user.businesses.length > 0 ? (
                        <>
                          <div className={`flex items-center gap-1 ${user.featureUsage.catalog ? 'text-emerald-600' : 'text-slate-300'}`}>
                            <span className={`w-2 h-2 rounded-full ${user.featureUsage.catalog ? 'bg-emerald-500' : 'bg-slate-200'}`}></span> Catalog
                          </div>
                          <div className={`flex items-center gap-1 ${user.featureUsage.hpp ? 'text-emerald-600' : 'text-slate-300'}`}>
                            <span className={`w-2 h-2 rounded-full ${user.featureUsage.hpp ? 'bg-emerald-500' : 'bg-slate-200'}`}></span> HPP
                          </div>
                          <div className={`flex items-center gap-1 ${user.featureUsage.pos ? 'text-emerald-600' : 'text-slate-300'}`}>
                            <span className={`w-2 h-2 rounded-full ${user.featureUsage.pos ? 'bg-emerald-500' : 'bg-slate-200'}`}></span> POS Tx
                          </div>
                        </>
                      ) : (
                        <span className="text-slate-400">NO BIZ</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                        user.riskLevel === 'CRITICAL' ? 'text-rose-700 bg-rose-100' :
                        user.riskLevel === 'HIGH' ? 'text-orange-700 bg-orange-100' :
                        user.riskLevel === 'MEDIUM' ? 'text-amber-700 bg-amber-100' :
                        'text-emerald-700 bg-emerald-100'
                      }`}>
                        {user.riskLevel}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs font-bold text-blue-900">{user.recommendedAction}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
