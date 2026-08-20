"use client"

import { editProduct } from "@/actions/catalog"
import Link from "next/link"
import { useActionState } from "react"

export default function EditProductClient({ product }: { product: any }) {
  const [state, action, pending] = useActionState(editProduct, null)

  return (
    <div className="min-h-screen bg-white p-6 max-w-md mx-auto">
      <Link href="/katalog" className="text-sm text-gray-500 font-semibold mb-6 inline-block">← Batal</Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Produk</h1>
      
      <form action={action} className="space-y-4">
        <input type="hidden" name="id" value={product.id} />
        {state?.error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{state.error}</div>}
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Nama Produk</label>
          <input name="name" type="text" defaultValue={product.name} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Harga Jual</label>
          <input name="sellPrice" type="number" step="any" defaultValue={product.sellPrice} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900" />
        </div>

        <button disabled={pending} type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-md mt-6 disabled:opacity-50">
          {pending ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>
    </div>
  )
}
