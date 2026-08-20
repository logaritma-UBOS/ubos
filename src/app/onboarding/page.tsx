"use client"

import { createBusiness } from "@/actions/business"
import { useActionState } from "react"

export default function OnboardingPage() {
  const [state, action, pending] = useActionState(createBusiness, null)

  return (
    <div className="min-h-screen bg-white flex flex-col p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Setup Bisnis Anda</h1>
      <form action={action} className="space-y-4">
        
        {state?.error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
            {state.error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Nama Usaha</label>
          <input name="name" type="text" required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Jenis Usaha</label>
          <select name="businessType" className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900">
            <option value="F&B">F&B (Makanan/Minuman)</option>
            <option value="RETAIL">Toko/Retail</option>
            <option value="JASA">Jasa</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Hari Buka (per minggu)</label>
          <input name="operatingDays" type="number" min="1" max="7" defaultValue="7" required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Target Omzet (Per Bulan)</label>
          <input name="targetOmzet" type="number" required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900" />
        </div>
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm font-semibold mb-2 text-gray-900">Produk Pertama Anda</p>
          <label className="block text-sm font-medium text-gray-700">Nama Produk</label>
          <input name="productName" type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2 mb-2 text-gray-900" />
          <label className="block text-sm font-medium text-gray-700">Harga Jual</label>
          <input name="sellPrice" type="number" className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900" />
        </div>
        <button disabled={pending} type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-md mt-6 disabled:opacity-50">
          {pending ? "Menyimpan..." : "Selesai & Mulai"}
        </button>
      </form>
    </div>
  )
}
