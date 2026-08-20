"use client"

import { useState } from "react"
import { submitFeedback } from "@/actions/analytics"

export default function FeedbackButton({ businessId }: { businessId?: string | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState("")

  if (!businessId) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus("Mengirim...")
    const fd = new FormData(e.currentTarget)
    const res = await submitFeedback(businessId, fd.get("category") as string, fd.get("content") as string)
    if (res.success) {
      setStatus("Terkirim!")
      setTimeout(() => { setIsOpen(false); setStatus(""); }, 2000)
    } else {
      setStatus("Gagal")
    }
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 bg-emerald-600 text-white p-3 rounded-full shadow-lg z-50 text-sm font-bold"
      >
        ?
      </button>
    )
  }

  return (
    <div className="fixed bottom-20 right-4 bg-white p-4 rounded-xl shadow-xl z-50 border border-gray-200 w-72">
      <h3 className="font-bold text-sm mb-2">Beri Masukan (Pilot)</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <select name="category" required className="w-full border p-2 rounded text-sm bg-gray-50">
          <option value="Bug">Ada Bug / Error</option>
          <option value="Bingung">Saya Bingung</option>
          <option value="Saran">Saran / Ide</option>
          <option value="Fitur">Butuh Fitur Baru</option>
        </select>
        <textarea 
          name="content" 
          required 
          placeholder="Ceritakan..."
          className="w-full border p-2 rounded text-sm h-24 bg-gray-50"
        ></textarea>
        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-emerald-600 text-white rounded py-2 text-sm font-bold">Kirim</button>
          <button type="button" onClick={() => setIsOpen(false)} className="flex-1 bg-gray-200 text-gray-800 rounded py-2 text-sm font-bold">Batal</button>
        </div>
        {status && <p className="text-xs text-center text-gray-600">{status}</p>}
      </form>
    </div>
  )
}
