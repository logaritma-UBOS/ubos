export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SaldoWidget from "@/components/team/SaldoWidget";
import ChecklistHarian from "@/components/team/ChecklistHarian";
import RadarProspekForm from "@/components/team/RadarProspekForm";
export default async function operationsChecklist() {
  
  const session = await auth();
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, phone: true, crmStatus: true, lastLogin: true, createdAt: true } });
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

      
      <RadarProspekForm />

      <div className="pt-2 w-full">
        <ChecklistHarian teamMemberId={teamMember.id} tasks={teamMember.tasks} users={users} />
      </div>
    </div>
  );
}
