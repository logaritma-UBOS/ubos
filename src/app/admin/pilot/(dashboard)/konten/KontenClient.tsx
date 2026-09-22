"use client"

import { useState, useRef } from "react"
import { createFeedContent, deleteFeedContent, updateFeedContent, uploadFeedBanner } from "@/actions/marketing"
import { useRouter } from "next/navigation"

export default function KontenClient({ initialData, audienceType }: { initialData: any[], audienceType: string }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("TIPS")
  const [bannerUrl, setBannerUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    const formData = new FormData()
    formData.append("image", file)
    const res = await uploadFeedBanner(formData)
    if (res.success) {
      setBannerUrl(res.url)
    } else {
      alert("Gagal upload gambar banner")
    }
    setIsUploading(false)
  }

  const handleEdit = (item: any) => {
    setEditingId(item.id)
    setTitle(item.title)
    setContent(item.content)
    setCategory(item.category)
    setBannerUrl(item.imageUrl || "")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setTitle("")
    setContent("")
    setCategory("TIPS")
    setBannerUrl("")
    if (fileRef.current) fileRef.current.value = ""
  }

  const handleSave = async () => {
    if (!title || !content) return alert("Judul dan Konten wajib diisi")
    setIsLoading(true)
    
    if (editingId) {
      await updateFeedContent(editingId, { title, content, category, audience: audienceType, imageUrl: bannerUrl })
    } else {
      await createFeedContent({ title, content, category, status: "PUBLISHED", audience: audienceType, imageUrl: bannerUrl })
    }

    handleCancelEdit()
    setIsLoading(false)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus konten ini?")) return
    await deleteFeedContent(id)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{editingId ? "Edit Konten" : "Buat Konten Baru"}</h2>
          {editingId && (
            <button onClick={handleCancelEdit} className="text-sm font-bold text-slate-500 hover:text-slate-700">Batal Edit</button>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Kategori</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border rounded-xl">
              <option value="TIPS">Tips Bisnis</option>
              <option value="TUTORIAL">Tutorial UBOS</option>
              <option value="PROMO">Info Promo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Judul</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Banner Gambar (Opsional)</label>
            <div className="flex items-center gap-4">
              <input type="file" accept="image/*" ref={fileRef} onChange={handleUpload} className="w-full p-2 border rounded-xl" />
              {isUploading && <span className="text-sm text-slate-500 font-medium">Uploading...</span>}
            </div>
            {bannerUrl && <img src={bannerUrl} alt="Banner" className="mt-2 w-32 h-20 object-cover rounded-lg border" />}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Konten (Bisa pakai Markdown/HTML ringkas)</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full p-2 border rounded-xl min-h-[100px]" />
          </div>
          <button onClick={handleSave} disabled={isLoading || isUploading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl">
            {isLoading ? "Menyimpan..." : (editingId ? "Simpan Perubahan" : "Publikasikan Konten")}
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-4">Riwayat Konten Kalender</h2>
        {initialData.length === 0 ? (
          <p className="text-slate-500">Belum ada konten dipublikasikan.</p>
        ) : (
          <div className="space-y-4">
            {initialData.map((item, i) => (
              <div key={i} className={`p-4 border rounded-xl flex justify-between items-start transition-colors ${editingId === item.id ? 'border-blue-500 bg-blue-50/50' : ''}`}>
                <div>
                  <div className="flex gap-2">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{item.category}</span>
                    {item.author && (
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        {item.author}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mt-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2 mt-1">{item.content}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700 text-sm font-bold">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 text-sm font-bold">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
