"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ==========================================
// RELATIONSHIP PAGE ACTIONS (PREMIUM USERS)
// ==========================================

export async function pushDashboardInfo(formData: FormData) {
  const title = formData.get("title") as string;
  const message = formData.get("message") as string;
  const cta = formData.get("cta") as string;
  const ctaUrl = formData.get("ctaUrl") as string;

  try {
    const revs = await prisma.ubosRevenue.findMany({ where: { status: "PAID" } });
    const pIds = Array.from(new Set(revs.map(r => r.userId))).filter(Boolean);
    
    for (const uid of pIds) {
      try {
        await prisma.ownerNotification.create({
          data: {
            recipientId: uid,
            segment: "PREMIUM_USERS",
            trigger: "DASHBOARD_BANNER",
            title: title || "Fitur Eksklusif VIP",
            message: message || "Akses spesial untuk Anda.",
            cta: cta || undefined,
            ctaUrl: ctaUrl || undefined,
            priority: "HIGH",
            status: "SENT"
          }
        });
      } catch (e) {
        console.error("Failed to push to", uid, e);
      }
    }
  } catch (e) {
    console.error("Push dashboard failed:", e);
  }
  revalidatePath("/admin/pilot/relationship");
}

export async function pushPushNotification(formData: FormData) {
  const title = formData.get("title") as string;
  const message = formData.get("message") as string;
  const cta = formData.get("cta") as string;
  const ctaUrl = formData.get("ctaUrl") as string;

  try {
    const revs = await prisma.ubosRevenue.findMany({ where: { status: "PAID" } });
    const pIds = Array.from(new Set(revs.map(r => r.userId))).filter(Boolean);
    
    for (const uid of pIds) {
      try {
        await prisma.ownerNotification.create({
          data: {
            recipientId: uid,
            segment: "PREMIUM_USERS",
            trigger: "MANUAL_BROADCAST",
            title: title || "Informasi UBOS",
            message: message || "Ada pesan baru untuk Anda.",
            cta: cta || undefined,
            ctaUrl: ctaUrl || undefined,
            priority: "MEDIUM",
            status: "SENT"
          }
        });
      } catch (e) {
        console.error("Failed to push to", uid, e);
      }
    }
  } catch (e) {
    console.error("Push notification failed:", e);
  }
  revalidatePath("/admin/pilot/relationship");
}

export async function clearAllBroadcasts() {
  try {
    await prisma.ownerNotification.deleteMany({
      where: {
        segment: "PREMIUM_USERS"
      }
    });
  } catch (e) {
    console.error(e);
  }
  revalidatePath("/admin/pilot/relationship");
}

// ==========================================
// KONVERSI PAGE ACTIONS (FREE USERS)
// ==========================================

export async function pushFollowUpNotification(formData: FormData) {
  const title = formData.get("title") as string;
  const message = formData.get("message") as string;
  const cta = formData.get("cta") as string;
  const ctaUrl = formData.get("ctaUrl") as string;

  const allUsers = await prisma.user.findMany({ where: { role: "OWNER" } });
  const premiumRevs = await prisma.ubosRevenue.findMany({ where: { status: "PAID" } });
  const paidIds = new Set(premiumRevs.map(r => r.userId).filter(Boolean));
  const pIds = allUsers.filter(u => !paidIds.has(u.id)).map(u => u.id);
  
  for (const uid of pIds) {
    try {
      await prisma.ownerNotification.create({
        data: {
          recipientId: uid,
          segment: "FREE_USERS",
          trigger: "MANUAL_BROADCAST",
          title: title || "Informasi Penting",
          message: message || "Ada pesan baru untuk Anda.",
          cta: cta || undefined,
          ctaUrl: ctaUrl || undefined,
          priority: "HIGH",
          status: "SENT"
        }
      });
    } catch(e) {}
  }

  revalidatePath("/admin/pilot/konversi");
}

export async function clearFreeBroadcasts() {
  try {
    await prisma.ownerNotification.deleteMany({
      where: { segment: "FREE_USERS" }
    });
  } catch(e) {}
  revalidatePath("/admin/pilot/konversi");
}

// ==========================================
// FONNTE WA BLAST
// ==========================================

export async function sendWaBlastFonnte(phone: string, message: string) {
    const session = await auth();
    const member = session?.user?.email ? await prisma.teamMember.findUnique({ where: { email: session.user.email } }) : null;
    const gatewaySessionId = member ? "team_" + member.id : "master";
    if (!phone) throw new Error("Nomor HP tidak tersedia");
    
    // Format phone to 62...
    let target = phone.replace(/[^0-9]/g, '');
    if (target.startsWith('0')) target = '62' + target.substring(1);
    
    try {
      const res = await fetch("http://202.155.94.170:3000/send-message?session=" + gatewaySessionId, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phone: target,
          text: message
        })
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengirim pesan via Private Gateway");
      }
      
      // LOG AUDIT
      try {
        const { logPilotActivity } = await import("@/lib/pilotAudit");
        await logPilotActivity("Kirim WA Blast (Personal)", `Mengirim broadcast manual via Private Engine ke nomor target ${target}`);
      } catch(e) {
        console.error(e);
      }
      
      return { success: true };
    } catch (err: any) {
      console.error("Gateway Blast Error:", err);
      throw new Error(err.message || "Terjadi kesalahan saat menghubungi Gateway");
    }
  }


