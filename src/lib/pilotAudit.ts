import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function sendConditionalWA(userName: string, action: string, detail: string, timestamp: string) {
  // Hanya kirim ke grup WA jika action adalah Login atau Check-in Aktivitas Harian
  const isLogin = action === "Login ke Dasbor Pilot" || action === "Login";
  const isCheckIn = action === "Check-in Aktivitas Harian";

  if (!isLogin && !isCheckIn) return; // Ignore others for WA

  let message = "";
  if (isLogin) {
    const jamOnly = new Intl.DateTimeFormat("id-ID", {
      timeStyle: "short",
      timeZone: "Asia/Jakarta"
    }).format(new Date());

    message = `🚨 *[LOGARITMA AUDIT]*\n\n👤 @${userName} sedang login ke https://ubos.logaritma.id/admin/pilot hari ini jam ${jamOnly}.\n\n💡 *Pesan untuk tim:*\nBagi yang belum check-in hari ini, segera login dan pantau aktivitas UBOS atau catat kontribusi Anda untuk memajukan UBOS hari ini! 🔥`;
  } else {
    message = `🚨 *[LOGARITMA AUDIT]*\n\n👤 *User:* @${userName}\n▶️ *Aksi:* ${action}\n📝 *Detail:* ${detail}\n⏰ *Waktu:* ${timestamp}`;
  }

  const target = "120363427940625422@g.us";
  
  await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: {
      "Authorization": "yR1HdhH9wfPVVoKu2G4e",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ target, message })
  });
}

export async function logPilotActivityRaw(userName: string, userEmail: string, action: string, detail: string) {
  try {
    const timestamp = new Intl.DateTimeFormat("id-ID", {
      dateStyle: "full",
      timeStyle: "medium",
      timeZone: "Asia/Jakarta"
    }).format(new Date());

    // 1. Save to DB for Performa Tim analytics
    await prisma.pilotActivityLog.create({
      data: {
        ownerEmail: userEmail,
        ownerName: userName,
        action: action,
        details: detail || null,
      }
    });

    await sendConditionalWA(userName, action, detail, timestamp);
  } catch (error) {
    console.error("Failed to log raw pilot activity:", error);
  }
}

export async function logPilotActivity(action: string, detail: string) {
  try {
    const session = await auth();
    const userName = session?.user?.name || "Admin (Unidentified)";
    const userEmail = session?.user?.email || "unknown@logaritma.id";
    const timestamp = new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'full',
      timeStyle: 'medium',
      timeZone: 'Asia/Jakarta'
    }).format(new Date());

    // 1. Save to DB for Performa Tim analytics
    await prisma.pilotActivityLog.create({
      data: {
        ownerEmail: userEmail,
        ownerName: userName,
        action: action,
        details: detail || null,
      }
    });

    await sendConditionalWA(userName, action, detail, timestamp);
  } catch (error) {
    console.error("Failed to log pilot activity:", error);
  }
}