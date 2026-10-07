"use client"
import { useState } from "react"
import ManualLeadForm from "../ManualLeadForm"
import { delegateToBana } from "@/actions/superAdminActions"
import { sendWaBana, recordFollowUp } from "@/actions/teamOs"

const TIER_CONFIG: Record<string, { label: string; color: string }> = {
  STARTER:     { label: "Starter",     color: "bg-gray-100 text-gray-600" },
  PRO_BULANAN: { label: "Pro Bulanan", color: "bg-blue-100 text-blue-700" },
  PRO_TAHUNAN: { label: "Pro Tahunan", color: "bg-purple-100 text-purple-700" },
  LIFETIME:    { label: "Lifetime",    color: "bg-amber-100 text-amber-700" },
};

export default function UsersClient({ users }: { users: any[] }) {
    const [filter, setFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDelegating, setIsDelegating] = useState(false);
    const [loadingWa, setLoadingWa] = useState<string | null>(null);

    // Auto-compute CRM Status
    const usersWithStatus = users.map(u => {
      const daysSinceLogin = u.lastLogin ? (new Date().getTime() - new Date(u.lastLogin).getTime()) / (1000 * 3600 * 24) : 999;
      let computedStatus = "PASIF";
      if (daysSinceLogin <= 7) computedStatus = "AKTIF";
      if (!u.lastLogin && (new Date().getTime() - new Date(u.createdAt).getTime()) / (1000 * 3600 * 24) <= 1) computedStatus = "NEW";
      return { ...u, computedStatus, daysSinceLogin };
    });

    const filteredUsers = usersWithStatus.filter(u => {
        const searchMatch = !search || 
          u.name.toLowerCase().includes(search.toLowerCase()) || 
          (u.email && u.email.toLowerCase().includes(search.toLowerCase())) || 
          (u.phone && u.phone.includes(search));

        if (!searchMatch) return false;

        if (filter === "STARTER") return u.tier === "STARTER";
        if (filter === "PRO") return u.tier === "PRO_BULANAN";
        if (filter === "VIP") return u.tier === "PRO_TAHUNAN" || u.tier === "LIFETIME";
        if (filter === "PASIF") return u.tier === "STARTER" && u.computedStatus === "PASIF";
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

    const handleFollowUpWA = async (user: any) => {
        if (!user.phone) return alert("User tidak memiliki nomor WA");
        
        let autoMsg = `Halo kak ,`;
        if (user.computedStatus === "PASIF") {
          autoMsg += ` kami dari UBOS melihat kakak sudah lebih dari seminggu tidak login ke sistem. Apakah ada kendala atau butuh bantuan kami?`;
        } else if (user.computedStatus === "NEW") {
          autoMsg += ` selamat datang di UBOS! Kami siap mendampingi kakak membangun ekosistem bisnis digital.`;
        } else {
          autoMsg += ` semoga harinya menyenangkan! Kami lihat kakak sangat aktif menggunakan UBOS. Jika butuh upgrade atau bantuan, kabari kami ya.`;
        }
    
        if (!confirm(`Kirim pesan via Private Engine?\n\nPesan:\n`)) return;
    
        setLoadingWa(user.id);
        const res = await sendWaBana(user.phone, autoMsg);
        if (!res?.error) {
          await recordFollowUp(user.id);
          user.followUpCount = (user.followUpCount || 0) + 1;
          alert("Pesan berhasil dikirim via Private Engine!");
        } else {
          alert("Gagal: " + res.error);
        }
        setLoadingWa(null);
    }

    const FILTERS = [
        { key: "ALL",     label: "Semua" },
        { key: "STARTER", label: "Starter" },
        { key: "PRO",     label: "Pro Bulanan" },
        { key: "VIP",     label: "Pro Tahunan / Lifetime" },
        { key: "PASIF",   label: "Starter Pasif >7 Hari" },
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex w-full md:w-auto items-center">
                    <input 
                      type="search" 
                      placeholder="Cari Nama/Email/Nomor..." 
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full md:w-64 bg-slate-50 border border-slate-200 rounded-xl px-4 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {FILTERS.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors `}
                        >
                            {f.label}
                        </button>
                    ))}
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

            <ManualLeadForm />
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3">
                                <input type="checkbox" checked={selectedIds.length === filteredUsers.length && filteredUsers.length > 0} onChange={selectAll} className="rounded text-blue-600 focus:ring-blue-500" />
                            </th>
                            <th className="px-4 py-3">User & Nama Usaha</th>
                            <th className="px-4 py-3">Paket</th>
                            <th className="px-4 py-3">Status CRM</th>
                            <th className="px-4 py-3">Login Terakhir</th>
                            <th className="px-4 py-3">Kontak & Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map(u => {
                            const tierCfg = TIER_CONFIG[u.tier] || TIER_CONFIG.STARTER;
                            return (
                                <tr key={u.id} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-3">
                                        <input type="checkbox" checked={selectedIds.includes(u.id)} onChange={() => toggleSelect(u.id)} className="rounded text-blue-600 focus:ring-blue-500" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-bold text-gray-900">{u.name || u.email}</p>
                                        <p className="text-[10px] text-gray-500">{u.businesses?.[0]?.name || "Belum ada usaha"}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md `}>
                                            {tierCfg.label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md `}>
                                            {u.crmStatus || "PASIF"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-600">
                                        {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "-"}
                                    </td>
                                    <td className="px-4 py-3">
                                        {u.phone ? (
                                            <div className="flex items-center gap-3">
                                              <a href={`https://wa.me/`} target="_blank" className="text-emerald-600 font-semibold text-xs hover:underline">
                                                  {u.phone}
                                              </a>
                                              <button 
                                                onClick={() => handleFollowUpWA(u)}
                                                disabled={loadingWa === u.id}
                                                className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold hover:bg-emerald-100 disabled:opacity-50 flex items-center gap-1 transition-colors"
                                              >
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.898-4.45 9.898-9.898 0-5.45-4.449-9.898-9.896-9.898-5.45 0-9.898 4.448-9.898 9.898 0 1.956.49 3.633 1.517 5.205l1.011 1.536-1.127 4.12 4.225-1.11.98.555zm11.751-6.195c-.482-1.206-2.42-1.875-3.08-1.875-.662 0-1.066.86-1.166 1.002-.1.14-.144.382-.424.524-.282.14-1.258.463-2.408-.56-.893-.794-1.498-1.77-1.673-2.072-.175-.3-.021-.462.115-.595.127-.123.275-.316.415-.472.138-.158.183-.267.275-.444.092-.178.046-.334-.022-.475-.068-.142-.614-1.478-.84-2.023-.222-.533-.448-.46-.614-.468-.157-.008-.337-.01-.518-.01-.183 0-.48.067-.732.34-.25.27-1.218 1.192-1.218 2.906 0 1.713 1.25 3.37 1.42 3.593.172.223 2.453 3.743 5.94 5.2 3.488 1.458 3.488.971 4.103.902.615-.069 1.98-.808 2.259-1.588.278-.779.278-1.448.194-1.588z"/></svg>
                                                {loadingWa === u.id ? "Proses..." : "Follow Up (WA Pribadi)"}
                                              </button>
                                            </div>
                                        ) : "-"}
                                    </td>
                                </tr>
                            )
                        })}
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
