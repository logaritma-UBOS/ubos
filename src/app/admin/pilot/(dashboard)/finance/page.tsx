import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import RoyaltyForm from "../RoyaltyForm";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
    const session = await auth();
    const userEmail = session?.user?.email || "";
    const teamMember = await prisma.teamMember.findUnique({
      where: { email: userEmail }
    });
    
    if (!teamMember) redirect("/login");

    return (
        <div className="p-4 lg:p-8 w-full max-w-7xl mx-auto space-y-6 pb-24 lg:pb-8">
            <h2 className="text-xl font-black text-gray-900 tracking-tight mb-4">Distribusi Finansial</h2>
            
            <div id="finance" className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm shadow-blue-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 relative z-10">
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Distribusi Finansial
                </h3>
                <div className="relative z-10">
                    <RoyaltyForm />
                </div>
            </div>
        </div>
    );
}

