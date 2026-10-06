import { formatRupiah } from '@/lib/format';
export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { runOwnerEngine } from "@/lib/engines/ownerEngine";
import { prisma } from "@/lib/prisma";
import UserActivityLog from "./UserActivityLog";
import RoyaltyForm from "./RoyaltyForm";
import ControlTowerForms from "./ControlTowerForms";
import MayarBalanceWidget from "@/components/team/MayarBalanceWidget";
import LeadPoolWidget from "@/components/team/LeadPoolWidget";

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

  // LEAD POOL DATA for Baim
  const manualLeads = await prisma.manualLead.findMany({
      orderBy: { createdAt: "desc" },
      include: {
          source: { select: { name: true, role: true } },
          assignedTo: { select: { name: true } }
      }
  });

  // Tier breakdown based on UbosRevenue (synced with frontend subscription logic)
  const allRevenues = await prisma.ubosRevenue.findMany({
    where: { status: "PAID" },
    select: { userId: true, amount: true }
  });
  // Get max payment per user
  const maxAmountByUser: Record<string, number> = {};
  for (const r of allRevenues) {
    if (!maxAmountByUser[r.userId] || r.amount > maxAmountByUser[r.userId]) {
      maxAmountByUser[r.userId] = r.amount;
    }
  }
  
  const warunkArsi = await prisma.user.findUnique({ where: { email: "warunkarsi23@gmail.com" } });
  const paidUserIds = [...new Set(allRevenues.map(r => r.userId))];
  
  let countLifetime = 0;
  let countProBulanan = 0;
  
  for (const id of paidUserIds) {
    if (warunkArsi && id === warunkArsi.id) continue;
    countProBulanan++;
  }
  if (warunkArsi) {
    countLifetime = 1;
  }

  const totalPaidOrLifetime = countProBulanan + countLifetime;
  const countStarter = Math.max(0, totalUsers - totalPaidOrLifetime);
  const countProTahunan = 0;

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

            {/* TIER BREAKDOWN — synced with frontend subscription system */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Starter (Gratis)</p>
                    <p className="text-xl font-black text-gray-700">{countStarter}</p>
                    <p className="text-[10px] text-gray-400 mt-1">Rp 0 / bulan</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-wider mb-1">Pro Bulanan</p>
                    <p className="text-xl font-black text-blue-700">{countProBulanan}</p>
                    <p className="text-[10px] text-blue-400 mt-1">Rp 49.000 / bulan</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <p className="text-[10px] font-black text-purple-500 uppercase tracking-wider mb-1">Pro Tahunan</p>
                    <p className="text-xl font-black text-purple-700">{countProTahunan}</p>
                    <p className="text-[10px] text-purple-400 mt-1">Rp 349.000 / tahun</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-wider mb-1">Lifetime</p>
                    <p className="text-xl font-black text-amber-700">{countLifetime}</p>
                    <p className="text-[10px] text-amber-400 mt-1">Rp 499.000 sekali bayar</p>
                </div>
            </div>
        </div>

        
      
        {/* LEAD POOL */}
        <div id="lead-pool" className="mb-8 pt-4">
            <h2 className="text-xl font-black text-gray-900 tracking-tight mb-4">Kolam Prospek Tim (Lead Pool)</h2>
            <LeadPoolWidget leads={manualLeads} />
        </div>

        {/* TEAM PERFORMANCE MATRIX */}
        <div id="monitoring" className="mb-8 pt-4">
            <h2 className="text-xl font-black text-gray-900 tracking-tight mb-4">Team Performance Matrix</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Anggota Tim</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Progress Hari Ini</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status Checklist</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {members.filter(m => m.role !== "SUPER_ADMIN").map(member => {
                                const total = member.tasks.length;
                                const completed = member.tasks.filter(t => t.isCompleted).length;
                                const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
                                
                                return (
                                    <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-gray-900">{member.name}</div>
                                            <div className="text-xs text-gray-500">{member.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                                                {member.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-sm font-bold text-gray-900">{percentage}%</span>
                                                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percentage}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs font-medium text-gray-600">
                                                {completed} / {total} Tugas Selesai
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                            {members.filter(m => m.role !== "SUPER_ADMIN").length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-400 text-sm italic">Belum ada tim yang terdaftar.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* DISTRIBUSI FINANSIAL */}
        <div id="finance" className="mb-8 pt-4">
            <h2 className="text-xl font-black text-gray-900 tracking-tight mb-4">Distribusi Finansial (Payout)</h2>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm max-w-xl">
                <RoyaltyForm />
            </div>
        </div>


        <div className="mt-6">
          <UserActivityLog />
        </div>

      </div>
    </div>
  );
}
