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

    const nameLower = userName.toLowerCase();
    let displayName = userName;
    let icon = '👤';
    let title = '';
    let customMessage = 'Satu amunisi kita sudah siap di posnya! Bagi tim yang belum check-in, yuk segera merapat, gas bereskan Checklist Harian, dan mari cetak rekor konversi baru hari ini! 🔥🚀';

    if (nameLower.includes('baim')) {
      icon = '👑';
      title = ' (Super Admin)';
      customMessage = 'Kapten sedang inspeksi *dashboard* utama nih! Pastikan *Checklist Harian* kalian sudah mulai dikerjakan dan progresnya hijau semua. Let\'s go! 🔥';
    } else if (nameLower.includes('tony')) {
      icon = '🦅';
      displayName = 'Pak Tony';
      title = ' (Investor & Advisor)';
      customMessage = 'Mata elang kita sedang mengevaluasi konversi dan strategi bisnis hari ini. Siap-siap untuk diskusi *insight* dan ide segar di Linimasa Tim! 📈';
    } else if (nameLower.includes('reza')) {
      icon = '💻';
      title = ' (Developer)';
      customMessage = 'Keamanan dan stabilitas sistem sedang dijaga. Kalau ada *error* atau ide fitur baru hari ini, pastikan sudah kalian catat dan delegasikan sebagai Tiket Bug! 🛠️';
    } else if (nameLower.includes('bana')) {
      icon = '🚀';
      title = ' (Operations & QA)';
      customMessage = 'Ujung tombak operasional kita sudah *standby* untuk *follow-up* Lead dan QA sistem! Bagi yang belum login, yuk segera merapat dan tuntaskan *Checklist Harian* masing-masing! 🎯';
    }

    message = `🟢 *[UBOS TEAM RADAR]*\n\n${icon} *${displayName}*${title} baru saja merapat ke markas UBOS! [Jam ${jamOnly}]\n🔗 https://ubos.logaritma.id/admin/pilot\n\n💡 *Pesan untuk Tim:*\n${customMessage}`;
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