import { formatRupiah } from '@/lib/format';
export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { runOwnerEngine } from "@/lib/engines/ownerEngine";
import { Card, CardContent } from "@/components/ui/Card";
import { revalidatePath } from "next/cache";
import { IconHome, IconCatalog, IconHistory } from "@/components/ui/Icons";
import ProfileMenu from "@/components/ProfileMenu";

export default async function AdminPilotPage() {
  async function updateTarget(formData: FormData) {
    "use server";
    const newTarget = formData.get("target")?.toString();
    if (newTarget) {
      await prisma.systemSetting.upsert({
        where: { key: "MONTHLY_REVENUE_TARGET" },
        update: { value: newTarget },
        create: { key: "MONTHLY_REVENUE_TARGET", value: newTarget }
      });
      revalidatePath("/admin/pilot");
    }
  }
  const session = await auth();
  // Validasi khusus untuk role owner/admin bisa ditambahkan di sini

  const { target, actual, gap, recommendation, metrics } = await runOwnerEngine();

  const progressPct = target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0;
  
  const hourStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta", hour: "numeric", hour12: false });
  const currentHour = parseInt(hourStr, 10);
  let greeting = "Selamat Malam";
  if (currentHour >= 5 && currentHour < 11) greeting = "Selamat Pagi";
  else if (currentHour >= 11 && currentHour < 15) greeting = "Selamat Siang";
  else if (currentHour >= 15 && currentHour < 18) greeting = "Selamat Sore";

  return (
    <div className="min-h-screen bg-gray-50 pb-[80px] md:pb-0 font-sans">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6">
        
        {/* HEADER */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-black text-2xl text-blue-800 tracking-tight">UBOS<span className="text-blue-600">Pilot</span></span>
            </div>
            <h1 className="text-lg lg:text-xl font-bold text-gray-900">Dashboard Owner</h1>
            <p className="text-sm text-gray-500 font-medium">{greeting} 👋</p>
          </div>
          <ProfileMenu />
        </div>

        {/* METRICS ROW (Like User Dashboard) */}
        <div className="flex flex-nowrap overflow-x-auto gap-4 pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-3 snap-x lg:snap-none hide-scrollbar">
          
          <Card className="min-w-[280px] lg:min-w-0 snap-center shrink-0 shadow-sm border-gray-100 hover:border-gray-200 transition-colors bg-white">
            <CardContent className="p-5 lg:p-6 flex flex-col h-full justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xs lg:text-sm font-bold text-gray-400 uppercase tracking-wider">Target Bulanan</h3>
                  <form action={updateTarget} className="flex gap-2">
                    <input type="number" name="target" placeholder="Ubah target..." className="w-24 text-xs px-2 py-1 rounded border border-gray-200" required />
                    <button type="submit" className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs px-2 rounded font-bold">Simpan</button>
                  </form>
                </div>
                <div className="flex items-baseline gap-1 mt-1 lg:mt-2">
                  <span className="text-2xl lg:text-3xl font-black text-gray-800 tracking-tight">{formatRupiah(target)}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 font-medium mt-4 pt-4 border-t border-gray-50">Bulan ini: {formatRupiah(target)}</p>
            </CardContent>
          </Card>

          <Card className="min-w-[280px] lg:min-w-0 snap-center shrink-0 shadow-sm border-gray-100 bg-white">
            <CardContent className="p-5 lg:p-6 flex flex-col h-full justify-between relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xs lg:text-sm font-bold text-success-600 uppercase tracking-wider mb-2">Tercapai</h3>
                <div className="flex items-baseline gap-2 mt-1 lg:mt-2">
                  <span className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">{formatRupiah(actual)}</span>
                  <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">({progressPct}%)</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-50 relative z-10">
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2 overflow-hidden">
                  <div className="bg-success-500 h-1.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPct}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 font-medium truncate">
                   {progressPct < 100 ? "Terus tingkatkan konversi user premium." : "Target tercapai!"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-[280px] lg:min-w-0 snap-center shrink-0 shadow-sm border-gray-100 bg-white">
            <CardContent className="p-5 lg:p-6 flex flex-col h-full justify-between">
              <div>
                <h3 className="text-xs lg:text-sm font-bold text-red-500 uppercase tracking-wider mb-2">Kekurangan (GAP)</h3>
                <div className="flex items-baseline gap-1 mt-1 lg:mt-2">
                  <span className="text-2xl lg:text-3xl font-black text-red-600 tracking-tight">
                    {gap > 0 ? `-${formatRupiah(gap)}` : 'Rp 0'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 font-medium mt-4 pt-4 border-t border-gray-50">
                Fokus dorong pendapatan bulan ini
              </p>
            </CardContent>
          </Card>

        </div>

        {/* LOGARITMA ENGINE (PRIORITAS HARI INI) */}
        <div className="mt-6 mb-8 lg:mb-10 lg:grid lg:grid-cols-[200px_1fr] lg:gap-8 items-start">
          <div className="hidden lg:block pt-2">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Prioritas</h2>
            <p className="text-xs text-gray-500 font-medium">Analisa AI berdasarkan metrik *funnel* SaaS.</p>
          </div>

          <div className="w-full relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl blur opacity-25"></div>
            <div className="relative bg-gradient-to-br from-slate-50 to-blue-50/30 border border-blue-100/50 rounded-2xl p-5 lg:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🔥</span>
                <h2 className="text-sm font-black text-blue-900 tracking-wide uppercase">Prioritas Hari Ini</h2>
                <div className="ml-auto flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded-full border border-blue-100">
                  <div className="w-2 h-2 rounded-full bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                  <span className="text-[10px] font-bold text-success-700 uppercase tracking-wider">Engine Aktif</span>
                </div>
              </div>

              <h3 className="text-lg lg:text-2xl font-black text-slate-800 leading-tight mb-4 lg:w-11/12">
                {recommendation.actionText}
              </h3>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 lg:p-5 border border-white shadow-sm mb-5">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.12em] mb-2 lg:mb-3">Kenapa?</p>
                <p className="text-sm lg:text-base font-medium text-gray-700 leading-relaxed mb-3 lg:mb-4">
                  {recommendation.reason}
                </p>
                
                <div className="grid grid-cols-3 gap-2 lg:gap-4 pt-3 lg:pt-4 border-t border-gray-100">
                  <div className="text-center lg:text-left">
                    <p className="text-[9px] text-gray-400 font-semibold uppercase lg:mb-1">Total User</p>
                    <p className="text-xs lg:text-sm font-black text-gray-700 tabular-nums">{metrics.totalUsers}</p>
                  </div>
                  <div className="text-center lg:text-left">
                    <p className="text-[9px] text-gray-400 font-semibold uppercase lg:mb-1">User Gratis</p>
                    <p className="text-xs lg:text-sm font-black text-gray-700 tabular-nums">{metrics.freeUsers}</p>
                  </div>
                  <div className="text-center lg:text-left">
                    <p className="text-[9px] text-gray-400 font-semibold uppercase lg:mb-1">User Premium</p>
                    <p className="text-xs lg:text-sm font-black text-blue-600 tabular-nums">{metrics.premiumUsers}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <Link
                  href={recommendation.ctaHref}
                  className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 active:scale-95 transition-all whitespace-nowrap"
                >
                  {recommendation.ctaLabel}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* PILAR KELOLA (TRAFIK, KONVERSI, RELATIONSHIP) */}
        <div className="lg:grid lg:grid-cols-[200px_1fr] lg:gap-8 items-start mb-8">
          <div className="hidden lg:block pt-2">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">AARRR Funnel</h2>
            <p className="text-xs text-gray-500 font-medium">Kelola siklus hidup pengguna.</p>
          </div>
          <div className="grid grid-cols-3 gap-3 lg:gap-6">
            <Link href="/admin/pilot/trafik" className="group">
              <div className="bg-white border border-gray-100 rounded-2xl p-4 lg:p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-center lg:text-left h-full flex flex-col items-center lg:items-start gap-2 lg:gap-3">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 lg:w-6 lg:h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-800 text-xs lg:text-sm">Trafik</h3>
                <p className="hidden lg:block text-xs text-gray-500 leading-relaxed">Akuisisi pengunjung web & kelola sumber pendaftaran.</p>
              </div>
            </Link>

            <Link href="/admin/pilot/konversi" className="group">
              <div className="bg-white border border-gray-100 rounded-2xl p-4 lg:p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all text-center lg:text-left h-full flex flex-col items-center lg:items-start gap-2 lg:gap-3">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 lg:w-6 lg:h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-800 text-xs lg:text-sm">Konversi</h3>
                <p className="hidden lg:block text-xs text-gray-500 leading-relaxed">Ubah pendaftar Free menjadi Premium (VIP).</p>
              </div>
            </Link>

            <Link href="/admin/pilot/relationship" className="group">
              <div className="bg-white border border-gray-100 rounded-2xl p-4 lg:p-6 shadow-sm hover:shadow-md hover:border-purple-200 transition-all text-center lg:text-left h-full flex flex-col items-center lg:items-start gap-2 lg:gap-3">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 lg:w-6 lg:h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-800 text-xs lg:text-sm">Rawat</h3>
                <p className="hidden lg:block text-xs text-gray-500 leading-relaxed">Rawat user VIP, masukan Dasbor, & Upsell layanan.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
