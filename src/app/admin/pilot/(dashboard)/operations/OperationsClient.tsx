"use client"

import { useState } from "react"
import { recordFollowUp } from "@/actions/teamOs"
import { createTicket, sendWaBana } from "@/actions/teamOs"

export default function OperationsClient({ users }: { users: any[] }) {
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [notes, setNotes] = useState("")
  const [isTechBug, setIsTechBug] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Search
  const [search, setSearch] = useState("");
  const [loadingWa, setLoadingWa] = useState<string | null>(null);

  const usersWithStatus = users.map(u => {
    const daysSinceLogin = u.lastLogin ? (new Date().getTime() - new Date(u.lastLogin).getTime()) / (1000 * 3600 * 24) : 999;
    let computedStatus = "PASIF";
    if (daysSinceLogin <= 7) computedStatus = "AKTIF";
    if (!u.lastLogin && (new Date().getTime() - new Date(u.createdAt).getTime()) / (1000 * 3600 * 24) <= 1) computedStatus = "NEW";
    return { ...u, computedStatus, daysSinceLogin };
  });

  const filteredUsers = usersWithStatus.filter(u => {
    if (!search) return true;
    return (u.name && u.name.toLowerCase().includes(search.toLowerCase())) || 
           (u.email && u.email.toLowerCase().includes(search.toLowerCase())) || 
           (u.phone && u.phone.includes(search));
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("notes", notes);
    formData.append("isTechBug", isTechBug.toString());
    if (selectedUser) formData.append("userId", selectedUser.id);
    
    await createTicket(formData);
    
    setIsSubmitting(false);
    setNotes("");
    setIsTechBug(false);
    setSelectedUser(null);
    alert("Tiket berhasil disimpan!");
  }

  const handleFollowUpWA = async (user: any) => {
    if (!user.phone) return alert("User tidak memiliki nomor WA");
    
    let autoMsg = `Halo kak ${user.name || 'Pebisnis'},`;
    if (user.computedStatus === "PASIF") {
      autoMsg += ` kami dari UBOS melihat kakak sudah lebih dari seminggu tidak login ke sistem. Apakah ada kendala atau butuh bantuan kami?`;
    } else if (user.computedStatus === "NEW") {
      autoMsg += ` selamat datang di UBOS! Kami siap mendampingi kakak membangun ekosistem bisnis digital.`;
    } else {
      autoMsg += ` semoga harinya menyenangkan! Kami lihat kakak sangat aktif menggunakan UBOS. Jika butuh upgrade atau bantuan, kabari kami ya.`;
    }

    if (!confirm(`Kirim pesan via Private Engine?\n\nPesan:\n${autoMsg}`)) return;

    setLoadingWa(user.id);
    const res = await sendWaBana(user.phone, autoMsg);
    if (!res?.error) {
      await recordFollowUp(user.id);
      user.followUpCount = (user.followUpCount || 0) + 1;
    }
    setLoadingWa(null);

    if (res?.error) alert(res.error);
    else alert("Berhasil di-Follow Up via Private Engine!");
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">Buat Catatan / Tiket Kendala</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {selectedUser && (
            <div className="bg-blue-50 p-3 rounded-xl flex justify-between items-center">
              <div>
                <p className="text-xs text-blue-600 font-bold uppercase">Terhubung dengan:</p>
                <p className="text-sm font-semibold">{selectedUser.name || selectedUser.email}</p>
              </div>
              <button type="button" onClick={() => setSelectedUser(null)} className="text-blue-400 hover:text-blue-600">&times;</button>
            </div>
          )}
          
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            required
            placeholder="Tulis catatan interaksi atau kendala user..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 text-sm h-32"
          ></textarea>

          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={isTechBug} 
              onChange={(e) => setIsTechBug(e.target.checked)}
              className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
            />
            <span className="text-sm font-bold text-red-500">Tandai sebagai Bug Teknis (Kirim ke Reza)</span>
          </label>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Tiket"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="font-bold text-gray-900">List Follow Up User Starter</h3>
          <input 
            type="search" 
            placeholder="Cari Nama/Email/Nomor..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full md:w-64 bg-slate-50 border border-slate-200 rounded-xl px-4 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
          />
        </div>
        
      <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Nama Lead</th>
                <th className="px-4 py-3">Status CRM</th>
                <th className="px-4 py-3 text-center">Tanda Follow Up</th>
                <th className="px-4 py-3">Kontak WA</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <p className="font-bold text-gray-900">{u.name || "Tanpa Nama"}</p>
                    <p className="text-[10px] text-gray-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${u.computedStatus === 'AKTIF' ? 'bg-emerald-100 text-emerald-700' : u.computedStatus === 'NEW' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                      {u.computedStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black ${u.followUpCount >= 3 ? "bg-emerald-100 text-emerald-700" : u.followUpCount === 2 ? "bg-blue-100 text-blue-700" : u.followUpCount === 1 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"}`}>
                      FU {u.followUpCount || 0} / 3
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-700">
                    {u.phone || "-"}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button 
                      onClick={() => setSelectedUser(u)}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100"
                    >
                      Pilih (Kendala)
                    </button>
                    <button 
                      onClick={() => handleFollowUpWA(u)}
                      disabled={loadingWa === u.id || !u.phone}
                      className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 disabled:opacity-50 flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.898-4.45 9.898-9.898 0-5.45-4.449-9.898-9.896-9.898-5.45 0-9.898 4.448-9.898 9.898 0 1.956.49 3.633 1.517 5.205l1.011 1.536-1.127 4.12 4.225-1.11.98.555zm11.751-6.195c-.482-1.206-2.42-1.875-3.08-1.875-.662 0-1.066.86-1.166 1.002-.1.14-.144.382-.424.524-.282.14-1.258.463-2.408-.56-.893-.794-1.498-1.77-1.673-2.072-.175-.3-.021-.462.115-.595.127-.123.275-.316.415-.472.138-.158.183-.267.275-.444.092-.178.046-.334-.022-.475-.068-.142-.614-1.478-.84-2.023-.222-.533-.448-.46-.614-.468-.157-.008-.337-.01-.518-.01-.183 0-.48.067-.732.34-.25.27-1.218 1.192-1.218 2.906 0 1.713 1.25 3.37 1.42 3.593.172.223 2.453 3.743 5.94 5.2 3.488 1.458 3.488.971 4.103.902.615-.069 1.98-.808 2.259-1.588.278-.779.278-1.448.194-1.588z"/></svg>
                      {loadingWa === u.id ? "Memproses..." : "Follow-Up (Engine)"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="text-center p-8 text-gray-500 font-medium">Tidak ada user ditemukan.</div>
          )}
        </div>
      </div>
    </div>
  )
}



