import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
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
            <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xl">U</span>
            </div>
            <div>
              <h1 className="font-bold text-slate-900">Control Center</h1>
              <p className="text-xs text-slate-500">Internal Access Only</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email</label>
              <input type="email" name="email" className="w-full p-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-indigo-500" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Password</label>
              <input type="password" name="password" className="w-full p-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-indigo-500" required />
            </div>
            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded uppercase text-xs tracking-wider transition-colors mt-2">
              Login to Control Center
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

  return (
    <AdminLayout activeMenu="control" logoutAction={logoutAdmin}>
      <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-full">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Growth Control Center</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Traffic &rarr; Conversion &rarr; Relationship &rarr; Revenue</p>
        </div>

        {/* OWNER DECISION SCREEN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
            <h2 className="text-xs font-black tracking-widest text-slate-400 mb-4">REVENUE</h2>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Target Revenue</p>
                <p className="text-xl font-bold">DATA BELUM TERSEDIA</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Pencapaian Actual</p>
                <p className="text-xl font-bold">DATA BELUM TERSEDIA</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-rose-400">Kurang (Gap)</p>
                <p className="text-xl font-bold text-rose-300">DATA BELUM TERSEDIA</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xs font-black tracking-widest text-slate-500 mb-4">PAYING USERS</h2>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Target Paying Users</p>
                <p className="text-xl font-bold text-slate-900">DATA BELUM TERSEDIA</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Pencapaian Actual</p>
                <p className="text-xl font-bold text-slate-900">DATA BELUM TERSEDIA</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-rose-500">Kurang (Gap)</p>
                <p className="text-xl font-bold text-rose-600">DATA BELUM TERSEDIA</p>
              </div>
            </div>
          </div>
        </div>

        {/* BACKWARD MAPPING */}
        <div className="space-y-6">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest">Digital Marketing Backward Mapping</h2>
          
          {/* TRAFFIC */}
          <div className="bg-white border-l-4 border-indigo-500 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-black text-indigo-900 uppercase tracking-wider">1. TRAFFIC</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Target (User Baru)</p>
                <p className="font-bold text-slate-900">DATA BELUM TERSEDIA</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Pencapaian (User Terdaftar)</p>
                <p className="font-bold text-indigo-700">{formatNumber(intel.totalUsers)} User</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-rose-500 uppercase">Kurang (Gap)</p>
                <p className="font-bold text-rose-600">DATA BELUM TERSEDIA</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Status</p>
                <p className="font-bold text-slate-700">{trafficProblem ? trafficProblem.severity + " RISK" : "AMAN"}</p>
              </div>
            </div>
            {trafficProblem ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-indigo-50 p-4 rounded-lg">
                <div>
                  <p className="text-[10px] font-bold text-indigo-800 uppercase">Masalah Utama</p>
                  <p className="text-sm font-semibold">{trafficProblem.diagnosis || trafficProblem.evidence}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-indigo-800 uppercase">Penyebab</p>
                  <p className="text-sm">{trafficProblem.evidence}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-indigo-800 uppercase">Apa yang harus dilakukan</p>
                  <p className="text-sm font-bold text-indigo-900">{trafficProblem.recommendedAction}</p>
                  <form action={triggerAction} className="mt-2">
                    <input type="hidden" name="metric" value={trafficProblem.targetSegment} />
                    <input type="hidden" name="recommendation" value={trafficProblem.recommendedAction} />
                    <input type="hidden" name="expectedResult" value={trafficProblem.expectedResult} />
                    <input type="hidden" name="actionType" value="MARKETING_CAMPAIGN" />
                    <button type="submit" className="bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded">Jalankan Kampanye</button>
                  </form>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">Traffic aman. Tidak ada masalah mendesak di tahap ini.</p>
            )}
          </div>

          {/* CONVERSION */}
          <div className="bg-white border-l-4 border-emerald-500 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-black text-emerald-900 uppercase tracking-wider">2. CONVERSION</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Target (User Aktif/Bisnis)</p>
                <p className="font-bold text-slate-900">DATA BELUM TERSEDIA</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Pencapaian (Bisnis Teraktivasi)</p>
                <p className="font-bold text-emerald-700">{formatNumber(intel.activatedUsers)} Bisnis</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-rose-500 uppercase">Kurang (Gap)</p>
                <p className="font-bold text-rose-600">{formatNumber(intel.stuckAfterRegister)} Stuck</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Status</p>
                <p className="font-bold text-slate-700">{conversionProblem ? conversionProblem.severity + " RISK" : "AMAN"}</p>
              </div>
            </div>
            {conversionProblem ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-emerald-50 p-4 rounded-lg">
                <div>
                  <p className="text-[10px] font-bold text-emerald-800 uppercase">Masalah Utama</p>
                  <p className="text-sm font-semibold">{conversionProblem.diagnosis || conversionProblem.evidence}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-800 uppercase">Penyebab</p>
                  <p className="text-sm">{conversionProblem.evidence}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-800 uppercase">Apa yang harus dilakukan</p>
                  <p className="text-sm font-bold text-emerald-900">{conversionProblem.recommendedAction}</p>
                  <form action={triggerAction} className="mt-2">
                    <input type="hidden" name="metric" value={conversionProblem.targetSegment} />
                    <input type="hidden" name="recommendation" value={conversionProblem.recommendedAction} />
                    <input type="hidden" name="expectedResult" value={conversionProblem.expectedResult} />
                    <input type="hidden" name="actionType" value="MARKETING_CAMPAIGN" />
                    <button type="submit" className="bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded">Jalankan Kampanye</button>
                  </form>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">Conversion aman. Tidak ada masalah mendesak di tahap ini.</p>
            )}
          </div>

          {/* RELATIONSHIP */}
          <div className="bg-white border-l-4 border-amber-500 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-black text-amber-900 uppercase tracking-wider">3. RELATIONSHIP & RETENTION</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Target (Pengguna Rutin)</p>
                <p className="font-bold text-slate-900">DATA BELUM TERSEDIA</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Pencapaian (Aktif 7 Hari)</p>
                <p className="font-bold text-amber-700">{formatNumber(intel.activeUsers)} User</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-rose-500 uppercase">Kurang (Gap)</p>
                <p className="font-bold text-rose-600">{formatNumber(intel.inactiveUsers)} Pasif / Churn</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Status</p>
                <p className="font-bold text-slate-700">{relationshipProblem ? relationshipProblem.severity + " RISK" : "AMAN"}</p>
              </div>
            </div>
            {relationshipProblem ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-amber-50 p-4 rounded-lg">
                <div>
                  <p className="text-[10px] font-bold text-amber-800 uppercase">Masalah Utama</p>
                  <p className="text-sm font-semibold">{relationshipProblem.diagnosis || relationshipProblem.evidence}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-amber-800 uppercase">Penyebab</p>
                  <p className="text-sm">{relationshipProblem.evidence}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-amber-800 uppercase">Apa yang harus dilakukan</p>
                  <p className="text-sm font-bold text-amber-900">{relationshipProblem.recommendedAction}</p>
                  <form action={triggerAction} className="mt-2">
                    <input type="hidden" name="metric" value={relationshipProblem.targetSegment} />
                    <input type="hidden" name="recommendation" value={relationshipProblem.recommendedAction} />
                    <input type="hidden" name="expectedResult" value={relationshipProblem.expectedResult} />
                    <input type="hidden" name="actionType" value="MARKETING_CAMPAIGN" />
                    <button type="submit" className="bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded">Jalankan Kampanye</button>
                  </form>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">Relationship aman. Tidak ada masalah mendesak di tahap ini.</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
