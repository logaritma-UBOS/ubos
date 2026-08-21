"use client"

import { useState } from "react"
import { submitFeedback } from "@/actions/analytics"
import { usePathname } from "next/navigation"

export default function FeedbackButton({ businessId }: { businessId?: string | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState("")
  const pathname = usePathname()

  if (!businessId) return null
  
  // Kasir page has a floating cart bar, so we push the button higher up
  const isKasir = pathname === "/kasir"
  const bottomClass = isKasir ? "bottom-[140px]" : "bottom-20"

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
        className={`fixed ${bottomClass} right-4 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-xl z-50 flex items-center justify-center transition-transform hover:scale-105`}
        aria-label="Ada kendala?"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
        </svg>
      </button>
    )
  }

  return (
    <div className={`fixed ${bottomClass} right-4 bg-white p-4 rounded-xl shadow-xl z-50 border border-gray-200 w-72`}>
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
