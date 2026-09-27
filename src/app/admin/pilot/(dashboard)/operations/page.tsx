import { formatRupiah } from '@/lib/format';
export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import OperationsClient from "./OperationsClient";
import ChecklistHarian from "@/components/team/ChecklistHarian";
import SaldoWidget from "@/components/team/SaldoWidget";

export default async function OperationsPage({ searchParams }: { searchParams: { tab?: string } }) {
  const session = await auth();
  const currentTab = searchParams.tab || 'beranda';
  
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

  // Get all users/merchants for Mini CRM
  const users = await prisma.user.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 pb-24 lg:pb-8">
      {/* Header Info */}
      <div className="hidden lg:block">
        <h2 className="text-2xl font-black text-gray-900">Halo, Bana!</h2>
        <p className="text-gray-500 text-sm">Operations, QA & User Care</p>
      </div>
      <div className="lg:hidden mb-2">
        <h2 className="text-lg font-black text-gray-900">Operations, QA & User Care</h2>
      </div>

      {/* Sub Menu / Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-200 hide-scrollbar">
        <Link href="?tab=beranda" className={`px-4 py-2.5 text-sm font-bold rounded-t-xl whitespace-nowrap transition-colors ${currentTab === 'beranda' ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>Beranda & Dompet</Link>
        <Link href="?tab=checklist" className={`px-4 py-2.5 text-sm font-bold rounded-t-xl whitespace-nowrap transition-colors flex items-center gap-2 ${currentTab === 'checklist' ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
          Checklist Harian 
          {teamMember.tasks.filter(t => !t.isCompleted).length > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{teamMember.tasks.filter(t => !t.isCompleted).length}</span>
          )}
        </Link>
        <Link href="?tab=tools" className={`px-4 py-2.5 text-sm font-bold rounded-t-xl whitespace-nowrap transition-colors ${currentTab === 'tools' ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>Log Tiket & CRM</Link>
      </div>

      {/* Konten Beranda */}
      {currentTab === 'beranda' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100">
                <h3 className="font-bold text-emerald-900 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" /></svg>
                  Fokus Utama
                </h3>
              </div>
              <div className="p-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mengawal pengalaman pengguna pertama, menjaga retensi, dan memastikan aplikasi bebas kendala teknis di lapangan.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                  Tanggung Jawab Harian & Mingguan
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs font-bold text-slate-800">1. Follow-up Pengguna</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">Menghubungi minimal 5 pengguna pasif yang didelegasikan oleh Baim via WA setiap hari dengan pendekatan personal.</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">2. Pencatatan Masalah (Issue Logging)</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">Mendata alasan pengguna pasif serta mencatat error aplikasi langsung ke sistem tiket untuk Reza.</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">3. Internal QA & Komunitas</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">Menguji rutin fitur baru di HP dan menjawab pertanyaan dasar pengguna di grup WA/Telegram.</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <SaldoWidget balance={teamMember.walletBalance} totalEarned={teamMember.totalEarned} ledgers={teamMember.ledgers} />
          </div>
        </div>
      )}

      {/* Konten Checklist */}
      {currentTab === 'checklist' && (
        <div className="max-w-2xl">
          <ChecklistHarian teamMemberId={teamMember.id} tasks={teamMember.tasks} />
        </div>
      )}

      {/* Konten Tools */}
      {currentTab === 'tools' && (
        <div className="space-y-6">
          <OperationsClient users={users} />

          <div className="bg-white p-5 lg:p-6 rounded-2xl border border-red-100 shadow-sm max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Log Issue ke Developer</h3>
                <p className="text-xs text-slate-500">Buat tiket kendala teknis (Bug) untuk Reza</p>
              </div>
            </div>
            
            <form className="space-y-4">
              <input type="text" placeholder="Judul / Bagian yang Error (Contoh: Tombol Kasir Macet)..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500 transition-all" />
              <textarea placeholder="Ceritakan detail kendalanya di sini, dan langkah untuk mereplikasinya..." className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none"></textarea>
              <button type="button" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-md shadow-red-500/20 active:scale-95 text-sm uppercase tracking-wider">Submit Tiket ke Reza</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
