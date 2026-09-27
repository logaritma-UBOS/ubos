import { formatRupiah } from '@/lib/format';
export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DeveloperClient from "./DeveloperClient";

export default async function DeveloperPage() {
  const session = await auth();
  
  const teamMember = await prisma.teamMember.findUnique({
    where: { email: session?.user?.email || "" }
  });

  if (!teamMember) redirect("/login");
  if (teamMember.role !== "DEVELOPER" && teamMember.role !== "SUPER_ADMIN") redirect("/admin/pilot");

  const tickets = await prisma.teamTicket.findMany({
    where: { isTechBug: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900">Developer (Reza)</h2>
        <p className="text-gray-500">Antrean Tiket Bug Teknis.</p>
      </div>

      <DeveloperClient tickets={tickets} />
    </div>
  );
}
