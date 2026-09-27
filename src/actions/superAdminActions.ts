"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// 1. CRM DELEGATION
export async function delegateToBana(userIds: string[]) {
    // get bana team member
    const bana = await prisma.teamMember.findFirst({ where: { role: "OPERATIONS" } });
    if (!bana) return;

    for (const id of userIds) {
        const u = await prisma.user.findUnique({ where: { id } });
        if (u) {
            await prisma.teamTask.create({
                data: {
                    teamMemberId: bana.id,
                    taskName: `Follow up user: ${u.name || u.email}`
                }
            });
        }
    }
    revalidatePath("/admin/pilot/users");
    revalidatePath("/admin/pilot/operations");
}

// 2. NOTIFICATIONS
export async function sendNotification(formData: FormData) {
    const title = formData.get("title")?.toString() || "Pemberitahuan";
    const message = formData.get("message")?.toString() || "";
    const ctaUrl = formData.get("ctaUrl")?.toString();
    const segment = formData.get("segment")?.toString() || "ALL";

    if (!message) return;

    let userQuery = {};
    if (segment === "VIP_ONLY") {
        userQuery = { role: { in: ["VIP", "PREMIUM"] } };
    } else if (segment === "FREE_ONLY") {
        userQuery = { role: { in: ["FREE", "OWNER"] } };
    }

    const users = await prisma.user.findMany({ where: userQuery });
    
    // Batch insert for all matched users
    const notifs = users.map(u => ({
        recipientId: u.id,
        title,
        message,
        ctaUrl,
        segment,
        trigger: "MANUAL",
        priority: "HIGH",
        status: "SENT"
    }));

    if (notifs.length > 0) {
        await prisma.ownerNotification.createMany({
            data: notifs
        });
    }

    revalidatePath("/admin/pilot/content");
}

// 3. BANNER/FEED
export async function createFeed(formData: FormData) {
    const title = formData.get("title")?.toString() || "";
    const imageUrl = formData.get("imageUrl")?.toString();
    const ctaUrl = formData.get("ctaUrl")?.toString();
    const audience = formData.get("audience")?.toString() || "ALL";
    const status = formData.get("status")?.toString() || "PUBLISHED";

    if (!title) return;

    await prisma.ubosFeedContent.create({
        data: {
            title,
            content: "Banner/Info",
            imageUrl,
            ctaUrl,
            audience,
            status
        }
    });

    revalidatePath("/admin/pilot/content");
}

export async function toggleFeedStatus(feedId: string, currentStatus: string) {
    await prisma.ubosFeedContent.update({
        where: { id: feedId },
        data: { status: currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED" }
    });
    revalidatePath("/admin/pilot/content");
}
