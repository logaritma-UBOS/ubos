"use client"

import { useState, useEffect, useRef } from "react"
import Script from "next/script"
import { Button } from "@/components/ui/Button"

const GATEWAY_URL = "http://202.155.94.170:3000"

export function MasterWaSyncClient() {
  const [status, setStatus] = useState<string>("LOADING")
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [deviceInfo, setDeviceInfo] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const fetchStatus = async () => {
    try {
      // "master" is the default session ID for internal Team OS
      const res = await fetch(`${GATEWAY_URL}/status?session=master`, { cache: "no-store" })
      const data = await res.json()

      if (data.status === "connected") {
        setStatus("CONNECTED")
        setDeviceInfo(data.user?.id)
      } else if (data.status === "waiting_for_scan") {
        setStatus("DISCONNECTED")
        setQrCode(data.qr)
      } else {
        setStatus("INITIALIZING")
      }
    } catch (e) {
      setStatus("ERROR")
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
    if (!confirm("Yakin ingin memutuskan koneksi Master WhatsApp? Semua fitur notifikasi dan blast sistem UBOS akan terhenti sementara hingga disambungkan ulang!")) return
    setIsSaving(true)
    try {
      await fetch(`${GATEWAY_URL}/disconnect?session=master`, { method: "POST" })
    } catch (e) {}
    setIsSaving(false)
    fetchStatus()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js" strategy="lazyOnload" />
      
      {/* KIRI - Status Koneksi */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Status Master Gateway</h2>
        
        {status === "LOADING" ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-slate-500 animate-pulse">
            Memuat status gateway...
          </div>
        ) : status === "CONNECTED" ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 ring-8 ring-emerald-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">WhatsApp Terhubung</h3>
            <p className="text-slate-500 mb-8 max-w-sm">
              Sistem telah terhubung dengan nomor Master <strong className="text-slate-800">{deviceInfo?.split(':')[0]}</strong>. Seluruh tim kini dapat mengirim notifikasi dan blast.
            </p>
            <Button onClick={handleDisconnect} disabled={isSaving} variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
              {isSaving ? "Memutuskan..." : "Putuskan Koneksi"}
            </Button>
          </div>
        ) : status === "INITIALIZING" ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Menyiapkan Master Engine...</h3>
            <p className="text-sm text-slate-500">Mohon tunggu, sedang meminta instance WhatsApp ke server...</p>
          </div>
        ) : status === "ERROR" ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-red-500 mb-4">Gagal terhubung ke VPS Engine (202.155.94.170:3000)</div>
            <Button onClick={fetchStatus}>Coba Ulang</Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Scan QR Code Master</h3>
            <p className="text-sm text-slate-500 mb-6">Gunakan HP Admin Pusat: Buka WhatsApp &gt; Perangkat Tautkan &gt; Scan QR di bawah ini.</p>
            
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
      <div className="bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm text-white h-full border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654z"/></svg>
        </div>
        <h2 className="text-xl font-bold mb-4 relative z-10">Informasi Master Engine</h2>
        <p className="text-slate-300 text-sm leading-relaxed mb-6 relative z-10">
          Halaman ini digunakan khusus untuk menyambungkan nomor WhatsApp Pusat (Master) UBOS.
        </p>
        <ul className="space-y-4 relative z-10">
          <li className="flex gap-3 text-sm text-slate-200">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">1</div>
            <div>
              <strong className="block text-white">Sesi Global (Master)</strong>
              Koneksi ini akan digunakan oleh menu Marketing Blast, Follow-Up Bana, dan notifikasi internal tim lainnya.
            </div>
          </li>
          <li className="flex gap-3 text-sm text-slate-200">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">2</div>
            <div>
              <strong className="block text-white">Terisolasi dari Merchant</strong>
              Nomor Master ini terpisah dari nomor-nomor milik Merchant. Merchant memiliki sesi Private Gateway mereka sendiri.
            </div>
          </li>
          <li className="flex gap-3 text-sm text-slate-200">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">✓</div>
            <div>
              <strong className="block text-white">Akses Semua Tim</strong>
              Seluruh anggota tim dapat memantau status Master Engine ini untuk memastikan operasional blast berjalan lancar.
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}
