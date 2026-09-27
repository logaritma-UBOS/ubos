import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import ContentClient from "./ContentClient"

export const dynamic = "force-dynamic";

export default async function ContentPage() {
    const session = await auth();
    const teamMember = await prisma.teamMember.findUnique({
        where: { email: session?.user?.email || "" }
    });

    if (!teamMember || teamMember.role !== "SUPER_ADMIN") redirect("/admin/pilot");

    const notifications = await prisma.ownerNotification.findMany({
        where: { trigger: "MANUAL" },
        distinct: ['message'],
        orderBy: { createdAt: 'desc' },
        take: 10
    });

    const feeds = await prisma.ubosFeedContent.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10
    });

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
            <div>
                <h2 className="text-2xl font-black text-gray-900">Konten & Notifikasi</h2>
                <p className="text-gray-500">Distribusi notifikasi In-App dan manajemen Banner/Feed.</p>
            </div>
            
            <ContentClient notifications={notifications} feeds={feeds} />
        </div>
    )
}
