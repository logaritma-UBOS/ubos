
"use client"

import { useState } from "react"
import { updateTicketStatus } from "@/actions/teamOs"

export default function DeveloperClient({ tickets }: { tickets: any[] }) {
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const handleUpdateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    await updateTicketStatus(id, status);
    setUpdatingId(null);
  }

  const columns = [
    { id: "OPEN", title: "To Do (Baru)", color: "border-red-200 bg-red-50 text-red-700", badge: "bg-red-500" },
    { id: "IN_PROGRESS", title: "In Progress", color: "border-blue-200 bg-blue-50 text-blue-700", badge: "bg-blue-500" },
    { id: "TESTING", title: "Testing", color: "border-purple-200 bg-purple-50 text-purple-700", badge: "bg-purple-500" },
    { id: "RESOLVED", title: "Done", color: "border-emerald-200 bg-emerald-50 text-emerald-700", badge: "bg-emerald-500" }
  ];

  return (
    <div className="w-full pb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Ticket Board / Bug Tracker</h3>
          <p className="text-sm text-slate-500">Kelola dan pantau laporan kendala dari operasional (Bana).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-x-auto">
        {columns.map(col => {
          const colTickets = tickets.filter(t => t.status === col.id || (!t.status && col.id === "OPEN"));
          
          return (
            <div key={col.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col min-h-[500px]">
              <div className="flex justify-between items-center mb-4">
                <h4 className={`font-bold text-sm px-3 py-1.5 rounded-lg border ${col.color}`}>
                  {col.title}
                </h4>
                <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2.5 py-1 rounded-full">
                  {colTickets.length}
                </span>
              </div>

              <div className="flex-1 space-y-3">
                {colTickets.map(t => (
                  <div key={t.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow relative group">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${col.badge}`}></span>
                      DARI: {t.source?.name || "Sistem"}
                    </p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap font-medium">{t.notes}</p>
                    
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5 justify-end opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      {col.id !== "OPEN" && (
                        <button 
                          onClick={() => handleUpdateStatus(t.id, columns[columns.findIndex(c => c.id === col.id) - 1].id)}
                          disabled={updatingId === t.id}
                          className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold hover:bg-slate-200 disabled:opacity-50"
                        >
                          &larr; Mundur
                        </button>
                      )}
                      {col.id !== "RESOLVED" && (
                        <button 
                          onClick={() => handleUpdateStatus(t.id, columns[columns.findIndex(c => c.id === col.id) + 1].id)}
                          disabled={updatingId === t.id}
                          className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-50"
                        >
                          Lanjut &rarr;
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {colTickets.length === 0 && (
                  <div className="h-full flex items-center justify-center">
                    <span className="text-sm text-slate-400 italic">Kosong</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

