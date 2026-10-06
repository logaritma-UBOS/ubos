"use server"

import { prisma } from "@/lib/prisma"
import { disburseMayar } from "@/lib/mayar"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");
  const member = await prisma.teamMember.findUnique({ where: { email: session.user.email } });
  if (member?.role !== "SUPER_ADMIN") throw new Error("Forbidden");
  return member;
}

export async function distributeRoyalty(prevState: any, formData: FormData) {
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

  const sender = await prisma.teamMember.findUnique({ where: { email: session?.user?.email || "" } });

  let assignedToId = null;
  if (isTechBug) {
    const dev = await prisma.teamMember.findFirst({ where: { role: "DEVELOPER" } });
    if (dev) assignedToId = dev.id;
  }

  await prisma.teamTicket.create({
    data: {
      notes,
      isTechBug,
      userId,
      sourceId: sender?.id,
      assignedToId
    }
  });
  revalidatePath("/admin/pilot", "layout");
}

export async function updateTicketStatus(ticketId: string, status: string) {
  await prisma.teamTicket.update({
    where: { id: ticketId },
    data: { status }
  });
  revalidatePath("/admin/pilot", "layout");
}

// --- FUND REQUEST SYSTEM ---
export async function createFundRequest(formData: FormData) {
  try {
    const admin = await requireSuperAdmin();
    const amount = parseFloat(formData.get("amount") as string) || 0;
    const reason = formData.get("reason") as string;
    if (amount <= 0 || !reason) throw new Error("Nominal dan alasan wajib diisi");

    await prisma.teamFundRequest.create({
      data: {
        requesterId: admin.id,
        amount,
        reason,
        status: "PENDING"
      }
    });
    revalidatePath("/admin/pilot");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function approveFundRequest(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");
    const member = await prisma.teamMember.findUnique({ where: { email: session.user.email } });
    if (member?.role !== "METHODOLOGY" && member?.role !== "SUPER_ADMIN") throw new Error("Forbidden");

    const req = await prisma.teamFundRequest.findUnique({ where: { id } });
    if (!req || req.status !== "PENDING") throw new Error("Request tidak valid");

    // Approve the request
    await prisma.teamFundRequest.update({
      where: { id },
      data: { status: "APPROVED" }
    });

    // Deduct from reserve via TeamLedger
    await prisma.teamLedger.create({
      data: {
        type: "BUSINESS_EXPENSE",
        amount: -req.amount,
        description: `Pencairan Dana: ${req.reason}`
      }
    });

    revalidatePath("/admin/pilot/methodology/tools");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function rejectFundRequest(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");
    const member = await prisma.teamMember.findUnique({ where: { email: session.user.email } });
    if (member?.role !== "METHODOLOGY" && member?.role !== "SUPER_ADMIN") throw new Error("Forbidden");

    await prisma.teamFundRequest.update({
      where: { id },
      data: { status: "REJECTED" }
    });

    revalidatePath("/admin/pilot/methodology/tools");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// --- DELEGATION SYSTEM ---
export async function delegateTask(formData: FormData) {
  try {
    await requireSuperAdmin();
    const assignedToId = formData.get("assignedToId") as string;
    const taskName = formData.get("taskName") as string;
    if (!assignedToId || !taskName) throw new Error("Data tidak lengkap");

    const assignee = await prisma.teamMember.findUnique({ where: { id: assignedToId } });
    if (!assignee) throw new Error("Penerima tugas tidak valid");

    if (assignee.role === "DEVELOPER") {
      // Create ticket for dev
      await prisma.teamTicket.create({
        data: {
          notes: taskName,
          isTechBug: false,
          status: "OPEN",
          assignedToId: assignee.id
        }
      });
    } else {
      // Create checklist task for ops
      await prisma.teamTask.create({
        data: {
          teamMemberId: assignee.id,
          taskName: taskName
        }
      });
    }
    
    revalidatePath("/admin/pilot");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// --- FONNTE BANA FOLLOW-UP ---
export async function sendWaBana(phone: string, message: string) {
    try {
      const session = await auth();
      if (!session?.user?.email) throw new Error("Unauthorized");
      const member = await prisma.teamMember.findUnique({ where: { email: session.user.email } });
      if (!member || (member.role !== "OPERATIONS" && member.role !== "SUPER_ADMIN")) {
        throw new Error("Forbidden");
      }
  
      if (!phone) throw new Error("Nomor HP tidak tersedia");
      
      // Format phone to 62...
      let target = phone.replace(/[^0-9]/g, '');
      if (target.startsWith('0')) target = '62' + target.substring(1);
      
      const res = await fetch("http://202.155.94.170:3000/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phone: target,
          text: message
        })
      });
      
      const result = await res.json();
      if (!res.ok || !result.success) {
        return { error: result.error || "Gagal mengirim pesan" };
      }
      
      return { success: true };
    } catch (error: any) {
      return { error: error.message };
    }
  }

export async function requestWithdrawal(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");
    
    const member = await prisma.teamMember.findUnique({ 
      where: { email: session.user.email },
      include: {
        tasks: {
          where: {
            date: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
              lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1) // First day of next month
            }
          }
        }
      }
    });

    if (!member) throw new Error("User not found");

    const amount = parseFloat(formData.get("amount") as string) || 0;
    if (amount <= 0) throw new Error("Nominal penarikan tidak valid");
    if (amount > member.walletBalance) throw new Error("Saldo tidak mencukupi");

    
    // SAFETY RULE 80% CHECKLIST
    const isMasterAdmin = member.role === "SUPER_ADMIN";
    const totalTasks = member.tasks.length;
    
    if (totalTasks === 0 && !isMasterAdmin) {
      throw new Error("Anda belum memiliki aktivitas checklist bulan ini. Selesaikan tugas harian terlebih dahulu.");
    }

    const completedTasks = member.tasks.filter(t => t.isCompleted).length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) : 0;

    if (completionRate < 0.8 && !isMasterAdmin) {
      throw new Error(`Syarat pencairan gagal: Progres checklist Anda bulan ini baru ${Math.round(completionRate * 100)}%. Minimal syarat adalah 80%.`);
    }

    // CHECK BANK DETAILS
    if (!member.bankName || !member.bankAccount || !member.bankAccountName) {
      throw new Error("Data rekening bank Anda belum lengkap. Silakan lengkapi profil terlebih dahulu.");
    }

    // HIT MAYAR API FIRST
    const disburseRes = await disburseMayar(amount, member.bankName, member.bankAccount, member.bankAccountName, `Payout UBOS OS untuk ${member.name}`);
    if (!disburseRes.success) {
      throw new Error("Sistem Mayar menolak transfer. Hubungi Super Admin.");
    }

    // PROCESS WITHDRAWAL IN DB
    // PROCESS WITHDRAWAL
    await prisma.$transaction(async (tx) => {
      await tx.teamMember.update({
        where: { id: member.id },
        data: { walletBalance: { decrement: amount } }
      });

      await tx.teamLedger.create({
        data: {
          teamMemberId: member.id,
          type: "WITHDRAWAL",
          amount: amount,
          description: `Penarikan saldo sebesar Rp ${amount.toLocaleString("id-ID")}`
        }
      });
    });

    revalidatePath("/admin/pilot", "layout");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function createIdea(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");
    
    const member = await prisma.teamMember.findUnique({ where: { email: session.user.email } });
    if (!member) throw new Error("User not found");

    const content = formData.get("content") as string;
    if (!content || content.trim().length === 0) throw new Error("Konten tidak boleh kosong");

    await prisma.teamIdea.create({
      data: {
        content: content.trim(),
        authorId: member.id
      }
    });

    revalidatePath("/admin/pilot", "layout");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateBankDetails(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");
    
    const member = await prisma.teamMember.findUnique({ where: { email: session.user.email } });
    if (!member) throw new Error("User not found");

    const bankName = formData.get("bankName") as string;
    const bankAccount = formData.get("bankAccount") as string;
    const bankAccountName = formData.get("bankAccountName") as string;

    await prisma.teamMember.update({
      where: { id: member.id },
      data: { bankName, bankAccount, bankAccountName }
    });

    revalidatePath("/admin/pilot", "layout");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function recordFollowUp(userId: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");
    const member = await prisma.teamMember.findUnique({ where: { email: session.user.email } });
    if (!member || (member.role !== "OPERATIONS" && member.role !== "SUPER_ADMIN")) throw new Error("Forbidden");

    await prisma.user.update({
      where: { id: userId },
      data: { followUpCount: { increment: 1 } }
    });
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

