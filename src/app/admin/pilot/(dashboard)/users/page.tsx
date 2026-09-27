import { prisma } from "@/lib/prisma"
import UsersClient from "./UsersClient"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic";

export default async function UsersPage() {
    const session = await auth();
    const teamMember = await prisma.teamMember.findUnique({
        where: { email: session?.user?.email || "" }
    });

    if (!teamMember || teamMember.role !== "SUPER_ADMIN") redirect("/admin/pilot");

    const users = await prisma.user.findMany({
        include: {
            businesses: true
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-black text-gray-900">Manajemen User (CRM)</h2>
                <p className="text-gray-500">Filter, pantau, dan delegasikan eksekusi harian ke tim Operations.</p>
            </div>
            
            <UsersClient users={users} />
        </div>
    )
}
