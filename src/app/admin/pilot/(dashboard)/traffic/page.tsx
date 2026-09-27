import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic";

export default async function TrafficPage() {
    const session = await auth();
    const teamMember = await prisma.teamMember.findUnique({
        where: { email: session?.user?.email || "" }
    });

    if (!teamMember || teamMember.role !== "SUPER_ADMIN") redirect("/admin/pilot");

    const todayStart = new Date(new Date().setHours(0,0,0,0));

    // Pageviews
    const pageviews = await prisma.visitorAnalytics.count({
        where: { createdAt: { gte: todayStart } }
    });

    // Unique Visitors
    // Prisma SQLite doesn't support distinct count easily with groupBy without workarounds, 
    // we fetch them and count distinct userAgents + IPs (or just paths if we don't have IP).
    const visitors = await prisma.visitorAnalytics.findMany({
        where: { createdAt: { gte: todayStart } },
        select: { userAgent: true }
    });
    const uniqueVisitors = new Set(visitors.map(v => v.userAgent)).size;

    // Referrals
    const refs = await prisma.visitorAnalytics.findMany({
        where: { createdAt: { gte: todayStart } },
        select: { referrer: true }
    });
    
    let tiktok = 0;
    let ig = 0;
    let direct = 0;

    refs.forEach(r => {
        const ref = (r.referrer || "").toLowerCase();
        if (ref.includes("tiktok")) tiktok++;
        else if (ref.includes("instagram") || ref.includes("ig")) ig++;
        else direct++;
    });

    // New Users today
    const newUsers = await prisma.user.count({
        where: { createdAt: { gte: todayStart } }
    });

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
            <div>
                <h2 className="text-2xl font-black text-gray-900">Traffic Tracker</h2>
                <p className="text-gray-500">Metrik kunjungan dan pendaftaran hari ini secara real-time.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-wider mb-2">Pageviews Hari Ini</p>
                    <p className="text-3xl font-black text-gray-900 tabular-nums">{pageviews}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-wider mb-2">Unique Visitors</p>
                    <p className="text-3xl font-black text-gray-900 tabular-nums">{uniqueVisitors}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-purple-500 uppercase tracking-wider mb-2">Registrasi Baru</p>
                    <p className="text-3xl font-black text-gray-900 tabular-nums">{newUsers}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-wider mb-2">Konversi Harian</p>
                    <p className="text-3xl font-black text-gray-900 tabular-nums">{uniqueVisitors > 0 ? Math.round((newUsers / uniqueVisitors) * 100) : 0}%</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm max-w-xl">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Sumber Traffic (Referral)
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-black"></span> TikTok
                        </span>
                        <span className="text-sm font-bold">{tiktok}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-black h-1.5 rounded-full" style={{ width: `${pageviews > 0 ? (tiktok / pageviews) * 100 : 0}%` }}></div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></span> Instagram
                        </span>
                        <span className="text-sm font-bold">{ig}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full" style={{ width: `${pageviews > 0 ? (ig / pageviews) * 100 : 0}%` }}></div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-gray-400"></span> Direct / Lainnya
                        </span>
                        <span className="text-sm font-bold">{direct}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-gray-400 h-1.5 rounded-full" style={{ width: `${pageviews > 0 ? (direct / pageviews) * 100 : 0}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
