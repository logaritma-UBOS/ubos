import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"; // Ensure it runs dynamically

export async function GET(req: NextRequest) {
  try {
    // 1. Verify Authorization (Basic Cron Secret)
    const authHeader = req.headers.get("authorization");
    const CRON_SECRET = process.env.CRON_SECRET || "virtual-baim-secret";
    
    if (authHeader !== `Bearer ${CRON_SECRET}` && req.nextUrl.searchParams.get("key") !== CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Define Time Boundaries (Today)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 3. Get All Team Members
    const members = await prisma.teamMember.findMany();
    
    let generatedCount = 0;

    for (const member of members) {
      // Cek apakah member ini sudah punya task hari ini
      const existingTasks = await prisma.teamTask.findMany({
        where: {
          teamMemberId: member.id,
          date: { gte: startOfDay, lt: endOfDay }
        }
      });

      // Jika sudah ada task (mungkin dari Baim manual, atau cron sudah jalan), lewati
      
      const hasAutomated = existingTasks.some(t => 
        t.taskName.includes("Riset & Input") || 
        t.taskName.includes("Review Matriks") || 
        t.taskName.includes("Selesaikan minimal") || 
        t.taskName.includes("Update laporan harian") ||
        t.taskName.startsWith("Follow up user:") ||
        t.taskName.includes("Cari minimal 5 leads")
      );
      if (hasAutomated) continue;
    

      let dailyTasks: string[] = [];

      // 4. Baim's Persona: Task Assignment based on Role
      if (member.role === "SUPER_ADMIN") {
        dailyTasks = [
          "Review Matriks Performa Tim (Matrix Board)",
          "Update feed motivasi/bisnis harian"
        ];
      } else if (member.role === "METHODOLOGY") {
        dailyTasks = [
          "Riset & Input minimal 1 Studi Kasus / Formula Bisnis ke Repository",
          "Review metrik Conversion Rate dari funnel marketing",
          "Cek Inbox Pengajuan Dana (Approve/Reject jika ada)"
        ];
      } else if (member.role === "DEVELOPER") {
        dailyTasks = [
          "Selesaikan minimal 2 Tiket Bug/Fitur dari kolom In Progress ke Done",
          "Monitor log error server & Pastikan sistem 100% Up",
          "Review performa loading aplikasi (Wajib di bawah 2 detik)"
        ];
      } else if (member.role === "OPERATIONS") {
        dailyTasks = [
          "Update laporan harian Trafik & Lead yang masuk",
          "Filter keluhan dari tim dan ubah jadi Tiket Bug untuk Reza"
        ];
        
        // FASE OTOMATISASI DELEGASI: Ambil 5 user "STARTER" secara acak untuk di-follow up Bana
        const starters = await prisma.user.findMany({
          where: { role: "LEAD" }, // Asumsi STARTER adalah default role LEAD di sistem ini
          take: 50,
          orderBy: { createdAt: "desc" } // Ambil yang terbaru
        });
        
        // Ambil 5 teratas yang punya nomor telepon
        const validStarters = starters.filter(u => !!u.phone).slice(0, 5);
        
        validStarters.forEach(user => {
            // Gunakan format "Follow up user: [Name]" agar ChecklistHarian.tsx bisa menampilkan tombol WA Fonnte!
            const namaPanggilan = user.name || user.email;
            dailyTasks.push(`Follow up user: ${namaPanggilan}`);
        });
        
        // Jika tidak ada user baru, beri tugas opsional
        if (validStarters.length === 0) {
            dailyTasks.push("Cari minimal 5 leads baru via cold prospecting hari ini");
        }
      }

      // 5. Insert Tasks into DB
      for (const taskName of dailyTasks) {
        await prisma.teamTask.create({
          data: {
            taskName: taskName,
            isCompleted: false,
            date: new Date(), // Today
            teamMemberId: member.id
          }
        });
        generatedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Virtual Baim berhasil mendistribusikan ${generatedCount} tugas harian!` 
    });
  } catch (error: any) {
    console.error("Cron Daily Tasks Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
