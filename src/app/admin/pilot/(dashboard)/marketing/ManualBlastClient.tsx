"use client"

import { useState, useRef } from "react"
import { sendWaBlastFonnte } from "@/actions/admin"
import { logManualBlastAudit } from "@/actions/marketing"

export default function ManualBlastClient() {
  const [phoneList, setPhoneList] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState<{current: number, total: number, phone: string, countdown: number} | null>(null)
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
    for (let i = 0; i < validPhones.length; i++) {
      const phone = validPhones[i];
      setProgress({ current: i + 1, total: validPhones.length, phone, countdown: 0 });
      
      try {
        await sendWaBlastFonnte(phone, message);
        successCount++;
        
        // Delay to respect API limits (30 seconds) EXCEPT for the last message
        if (i < validPhones.length - 1) {
            for (let c = 30; c > 0; c--) {
                setProgress(prev => prev ? { ...prev, countdown: c } : null);
                await new Promise(r => setTimeout(r, 1000));
            }
        }
      } catch (e) {
        console.error("Failed to send to", phone);
      }
    }

    setProgress(null);
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
            disabled={isLoading}
            className="w-full p-3 border rounded-xl min-h-[120px] font-mono text-sm disabled:opacity-50"
            placeholder="6281234567890\n085175150408\n(pisahkan dengan Enter atau Koma)"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-2">Pesan WhatsApp</label>
          <textarea 
            value={message} 
            onChange={e => setMessage(e.target.value)}
            disabled={isLoading}
            className="w-full p-3 border rounded-xl min-h-[150px] disabled:opacity-50"
            placeholder="Ketik pesan promosi kustom Anda di sini..."
          />
        </div>
        
        {progress && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4 text-center">
             <p className="text-sm text-blue-800 font-bold mb-1">
                Mengirim Pesan {progress.current} dari {progress.total}
             </p>
             <p className="text-xs text-blue-600 font-mono mb-3">Target: {progress.phone}</p>
             
             {progress.countdown > 0 && (
                <div className="flex flex-col items-center">
                    <p className="text-xs text-slate-500 mb-2">Jeda anti-banned sebelum pesan berikutnya:</p>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 text-blue-800 font-bold text-lg ring-4 ring-blue-50">
                        {progress.countdown}s
                    </div>
                </div>
             )}
          </div>
        )}
        
        <button 
          onClick={handleBlast} 
          disabled={isLoading || !phoneList || !message}
          className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
        >
          {isLoading ? "Memproses Blast..." : "Kirim Manual Blast"}
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
