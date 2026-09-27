"use client"
import { useState } from "react"
import { delegateToBana } from "@/actions/superAdminActions"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"

export default function UsersClient({ users }: { users: any[] }) {
    const [filter, setFilter] = useState("ALL");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDelegating, setIsDelegating] = useState(false);

    // Filters: [Semua] | [VIP Aktif] | [Free Aktif] | [Free Pasif >7 Hari]
    const filteredUsers = users.filter(u => {
        const isVIP = u.role === "VIP" || u.role === "PREMIUM";
        const isFree = u.role === "OWNER" || u.role === "FREE";
        
        const daysSinceLogin = (new Date().getTime() - new Date(u.lastLogin).getTime()) / (1000 * 3600 * 24);

        if (filter === "VIP_AKTIF") return isVIP && u.crmStatus === "AKTIF";
        if (filter === "FREE_AKTIF") return isFree && u.crmStatus === "AKTIF";
        if (filter === "FREE_PASIF") return isFree && (u.crmStatus === "PASIF" || daysSinceLogin > 7);
        return true;
    });

    const toggleSelect = (userId: string) => {
        if (selectedIds.includes(userId)) setSelectedIds(selectedIds.filter(id => id !== userId));
        else setSelectedIds([...selectedIds, userId]);
    }

    const selectAll = () => {
        if (selectedIds.length === filteredUsers.length) setSelectedIds([]);
        else setSelectedIds(filteredUsers.map(u => u.id));
    }

    const handleDelegate = async () => {
        if (selectedIds.length === 0) return;
        setIsDelegating(true);
        await delegateToBana(selectedIds);
        setIsDelegating(false);
        setSelectedIds([]);
        alert("Berhasil didelegasikan ke Bana!");
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex gap-2">
                    <button onClick={() => setFilter("ALL")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${filter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>Semua</button>
                    <button onClick={() => setFilter("VIP_AKTIF")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${filter === 'VIP_AKTIF' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>VIP Aktif</button>
                    <button onClick={() => setFilter("FREE_AKTIF")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${filter === 'FREE_AKTIF' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>Free Aktif</button>
                    <button onClick={() => setFilter("FREE_PASIF")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${filter === 'FREE_PASIF' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>Free Pasif {'>'}7 Hari</button>
                </div>
                
                {selectedIds.length > 0 && (
                    <button 
                        onClick={handleDelegate}
                        disabled={isDelegating}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        Delegasikan ke Bana ({selectedIds.length})
                    </button>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3">
                                <input type="checkbox" checked={selectedIds.length === filteredUsers.length && filteredUsers.length > 0} onChange={selectAll} className="rounded text-blue-600 focus:ring-blue-500" />
                            </th>
                            <th className="px-4 py-3">User & Nama Usaha</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Login Terakhir</th>
                            <th className="px-4 py-3">Kontak</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50/50">
                                <td className="px-4 py-3">
                                    <input type="checkbox" checked={selectedIds.includes(u.id)} onChange={() => toggleSelect(u.id)} className="rounded text-blue-600 focus:ring-blue-500" />
                                </td>
                                <td className="px-4 py-3">
                                    <p className="font-bold text-gray-900">{u.name || u.email}</p>
                                    <p className="text-[10px] text-gray-500">{u.businesses?.[0]?.name || "Belum ada usaha"}</p>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${u.role === 'VIP' || u.role === 'PREMIUM' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {u.role === 'VIP' || u.role === 'PREMIUM' ? 'VIP' : 'FREE'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${u.crmStatus === 'AKTIF' ? 'bg-emerald-100 text-emerald-700' : u.crmStatus === 'TERKENDALA' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {u.crmStatus}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-600">
                                    {formatDistanceToNow(new Date(u.lastLogin), { addSuffix: true, locale: id })}
                                </td>
                                <td className="px-4 py-3">
                                    {u.phone ? (
                                        <a href={`https://wa.me/${u.phone.replace(/^0/, '62')}`} target="_blank" className="text-emerald-600 font-semibold text-xs hover:underline">
                                            {u.phone}
                                        </a>
                                    ) : "-"}
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">Tidak ada data user.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
