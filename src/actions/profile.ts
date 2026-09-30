"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfilePicture(userId: string, base64Image: string) {
    try {
        await prisma.teamMember.update({
            where: { id: userId },
            data: { profilePicture: base64Image }
        });
        revalidatePath("/admin/pilot", "layout");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}
