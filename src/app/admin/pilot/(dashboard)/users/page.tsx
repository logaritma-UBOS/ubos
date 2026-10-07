import { prisma } from "@/lib/prisma"
import UsersClient from "./UsersClient"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic";

function getTier(email: string, revenues: { amount: number, paymentMethod: string | null }[]): string {
  if (email === "warunkarsi23@gmail.com") return "LIFETIME";
  if (revenues.length > 0) {
    const isTahunan = revenues.some(r => r.paymentMethod && r.paymentMethod.includes("PRO_TAHUNAN"));
    return isTahunan ? "PRO_TAHUNAN" : "PRO_BULANAN";
  }
  return "STARTER";
}

export default async function UsersPage() {
    const session = await auth();
    const teamMember = await prisma.teamMember.findUnique({
        where: { email: session?.user?.email || "" }
    });

    if (!teamMember || teamMember.role !== "SUPER_ADMIN") redirect("/admin/pilot");

    const users = await prisma.user.findMany({
        include: { businesses: true },
        orderBy: { createdAt: "desc" }
    });

    const allRevenues = await prisma.ubosRevenue.findMany({
        where: { status: "PAID" },
        select: { userId: true, amount: true, paymentMethod: true }
    });

    const revenueMap: Record<string, { amount: number, paymentMethod: string | null }[]> = {};
    for (const r of allRevenues) {
        if (!revenueMap[r.userId]) revenueMap[r.userId] = [];
        revenueMap[r.userId].push({ amount: r.amount, paymentMethod: r.paymentMethod });
    }

    const usersWithTier = users.map(u => ({
        ...u,
        tier: getTier(u.email, revenueMap[u.id] || [])
    }));

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-black text-gray-900">Manajemen User (CRM)</h2>
                <p className="text-gray-500">Filter, pantau, dan delegasikan eksekusi harian ke tim Operations.</p>
            </div>
            
            <UsersClient users={usersWithTier} currentUserEmail={teamMember.email} currentUserName={teamMember.name} />
        </div>
    )
}
