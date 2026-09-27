"use client"

import { useState } from "react"
import { createTicket } from "@/actions/teamOs"

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
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Kontak</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <p className="font-bold text-gray-900">{u.name || "Tanpa Nama"}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    {u.phone ? (
                      <a href={`https://wa.me/${u.phone.replace(/^0/, '62')}`} target="_blank" className="inline-flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded hover:bg-emerald-100 transition-colors">
                        WA Chat
                      </a>
                    ) : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => setSelectedUser(u)}
                      className="text-blue-600 font-semibold text-xs border border-blue-200 bg-white px-3 py-1.5 rounded-lg hover:bg-blue-50"
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
