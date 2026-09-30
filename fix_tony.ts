
import { prisma } from "./src/lib/prisma";

async function fix() {
  const tony = await prisma.teamMember.findFirst({ where: { role: "METHODOLOGY" } });
  if (tony) {
    const dailyTasks = [
      "Riset & Input minimal 1 Studi Kasus / Formula Bisnis ke Repository",
      "Review metrik Conversion Rate dari funnel marketing",
      "Cek Inbox Pengajuan Dana (Approve/Reject jika ada)"
    ];
    for (const t of dailyTasks) {
      await prisma.teamTask.create({
        data: {
          taskName: t,
          isCompleted: false,
          date: new Date(),
          teamMemberId: tony.id
        }
      });
    }
    console.log("Injected Tony tasks!");
  }
}
fix();

