"use client"

import { editIngredient } from "@/actions/catalog"
import Link from "next/link"
import { useActionState } from "react"

export default function EditIngredientClient({ ingredient }: { ingredient: any }) {
  const [state, action, pending] = useActionState(editIngredient, null)

  return (
    <div className="min-h-screen bg-white p-6 max-w-md mx-auto">
      <Link href="/katalog" className="text-sm text-gray-500 font-semibold mb-6 inline-block">← Batal</Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Bahan Baku</h1>
      
      <form action={action} className="space-y-4">
        <input type="hidden" name="id" value={ingredient.id} />
        {state?.error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{state.error}</div>}
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Nama Bahan</label>
          <input name="name" type="text" defaultValue={ingredient.name} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Harga Beli</label>
            <input name="costPerUnit" type="number" step="any" defaultValue={ingredient.costPerUnit} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Per Satuan</label>
            <input name="unit" type="text" defaultValue={ingredient.unit} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Stok Saat Ini</label>
          <input name="currentStock" type="number" step="any" defaultValue={ingredient.currentStock} className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900" />
        </div>

        <button disabled={pending} type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-md mt-6 disabled:opacity-50">
          {pending ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>
    </div>
  )
}
