"use client"

import { useState } from "react"
import { resolveTicket } from "@/actions/teamOs"

export default function DeveloperClient({ tickets }: { tickets: any[] }) {
  const [resolvingId, setResolvingId] = useState<string | null>(null)

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    await resolveTicket(id);
    setResolvingId(null);
  }

  const openTickets = tickets.filter(t => t.status !== "RESOLVED");
  const resolvedTickets = tickets.filter(t => t.status === "RESOLVED");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500"></span> 
          Antrean Bug ({openTickets.length})
        </h3>
        {openTickets.map(t => (
          <div key={t.id} className="bg-red-50 border border-red-100 p-4 rounded-xl">
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{t.notes}</p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-[10px] font-bold text-red-400 uppercase">{new Date(t.createdAt).toLocaleDateString("id-ID")}</span>
              <button 
                onClick={() => handleResolve(t.id)}
                disabled={resolvingId === t.id}
                className="bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
              >
                {resolvingId === t.id ? "Memproses..." : "Tandai Selesai"}
              </button>
            </div>
          </div>
        ))}
        {openTickets.length === 0 && (
          <div className="text-center p-8 text-gray-400 text-sm">Tidak ada bug di antrean.</div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 opacity-75">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 
          Diselesaikan ({resolvedTickets.length})
        </h3>
        {resolvedTickets.map(t => (
          <div key={t.id} className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
            <p className="text-sm text-gray-600 line-through whitespace-pre-wrap">{t.notes}</p>
            <div className="mt-3">
              <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-100 px-2 py-1 rounded">Resolved</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
