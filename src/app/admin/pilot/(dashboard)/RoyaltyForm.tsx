"use client"

import { useActionState } from "react"
import { distributeRoyalty } from "@/actions/teamOs"

export default function RoyaltyForm() {
  const [state, action, pending] = useActionState(distributeRoyalty, null)

  return (
    <form action={action} className="space-y-4">
      {state?.error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">{state.error}</div>}
      {state?.success && <div className="text-emerald-600 text-sm bg-emerald-50 p-3 rounded-xl">Distribusi berhasil!</div>}
      
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Input Laba Bersih Baru</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rp</span>
          <input 
            type="number" 
            name="netProfit" 
            placeholder="0"
            required
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
          />
        </div>
      </div>
      <button 
        type="submit" 
        disabled={pending}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
      >
        {pending ? "Memproses..." : "Eksekusi Distribusi (80/20)"}
      </button>
    </form>
  )
}
