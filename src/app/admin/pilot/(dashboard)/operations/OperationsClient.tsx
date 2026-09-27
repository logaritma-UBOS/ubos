"use client"

import { useState } from "react"
import { createTicket } from "@/actions/teamOs"
import { updateCrmStatus } from "@/actions/crmActions"

export default function OperationsClient({ users }: { users: any[] }) {
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [notes, setNotes] = useState("")
  const [isTechBug, setIsTechBug] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleStatusChange = async (userId: string, newStatus: string) => {
    await updateCrmStatus(userId, newStatus);
  }

  return (
    <div className="space-y-6">
      {/* Create Ticket Form */}
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

      {/* Mini CRM Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Database User</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Status CRM</th>
                <th className="px-4 py-3">Kontak WA</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <p className="font-bold text-gray-900">{u.name || "Tanpa Nama"}</p>
                    <p className="text-[10px] text-gray-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <select 
                      defaultValue={u.crmStatus || "PASIF"} 
                      onChange={(e) => handleStatusChange(u.id, e.target.value)}
                      className={`text-xs font-bold rounded px-2 py-1 outline-none cursor-pointer border ${u.crmStatus === 'AKTIF' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : u.crmStatus === 'TERKENDALA' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
                    >
                      <option value="PASIF">Pasif</option>
                      <option value="AKTIF">Aktif</option>
                      <option value="TERKENDALA">Terkendala</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {u.phone ? (
                      <a href={`https://wa.me/${u.phone.replace(/^0/, '62')}`} target="_blank" className="inline-flex items-center gap-1.5 text-[10px] text-white font-bold bg-emerald-500 px-3 py-1.5 rounded-lg shadow-sm hover:bg-emerald-600 transition-colors tracking-wide uppercase">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Chat WA
                      </a>
                    ) : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => setSelectedUser(u)}
                      className="text-blue-600 font-semibold text-[10px] uppercase border border-blue-200 bg-white px-3 py-1.5 rounded-lg hover:bg-blue-50"
                    >
                      Buat Tiket
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
