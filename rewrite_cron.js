const fs = require('fs');
const file = 'src/app/api/cron/wa-alerts/route.ts';

const newCode = `import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // morning, afternoon, night
    const secret = searchParams.get("secret");

    if (secret !== process.env.CRON_SECRET && secret !== "ubos123") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const teamMembers = await prisma.teamMember.findMany();
        
        const baim = teamMembers.find(m => m.name.toLowerCase().includes("baim") || m.email === "logaritma.tim@gmail.com");
        const tony = teamMembers.find(m => m.name.toLowerCase().includes("tony"));

        const baimSession = baim ? "team_" + baim.id : "master";
        const tonySession = tony ? "team_" + tony.id : "master";
        const groupId = "120363427940625422@g.us";

        const sendWA = async (session: string, phone: string, text: string) => {
            await fetch("http://202.155.94.170:3000/send-message?session=" + session, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, text })
            }).catch(e => console.error(e));
        };

        if (type === "morning") {
            for (const member of teamMembers) {
                if (!member.whatsapp) continue;
                const msg = "Halo " + member.name + "! ??\\n\\nChecklist harian kamu sudah terbit dan siap dikerjakan di dasbor UBOS Pilot. Semangat!";
                await sendWA(baimSession, member.whatsapp, msg);
            }
            return NextResponse.json({ success: true, type: "morning" });
        }

        if (type === "afternoon") {
            for (const member of teamMembers) {
                if (!member.whatsapp) continue;
                const msg = "Sore " + member.name + "! ?\\n\\nJangan lupa update dan selesaikan checklist harianmu ya, agar progresnya tercatat 100%.";
                await sendWA(tonySession, member.whatsapp, msg);
            }
            return NextResponse.json({ success: true, type: "afternoon" });
        }

        if (type === "night") {
            let reportMsg = "?? *Laporan Progres Ceklis Harian*\\nTanggal: " + new Date().toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' }) + "\\n\\n";
            
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            
            // Menggabungkan duplikat nama (Group by Name)
            const groupedTasks = new Map();
            
            for (const member of teamMembers) {
                const tasks = await prisma.teamTask.findMany({
                    where: {
                        teamMemberId: member.id,
                        date: { gte: startOfDay }
                    }
                });
                if (tasks.length === 0) continue;
                
                const normalizedName = member.name.trim().charAt(0).toUpperCase() + member.name.trim().slice(1).toLowerCase();
                if (!groupedTasks.has(normalizedName)) {
                    groupedTasks.set(normalizedName, { completed: 0, total: 0 });
                }
                const data = groupedTasks.get(normalizedName);
                data.completed += tasks.filter(t => t.isCompleted).length;
                data.total += tasks.length;
            }
            
            for (const [name, data] of groupedTasks.entries()) {
                const percentage = Math.round((data.completed / data.total) * 100);
                reportMsg += "? *" + name + "*: " + data.completed + "/" + data.total + " Selesai (" + percentage + "%)\\n";
            }
            
            reportMsg += "\\nTetap semangat dan persiapkan diri untuk besok! ??";
            
            await sendWA(baimSession, groupId, reportMsg);
            
            return NextResponse.json({ success: true, type: "night" });
        }

        return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
    } catch (error: any) {
        console.error("Cron WA Alerts Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
`;

fs.writeFileSync(file, newCode.replace(/\\\\n/g, '\\n'));
console.log('API Cron rewritten successfully.');
