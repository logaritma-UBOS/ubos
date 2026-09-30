export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FundRequestClient from "./FundRequestClient";
import IdeaRepositoryClient from "./IdeaRepositoryClient";

export default async function FundRequestPage() {
  const session = await auth();
  const teamMember = await prisma.teamMember.findUnique({
    where: { email: session?.user?.email || "" }
  });

  if (!teamMember) redirect("/login");
  if (teamMember.role !== "METHODOLOGY" && teamMember.role !== "SUPER_ADMIN") redirect("/admin/pilot");

  const requests = await prisma.teamFundRequest.findMany({
    orderBy: { createdAt: "desc" }
  });

  const ideas = await prisma.teamIdea.findMany({
    include: { author: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-4 lg:p-8 w-full max-w-5xl mx-auto space-y-6 pb-24 lg:pb-8 flex flex-col">
      <div className="hidden lg:block mb-6">
        <h2 className="text-2xl font-black text-gray-900">Inbox Pengajuan Dana</h2>
        <p className="text-gray-500 text-sm">Review dan setujui proposal dana dari Control Tower</p>
      </div>
      <div className="lg:hidden mb-6">
        <h2 className="text-lg font-black text-gray-900">Inbox Dana</h2>
      </div>

      <FundRequestClient requests={requests} />
      <div className="pt-4">
        <IdeaRepositoryClient ideas={ideas} />
      </div>
    </div>
  );
}
