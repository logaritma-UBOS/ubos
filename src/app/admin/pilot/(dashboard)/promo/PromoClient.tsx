"use client"

import { useState } from "react"
import { createOwnerOffer, deleteOwnerOffer } from "@/actions/marketing"
import { useRouter } from "next/navigation"

export default function PromoClient({ initialData }: { initialData: any[] }) {
  const [name, setName] = useState("")
  const [targetSegment, setTargetSegment] = useState("FREE_TENANT")
  const [cta, setCta] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCreate = async () => {
    if (!name || !cta) return alert("Nama Promo dan CTA wajib diisi")
    setIsLoading(true)
    await createOwnerOffer({ name, targetSegment, cta, status: "ACTIVE" })
    setName("")
    setCta("")
    setIsLoading(false)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus promo ini?")) return
    await deleteOwnerOffer(id)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-4">Buat Penawaran Promo (Owner Offer)</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Target Segmen</label>
            <select value={targetSegment} onChange={e => setTargetSegment(e.target.value)} className="w-full p-2 border rounded-xl">
              <option value="FREE_TENANT">Pengguna Free</option>
              <option value="VIP_TENANT">Pengguna VIP (Upsell)</option>
              <option value="ALL">Semua Pengguna</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Nama / Deskripsi Promo</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Diskon 50% Langganan VIP..." className="w-full p-2 border rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Tombol CTA (Teks)</label>
            <input value={cta} onChange={e => setCta(e.target.value)} placeholder="Ambil Promo Sekarang" className="w-full p-2 border rounded-xl" />
          </div>
          <button onClick={handleCreate} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl">
            {isLoading ? "Menyimpan..." : "Aktifkan Promo"}
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-4">Daftar Promo Aktif</h2>
        {initialData.length === 0 ? (
          <p className="text-slate-500">Belum ada promo yang berjalan.</p>
        ) : (
          <div className="space-y-4">
            {initialData.map((item, i) => (
              <div key={i} className="p-4 border rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{item.targetSegment}</span>
                  <h3 className="font-bold text-lg mt-2">{item.name}</h3>
                  <p className="text-sm text-slate-500">CTA: {item.cta}</p>
                </div>
                <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 text-sm font-bold">Berhentikan</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
