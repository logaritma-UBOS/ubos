"use client"

import { useState } from "react"
import { blastWhatsAppGroup } from "@/actions/marketing"

export default function MarketingClient() {
  const [segment, setSegment] = useState("ALL")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleBlast = async () => {
    if (!message) return alert("Pesan tidak boleh kosong")
    if (!confirm(`Yakin ingin melakukan blast WA ke segmen: ${segment}?`)) return
    
    setIsLoading(true)
    setResult(null)
    const res = await blastWhatsAppGroup(segment, message)
    if (res.error) {
      alert(res.error)
    } else {
      setResult(res)
    }
    setIsLoading(false)
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold mb-4">WhatsApp Blast Massal</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Target Segmen</label>
          <select value={segment} onChange={e => setSegment(e.target.value)} className="w-full p-3 border rounded-xl">
            <option value="ALL">Semua Tenant (Free + VIP)</option>
            <option value="FREE">Hanya Tenant Free</option>
            <option value="VIP">Hanya Tenant VIP</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Pesan WhatsApp</label>
          <textarea 
            value={message} 
            onChange={e => setMessage(e.target.value)}
            className="w-full p-3 border rounded-xl min-h-[150px]"
            placeholder="Ketik pesan promosi Anda di sini..."
          />
        </div>
        <button 
          onClick={handleBlast} 
          disabled={isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
        >
          {isLoading ? "Sedang Mengirim..." : "Kirim Blast Sekarang"}
        </button>
        
        {result && (
          <div className="mt-4 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
            <p className="font-bold">Blast Selesai!</p>
            <p className="text-sm">Berhasil dikirim ke {result.count} dari total {result.total} target pengguna yang memiliki nomor WhatsApp.</p>
          </div>
        )}
      </div>
    </div>
  )
}
