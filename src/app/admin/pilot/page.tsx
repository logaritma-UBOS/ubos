import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import { formatNumber, formatRupiah } from "@/lib/format"
import { runOwnerEngine, getRevenueSnapshot } from "@/lib/ownerEngine"

export const dynamic = "force-dynamic"

async function loginAdmin(formData: FormData) {
  "use server"
  const email = formData.get("email")?.toString()
  const password = formData.get("password")?.toString()
  
  const expectedEmail = process.env.OWNER_EMAIL
  const expectedPassword = process.env.OWNER_PASSWORD

  if (expectedEmail && expectedPassword && email === expectedEmail && password === expectedPassword) {
    const cookieStore = await cookies()
    cookieStore.set("ubos_pilot_auth", "authenticated", { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 2592000
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
  const actual = parseFloat(actualStr) || 0
  const gapStr = formData.get("gap")?.toString() || "0"
  const targetStr = formData.get("target")?.toString() || "0"
  const severity = formData.get("severity")?.toString() || "LOW"
  const confidence = formData.get("confidence")?.toString() || "LOW"
  const direction = formData.get("direction")?.toString() || "HIGHER_IS_BETTER"
  
  await prisma.ownerAction.create({
    data: {
      actionType: "OWNER_INTERVENTION",
      source: "SYSTEM_RECOMMENDATION",
      metric,
      target: parseFloat(targetStr) || 0,
      recommendation,
      expectedResult,
      actualBefore: actual,
      gapBefore: parseFloat(gapStr) || 0,
      severity,
      confidence,
      direction,
      status: "ACCEPTED",
      acceptedAt: new Date()
    }
  })
  
  revalidatePath("/admin/pilot")
}

async function setRevenueTarget(formData: FormData) {
  "use server"
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") throw new Error("Unauthorized")
  const targetStr = formData.get("revenueTarget")?.toString()?.trim() || ""
  const target = parseFloat(targetStr)
  // Reject: empty, NaN, 0, negative, or unreasonably large (> 100 trillion)
  if (!isNaN(target) && target > 0 && target <= 100_000_000_000_000) {
    const key = "owner_revenue_target_weekly"
    const existing = await prisma.systemSetting.findUnique({ where: { key } })
    if (existing) {
      await prisma.systemSetting.update({ where: { key }, data: { value: target.toString(), updatedBy: "owner" } })
    } else {
      await prisma.systemSetting.create({ data: { key, value: target.toString(), description: "Target revenue mingguan untuk Owner Engine", updatedBy: "owner" } })
    }
    revalidatePath("/admin/pilot")
  }
}

export default async function AdminPilotPage() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get("ubos_pilot_auth")?.value
  
  if (authCookie !== "authenticated") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <form action={loginAdmin} className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 max-w-sm w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">UBOS<span className="text-blue-600">PILOT</span></h1>
            <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-widest">OWNER LOGIN</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Owner</label>
              <input type="email" name="email" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
              <input type="password" name="password" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95">Masuk Control Center</button>
          </div>
        </form>
      </div>
    )
  }

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  let systemHealth = "HEALTHY"
  try {
    await prisma.$queryRaw`SELECT 1`
  } catch (error) {
    systemHealth = "DATABASE_ERROR"
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
  let firstTxCount = 0
  
  for (const b of allBusinesses) {
    if (b.products.length > 0 || b.ingredients.length > 0) businessesWithData++
    if (b.sales.length > 0) firstTxCount++
  }

  const [
    active7DaysEvents,
    activeTodayEvents,
  ] = await Promise.all([
    prisma.pilotEvent.findMany({ where: { createdAt: { gte: startOfWeek } }, select: { businessId: true } }),
    prisma.pilotEvent.findMany({ where: { createdAt: { gte: startOfToday } }, select: { businessId: true } }),
  ])

  const active7Days = new Set(active7DaysEvents.map(e => e.businessId).filter(Boolean)).size
  const activeToday = new Set(activeTodayEvents.map(e => e.businessId).filter(Boolean)).size
  
  // Real Funnel Data
  const registerCount = totalUsers
  const activeCount = totalBusinesses

  // Revenue Snapshot â€” real data from Sale.totalAmount (DB aggregated)
  const revenueSnapshot = await getRevenueSnapshot()

  // Revenue target from SystemSetting (reject 0 and NaN)
  const revenueSetting = await prisma.systemSetting.findUnique({ where: { key: "owner_revenue_target_weekly" } })
  const rawTarget = revenueSetting ? parseFloat(revenueSetting.value) : NaN
  const revenueTarget: number | null = (!isNaN(rawTarget) && rawTarget > 0) ? rawTarget : null

  // Revenue trend: safe against division-by-zero and Infinity
  const revenueTrend = revenueSnapshot.previousPeriodRevenue > 0
    ? ((revenueSnapshot.currentPeriodRevenue - revenueSnapshot.previousPeriodRevenue) / revenueSnapshot.previousPeriodRevenue) * 100
    : null

  // gapBefore for HIGHER_IS_BETTER: target - actual (positive = below target, negative = surplus)
  const revenueGapBefore = revenueTarget !== null
    ? revenueTarget - revenueSnapshot.currentPeriodRevenue
    : null

  // Run Owner Engine (includes revenue metric)
  const gapAnalysis = await runOwnerEngine()

  return (
    <AdminLayout activeMenu="control" logoutAction={logoutAdmin}>
      <div className="p-4 md:p-8 space-y-8">
        
        {/* HEADER */}
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">UBOS Control Center</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Management Layer & Logaritma Method Dashboard</p>
        </div>

        {/* 1. STATUS & KPI GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">System Health</p>
            {systemHealth === "HEALTHY" ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-lg font-black text-gray-900">Normal</span>
                </div>
                <p className="text-xs text-emerald-600 font-medium mt-1">Database & Core OK</p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  <span className="text-lg font-black text-rose-900">Error</span>
                </div>
                <p className="text-xs text-rose-600 font-medium mt-1">Database tidak merespon</p>
              </>
            )}
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Acquisition (Biz)</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-black text-gray-900 leading-none">{formatNumber(totalBusinesses)}</p>
                <p className="text-xs text-gray-500 font-medium mt-1">Total Created</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{formatNumber(active7Days)} <span className="text-[10px] text-gray-500 font-normal">Aktif 7H</span></p>
                <p className="text-sm font-bold text-gray-900">{formatNumber(activeToday)} <span className="text-[10px] text-gray-500 font-normal">Aktif Hari Ini</span></p>
              </div>
            </div>
          </div>

          {/* REVENUE KPI â€” real data from Sale.totalAmount */}
          <div className={`p-5 rounded-2xl shadow-sm border ${revenueSnapshot.totalTransactions > 0 ? 'bg-white border-gray-100' : 'bg-white border-gray-100 opacity-80'}`}>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Revenue (7 Hari)</p>
            {revenueSnapshot.totalTransactions === 0 ? (
              <>
                <p className="text-base font-black text-gray-400 leading-none">Rp 0</p>
                <p className="text-[10px] text-gray-400 font-medium mt-1">Belum ada transaksi POS tersimpan.</p>
              </>
            ) : (
              <>
                <p className="text-xl font-black text-gray-900 leading-none">{formatRupiah(revenueSnapshot.currentPeriodRevenue)}</p>
                <div className="flex items-center gap-2 mt-1">
                  {revenueTrend !== null ? (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${revenueTrend >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {revenueTrend >= 0 ? 'â–²' : 'â–¼'} {Math.abs(revenueTrend).toFixed(1)}% vs 7H lalu
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-400">Data sebelumnya: â€”</span>
                  )}
                </div>
                {revenueTarget !== null && revenueGapBefore !== null && (
                  <p className={`text-[10px] font-bold mt-1 ${revenueGapBefore <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    Target: {formatRupiah(revenueTarget)} Â· Gap: {revenueGapBefore <= 0 ? '+' : ''}{formatRupiah(revenueGapBefore)}
                  </p>
                )}
                <p className="text-[9px] text-gray-400 mt-1">{formatNumber(revenueSnapshot.currentPeriodTransactions)} transaksi Â· âˆ… {formatRupiah(revenueSnapshot.avgTransactionValue)}</p>
              </>
            )}
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-800 text-white">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Activation Funnel</p>
            <div className="space-y-1">
              <div className="flex justify-between items-center"><span className="text-xs text-slate-300">Registered Users</span><span className="font-bold text-sm text-blue-400">{formatNumber(registerCount)}</span></div>
              <div className="flex justify-between items-center"><span className="text-xs text-slate-300">Business Created</span><span className="font-bold text-sm text-emerald-400">{formatNumber(activeCount)}</span></div>
              <div className="flex justify-between items-center"><span className="text-xs text-slate-300">First Data Input</span><span className="font-bold text-sm text-amber-400">{formatNumber(businessesWithData)}</span></div>
              <div className="flex justify-between items-center"><span className="text-xs text-slate-300">First POS Tx</span><span className="font-bold text-sm text-rose-400">{formatNumber(firstTxCount)}</span></div>
            </div>
          </div>
        </div>

        {/* REVENUE INTELLIGENCE PANEL */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Revenue Intelligence</p>
              <h3 className="text-lg font-bold text-gray-900">Performa Revenue Aktual</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Sumber: <code>Sale.totalAmount</code> â€” Agregasi Global Semua Merchant</p>
            </div>
            {/* Target setter */}
            <form action={setRevenueTarget} className="flex items-center gap-2 flex-shrink-0">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Set Target Revenue Mingguan</label>
                <input
                  type="number"
                  name="revenueTarget"
                  min="0"
                  step="100000"
                  defaultValue={revenueTarget ?? ""}
                  placeholder="contoh: 10000000"
                  className="w-44 p-2 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <button type="submit" className="mt-4 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all active:scale-95">Set</button>
            </form>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">7 Hari Terakhir</p>
              <p className="text-lg font-black text-gray-900">{formatRupiah(revenueSnapshot.currentPeriodRevenue)}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{revenueSnapshot.currentPeriodTransactions} transaksi</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">7 Hari Sebelumnya</p>
              <p className="text-lg font-black text-gray-900">{formatRupiah(revenueSnapshot.previousPeriodRevenue)}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{revenueSnapshot.previousPeriodTransactions} transaksi</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">All Time Revenue</p>
              <p className="text-lg font-black text-gray-900">{formatRupiah(revenueSnapshot.allTimeRevenue)}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{revenueSnapshot.totalTransactions} transaksi total</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Avg Transaksi</p>
              <p className="text-lg font-black text-gray-900">{revenueSnapshot.totalTransactions > 0 ? formatRupiah(revenueSnapshot.avgTransactionValue) : 'â€”'}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Per transaksi (all time)</p>
            </div>
          </div>

          {revenueTarget !== null && revenueGapBefore !== null && (
            <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${revenueGapBefore <= 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-rose-50 border border-rose-200'}`}>
              <span className={`text-2xl ${revenueGapBefore <= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{revenueGapBefore >= 0 ? 'âœ“' : 'â–½'}</span>
              <div>
                <p className={`text-sm font-bold ${revenueGapBefore <= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                  {revenueGapBefore <= 0 ? `TARGET TERCAPAI â€” Surplus ${formatRupiah(Math.abs(revenueGapBefore))}`
                    : `GAP REVENUE â€” Kekurangan ${formatRupiah(Math.abs(revenueGapBefore))} dari target`}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Target: {formatRupiah(revenueTarget)} Â· Aktual 7H: {formatRupiah(revenueSnapshot.currentPeriodRevenue)} Â· gapBefore = target - actual = {formatRupiah(revenueGapBefore)}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* 2. LOGARITMA GAP & ACTIONS */}
        <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-rose-600 font-bold tracking-widest text-xs uppercase mb-1">Target Bisnis UBOS & Gap</h2>
              <h3 className="text-xl font-bold text-gray-900">Analisis & Tindakan Owner</h3>
            </div>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold hidden md:inline-block uppercase">Logaritma Engine (Read-Only)</span>
          </div>

          <div className="space-y-4">
            {gapAnalysis.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">Tidak ada gap kritis. Semua metrik sesuai target.</div>
            ) : (
              gapAnalysis.map((item, idx) => (
                <div key={idx} className={`p-5 md:p-6 border-l-4 rounded-r-xl border-t border-b border-r border-gray-100 ${item.severity === 'HIGH' ? 'border-rose-500 bg-rose-50/50' : 'border-amber-500 bg-amber-50/50'}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded ${item.severity === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{item.severity} PRIORITY</span>
                      <span className="text-sm font-bold text-gray-900">{item.metric}</span>
                      <span className="text-[10px] text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full uppercase tracking-wider">Lokasi: {item.where}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-3">
                    <div className="lg:col-span-1">
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">TARGET VS AKTUAL</p>
                      <p className="text-xs text-gray-700 mb-1 line-clamp-2" title={item.goal}>Goal: {item.goal}</p>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-gray-900">{formatNumber(item.actual)}</span>
                        <span className="text-xs text-gray-500 mb-1">/ {formatNumber(item.target)} target</span>
                      </div>
                      <p className="text-xs font-bold text-rose-600 mt-1">Gap: {formatNumber(item.gap)} ({item.gapPercentage}%)</p>
                      <p className="text-[9px] text-gray-400 mt-0.5 uppercase">{item.direction}</p>
                    </div>
                    
                    <div className="lg:col-span-2">
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">DIAGNOSIS (WHY)</p>
                      <p className="text-sm font-medium text-gray-800 mb-3">{item.cause}</p>
                      
                      <p className="text-[10px] text-blue-600 uppercase font-bold mb-1">REKOMENDASI SISTEM</p>
                      <p className="text-sm font-medium text-blue-900">{item.recommendation}</p>
                      <p className="text-[11px] text-gray-500 mt-1 italic">Ekspektasi: {item.expectedResult}</p>
                    </div>
                    
                    <div className="lg:col-span-1 flex flex-col justify-end">
                      <form action={triggerAction}>
                        <input type="hidden" name="metric" value={item.metric} />
                        <input type="hidden" name="recommendation" value={item.recommendation} />
                        <input type="hidden" name="expectedResult" value={item.expectedResult} />
                        <input type="hidden" name="actual" value={item.actual} />
                        <input type="hidden" name="gap" value={item.gap} />
                        <input type="hidden" name="target" value={item.target} />
                        <input type="hidden" name="severity" value={item.severity} />
                        <input type="hidden" name="confidence" value={item.confidence} />
                        <input type="hidden" name="direction" value={item.direction} />
                        <button type="submit" className="w-full bg-gray-900 hover:bg-black text-white text-xs font-bold py-3 px-4 rounded-xl transition-all shadow-sm active:scale-95">
                          TERIMA & EKSEKUSI
                        </button>
                      </form>
                      <p className="text-[9px] text-center text-gray-400 mt-2 uppercase tracking-widest">Confidence: {item.confidence}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}
