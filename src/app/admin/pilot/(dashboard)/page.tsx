import { formatRupiah } from '@/lib/format';
export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { runOwnerEngine } from "@/lib/engines/ownerEngine";
import { prisma } from "@/lib/prisma";
import RoyaltyForm from "./RoyaltyForm";

export default async function AdminPilotPage() {
  const session = await auth();
  const userEmail = session?.user?.email || "";
  
  const teamMember = await prisma.teamMember.findUnique({
    where: { email: userEmail }
  });

  if (!teamMember) redirect("/login");
  if (teamMember.role === "METHODOLOGY") redirect("/admin/pilot/methodology");
  if (teamMember.role === "DEVELOPER") redirect("/admin/pilot/developer");
  if (teamMember.role === "OPERATIONS") redirect("/admin/pilot/operations");

  const { recommendation, metrics } = await runOwnerEngine();

  // TEAM OS DATA
  const members = await prisma.teamMember.findMany({
      include: {
          tasks: {
              where: {
                  date: {
                      gte: new Date(new Date().setHours(0,0,0,0)),
                      lt: new Date(new Date().setHours(23,59,59,999))
                  }
              }
          }
      }
  });

  const totalReserve = await prisma.teamLedger.aggregate({
    where: { type: "RESERVE_ALLOCATION" },
    _sum: { amount: true }
  });
  
  const totalDistributed = await prisma.teamLedger.aggregate({
    where: { type: "ROYALTY_DISTRIBUTION" },
    _sum: { amount: true }
  });

  const activeUsers = await prisma.user.count({ where: { crmStatus: "AKTIF" } });
  const passiveUsers = await prisma.user.count({ where: { crmStatus: "PASIF" } });
  const totalUsers = await prisma.user.count();

  return (
    <div className="w-full font-sans pb-10">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6">

        {/* LOGARITMA ENGINE (PRIORITAS HARI INI) */}
        <div className="mb-8 lg:mb-10">
          <h2 className="text-xl font-black text-gray-900 tracking-tight mb-4 flex items-center gap-2">
            <span className="text-2xl">🎯</span> Prioritas Engine AI
          </h2>
          <div className="w-full relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl blur opacity-25"></div>
            <div className="relative bg-gradient-to-br from-slate-50 to-blue-50/30 border border-blue-100/50 rounded-2xl p-5 lg:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg lg:text-2xl font-black text-slate-800 leading-tight lg:w-11/12">
                  {recommendation.actionText}
                </h3>
                <div className="flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded-full border border-blue-100 shrink-0">
                  <div className="w-2 h-2 rounded-full bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                  <span className="text-[10px] font-bold text-success-700 uppercase tracking-wider hidden sm:inline-block">Engine Aktif</span>
                </div>
              </div>

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
                    <p className="text-[9px] text-gray-400 font-semibold uppercase lg:mb-1">User Gratis (FREE)</p>
                    <p className="text-xs lg:text-sm font-black text-gray-700 tabular-nums">{metrics.freeUsers}</p>
                  </div>
                  <div className="text-center lg:text-left">
                    <p className="text-[9px] text-gray-400 font-semibold uppercase lg:mb-1">User VIP</p>
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
        
        {/* SECTION 1: QUICK STATS CARDS */}
        <div className="mb-8">
            <h2 className="text-xl font-black text-gray-900 tracking-tight mb-4">Overview Bisnis</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Total User</p>
                    <p className="text-2xl font-black text-gray-900">{totalUsers}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Aktif / Pasif</p>
                    <p className="text-2xl font-black text-gray-900">
                        <span className="text-emerald-500">{activeUsers}</span> <span className="text-gray-300">/</span> <span className="text-gray-400">{passiveUsers}</span>
                    </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-blue-100 bg-blue-50/30 shadow-sm">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-wider mb-2">Kas Cadangan</p>
                    <p className="text-2xl font-black text-blue-600">{formatRupiah(totalReserve._sum.amount || 0)}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-emerald-100 bg-emerald-50/30 shadow-sm">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-wider mb-2">Total Terdistribusi</p>
                    <p className="text-2xl font-black text-emerald-600">{formatRupiah(totalDistributed._sum.amount || 0)}</p>
                </div>
            </div>
        </div>

        {/* SECTION 2: GRID 2 KOLOM (MONITORING & FINANSIAL) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* KOLOM KIRI: STATUS EKSEKUSI TIM */}
            <div id="monitoring" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> Status Eksekusi Tim Hari Ini
                </h3>
                <div className="space-y-4">
                    {members.filter(m => m.role !== 'SUPER_ADMIN').map(m => {
                        const completed = m.tasks.filter(t => t.isCompleted).length;
                        const total = m.tasks.length;
                        const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
                        
                        return (
                            <div key={m.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{m.name}</p>
                                        <p className="text-[10px] text-gray-500 uppercase font-semibold">{m.role}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-700">{completed} / {total} Selesai</p>
                                    </div>
                                </div>
                                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${pct === 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-blue-500' : 'bg-gray-300'}`} style={{ width: `${pct}%` }}></div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* KOLOM KANAN: DISTRIBUSI FINANSIAL */}
            <div id="finance" className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm shadow-blue-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 relative z-10">
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Distribusi Finansial
                </h3>
                <div className="relative z-10">
                    <RoyaltyForm />
                </div>
            </div>
            
        </div>

      </div>
    </div>
  );
}
