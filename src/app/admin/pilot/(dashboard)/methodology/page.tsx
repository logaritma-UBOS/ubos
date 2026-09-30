export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import UserActivityLog from "../UserActivityLog";
import SaldoWidget from "@/components/team/SaldoWidget";

export default async function methodologyBeranda() {
  const session = await auth();
  const teamMember = await prisma.teamMember.findUnique({
    where: { email: session?.user?.email || "" },
    include: {
      ledgers: {
        orderBy: { createdAt: 'desc' },
        take: 3
      }
    }
  });

  if (!teamMember) redirect("/login");
  if (teamMember.role !== "METHODOLOGY" && teamMember.role !== "SUPER_ADMIN") redirect("/admin/pilot");

  // Get high-level metrics
  const totalUsers = await prisma.user.count();
  const paidRevenues = await prisma.ubosRevenue.findMany({ where: { status: "PAID" } });
  const totalRevenue = paidRevenues.reduce((acc, curr) => acc + curr.amount, 0);
  
  const totalReserve = await prisma.teamLedger.aggregate({
    where: { type: "RESERVE_ALLOCATION" },
    _sum: { amount: true }
  });
  const reserveBalance = totalReserve._sum.amount || 0;

  const members = await prisma.teamMember.findMany({
    include: {
      tasks: {
        where: {
          date: {
            gte: new Date(new Date().setHours(0,0,0,0)),
            lt: new Date(new Date().setHours(23,59,59,999))
          }
        }
      },
      assignedTickets: {
        where: {
          updatedAt: {
            gte: new Date(new Date().setHours(0,0,0,0)),
            lt: new Date(new Date().setHours(23,59,59,999))
          }
        }
      }
    }
  });

  return (
    <div className="p-4 lg:p-8 w-full max-w-7xl mx-auto space-y-6 pb-24 lg:pb-8 flex flex-col">
      <div className="hidden lg:block mb-2">
        <h2 className="text-2xl font-black text-gray-900">Halo, Tony!</h2>
        <p className="text-gray-500 text-sm">Investor & Advisor (Eagle Eye View)</p>
      </div>
      <div className="lg:hidden mb-2">
        <h2 className="text-lg font-black text-gray-900">Investor & Advisor</h2>
      </div>

      <SaldoWidget teamMember={teamMember} balance={teamMember.walletBalance} totalEarned={teamMember.totalEarned} ledgers={teamMember.ledgers} />

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          Executive Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <p className="text-sm text-slate-500 font-semibold mb-1">Total Pengguna (All)</p>
            <p className="text-3xl font-black text-slate-800">{totalUsers}</p>
          </div>
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
            <p className="text-sm text-emerald-600 font-semibold mb-1">Total Pendapatan Kotor</p>
            <p className="text-2xl font-black text-emerald-900">Rp {totalRevenue.toLocaleString("id-ID")}</p>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-sm text-blue-600 font-semibold mb-1">Kas Cadangan Operasional</p>
            <p className="text-2xl font-black text-blue-900">Rp {reserveBalance.toLocaleString("id-ID")}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">Kinerja Tim Hari Ini</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {members.map(m => {
            const total = m.role === "DEVELOPER" ? m.assignedTickets.length : m.tasks.length;
            const completed = m.role === "DEVELOPER" ? m.assignedTickets.filter(t => t.status === "RESOLVED").length : m.tasks.filter(t => t.isCompleted).length;
            const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
            return (
              <div key={m.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                  <div className="flex justify-between items-end mb-2">
                      <div>
                          <p className="font-bold text-gray-800">{m.name}</p>
                          <p className="text-xs font-semibold text-gray-500 uppercase">{m.role}</p>
                      </div>
                      <p className="text-lg font-black text-blue-600">{pct}%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`h-full rounded-full ${pct === 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-blue-500' : 'bg-gray-300'}`} style={{ width: `${pct}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 font-medium">{completed} dari {total} tugas selesai</p>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-4 italic">* Tampilan ini bersifat Read-Only. Anda tidak memiliki akses untuk mengubah data operasional.</p>
      </div>
      <UserActivityLog />
    </div>
  );
}
