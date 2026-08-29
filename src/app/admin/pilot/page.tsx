import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import { formatNumber } from "@/lib/format"
import { runOwnerEngine } from "@/lib/ownerEngine"
import { getOwnerOpportunities, getDailyBrief } from "@/lib/owner/opportunityEngine"

export const dynamic = "force-dynamic"

async function loginAdmin(formData: FormData) {
  "use server"
  const email = formData.get("email")?.toString()
  const password = formData.get("password")?.toString()
  
  if (email === process.env.OWNER_EMAIL && password === process.env.OWNER_PASSWORD) {
    const cookieStore = await cookies()
    cookieStore.set("ubos_pilot_auth", "authenticated", { 
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 2592000
    })
    revalidatePath("/admin/pilot")
  }
}

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
  const severity = (formData.get("severity")?.toString() || "LOW") as "LOW" | "MEDIUM" | "HIGH"
  const confidence = (formData.get("confidence")?.toString() || "LOW") as "LOW" | "MEDIUM" | "HIGH"
  const direction = (formData.get("direction")?.toString() || "HIGHER_IS_BETTER") as "HIGHER_IS_BETTER" | "LOWER_IS_BETTER"
  const actionType = formData.get("actionType")?.toString() || "GENERAL_ACTION"
  
  await prisma.ownerAction.create({
    data: {
      source: "SYSTEM_RECOMMENDATION",
      metric,
      target: parseFloat(targetStr) || 0,
      recommendation,
      expectedResult,
      actualBefore: parseFloat(actualStr) || 0,
      gapBefore: parseFloat(gapStr) || 0,
      severity,
      confidence,
      direction,
      actionType,
      status: "ACCEPTED",
      acceptedAt: new Date()
    }
  })
  revalidatePath("/admin/pilot")
}

export default async function AdminPilotPage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <form action={loginAdmin} className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-slate-900">UBOS<span className="text-blue-600">PILOT</span></h1>
            <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">OWNER LOGIN</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input type="email" name="email" required className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input type="password" name="password" required className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50" />
            </div>
            <button type="submit" className="w-full p-3 bg-blue-600 text-white font-bold rounded-xl">LOGIN</button>
          </div>
        </form>
      </div>
    )
  }

  // System Health
  let systemHealth = "HEALTHY"
  try { await prisma.$queryRawUnsafe("SELECT 1"); } catch { systemHealth = "ERROR" }

  // Target Settings
  const settings = await prisma.systemSetting.findMany({
    where: { key: { in: ["owner_target_registered_users", "owner_target_activated_users", "owner_target_paid_users"] } }
  })
  const getTarget = (k: string) => { const v = settings.find(s => s.key === k)?.value; return v ? parseFloat(v) : null }
  const tRegistered = getTarget("owner_target_registered_users")
  const tActivated = getTarget("owner_target_activated_users")

  // Actual
  const [totalUsers, totalBusinesses] = await Promise.all([
    prisma.user.count(),
    prisma.business.count()
  ])

  const gapAnalysis = await runOwnerEngine()
  const opportunities = await getOwnerOpportunities()
  const dailyBrief = await getDailyBrief(opportunities)
  const activeActions = await prisma.ownerAction.findMany({
    where: { status: { in: ["ACCEPTED", "EXECUTED"] } },
    orderBy: { createdAt: "desc" },
    take: 3
  })

  return (
    <AdminLayout activeMenu="control" logoutAction={logoutAdmin}>
      <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-full">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">UBOS Control Center</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Pertumbuhan, Target, dan Tindakan Owner</p>
        </div>

        {/* HEALTH & OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">System Health</p>
            {systemHealth === "HEALTHY" ? (
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span>
                <span className="text-lg font-black text-slate-900">Normal</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                <span className="text-lg font-black text-rose-900">Error</span>
              </div>
            )}
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Registered Users</p>
            <p className="text-3xl font-black text-slate-900 leading-none">{formatNumber(totalUsers)}</p>
            <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase">Target: {tRegistered !== null ? formatNumber(tRegistered) : "Belum diset"}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Activated (Biz)</p>
            <p className="text-3xl font-black text-slate-900 leading-none">{formatNumber(totalBusinesses)}</p>
            <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase">Target: {tActivated !== null ? formatNumber(tActivated) : "Belum diset"}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 opacity-70">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Paid Users</p>
            <p className="text-xl font-bold text-slate-400 leading-none">Data belum tersedia</p>
            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">Subscription belum aktif</p>
          </div>
        </div>

        
        {/* OWNER DAILY BRIEF */}
        {dailyBrief && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6 mt-6">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <h2 className="text-sm font-black tracking-widest uppercase">UBOS HARI INI</h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Kondisi</p>
                <p className="font-semibold text-slate-900">{dailyBrief.kondisi}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Masalah Utama</p>
                <p className="font-semibold text-rose-600">{dailyBrief.masalah}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Dampak</p>
                <p className="font-semibold text-slate-900">{dailyBrief.dampak}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Penyebab</p>
                <p className="font-semibold text-slate-900">{dailyBrief.penyebab}</p>
              </div>
              <div className="md:col-span-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Action & Expected Result</p>
                <p className="font-bold text-blue-900">{dailyBrief.action}</p>
                <p className="text-xs text-blue-700 mt-1">Expected: {dailyBrief.expectedResult}</p>
              </div>
            </div>
          </div>
        )}

        {/* LOGARITMA ENGINE DIAGNOSIS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Top Opportunities (Logaritma)</h2>
            {gapAnalysis.length > 0 ? gapAnalysis.map((metric, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">{metric.where}</p>
                      <h3 className="text-lg font-black text-slate-900">{metric.metric}</h3>
                    </div>
                    <span className={"px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-md "}>
                      Severity: {metric.severity}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Target</p>
                      <p className="font-bold text-slate-900">{formatNumber(metric.target)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Aktual</p>
                      <p className="font-bold text-slate-900">{formatNumber(metric.actual)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Gap</p>
                      <p className={"font-bold "}>{metric.gap > 0 ? "-" : "+"}{formatNumber(Math.abs(metric.gap))}</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Mengapa ini terjadi?</p>
                    <p className="text-sm font-medium text-slate-700">{metric.cause}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Tindakan yang Disarankan</p>
                    <p className="text-sm font-bold text-blue-900">{metric.recommendation}</p>
                    <p className="text-xs text-blue-700 mt-2">Hasil yang diharapkan: <span className="font-medium italic">{metric.expectedResult}</span></p>
                    
                    <form action={triggerAction} className="mt-4">
                      <input type="hidden" name="metric" value={metric.metric} />
                      <input type="hidden" name="recommendation" value={metric.recommendation} />
                      <input type="hidden" name="expectedResult" value={metric.expectedResult} />
                      <input type="hidden" name="target" value={metric.target} />
                      <input type="hidden" name="actual" value={metric.actual} />
                      <input type="hidden" name="gap" value={metric.gap} />
                      <input type="hidden" name="severity" value={metric.severity} />
                      <input type="hidden" name="confidence" value={metric.confidence} />
                      <input type="hidden" name="direction" value={metric.direction} />
                      <input type="hidden" name="actionType" value={metric.actionType} />
                      <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors uppercase tracking-wider">
                        Terima & Eksekusi Tindakan
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
                <p className="text-slate-500 font-bold">Tidak ada rekomendasi kritis saat ini.</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Actions</h2>
            {activeActions.length > 0 ? activeActions.map(action => (
              <div key={action.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">{action.metric}</p>
                  <span className={"text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider "}>
                    {action.status}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900 mb-2">{action.recommendation}</p>
                <a href="/admin/pilot/actions" className="text-[10px] font-bold text-blue-600 uppercase hover:underline">Lihat Detail &rarr;</a>
              </div>
            )) : (
              <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 text-center">
                <p className="text-xs text-slate-500 font-medium">Belum ada tindakan aktif.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
