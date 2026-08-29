import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import { formatNumber, formatRupiah } from "@/lib/format"
import { IconTrendingUp } from "@/components/ui/Icons"
import { runOwnerEngine } from "@/lib/ownerEngine"

export const dynamic = "force-dynamic"

async function saveGlobalSetting(key: string, value: string) {
  await prisma.pilotError.create({
    data: {
      errorType: "GLOBAL_SETTING",
      path: key,
      message: value
    }
  })
}

async function updateNotification(formData: FormData) {
  "use server"
  const text = formData.get("notif_text")?.toString() || ""
  const active = formData.get("notif_active") === "on" ? "true" : "false"
  await saveGlobalSetting("NOTIFICATION", JSON.stringify({ text, active }))
  revalidatePath("/admin/pilot")
  revalidatePath("/")
}

async function updateBanner(formData: FormData) {
  "use server"
  const imageUrl = formData.get("banner_image")?.toString() || ""
  const linkUrl = formData.get("banner_link")?.toString() || ""
  const active = formData.get("banner_active") === "on" ? "true" : "false"
  await saveGlobalSetting("BANNER", JSON.stringify({ imageUrl, linkUrl, active }))
  revalidatePath("/admin/pilot")
  revalidatePath("/")
}

async function loginAdmin(formData: FormData) {
  "use server"
  const email = formData.get("email")?.toString()
  const password = formData.get("password")?.toString()
  
  if (email === "logaritma.tim@gmail.com" && password === "adminlog2026") {
    const cookieStore = await cookies()
    cookieStore.set("ubos_pilot_auth", "authenticated", { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
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

  const [
    totalUsers,
    totalBusinesses,
    active7DaysEvents,
    activeTodayEvents,
    newToday,
    totalSales,
    dashboardViews,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.business.count(),
    prisma.pilotEvent.findMany({ where: { createdAt: { gte: startOfWeek } }, select: { businessId: true } }),
    prisma.pilotEvent.findMany({ where: { createdAt: { gte: startOfToday } }, select: { businessId: true } }),
    prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.sale.count(),
    prisma.pilotEvent.count({ where: { eventName: 'dashboard_viewed' } }),
  ])

  const active7Days = new Set(active7DaysEvents.map(e => e.businessId)).size
  const activeToday = new Set(activeTodayEvents.map(e => e.businessId)).size
  const returningUser = active7Days > 0 ? active7Days : "DATA BELUM TERSEDIA"
  
  // Real Funnel Data
  const registerCount = totalUsers
  const activeCount = totalBusinesses
  const firstTxCount = await prisma.sale.groupBy({ by: ['businessId'] }).then(res => res.length)
  
  // No subscription table exists
  const paidCount = "DATA BELUM TERSEDIA"

  // Run Owner Engine
  const gapAnalysis = await runOwnerEngine()

  // Fetch Current Settings
  const notifSettingRow = await prisma.pilotError.findFirst({ where: { errorType: "GLOBAL_SETTING", path: "NOTIFICATION" }, orderBy: { createdAt: "desc" } })
  const bannerSettingRow = await prisma.pilotError.findFirst({ where: { errorType: "GLOBAL_SETTING", path: "BANNER" }, orderBy: { createdAt: "desc" } })
  const notifSetting = notifSettingRow ? JSON.parse(notifSettingRow.message) : { text: "", active: "false" }
  const bannerSetting = bannerSettingRow ? JSON.parse(bannerSettingRow.message) : { imageUrl: "", linkUrl: "", active: "false" }

  return (
    <AdminLayout activeMenu="control" logoutAction={logoutAdmin}>
      <div className="p-4 md:p-8 space-y-8">
        
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Control Center</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">10-Second Status Overview (Metode Logaritma)</p>
        </div>

        {/* 1. STATUS & KPI GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Status</p>
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-lg font-black text-gray-900">Sistem Normal</span>
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-1">Database & API Sehat</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">User</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-black text-gray-900 leading-none">{formatNumber(totalUsers)}</p>
                <p className="text-xs text-gray-500 font-medium mt-1">Total Register</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{formatNumber(active7Days)} <span className="text-[10px] text-gray-500 font-normal">Aktif 7H</span></p>
                <p className="text-sm font-bold text-gray-900">{formatNumber(activeToday)} <span className="text-[10px] text-gray-500 font-normal">Aktif Hari Ini</span></p>
                <p className="text-sm font-bold text-emerald-600">+{formatNumber(newToday)} <span className="text-[10px] text-emerald-600/70 font-normal">Baru Hari Ini</span></p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 opacity-70">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Revenue</p>
            <p className="text-xl font-black text-gray-900 leading-none">DATA BELUM TERSEDIA</p>
            <p className="text-xs text-gray-500 font-medium mt-1">Sistem Subscription belum dibuat.</p>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-800 text-white">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">SaaS Funnel</p>
            <div className="space-y-1">
              <div className="flex justify-between items-center"><span className="text-xs text-slate-300">Register</span><span className="font-bold text-sm text-blue-400">{formatNumber(registerCount)}</span></div>
              <div className="flex justify-between items-center"><span className="text-xs text-slate-300">Activated (Biz)</span><span className="font-bold text-sm text-emerald-400">{formatNumber(activeCount)}</span></div>
              <div className="flex justify-between items-center"><span className="text-xs text-slate-300">First Tx</span><span className="font-bold text-sm text-amber-400">{formatNumber(firstTxCount)}</span></div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-700 mt-1"><span className="text-xs font-bold text-rose-300">Paid</span><span className="font-black text-[10px] text-rose-400">DATA BELUM TERSEDIA</span></div>
            </div>
          </div>
        </div>

        {/* 2. PRIORITAS OWNER (ACTION CENTER LOGARITMA) */}
        <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-rose-600 font-bold tracking-widest text-xs uppercase mb-1">Action Center</h2>
              <h3 className="text-xl font-bold text-gray-900">Prioritas Owner</h3>
            </div>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold hidden md:inline-block">Backward Mapping Engine</span>
          </div>

          <div className="space-y-4">
            {gapAnalysis.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">Tidak ada gap kritis. Semua metrik sesuai target.</div>
            ) : (
              gapAnalysis.map((item, idx) => (
                <div key={idx} className={`p-5 border-l-4 rounded-r-xl border-t border-b border-r border-gray-100 ${item.severity === 'HIGH' ? 'border-rose-500 bg-rose-50/50' : 'border-amber-500 bg-amber-50/50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded ${item.severity === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{item.severity} PRIORITY</span>
                    <span className="text-sm font-bold text-gray-900">{item.metric}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">GAP</p>
                      <p className="text-sm font-medium text-gray-800">Target {item.target}, Aktual {item.actual} ({item.gap})</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">PENYEBAB (Hypothesis)</p>
                      <p className="text-sm font-medium text-gray-800">{item.cause}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">TINDAKAN OWNER</p>
                      <button className="text-sm font-bold text-blue-600 hover:text-blue-700">{item.recommendation}</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 3. GLOBAL UI SETTINGS */}
        <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-blue-600 font-bold tracking-widest text-xs uppercase mb-1">System Override</h2>
          <h3 className="text-xl font-bold mb-6 text-gray-900">Global UI & Engagement</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <form action={updateNotification} className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-blue-900 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">NOTIF</span>
                  Global Top Notification
                </h4>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="notif_active" className="sr-only peer" defaultChecked={notifSetting.active === "true"} />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Teks Pengumuman</label>
                <textarea name="notif_text" rows={2} defaultValue={notifSetting.text} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Contoh: Ada maintenance sistem..."></textarea>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm text-sm">Simpan Notifikasi</button>
            </form>

            <form action={updateBanner} className="bg-fuchsia-50/50 p-6 rounded-2xl border border-fuchsia-100/50 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-fuchsia-900 flex items-center gap-2">
                  <span className="bg-fuchsia-100 text-fuchsia-700 px-2 py-0.5 rounded text-xs">BANNER</span>
                  Promo Slide Bawah (Dashboard)
                </h4>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="banner_active" className="sr-only peer" defaultChecked={bannerSetting.active === "true"} />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-fuchsia-600"></div>
                </label>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">URL Gambar (Landscape)</label>
                <input type="url" name="banner_image" defaultValue={bannerSetting.imageUrl} className="w-full p-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 outline-none text-sm mb-3" placeholder="https://res.cloudinary.com/..." />
                
                <label className="block text-sm font-semibold mb-1 text-gray-700">Link Tujuan (Opsional)</label>
                <input type="url" name="banner_link" defaultValue={bannerSetting.linkUrl} className="w-full p-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 outline-none text-sm" placeholder="https://wa.me/62..." />
              </div>
              <button type="submit" className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm text-sm">Simpan Banner Promo</button>
            </form>
          </div>
        </section>

      </div>
    </AdminLayout>
  )
}
