"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");
  const member = await prisma.teamMember.findUnique({ where: { email: session.user.email } });
  if (member?.role !== "SUPER_ADMIN") throw new Error("Forbidden");
  return member;
}

export async function distributeRoyalty(formData: FormData) {
  try {
    await requireSuperAdmin();
    const netProfit = parseFloat(formData.get("netProfit") as string) || 0;
    if (netProfit <= 0) return { error: "Laba Bersih harus lebih dari 0" };

    const reserveAmount = netProfit * 0.2;
    const poolAmount = netProfit * 0.8;

    await prisma.$transaction(async (tx) => {
      // 1. Catat ke Ledger Kas Cadangan
      await tx.teamLedger.create({
        data: {
          type: "RESERVE_ALLOCATION",
          amount: reserveAmount,
          description: `Alokasi 20% dari Laba Bersih Rp ${netProfit.toLocaleString("id-ID")}`
        }
      });

      // 2. Bagi ke anggota
      const members = await tx.teamMember.findMany();
      for (const m of members) {
        const share = (m.sharePercentage / 100) * poolAmount;
        
        await tx.teamMember.update({
          where: { id: m.id },
          data: {
            walletBalance: { increment: share },
            totalEarned: { increment: share }
          }
        });

        await tx.teamLedger.create({
          data: {
            type: "ROYALTY_DISTRIBUTION",
            amount: share,
            description: `Distribusi Royalti (${m.sharePercentage}%) dari Pool Rp ${poolAmount.toLocaleString("id-ID")}`,
            teamMemberId: m.id
          }
        });
      }
    });

    revalidatePath("/admin/pilot", "layout");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function createTicket(formData: FormData) {
  const session = await auth();
  const notes = formData.get("notes") as string;
  const isTechBug = formData.get("isTechBug") === "true";
  const userId = formData.get("userId") as string || null;

  await prisma.teamTicket.create({
    data: {
      notes,
      isTechBug,
      userId
    }
  });
  revalidatePath("/admin/pilot", "layout");
}

export async function resolveTicket(ticketId: string) {
  await prisma.teamTicket.update({
    where: { id: ticketId },
    data: { status: "RESOLVED" }
  });
  revalidatePath("/admin/pilot", "layout");
}
