import { formatRupiah } from '@/lib/format';
export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DeveloperClient from "./DeveloperClient";
import ChecklistHarian from "@/components/team/ChecklistHarian";
import SaldoWidget from "@/components/team/SaldoWidget";

export default async function DeveloperPage() {
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
  if (teamMember.role !== "DEVELOPER" && teamMember.role !== "SUPER_ADMIN") redirect("/admin/pilot");

  const tickets = await prisma.teamTicket.findMany({
    where: { isTechBug: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900">Developer (Reza)</h2>
        <p className="text-gray-500">Mengeksekusi kode, mengatasi bug teknis, dan menjaga stabilitas server.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6 items-start">
        <div className="space-y-6">
          <ChecklistHarian teamMemberId={teamMember.id} tasks={teamMember.tasks} />
          
          <DeveloperClient tickets={tickets} />
        </div>
        
        <div>
          <SaldoWidget balance={teamMember.walletBalance} totalEarned={teamMember.totalEarned} ledgers={teamMember.ledgers} />
        </div>
      </div>
    </div>
  );
}
