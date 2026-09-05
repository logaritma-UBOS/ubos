"use client"

import { useState, useEffect } from "react"
import { submitDailyActivity } from "@/actions/pilotAnalytics"
import { useRouter } from "next/navigation"

export default function DailyActivityForm({ userName, userEmail }: { userName: string, userEmail: string }) {
  const [activity, setActivity] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [greeting, setGreeting] = useState("pagi")
  const router = useRouter()
  
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 11 && hour < 15) setGreeting("siang")
    else if (hour >= 15 && hour < 18) setGreeting("sore")
    else if (hour >= 18 || hour < 4) setGreeting("malam")
  }, [])
  
  const options = [
    { value: "Melakukan aktifitas trafik", label: "Trafik (WA Chat, Story, IG, TikTok, FB, dll)" },
    { value: "Melakukan followup untuk merubah konversi jadi relationship", label: "Followup Konversi -> Relationship" },
    { value: "Maintanence tenant yang berstatus vip (relationship)", label: "Maintenance Tenant VIP" },
    { value: "Lainnya", label: "Lainnya" },
  ]
  
  // khusus Reza & Baim
  if (userEmail === "reza@logaritma.id" || userEmail === "logaritma.tim@gmail.com") {
    options.push({ value: "Melakukan perubahan tampilan/sistem pada halaman", label: "Perubahan Tampilan / Sistem" })
  }
  
  const handleSubmit = async () => {
    if (!activity) return alert("Pilih salah satu aktifitas")
    setLoading(true)
    try {
      await submitDailyActivity(activity, note)
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setActivity("")
        setNote("")
        router.refresh()
      }, 3000)
    } catch (e: any) {
      alert("Error: " + e.message)
    }
    setLoading(false)
  }
  
  return (
    <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-sm mb-8 overflow-hidden relative">
      <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black px-4 py-1 rounded-bl-xl shadow-sm tracking-widest">TIM INTERNAL</div>
      <h2 className="text-xl font-black text-slate-900 mb-1">
        Selamat {greeting}, <span className="text-blue-600">{userName.split(' ')[0]}</span>! 👋
      </h2>
      <p className="text-slate-500 text-sm mb-6 font-medium">Apa yang sudah Anda lakukan hari ini?</p>
      
      {success ? (
         <div className="bg-emerald-50 text-emerald-700 p-5 rounded-xl border border-emerald-200 font-bold text-center">
            Aktifitas berhasil dicatat. Terima kasih atas dedikasinya hari ini! 🚀
         </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {options.map((opt, i) => (
              <label key={i} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${activity === opt.value ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}>
                <div className="pt-0.5">
                  <input 
                    type="radio" 
                    name="activity" 
                    value={opt.value} 
                    checked={activity === opt.value} 
                    onChange={e => setActivity(e.target.value)} 
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 mt-0.5"
                  />
                </div>
                <span className={`text-sm font-bold leading-snug ${activity === opt.value ? 'text-blue-900' : 'text-slate-700'}`}>{opt.label}</span>
              </label>
            ))}
          </div>
          
          {activity && (
            <div className="pt-3 animate-in fade-in slide-in-from-top-4 duration-300">
              <label className="block text-sm font-bold text-slate-700 mb-2">Kolom Keterangan / Catatan</label>
              <textarea 
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Tulis detail aktifitas Anda di sini..."
                className="w-full p-4 rounded-xl border-2 border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] text-sm bg-slate-50 focus:bg-white transition-colors"
              />
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-8 rounded-xl transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
                >
                  {loading ? "Menyimpan..." : "Kirim Laporan Aktifitas"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
