"use client"
import React, { useState, useEffect, useRef } from "react"
import { disconnectTeamWa } from "@/actions/teamOs"
import { Button } from "@/components/ui/button"

export function MasterWaSyncClient() {
  const [status, setStatus] = useState<string>("LOADING")
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [deviceInfo, setDeviceInfo] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [rawDebug, setRawDebug] = useState<any>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/wa/status?t=' + Date.now(), { cache: 'no-store' });
      const data = await res.json();
      
      if (data.success) {
        setStatus(data.status || "ERROR")
        setQrCode(data.qr || null)
        setDeviceInfo(data.device || null)
        if (data.raw) setRawDebug(data.raw)
      } else {
        setStatus("ERROR")
        setRawDebug(data.error)
      }
    } catch (e: any) {
      setStatus("ERROR")
      setRawDebug(e.message)
    }
  }

  useEffect(() => {
    fetchStatus()
    let interval: any
    if (status === "DISCONNECTED" || status === "INITIALIZING" || status === "LOADING") {
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
    setIsSaving(true)
    try {
      await disconnectTeamWa()
      await fetchStatus()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 flex flex-col h-full min-h-[400px]">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          Status Koneksi WA Pribadi
        </h2>

        {status === "LOADING" ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-400 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400">Memeriksa status...</p>
          </div>
        ) : status === "CONNECTED" ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">WhatsApp Pribadi Terhubung</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              Sistem telah terhubung dengan nomor <strong className="text-slate-800">{deviceInfo?.split(':')[0]}</strong>.
            </p>
            <Button onClick={handleDisconnect} disabled={isSaving} variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
              {isSaving ? "Memutuskan..." : "Putuskan Koneksi"}
            </Button>
          </div>
        ) : status === "INITIALIZING" ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Menyiapkan Sesi WA...</h3>
            <p className="text-sm text-slate-500 mb-4">Mohon tunggu, sedang menyiapkan ruang khusus untuk akun Anda...</p>
            {rawDebug && <pre className="text-xs bg-slate-100 p-2 rounded text-left w-full overflow-auto mb-4">{JSON.stringify(rawDebug, null, 2)}</pre>}
            <Button onClick={handleDisconnect} disabled={isSaving} variant="outline" size="sm" className="text-red-500 hover:text-red-600 border-red-200">
              {isSaving ? "Mereset..." : "Reset Sesi (Jika Macet)"}
            </Button>
          </div>
        ) : status === "ERROR" ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-red-500 mb-4">Gagal terhubung ke Engine Gateway</div>
            {rawDebug && <pre className="text-xs bg-slate-100 p-2 rounded text-left w-full overflow-auto mb-4 text-slate-700">{typeof rawDebug === 'string' ? rawDebug : JSON.stringify(rawDebug, null, 2)}</pre>}
            <Button onClick={fetchStatus}>Coba Ulang</Button>
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

      <div className="bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm text-white h-full border border-slate-800 relative overflow-hidden">
        <h2 className="text-xl font-bold mb-4 relative z-10">Informasi WA Pribadi</h2>
        <p className="text-slate-300 text-sm leading-relaxed mb-6 relative z-10">
          Tautkan WhatsApp pribadi Anda di sini. Ketika Anda mengirim Follow-Up atau Blast dari akun Anda, pesan tersebut akan terkirim dari nomor ini.
        </p>
        <ul className="space-y-4 relative z-10">
          <li className="flex gap-3 text-sm text-slate-200">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">1</div>
            <div>
              <strong className="block text-white">Sesi Pribadi</strong>
              Setiap anggota tim memiliki sesi Gateway terisolasi yang tidak akan bocor ke akun lain.
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}
