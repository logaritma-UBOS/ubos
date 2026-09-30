
"use server";

import { prisma } from "@/lib/prisma";

export async function getRecentUserActivity() {
    // Ambil daftar email tim untuk diexclude
    const teamMembers = await prisma.teamMember.findMany({ select: { email: true } });
    const teamEmails = teamMembers.map(tm => tm.email);

    const recentUsers = await prisma.user.findMany({
        where: {
            email: {
                notIn: teamEmails
            }
        },
        take: 10,
        orderBy: { lastLogin: "desc" },
        select: {
            id: true,
            name: true,
            email: true,
            lastLogin: true,
            createdAt: true,
            crmStatus: true,
        }
    });

    return recentUsers;
}

