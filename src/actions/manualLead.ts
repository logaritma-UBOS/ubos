"use server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function addManualLead(name: string, phone: string) {
    const session = await auth();
    if (!session?.user?.email) return { error: "Unauthorized" };

    const member = await prisma.teamMember.findUnique({ where: { email: session.user.email } });
    if (!member) return { error: "User not found" };

    try {
        await prisma.manualLead.create({
            data: {
                name,
                phone,
                sourceId: member.id,
                status: "NEW"
            }
        });
        revalidatePath("/admin/pilot");
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function delegateManualLead(leadId: string) {
    const session = await auth();
    if (!session?.user?.email) return { error: "Unauthorized" };

    const member = await prisma.teamMember.findUnique({ where: { email: session.user.email } });
    if (!member || member.role !== "SUPER_ADMIN") return { error: "Forbidden" };

    try {
        const bana = await prisma.teamMember.findFirst({ where: { role: "OPERATIONS" } });
        if (!bana) return { error: "Bana (OPERATIONS) not found" };

        const lead = await prisma.manualLead.findUnique({ where: { id: leadId } });
        if (!lead) return { error: "Lead not found" };

        await prisma.manualLead.update({
            where: { id: leadId },
            data: { 
                status: "DELEGATED",
                assignedToId: bana.id
            }
        });

        await prisma.teamTask.create({
            data: {
                teamMemberId: bana.id,
                taskName: "Follow up CALON USER: " + lead.name + " | " + lead.phone
            }
        });

        revalidatePath("/admin/pilot");
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}
