"use client"

import { useState } from "react"
import { approveFundRequest, rejectFundRequest } from "@/actions/teamOs"

export default function FundRequestClient({ requests }: { requests: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleApprove = async (id: string) => {
    if (!confirm("Setujui pencairan dana ini?")) return;
    setLoadingId(id);
    const res = await approveFundRequest(id);
    setLoadingId(null);
    if (res?.error) alert(res.error);
    else alert("Berhasil disetujui!");
  }

  const handleReject = async (id: string) => {
    if (!confirm("Tolak pengajuan dana ini?")) return;
    setLoadingId(id);
    const res = await rejectFundRequest(id);
    setLoadingId(null);
    if (res?.error) alert(res.error);
    else alert("Berhasil ditolak.");
  }

  return (
    <div className="space-y-4">
      {requests.length === 0 ? (
        <div className="text-center text-gray-500 py-10 bg-white rounded-2xl border border-gray-100 shadow-sm">
          Tidak ada proposal pengajuan dana saat ini.
        </div>
      ) : (
        requests.map(req => (
          <div key={req.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-sm text-gray-500 font-semibold mb-1">{new Date(req.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <h4 className="font-bold text-gray-900 text-lg">{req.reason}</h4>
              <p className="font-black text-blue-600 text-xl mt-1">Rp {req.amount.toLocaleString("id-ID")}</p>
            </div>
            
            {req.status === "PENDING" ? (
              <div className="flex gap-3">
                <button 
                  onClick={() => handleReject(req.id)}
                  disabled={loadingId === req.id}
                  className="px-4 py-2 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 disabled:opacity-50"
                >
                  Tolak
                </button>
                <button 
                  onClick={() => handleApprove(req.id)}
                  disabled={loadingId === req.id}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 shadow-md shadow-emerald-200"
                >
                  {loadingId === req.id ? 'Memproses...' : 'Setujui'}
                </button>
              </div>
            ) : (
              <div className={`px-4 py-2 rounded-xl font-bold text-sm ${req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {req.status === 'APPROVED' ? 'Telah Disetujui' : 'Ditolak'}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
