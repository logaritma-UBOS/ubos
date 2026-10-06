"use client"

import { useState, useEffect, useRef } from "react"
import { getWaStatus, disconnectWa } from "@/actions/whatsapp"
import { Button } from "@/components/ui/Button"

export function WaSettingsClient() {
  const [status, setStatus] = useState<string>("LOADING")
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [deviceInfo, setDeviceInfo] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  // QRCode library is loaded dynamically via script tag in page.tsx or here
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const fetchStatus = async () => {
    try {
      const res = await getWaStatus()
      if (res.success) {
        setStatus(res.status || "ERROR")
        setQrCode(res.qr || null)
        setDeviceInfo(res.device || null)
      } else {
        setStatus("ERROR")
      }
    } catch (e) {
      setStatus("ERROR")
    }
  }

  useEffect(() => {
    fetchStatus()
    let interval: any
    if (status === "DISCONNECTED" || status === "INITIALIZING") {
      interval = setInterval(fetchStatus, 3000)
    }
    return () => clearInterval(interval)
  }, [status])

  useEffect(() => {
    if (qrCode && canvasRef.current && (window as any).QRCode) {
      (window as any).QRCode.toCanvas(canvasRef.current, qrCode, { width: 250, margin: 2 }, (error: any) => {
        if (error) console.error(error)
      })
    }
  }, [qrCode])

  const handleDisconnect = async () => {
    if (!confirm("Yakin ingin memutuskan koneksi WhatsApp?")) return
    setIsSaving(true)
    await disconnectWa()
    setIsSaving(false)
    fetchStatus()
  }

  if (status === "LOADING") {
    return <div className="text-center py-12 text-slate-500 animate-pulse">Memuat status integrasi...</div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* KIRI - Status Koneksi */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Status Koneksi</h2>
        
        {status === "CONNECTED" ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 ring-8 ring-emerald-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">WhatsApp Terhubung</h3>
            <p className="text-slate-500 mb-8 max-w-sm">
              Sistem telah terhubung dengan nomor <strong className="text-slate-800">{deviceInfo?.split(':')[0]}</strong>. Anda sekarang dapat menggunakan fitur WA Blast.
            </p>
            <Button onClick={handleDisconnect} disabled={isSaving} variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
              {isSaving ? "Memutuskan..." : "Putuskan Koneksi"}
            </Button>
          </div>
        ) : status === "INITIALIZING" ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Menyiapkan Engine...</h3>
            <p className="text-sm text-slate-500 mb-4">Sistem sedang menyiapkan instance WhatsApp khusus untuk toko Anda.</p>
            <Button onClick={handleDisconnect} disabled={isSaving} variant="outline" size="sm" className="text-red-500 hover:text-red-600 border-red-200">
              {isSaving ? "Mereset..." : "Reset Sesi (Jika Macet)"}
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Scan QR Code</h3>
            <p className="text-sm text-slate-500 mb-6">Buka WhatsApp &gt; Perangkat Tautkan &gt; Scan QR di bawah ini.</p>
            
            <div className="bg-white p-4 rounded-2xl shadow-sm border-2 border-slate-100 min-h-[260px] flex items-center justify-center">
                {qrCode ? (
                    <canvas ref={canvasRef}></canvas>
                ) : (
                    <div className="text-sm text-slate-400 flex flex-col items-center">
                        <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-400 rounded-full animate-spin mb-2"></div>
                        Memuat QR Code...
                    </div>
                )}
            </div>
          </div>
        )}
      </div>

      {/* KANAN - Info */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 md:p-8 rounded-2xl shadow-sm text-white h-full">
        <h2 className="text-xl font-bold mb-4">Informasi Private Engine</h2>
        <p className="text-slate-300 text-sm leading-relaxed mb-6">
          Kini UBOS menggunakan sistem <strong>Private Gateway Multi-Session</strong>. Keuntungan yang Anda dapatkan:
        </p>
        <ul className="space-y-4">
          <li className="flex gap-3 text-sm text-slate-200">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">✓</div>
            <div>
              <strong className="block text-white">Tidak Perlu Token</strong>
              Cukup scan QR Code langsung dari layar ini tanpa harus meminta token manual ke Admin.
            </div>
          </li>
          <li className="flex gap-3 text-sm text-slate-200">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">✓</div>
            <div>
              <strong className="block text-white">Gratis Tanpa Batas</strong>
              Kirim blast berapapun tanpa biaya berlangganan API pihak ketiga.
            </div>
          </li>
          <li className="flex gap-3 text-sm text-slate-200">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">ℹ</div>
            <div>
              <strong className="block text-white">Nomor Tersendiri</strong>
              Sesi terisolasi khusus untuk toko Anda, sehingga privasi dan keamanan terjamin.
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}
