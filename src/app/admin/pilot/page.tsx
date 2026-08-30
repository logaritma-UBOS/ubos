import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import UbosFeed from "@/components/dashboard/UbosFeed"
import { formatNumber } from "@/lib/format"
import { getOwnerOpportunities, getDashboardIntelligence } from "@/lib/owner/opportunityEngine"

export const dynamic = "force-dynamic"

async function logoutAdmin() {
  "use server"
  const cookieStore = await cookies()
  cookieStore.delete("ubos_pilot_auth")
  revalidatePath("/admin/pilot")
}

async function loginAdmin(formData: FormData) {
  "use server"
  const email = formData.get("email")?.toString()
  const password = formData.get("password")?.toString()
  
  if (email === "logaritma.tim@gmail.com" && password === "adminlog2026") {
    const cookieStore = await cookies()
    cookieStore.set("ubos_pilot_auth", "authenticated", { path: "/" })
  }
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
  const opportunityId = formData.get("opportunityId")?.toString() || "SYSTEM_RECOMMENDATION"
  
  await prisma.ownerAction.create({
    data: {
      source: opportunityId,
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <form action={loginAdmin} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-sm w-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-black text-xl">U</span>
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-none">OWNER CENTER</h1>
              <p className="text-xs text-slate-500 mt-1">Internal Access Only</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
              <input type="email" name="email" className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Password</label>
              <input type="password" name="password" className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" required />
            </div>
            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg uppercase text-xs tracking-wider transition-colors mt-2">
              Login
            </button>
          </div>
        </form>
      </div>
    )
  }

  const intel = await getDashboardIntelligence()
  const opportunities = await getOwnerOpportunities()
  
  const trafficOpps = opportunities.filter(o => o.category === "USER_GROWTH");
  const conversionOpps = opportunities.filter(o => o.category === "ACTIVATION" || o.category === "UPGRADE");
  const relationshipOpps = opportunities.filter(o => o.category === "RETENTION" || o.category === "FEATURE_ADOPTION" || o.category === "REACTIVATION" || o.category === "EDUCATION");
  
  const getTopOpp = (opps: any[]) => opps.length > 0 ? opps[0] : null;
  const trafficProblem = getTopOpp(trafficOpps);
  const conversionProblem = getTopOpp(conversionOpps);
  const relationshipProblem = getTopOpp(relationshipOpps);
  const topProblem = opportunities.length > 0 ? opportunities[0] : null;

  return (
    <AdminLayout activeMenu="control" logoutAction={logoutAdmin}>
      <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-full">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase">Dashboard Utama</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Sistem Pemetaan Mundur (Backward Mapping)</p>
        </div>
        <div className="mt-6">
          <UbosFeed />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. REVENUE */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800">
            <h2 className="text-xs font-black tracking-widest text-slate-400 mb-4">1. REVENUE</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Target</p>
                <p className="text-lg font-bold">DATA BELUM TERSEDIA</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Pencapaian</p>
                <p className="text-lg font-bold">DATA BELUM TERSEDIA</p>
              </div>
              <div className="col-span-2 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-rose-400">Kurang (Gap)</p>
                    <p className="text-base font-bold text-rose-300">DATA BELUM TERSEDIA</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Status</p>
                    <p className="text-xs font-bold text-slate-400">DATA BELUM CUKUP</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. PAYING USERS */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xs font-black tracking-widest text-slate-500 mb-4">2. PAYING USERS</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Target</p>
                <p className="text-lg font-bold text-slate-400">DATA BELUM TERSEDIA</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Pencapaian</p>
                <p className="text-lg font-bold text-slate-400">DATA BELUM TERSEDIA</p>
              </div>
              <div className="col-span-2 bg-rose-50 p-3 rounded-lg border border-rose-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-rose-500">Kurang (Gap)</p>
                    <p className="text-base font-bold text-rose-600">DATA BELUM TERSEDIA</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Status</p>
                    <p className="text-xs font-bold text-slate-400">DATA BELUM CUKUP</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TOP PROBLEM */}
        {topProblem && (
          <div className="bg-rose-600 text-white p-6 rounded-2xl shadow-lg border border-rose-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-32 h-32">
                <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
              </svg>
            </div>
            
            <h2 className="text-xs font-black tracking-widest text-rose-200 mb-6 uppercase">Masalah Terbesar Hari Ini</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
              <div className="md:col-span-1">
                <p className="text-[10px] uppercase font-bold text-rose-200 mb-1">Masalah</p>
                <p className="text-lg font-bold leading-tight">{topProblem.diagnosis || topProblem.evidence}</p>
              </div>
              
              <div className="md:col-span-1">
                <p className="text-[10px] uppercase font-bold text-rose-200 mb-1">Penyebab</p>
                <p className="text-sm">{topProblem.evidence}</p>
              </div>
              
              <div className="md:col-span-1">
                <p className="text-[10px] uppercase font-bold text-rose-200 mb-1">Dampak (User Terdampak)</p>
                <p className="text-2xl font-black">{formatNumber(topProblem.affectedUsers)} <span className="text-sm font-medium">User</span></p>
              </div>

              <div className="md:col-span-1 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
                <p className="text-[10px] uppercase font-bold text-rose-200 mb-1">Tindakan</p>
                <p className="text-sm font-bold mb-3">{topProblem.recommendedAction}</p>
                <form action={triggerAction}>
                  <input type="hidden" name="metric" value={topProblem.targetSegment} />
                  <input type="hidden" name="recommendation" value={topProblem.recommendedAction} />
                  <input type="hidden" name="expectedResult" value={topProblem.expectedResult} />
                  <input type="hidden" name="actionType" value="MARKETING_CAMPAIGN" />
                  <input type="hidden" name="opportunityId" value={topProblem.id} />
                  <button type="submit" className="w-full bg-white text-rose-700 hover:bg-rose-50 text-[10px] font-black uppercase tracking-wider px-3 py-2.5 rounded-lg transition-colors">
                    Jalankan Kampanye
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">Performa Alur Bisnis</h2>
          
          {/* 3. KONVERSI */}
          <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-emerald-500">
            <h3 className="font-black text-emerald-900 uppercase tracking-wider mb-4">3. KONVERSI</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Target (Bisnis Aktif)</p>
                <p className="font-bold text-slate-400">DATA BELUM TERSEDIA</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Pencapaian</p>
                <p className="font-bold text-emerald-700">{formatNumber(intel.activatedUsers)} Bisnis</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-rose-500 uppercase">Kurang (Gap)</p>
                <p className="font-bold text-rose-600">{formatNumber(intel.stuckAfterRegister)} Stuck</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Status</p>
                <p className="font-bold text-slate-700">{conversionProblem ? "PERLU TINDAKAN" : "AMAN"}</p>
              </div>
            </div>
          </div>

          {/* 4. TRAFIK (KUNJUNGAN) */}
          <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-indigo-500">
            <h3 className="font-black text-indigo-900 uppercase tracking-wider mb-4">4. TRAFIK (KUNJUNGAN)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Target (User Baru)</p>
                <p className="font-bold text-slate-400">DATA BELUM TERSEDIA</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Pencapaian</p>
                <p className="font-bold text-indigo-700">{formatNumber(intel.totalUsers)} User</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-rose-500 uppercase">Kurang (Gap)</p>
                <p className="font-bold text-rose-600">DATA BELUM TERSEDIA</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Status</p>
                <p className="font-bold text-slate-700">{trafficProblem ? "PERLU TINDAKAN" : "AMAN"}</p>
              </div>
            </div>
          </div>

          {/* 5. HUBUNGAN (RETENSI) */}
          <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-amber-500">
            <h3 className="font-black text-amber-900 uppercase tracking-wider mb-4">5. HUBUNGAN (RETENSI)</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Pencapaian (Aktif)</p>
                <p className="font-bold text-amber-700">{formatNumber(intel.activeUsers)} User</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-[10px] font-bold text-rose-500 uppercase">Masalah</p>
                <p className="text-sm font-semibold text-rose-700 line-clamp-1">{relationshipProblem ? relationshipProblem.diagnosis : formatNumber(intel.inactiveUsers) + " User Pasif"}</p>
              </div>
              <div className="md:col-span-1">
                <p className="text-[10px] font-bold text-rose-500 uppercase">Penyebab</p>
                <p className="text-sm text-rose-600 line-clamp-1">{relationshipProblem ? relationshipProblem.evidence : "Belum ada data mendesak"}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Status</p>
                <p className="font-bold text-slate-700">{relationshipProblem ? "PERLU TINDAKAN" : "AMAN"}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  )
}
