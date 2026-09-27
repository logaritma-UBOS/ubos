import { formatRupiah } from '@/lib/format';
export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ChecklistHarian from "@/components/team/ChecklistHarian";
import SaldoWidget from "@/components/team/SaldoWidget";

export default async function MethodologyPage() {
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
  if (teamMember.role !== "METHODOLOGY" && teamMember.role !== "SUPER_ADMIN") redirect("/admin/pilot");

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900">Methodology (Tony)</h2>
        <p className="text-gray-500">Menganalisa, merancang, dan memvalidasi SOP atau alur kerja sistem SaaS.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6 items-start">
        <div className="space-y-6">
          <ChecklistHarian teamMemberId={teamMember.id} tasks={teamMember.tasks} />
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Input Materi & Studi Kasus (Backward Mapping)</h3>
            <form className="space-y-4">
              <input type="text" placeholder="Judul Studi Kasus / Sop..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              <textarea placeholder="Tulis kerangka atau poin-poin metodologi..." className="w-full h-32 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"></textarea>
              <button type="button" className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">Simpan Draft Metodologi</button>
            </form>
          </div>
        </div>
        
        <div>
          <SaldoWidget balance={teamMember.walletBalance} totalEarned={teamMember.totalEarned} ledgers={teamMember.ledgers} />
        </div>
      </div>
    </div>
  );
}
