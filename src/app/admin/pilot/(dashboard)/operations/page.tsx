import { formatRupiah } from '@/lib/format';
export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OperationsClient from "./OperationsClient";

export default async function OperationsPage() {
  const session = await auth();
  
  const teamMember = await prisma.teamMember.findUnique({
    where: { email: session?.user?.email || "" }
  });

  if (!teamMember) redirect("/login");
  if (teamMember.role !== "OPERATIONS" && teamMember.role !== "SUPER_ADMIN") redirect("/admin/pilot");

  // Get all users/merchants for Mini CRM
  const users = await prisma.user.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900">Operations (Bana)</h2>
        <p className="text-gray-500">Berinteraksi langsung dengan user, merawat hubungan, dan mengelola CRM.</p>
      </div>

      <OperationsClient users={users} />
    </div>
  );
}
