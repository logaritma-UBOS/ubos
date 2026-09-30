
"use client";

import { useState, useEffect } from "react";
import { getRecentUserActivity } from "@/actions/activity";

export default function UserActivityLog() {
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            const data = await getRecentUserActivity();
            setRecentUsers(data);
        } catch (error) {
            console.error("Failed to fetch activity:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Polling setiap 10 detik agar realtime
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    // Format WIB
    const formatWIB = (dateStr: Date | string | null) => {
        if (!dateStr) return "-";
        return new Intl.DateTimeFormat("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "Asia/Jakarta"
        }).format(new Date(dateStr)) + " WIB";
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Update Aktivitas User
                </h3>
                <div className="flex items-center gap-1">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 tracking-wider">LIVE</span>
                </div>
            </div>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {isLoading && recentUsers.length === 0 ? (
                    <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : recentUsers.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Belum ada aktivitas user pelanggan.</p>
                ) : (
                    recentUsers.map(user => {
                        const daysSince = user.lastLogin
                            ? Math.floor((new Date().getTime() - new Date(user.lastLogin).getTime()) / (1000 * 3600 * 24))
                            : null;
                        const isNew = (new Date().getTime() - new Date(user.createdAt).getTime()) < (1000 * 3600 * 24);
                        const statusColor = isNew ? "bg-emerald-100 text-emerald-700" : daysSince !== null && daysSince <= 7 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500";
                        const statusLabel = isNew ? "BARU" : daysSince !== null && daysSince <= 7 ? "AKTIF" : "PASIF";

                        return (
                            <div key={user.id} className="relative pl-6 pb-4 border-l-2 border-gray-100 last:border-0 last:pb-0">
                                <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-white"></div>
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{user.name || "User Anonim"}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{user.email}</p>
                                        <p className="text-[10px] text-gray-400 mt-1 font-mono">
                                            {user.lastLogin
                                                ? `Login terakhir: ${formatWIB(user.lastLogin)}`
                                                : `Daftar: ${formatWIB(user.createdAt)}`
                                            }
                                        </p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${statusColor}`}>{statusLabel}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

