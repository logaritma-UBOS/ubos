import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SupportAdminClient from "./SupportAdminClient";
import { getAdminInbox } from "@/actions/chat";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
    const session = await auth();
    const userEmail = session?.user?.email || "";
    const teamMember = await prisma.teamMember.findUnique({
      where: { email: userEmail }
    });
    
    if (!teamMember) redirect("/login");

    const inboxData = await getAdminInbox();

    return (
        <div className="p-4 lg:p-8 w-full max-w-7xl mx-auto pb-24 lg:pb-8">
            <div className="max-w-3xl mb-8">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Inbox Support (Live Chat)</h2>
                <p className="text-gray-500 mt-1">Balas keluhan atau pertanyaan dari pengguna UBOS secara real-time.</p>
            </div>
            
            <SupportAdminClient inboxData={inboxData} />
        </div>
    );
}

