import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import IdeasClient from "./IdeasClient";

export const dynamic = "force-dynamic";

export default async function IdeasPage() {
    const session = await auth();
    const userEmail = session?.user?.email || "";
    const teamMember = await prisma.teamMember.findUnique({
      where: { email: userEmail }
    });
    
    if (!teamMember) redirect("/login");

    const ideas = await prisma.teamIdea.findMany({
        orderBy: { createdAt: "desc" },
        include: { 
            author: true,
            comments: {
                include: { author: true },
                orderBy: { createdAt: "asc" }
            }
        }
    });

    return (
        <div className="p-4 lg:p-8 w-full max-w-7xl mx-auto pb-24 lg:pb-8">
            <div className="w-full mb-6">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Linimasa Tim</h2>
                <p className="text-gray-500 mt-1">Sampaikan gagasan, laporan cepat, atau ide brilian ke seluruh anggota tim UBOS.</p>
            </div>
            
            <IdeasClient authorId={teamMember.id} ideas={ideas} teamMember={teamMember} />
        </div>
    );
}
