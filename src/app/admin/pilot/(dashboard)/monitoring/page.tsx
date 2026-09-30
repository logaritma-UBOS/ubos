import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ControlTowerForms from "../ControlTowerForms";

export const dynamic = "force-dynamic";

export default async function MonitoringPage() {
    const session = await auth();
    const userEmail = session?.user?.email || "";
    const teamMember = await prisma.teamMember.findUnique({
      where: { email: userEmail }
    });
    
    if (!teamMember) redirect("/login");

    const members = await prisma.teamMember.findMany({
        include: {
            tasks: {
                where: {
                    date: {
                        gte: new Date(new Date().setHours(0,0,0,0)),
                        lt: new Date(new Date().setHours(23,59,59,999))
                    }
                }
            }
        }
    });

    return (
        <div className="p-4 lg:p-8 w-full max-w-7xl mx-auto space-y-6 pb-24 lg:pb-8">
            <h2 className="text-xl font-black text-gray-900 tracking-tight mb-4">Monitoring Tim & Delegasi</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div id="monitoring" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> Status Eksekusi Tim Hari Ini
                    </h3>
                    <div className="space-y-4">
                        {members.filter(m => m.role !== "SUPER_ADMIN").map(m => {
                            const completed = m.tasks.filter(t => t.isCompleted).length;
                            const total = m.tasks.length;
                            const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
                            
                            return (
                                <div key={m.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                                    <div className="flex justify-between items-center mb-3">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{m.name}</p>
                                            <p className="text-[10px] text-gray-500 uppercase font-semibold">{m.role}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-gray-700">{completed} / {total} Selesai</p>
                                        </div>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${pct === 100 ? "bg-emerald-500" : pct > 0 ? "bg-blue-500" : "bg-gray-300"}`} style={{ width: `${pct}%` }}></div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm shadow-blue-50 relative overflow-hidden">
                        <ControlTowerForms members={members} />
                    </div>
                </div>
            </div>
        </div>
    );
}

