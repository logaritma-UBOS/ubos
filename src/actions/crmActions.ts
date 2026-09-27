"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateCrmStatus(userId: string, newStatus: string) {
    await prisma.user.update({
        where: { id: userId },
        data: { crmStatus: newStatus }
    });
    revalidatePath("/admin/pilot/operations");
    revalidatePath("/admin/pilot");
}

export async function toggleTeamTask(taskId: string, isCompleted: boolean) {
    await prisma.teamTask.update({
        where: { id: taskId },
        data: { isCompleted, completedAt: isCompleted ? new Date() : null }
    });
    revalidatePath("/admin/pilot", "layout");
}

export async function createTeamTask(teamMemberId: string, taskName: string) {
    await prisma.teamTask.create({
        data: {
            teamMemberId,
            taskName
        }
    });
    revalidatePath("/admin/pilot", "layout");
}
