import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import { formatNumber } from "@/lib/format"
import { runOwnerEngine } from "@/lib/ownerEngine"
import { getOwnerOpportunities, getDailyBrief, getDashboardIntelligence } from "@/lib/owner/opportunityEngine"

export const dynamic = "force-dynamic"

async function logoutAdmin() {
  "use server"
  const cookieStore = await cookies()
  cookieStore.delete("ubos_pilot_auth")
  revalidatePath("/admin/pilot")
}

async function triggerAction(formData: FormData) {
  "use server"
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") throw new Error("Unauthorized")
  
  const metric = formData.get("metric")?.toString() || ""
  const recommendation = formData.get("recommendation")?.toString() || ""
  const expectedResult = formData.get("expectedResult")?.toString() || ""
  const actualStr = formData.get("actual")?.toString() || "0"
  const targetStr = formData.get("target")?.toString() || "0"
  const gapStr = formData.get("gap")?.toString() || "0"
  const severity = (formData.get("severity")?.toString() || "LOW")
  const confidence = (formData.get("confidence")?.toString() || "LOW")
  const direction = (formData.get("direction")?.toString() || "HIGHER_IS_BETTER")
  const actionType = formData.get("actionType")?.toString() || "GENERAL_ACTION"
  
  await prisma.ownerAction.create({
    data: {
      source: "SYSTEM_RECOMMENDATION",
      metric,
      actionType,
      recommendation,
      expectedResult,
      actualBefore: parseFloat(actualStr),
      target: parseFloat(targetStr),
      gapBefore: parseFloat(gapStr),
      severity,
      confidence,
      direction,
      status: "ACCEPTED"
    }
  })

  // Also create a Campaign draft
  if (actionType === "MARKETING_CAMPAIGN") {
    await prisma.ownerCampaign.create({
      data: {
        name: `${metric} Push`,
        objective: recommendation,
        targetSegment: metric,
        message: recommendation,
        status: "DRAFT",
        expectedResult: expectedResult
      }
    });
  }
  
  revalidatePath("/admin/pilot")
}

export default async function ControlCenterPage() {
  const cookieStore = await cookies()
  const auth = cookieStore.get("ubos_pilot_auth")?.value
  
  if (auth !== "authenticated") {
    // Should be handled by middleware or layout, but just in case
    return <div className="p-10">Unauthorized</div>
  }

  const systemHealth = "HEALTHY"
  
  const intel = await getDashboardIntelligence()
  
  const opportunities = await getOwnerOpportunities()
  const dailyBrief = await getDailyBrief(opportunities)
  
  // FETCH LAST EVALUATED ACTION FOR DAILY BRIEF
  const lastAction = await prisma.ownerAction.findFirst({
    where: { status: "EVALUATED" },
    orderBy: { gapAfter: 'asc' }, // just some deterministic order, ideally updatedAt
  });

  const gapAnalysis = await runOwnerEngine()

  return (
    <AdminLayout activeMenu="control" logoutAction={logoutAdmin}>
      <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-full">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">UBOS Growth Control Center</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Intelligence, Priorities, and Action Center</p>
        </div>

        
        
        {/* OWNER DAILY BRIEF */}
        {dailyBrief ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <h2 className="text-sm font-black tracking-widest uppercase">UBOS HARI INI</h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Kondisi Utama</p>
                <p className="font-semibold text-slate-900">{dailyBrief.kondisi}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Masalah Terbesar</p>
                <p className="font-semibold text-rose-600">{dailyBrief.masalah}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Jumlah User Terdampak</p>
                <p className="font-semibold text-slate-900">{opportunities[0]?.affectedUsers || 0} Users</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Evidence (Data Nyata)</p>
                <p className="font-semibold text-slate-900">{opportunities[0]?.evidence || dailyBrief.penyebab}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Action Terakhir (History)</p>
                <p className="font-semibold text-slate-900 line-clamp-1">{lastAction ? lastAction.recommendation : 'Belum ada action yang dievaluasi'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Result Action Terakhir</p>
                <p className={`font-semibold ${lastAction?.learningResult === 'SUCCESS' ? 'text-emerald-600' : lastAction?.learningResult === 'FAILED' ? 'text-rose-600' : 'text-slate-600'}`}>
                  {lastAction ? `${lastAction.learningResult} - ${lastAction.evaluation}` : '-'}
                </p>
              </div>
              <div className="md:col-span-2 p-4 bg-blue-50 border border-blue-100 rounded-xl mt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[10px] font-bold text-blue-600 uppercase">Action Owner yang Direkomendasikan</p>
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${opportunities[0]?.priority === 'CRITICAL' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'}`}>{opportunities[0]?.priority} PRIORITY</span>
                  </div>
                  <p className="font-bold text-blue-900">{dailyBrief.action}</p>
                </div>
                <a href="#opportunities" className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors">
                  Lihat Opportunity &rarr;
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest mb-2">UBOS HARI INI</h2>
            <p className="text-slate-500 font-medium">Tidak ada opportunity prioritas saat ini. Semua indikator operasional berjalan stabil.</p>
          </div>
        )}


        {/* GROWTH & LIFECYCLE GRID */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Users</p>
            <p className="text-2xl font-black text-slate-900">{formatNumber(intel.totalUsers)}</p>
            <p className="text-[10px] text-emerald-600 font-bold mt-1">+{formatNumber(intel.newUsers)} (7d)</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Activated</p>
            <p className="text-2xl font-black text-slate-900">{formatNumber(intel.activatedUsers)}</p>
            <p className="text-[10px] text-slate-500 font-bold mt-1">Rate: {intel.activationRate.toFixed(1)}%</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Active (7d)</p>
            <p className="text-2xl font-black text-slate-900">{formatNumber(intel.activeUsers)}</p>
            <p className="text-[10px] text-slate-500 font-bold mt-1">Ret: {intel.retentionRate.toFixed(1)}%</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-rose-100 bg-rose-50/30">
            <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest mb-1">Inactive / Churn Risk</p>
            <p className="text-2xl font-black text-rose-700">{formatNumber(intel.inactiveUsers)}</p>
            <p className="text-[10px] text-rose-500 font-bold mt-1">{formatNumber(intel.churnRiskUsers)} Critical Risk</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-amber-100 bg-amber-50/30">
            <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest mb-1">Stuck at Reg</p>
            <p className="text-2xl font-black text-amber-700">{formatNumber(intel.stuckAfterRegister)}</p>
            <p className="text-[10px] text-amber-600 font-bold mt-1">Belum bikin bisnis</p>
          </div>
        </div>

        {/* OPERATIONS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Feature Adoption</p>
            <div className="space-y-1 mt-2">
              <div className="flex justify-between text-[10px]"><span className="font-bold">Catalog</span><span>{intel.catalogAdoption.toFixed(0)}%</span></div>
              <div className="flex justify-between text-[10px]"><span className="font-bold">HPP</span><span>{intel.hppAdoption.toFixed(0)}%</span></div>
              <div className="flex justify-between text-[10px]"><span className="font-bold">POS</span><span>{intel.posAdoption.toFixed(0)}%</span></div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Active Actions</p>
            <p className="text-2xl font-black text-blue-600">{formatNumber(intel.activeActions)}</p>
            <p className="text-[10px] text-emerald-600 font-bold mt-1">{formatNumber(intel.successfulActions)} Success</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Marketing Status</p>
            <div className="space-y-1 mt-2">
              <div className="flex justify-between text-[10px]"><span className="font-bold">Campaigns</span><span className="text-blue-600 font-bold">{intel.activeCampaigns}</span></div>
              <div className="flex justify-between text-[10px]"><span className="font-bold">Offers</span><span className="text-purple-600 font-bold">{intel.activeOffers}</span></div>
              <div className="flex justify-between text-[10px]"><span className="font-bold">Pending Notif</span><span className="text-amber-600 font-bold">{intel.pendingNotifications}</span></div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 opacity-60">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Monetization</p>
            <p className="text-lg font-bold text-slate-400 mt-2 leading-tight">Data Belum Tersedia</p>
          </div>
        </div>

        {/* LOGARITMA ENGINE DIAGNOSIS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 id="opportunities" className="text-sm font-black text-slate-900 uppercase tracking-widest">Top Opportunities (Priority Sorted)</h2>
            {opportunities.length > 0 ? opportunities.map((opp, i) => (
              <div key={opp.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">{opp.audience}</p>
                      <h3 className="text-lg font-black text-slate-900">{opp.type} OPPORTUNITY</h3>
                    </div>
                    <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-md ${opp.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                      {opp.priority} PRIORITY
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-6 mt-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Target</p>
                      <p className="font-bold text-slate-900">{formatNumber(opp.target)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Aktual</p>
                      <p className="font-bold text-slate-900">{formatNumber(opp.current)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Gap</p>
                      <p className="font-bold text-rose-600">{formatNumber(Math.abs(opp.gap))}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Impact Score</p>
                      <p className="font-bold text-blue-600">{formatNumber(Math.round(opp.impactScore))}</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Diagnosis (Why)</p>
                    <p className="text-sm font-medium text-slate-700">{opp.diagnosis}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Recommended Action</p>
                    <p className="text-sm font-bold text-blue-900">{opp.recommendedAction}</p>
                    <p className="text-xs text-blue-700 mt-2">Marketing Message: <span className="font-medium italic">"{opp.recommendedMessage}"</span></p>
                    
                    <form action={triggerAction} className="mt-4">
                      <input type="hidden" name="metric" value={opp.type} />
                      <input type="hidden" name="recommendation" value={opp.recommendedAction} />
                      <input type="hidden" name="expectedResult" value={opp.expectedResult} />
                      <input type="hidden" name="target" value={opp.target} />
                      <input type="hidden" name="actual" value={opp.current} />
                      <input type="hidden" name="gap" value={opp.gap} />
                      <input type="hidden" name="severity" value={opp.severity} />
                      <input type="hidden" name="confidence" value={opp.confidence} />
                      <input type="hidden" name="direction" value="HIGHER_IS_BETTER" />
                      <input type="hidden" name="actionType" value="MARKETING_CAMPAIGN" />
                      <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors uppercase tracking-wider">
                        Accept & Execute Campaign
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
                <p className="text-slate-500 font-bold">Tidak ada opportunity aktif saat ini.</p>
              </div>
            )}
          </div>

          <div>
            <div className="space-y-4">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Marketing Opportunity Hari Ini</h2>
              {opportunities.length > 0 ? opportunities.slice(0, 3).map(opp => (
                <div key={"mkt_"+opp.id} className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase">{opp.audience}</p>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider bg-emerald-200 text-emerald-800">
                      {opp.type}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 mb-1">{opp.recommendedAction}</p>
                  <p className="text-[10px] text-slate-600 mb-2">{opp.numberOfAffectedUsers} user terdampak</p>
                  <a href="/admin/pilot/campaigns" className="text-[10px] font-bold text-emerald-700 uppercase hover:underline">Launch Campaign &rarr;</a>
                </div>
              )) : (
                 <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 text-center">
                   <p className="text-xs text-slate-500 font-medium">Tidak ada marketing opportunity.</p>
                 </div>
              )}
            </div>
            
            <div className="space-y-4 mt-8">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Actions</h2>
              <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 text-center">
                <p className="text-xs text-slate-500 font-medium">Lihat detail di halaman Actions.</p>
                <a href="/admin/pilot/actions" className="text-[10px] font-bold text-blue-600 uppercase hover:underline mt-2 inline-block">Buka Actions &rarr;</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
