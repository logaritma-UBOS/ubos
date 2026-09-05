"use client"

import { useState, useRef } from "react"
import { sendWaBlastFonnte } from "@/actions/admin"
import { logManualBlastAudit } from "@/actions/marketing"

export default function ManualBlastClient() {
  const [phoneList, setPhoneList] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleBlast = async () => {
    if (!message) return alert("Pesan tidak boleh kosong")
    
    // Parse phones (split by comma, newline, space)
    const rawPhones = phoneList.split(/[\n, ]+/)
    const validPhones = rawPhones.filter(p => p.trim().length >= 9).map(p => p.trim())
    
    if (validPhones.length === 0) return alert("Tidak ada nomor WhatsApp yang valid")
    
    if (!confirm(`Yakin ingin melakukan blast WA ke ${validPhones.length} nomor?`)) return
    
    setIsLoading(true)
    setResult(null)
    
    let successCount = 0;
    // Sequential blast
    for (const phone of validPhones) {
      try {
        await sendWaBlastFonnte(phone, message);
        successCount++;
        // Delay to respect API limits
        await new Promise(r => setTimeout(r, 1000));
      } catch (e) {
        console.error("Failed to send to", phone);
      }
    }

    setResult({ success: true, count: successCount, total: validPhones.length })
    await logManualBlastAudit(successCount, validPhones.length)
    setIsLoading(false)
  }

  const exportTemplate = () => {
    const csvContent = "phone,name\n6281234567890,Budi\n6280987654321,Ani"
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "template_wa_blast.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target?.result as string
      if (!text) return
      
      const lines = text.split('\n')
      const phones: string[] = []
      
      // Basic CSV parser (assumes phone is in first or second column)
      // We just regex extract everything that looks like a phone number
      const phoneRegex = /\b(62|08)\d{7,12}\b/g
      
      const matches = text.match(phoneRegex)
      if (matches && matches.length > 0) {
        setPhoneList(matches.join('\n'))
        alert(`Berhasil mengimpor ${matches.length} nomor WhatsApp.`)
      } else {
        alert("Tidak menemukan format nomor WhatsApp (62/08) yang valid di dalam file CSV.")
      }
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
    reader.readAsText(file)
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mt-8">
      <h2 className="text-xl font-bold mb-2">Manual & CSV WhatsApp Blast</h2>
      <p className="text-sm text-slate-500 mb-6">Input nomor WA secara manual atau impor dari file CSV/Excel untuk database prospek eksternal Anda.</p>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-semibold">Daftar Nomor WhatsApp</label>
            <div className="flex gap-2">
              <button onClick={exportTemplate} className="text-xs text-blue-600 font-bold hover:underline">Download Template CSV</button>
              <span className="text-slate-300">|</span>
              <button onClick={() => fileInputRef.current?.click()} className="text-xs text-emerald-600 font-bold hover:underline">Impor CSV</button>
              <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            </div>
          </div>
          <textarea 
            value={phoneList} 
            onChange={e => setPhoneList(e.target.value)}
            className="w-full p-3 border rounded-xl min-h-[120px] font-mono text-sm"
            placeholder="6281234567890\n085175150408\n(pisahkan dengan Enter atau Koma)"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-2">Pesan WhatsApp</label>
          <textarea 
            value={message} 
            onChange={e => setMessage(e.target.value)}
            className="w-full p-3 border rounded-xl min-h-[150px]"
            placeholder="Ketik pesan promosi kustom Anda di sini..."
          />
        </div>
        
        <button 
          onClick={handleBlast} 
          disabled={isLoading || !phoneList || !message}
          className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
        >
          {isLoading ? "Sedang Mengirim..." : "Kirim Manual Blast"}
        </button>
        
        {result && (
          <div className="mt-4 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
            <p className="font-bold">Manual Blast Selesai!</p>
            <p className="text-sm">Berhasil dikirim ke {result.count} dari total {result.total} nomor target.</p>
          </div>
        )}
      </div>
    </div>
  )
}
