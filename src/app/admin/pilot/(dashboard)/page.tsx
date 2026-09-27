import { formatRupiah } from '@/lib/format';
export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RoyaltyForm from "./RoyaltyForm";

export default async function AdminPilotPage() {
  const session = await auth();
  
  const teamMember = await prisma.teamMember.findUnique({
    where: { email: session?.user?.email || "" }
  });

  if (!teamMember) redirect("/login");
  if (teamMember.role === "METHODOLOGY") redirect("/admin/pilot/methodology");
  if (teamMember.role === "DEVELOPER") redirect("/admin/pilot/developer");
  if (teamMember.role === "OPERATIONS") redirect("/admin/pilot/operations");

  // SUPER ADMIN Dashboard
  const members = await prisma.teamMember.findMany();
  const ledgers = await prisma.teamLedger.findMany({ 
    where: { type: "RESERVE_ALLOCATION" },
    orderBy: { createdAt: "desc" },
    take: 5
  });

  const totalReserve = await prisma.teamLedger.aggregate({
    where: { type: "RESERVE_ALLOCATION" },
    _sum: { amount: true }
  });

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-black text-gray-900">Master Admin (Baim)</h2>
        <p className="text-gray-500">Overview performa Team OS & Distribusi Keuangan.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Kas Cadangan Bisnis (20%)</h3>
          <p className="text-3xl font-black text-blue-600 mb-6">{formatRupiah(totalReserve._sum.amount || 0)}</p>
          
          <RoyaltyForm />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Status Saldo Tim</h3>
          <div className="space-y-4">
            {members.map(m => (
              <div key={m.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-bold text-sm text-gray-900">{m.name}</p>
                  <p className="text-xs text-gray-500">{m.role} ({m.sharePercentage}%)</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600">{formatRupiah(m.walletBalance)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
