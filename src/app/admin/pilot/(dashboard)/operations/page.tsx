export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import UserActivityLog from "../UserActivityLog";
import SaldoWidget from "@/components/team/SaldoWidget";
export default async function operationsBeranda() {
  
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

      
      <div className="flex flex-col gap-6 w-full">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full">
          <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100">
            <h3 className="font-bold text-emerald-900 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" /></svg>
              Fokus Utama
            </h3>
          </div>
          <div className="p-5">
            <p className="text-sm text-slate-600 leading-relaxed">
              Mengawal pengalaman pengguna pertama, menjaga retensi, dan memastikan aplikasi bebas kendala teknis di lapangan.
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              Tanggung Jawab Harian & Mingguan
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <p className="text-sm font-bold text-slate-800">1. Follow-up Pengguna</p>
              <p className="text-xs text-slate-500 mt-1 leading-snug">Menghubungi minimal 5 pengguna pasif yang didelegasikan oleh Baim via WA setiap hari dengan pendekatan personal.</p>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">2. Pencatatan Masalah (Issue Logging)</p>
              <p className="text-xs text-slate-500 mt-1 leading-snug">Mendata alasan pengguna pasif serta mencatat error aplikasi langsung ke sistem tiket untuk Reza.</p>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">3. Internal QA & Komunitas</p>
              <p className="text-xs text-slate-500 mt-1 leading-snug">Menguji rutin fitur baru di HP dan menjawab pertanyaan dasar pengguna di grup WA/Telegram.</p>
            </div>
          </div>
        </div>
      </div>
      <UserActivityLog />
    </div>
  );
}
