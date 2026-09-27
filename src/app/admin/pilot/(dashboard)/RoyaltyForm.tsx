"use client"

import { useActionState, useState } from "react"
import { distributeRoyalty } from "@/actions/teamOs"
import { formatRupiah } from "@/lib/format"

export default function RoyaltyForm() {
  const [state, action, pending] = useActionState(distributeRoyalty, null)
  const [amount, setAmount] = useState<number>(0)

  return (
    <form action={action} className="space-y-4">
      {state?.error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">{state.error}</div>}
      {state?.success && <div className="text-emerald-600 text-sm bg-emerald-50 p-3 rounded-xl">Distribusi berhasil!</div>}
      
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Input Omset Bersih (Net Profit)</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rp</span>
          <input 
            type="number" 
            name="netProfit" 
            placeholder="0"
            required
            value={amount || ""}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
          />
        </div>
      </div>

      {amount > 0 && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Preview Distribusi</p>
              <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Kas Cadangan (20%)</span>
                  <span>{formatRupiah(amount * 0.2)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Baim (40% dari sisa)</span>
                  <span className="text-blue-600">{formatRupiah(amount * 0.8 * 0.4)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Tony (25% dari sisa)</span>
                  <span className="text-purple-600">{formatRupiah(amount * 0.8 * 0.25)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Reza (20% dari sisa)</span>
                  <span className="text-amber-600">{formatRupiah(amount * 0.8 * 0.2)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Bana (15% dari sisa)</span>
                  <span className="text-emerald-600">{formatRupiah(amount * 0.8 * 0.15)}</span>
              </div>
          </div>
      )}

      <button 
        type="submit" 
        disabled={pending || amount <= 0}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
      >
        {pending ? "Memproses..." : "Konfirmasi Distribusi Finansial"}
      </button>
    </form>
  )
}
