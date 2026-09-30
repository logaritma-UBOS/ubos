
export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SaldoWidget from "@/components/team/SaldoWidget";
import DeveloperClient from "../DeveloperClient";
import IdeaRepositoryClient from "../../methodology/tools/IdeaRepositoryClient";

export default async function developerTools() {
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
        orderBy: { date: "asc" }
      },
      ledgers: {
        orderBy: { createdAt: "desc" },
        take: 3
      }
    }
  });

  if (!teamMember) redirect("/login");

  if (teamMember.role !== "DEVELOPER" && teamMember.role !== "SUPER_ADMIN") redirect("/admin/pilot");
  
  const tickets = await prisma.teamTicket.findMany({
    where: { isTechBug: true },
    include: { source: true },
    orderBy: { createdAt: "desc" },
  });

  const ideas = await prisma.teamIdea.findMany({
    include: { author: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-4 lg:p-8 w-full max-w-7xl mx-auto space-y-6 pb-24 lg:pb-8 flex flex-col">
      <div className="hidden lg:block mb-2">
        <h2 className="text-2xl font-black text-gray-900">Halo, Reza!</h2>
        <p className="text-gray-500 text-sm">Lead Software Developer</p>
      </div>
      <div className="lg:hidden mb-2">
        <h2 className="text-lg font-black text-gray-900">Lead Software Developer</h2>
      </div>
      <SaldoWidget teamMember={teamMember} balance={teamMember.walletBalance} totalEarned={teamMember.totalEarned} ledgers={teamMember.ledgers} />

      <div className="w-full">
        <DeveloperClient tickets={tickets} />
      </div>
      <div className="w-full pt-4">
        <IdeaRepositoryClient ideas={ideas} readOnly={true} />
      </div>
    </div>
  );
}

