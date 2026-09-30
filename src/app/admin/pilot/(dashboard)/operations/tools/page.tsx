export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SaldoWidget from "@/components/team/SaldoWidget";
import OperationsClient from "../OperationsClient";
export default async function operationsTools() {
  
  const session = await auth();
  const teamMember = await prisma.teamMember.findUnique({
    where: { email: session?.user?.email || "" },
    include: {
      tasks: {
        where: {
          date: {
            gte: new Date(new Date().setHours(0,0,0,0)),
            lt: new Date(new Date().setHours(23,59,59,999))
          }
        },
        orderBy: { date: 'asc' }
      },
      ledgers: {
        orderBy: { createdAt: 'desc' },
        take: 3
      }
    }
  });

  if (!teamMember) redirect("/login");

  if (teamMember.role !== "OPERATIONS" && teamMember.role !== "SUPER_ADMIN") redirect("/admin/pilot");
  
  const users = await prisma.user.findMany({
    where: { role: "LEAD" },
    take: 100,
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-4 lg:p-8 w-full max-w-7xl mx-auto space-y-6 pb-24 lg:pb-8 flex flex-col">
      
      <div className="hidden lg:block mb-2">
        <h2 className="text-2xl font-black text-gray-900">Halo, Bana!</h2>
        <p className="text-gray-500 text-sm">Operations, QA & User Care</p>
      </div>
      <div className="lg:hidden mb-2">
        <h2 className="text-lg font-black text-gray-900">Operations, QA & User Care</h2>
      </div>
      <SaldoWidget teamMember={teamMember} balance={teamMember.walletBalance} totalEarned={teamMember.totalEarned} ledgers={teamMember.ledgers} />

      
      <div className="w-full">
        <OperationsClient users={users} />
      </div>
      <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm mt-6 w-full max-w-4xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Log Issue ke Developer</h3>
            <p className="text-sm text-slate-500">Buat tiket kendala teknis (Bug) untuk Reza</p>
          </div>
        </div>
        
        <form className="space-y-4">
          <input type="text" placeholder="Judul / Bagian yang Error (Contoh: Tombol Kasir Macet)..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500 transition-all" />
          <textarea placeholder="Ceritakan detail kendalanya di sini, dan langkah untuk mereplikasinya..." className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none"></textarea>
          <button type="button" className="w-auto bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-md shadow-red-500/20 active:scale-95 text-sm uppercase tracking-wider">Submit Tiket ke Reza</button>
        </form>
      </div>
    </div>
  );
}
