"use client"
import { FormattedNumberInput } from '@/components/FormattedNumberInput'

import { addProduct } from "@/actions/catalog"
import Link from "next/link"
import Image from "next/image"
import { useActionState, useState } from "react"

export default function TambahProdukClient({ businessType }: { businessType: string }) {
  const [state, action, pending] = useActionState(addProduct, null)
  
  // Default logic: F&B gets BOM, RETAIL gets RETAIL, others get SERVICE/BOM
  const defaultType = businessType === 'F_AND_B' ? 'BOM' : (businessType === 'RETAIL' ? 'RETAIL' : 'SERVICE')
  const [itemType, setItemType] = useState(defaultType)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setPreviewUrl(null)
    }
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 md:max-w-2xl lg:max-w-3xl mx-auto rounded-xl shadow-sm my-4 border border-gray-100">
      <Link href="/katalog" className="text-sm text-gray-500 font-semibold mb-6 inline-block hover:text-gray-900 transition-colors">&larr; Batal</Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tambah Produk</h1>
      
      <form action={action} className="space-y-5">
        {state?.error && <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg font-medium">{state.error}</div>}
        
        {/* Photo Upload Section */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 border-dashed text-center relative overflow-hidden group">
          {previewUrl ? (
            <div className="relative w-32 h-32 mx-auto mb-3">
              <Image src={previewUrl} alt="Preview" fill className="object-cover rounded-xl shadow-sm border border-gray-200" />
            </div>
          ) : (
            <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-3">
              <span className="text-2xl text-gray-400">📷</span>
            </div>
          )}
          <label className="block text-sm font-bold text-emerald-700 cursor-pointer hover:underline">
            {previewUrl ? "Ganti Foto" : "Upload Foto Produk"}
            <input type="file" name="image" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
          </label>
          <p className="text-xs text-gray-500 mt-1">Format JPG, PNG, WebP (Max 5MB)</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Nama Produk / Layanan</label>
          <input name="name" type="text" required placeholder="Contoh: Nasi Goreng / Jasa Potong" className="block w-full border border-gray-300 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
        </div>
        
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <label className="block text-sm font-bold text-gray-700 mb-3">Jenis Penjualan</label>
          <div className="flex flex-col md:flex-row gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-900 bg-white p-2.5 rounded-lg border border-gray-200 cursor-pointer flex-1 hover:border-emerald-300">
              <input type="radio" name="itemType" value="BOM" checked={itemType === 'BOM'} onChange={(e) => setItemType(e.target.value)} className="text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
              Racikan / Resep
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-900 bg-white p-2.5 rounded-lg border border-gray-200 cursor-pointer flex-1 hover:border-emerald-300">
              <input type="radio" name="itemType" value="RETAIL" checked={itemType === 'RETAIL'} onChange={(e) => setItemType(e.target.value)} className="text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
              Barang Ritel
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-900 bg-white p-2.5 rounded-lg border border-gray-200 cursor-pointer flex-1 hover:border-emerald-300">
              <input type="radio" name="itemType" value="SERVICE" checked={itemType === 'SERVICE'} onChange={(e) => setItemType(e.target.value)} className="text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
              Jasa Murni
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Harga Jual</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
            <FormattedNumberInput name="sellPrice" step="any" required placeholder="0" className="block w-full border border-gray-300 rounded-xl p-3 pl-10 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
          </div>
        </div>

        {itemType === 'RETAIL' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Modal Dasar (HPP)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                <FormattedNumberInput name="purchaseCost" step="any" required placeholder="0" className="block w-full border border-gray-300 rounded-xl p-3 pl-10 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Stok Awal Fisik</label>
              <FormattedNumberInput name="initialStock" step="any" placeholder="0" defaultValue="0" className="block w-full border border-gray-300 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
            </div>
          </div>
        )}

        {itemType === 'BOM' && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm p-4 rounded-xl flex items-start gap-3">
            <span className="text-lg">ℹ️</span>
            <p>Anda dapat meracik komponen bahan baku/resep dan menentukan HPP setelah produk ini disimpan.</p>
          </div>
        )}

        <button disabled={pending} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl mt-8 disabled:opacity-50 transition-colors shadow-md">
          {pending ? "Menyimpan..." : "Simpan Produk"}
        </button>
      </form>
    </div>
  )
}
