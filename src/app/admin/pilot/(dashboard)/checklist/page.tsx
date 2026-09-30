
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ChecklistHarian from "@/components/team/ChecklistHarian";
import SaldoWidget from "@/components/team/SaldoWidget";

export default async function BaimChecklistPage() {
    const session = await auth();
    if (!session?.user?.email) redirect("/admin/pilot/login");

    const teamMember = await prisma.teamMember.findUnique({
        where: { email: session.user.email },
        include: {
            tasks: {
                where: {
                    date: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        lt: new Date(new Date().setHours(23, 59, 59, 999))
                    }
                },
                orderBy: { id: "asc" }
            },
            ledgers: {
                orderBy: { createdAt: "desc" },
                take: 3
            }
        }
    });

    if (!teamMember) redirect("/admin/pilot/login");

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <svg className="w-32 h-32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="relative z-10">
                    <p className="text-emerald-400 font-bold tracking-wider text-sm mb-2 uppercase">Kinerja Eksekutif</p>
                    <h1 className="text-3xl md:text-4xl font-black mb-2">Checklist Harian</h1>
                    <p className="text-slate-300 max-w-lg leading-relaxed">
                        Pantau dan selesaikan tugas pemantauan harian Anda sebagai Control Tower.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <ChecklistHarian teamMemberId={teamMember.id} tasks={teamMember.tasks} />
                </div>
                <div className="space-y-6">
                    <SaldoWidget teamMember={teamMember} balance={teamMember.walletBalance} totalEarned={teamMember.totalEarned} ledgers={teamMember.ledgers} />
                </div>
            </div>
        </div>
    );
}

