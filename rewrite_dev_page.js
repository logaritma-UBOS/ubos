const fs = require('fs');

const pageCode = `import React from 'react';
import { fastDb } from '@/lib/fast-lane';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DeveloperPage() {
    let onlineUsers = [];
    try {
        const res = await fastDb.execute(\`
            SELECT * FROM _FastOnlineUsers 
            WHERE lastActive >= datetime('now', '-5 minutes')
            ORDER BY lastActive DESC
        \`);
        onlineUsers = res.rows;
    } catch (e) {
        console.error("Gagal baca FastLane:", e);
    }
    
    let totalVisitors = 0;
    try {
        const res = await fastDb.execute(\`SELECT COUNT(*) as count FROM VisitorAnalytics\`);
        totalVisitors = res.rows[0].count;
    } catch (e) {}

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl p-8 text-white">
                <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
                    \uD83D\uDEE1\uFE0F Developer Command Center
                </h1>
                <p className="text-slate-400">
                    Jalur Cepat (Fast Lane) untuk memantau aktivitas server, koneksi WA, dan status Online secara Real-Time tanpa membebani Database Utama (Prisma).
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                            Live Online Users
                        </h2>
                        <span className="text-sm bg-gray-100 px-3 py-1 rounded-full font-semibold">{onlineUsers.length} Aktif</span>
                    </div>
                    
                    {onlineUsers.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">Belum ada user yang terdeteksi aktif dalam 5 menit terakhir.</div>
                    ) : (
                        <ul className="space-y-4">
                            {onlineUsers.map((u: any, idx) => (
                                <li key={idx} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                            {String(u.name).charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-800">{u.name}</p>
                                            <p className="text-xs text-gray-500">{u.email} • {u.role}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-green-600">Online</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">\u26A1 Fast Lane Analytics</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-500 font-bold mb-1">Total Hits Pengunjung</p>
                                <p className="text-2xl font-black text-gray-800">{totalVisitors.toLocaleString()}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-500 font-bold mb-1">DB Connection</p>
                                <p className="text-2xl font-black text-green-500">Turso Edge</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">\uD83D\uDEE0\uFE0F System Tools</h2>
                        <div className="flex flex-col gap-3">
                            <Link href="/api/cron/wa-alerts?type=morning&secret=ubos123" target="_blank" className="bg-gray-50 hover:bg-gray-100 border border-gray-200 p-3 rounded-xl text-sm font-bold flex justify-between items-center transition-colors">
                                Trigger Pagi (Manual)
                                <span>\uD83D\uDE80</span>
                            </Link>
                            <Link href="/api/cron/wa-alerts?type=afternoon&secret=ubos123" target="_blank" className="bg-gray-50 hover:bg-gray-100 border border-gray-200 p-3 rounded-xl text-sm font-bold flex justify-between items-center transition-colors">
                                Trigger Sore (Manual)
                                <span>\uD83D\uDE80</span>
                            </Link>
                            <Link href="/api/cron/wa-alerts?type=night&secret=ubos123" target="_blank" className="bg-gray-50 hover:bg-gray-100 border border-gray-200 p-3 rounded-xl text-sm font-bold flex justify-between items-center transition-colors">
                                Trigger Malam (Manual)
                                <span>\uD83D\uDE80</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
`;

fs.writeFileSync('src/app/admin/pilot/(dashboard)/developer/page.tsx', pageCode, 'utf8');
console.log("Rewrote Developer page with safe UTF-8 unicode escapes");
