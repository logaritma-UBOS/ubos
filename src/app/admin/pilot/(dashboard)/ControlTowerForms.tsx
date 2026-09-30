"use client"

import { useState } from "react"
import { delegateTask, createFundRequest } from "@/actions/teamOs"

export default function ControlTowerForms({ members }: { members: any[] }) {
  const [delegationLoading, setDelegationLoading] = useState(false);
  const [fundLoading, setFundLoading] = useState(false);

  const handleDelegation = async (e: any) => {
    e.preventDefault();
    setDelegationLoading(true);
    const fd = new FormData(e.target);
    const res = await delegateTask(fd);
    setDelegationLoading(false);
    if (res?.error) alert(res.error);
    else {
      alert("Tugas berhasil didelegasikan!");
      e.target.reset();
    }
  }

  const handleFundRequest = async (e: any) => {
    e.preventDefault();
    setFundLoading(true);
    const fd = new FormData(e.target);
    const res = await createFundRequest(fd);
    setFundLoading(false);
    if (res?.error) alert(res.error);
    else {
      alert("Pengajuan dana terkirim ke Investor!");
      e.target.reset();
    }
  }

  const actionableMembers = members.filter(m => m.role === "OPERATIONS" || m.role === "DEVELOPER");

  return (
    <div className="space-y-6">
      {/* Delegasi Tugas */}
      <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          Delegasi Tugas Cepat
        </h3>
        <form onSubmit={handleDelegation} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Pilih Tim</label>
            <select name="assignedToId" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">-- Pilih Eksekutor --</option>
              {actionableMembers.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Instruksi Tugas</label>
            <input type="text" name="taskName" required placeholder="Contoh: Follow up 10 user pasif / Fix bug login" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <button type="submit" disabled={delegationLoading} className="w-full bg-blue-600 text-white rounded-xl py-2 font-bold hover:bg-blue-700 disabled:opacity-50">
            {delegationLoading ? 'Mengirim...' : 'Delegasikan Sekarang'}
          </button>
        </form>
      </div>

      {/* Pengajuan Dana */}
      <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Pengajuan Modal / Support
        </h3>
        <form onSubmit={handleFundRequest} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Nominal (Rp)</label>
            <input type="number" name="amount" required min="1" placeholder="Misal: 500000" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Alasan Pengajuan</label>
            <input type="text" name="reason" required placeholder="Contoh: Perpanjang server bulan ini" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <button type="submit" disabled={fundLoading} className="w-full bg-emerald-600 text-white rounded-xl py-2 font-bold hover:bg-emerald-700 disabled:opacity-50">
            {fundLoading ? 'Mengirim Proposal...' : 'Ajukan ke Investor'}
          </button>
        </form>
      </div>
    </div>
  );
}
