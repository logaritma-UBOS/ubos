"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function FounderClient({ userName }: { userName: string }) {
  const [loading, setLoading] = useState(true)
  const [isVip, setIsVip] = useState(false)
  const [payLoading, setPayLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch("/api/user/status")
      .then(res => res.json())
      .then(data => {
        if (data.isVip) {
          setIsVip(true)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleCheckout = async () => {
    setPayLoading(true)
    try {
      const res = await fetch("/api/mayar/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 399000, planName: "Paket Founder Pass UBOS", planDesc: "Akses seumur hidup (Lifetime) ke seluruh modul UBOS" })
      })
      const data = await res.json()
      if (data.link) {
        window.location.href = data.link
      } else {
        alert("Gagal membuat link pembayaran. Coba lagi nanti.")
        setPayLoading(false)
      }
    } catch (e) {
      alert("Terjadi kesalahan. Silakan coba lagi.")
      setPayLoading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (isVip) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-900 rounded-3xl p-8 text-white shadow-xl mb-8">
            <h1 className="text-3xl font-black mb-2">Selamat Datang di Dashboard Khusus Founder</h1>
            <p className="text-emerald-100">Terima kasih {userName} telah menjadi bagian dari 100 pemilik usaha pertama UBOS.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Akses Bisnis Anda</h3>
              <p className="text-slate-600 mb-4">Masuk ke sistem operasional utama untuk mengelola kasir, stok, dan laporan.</p>
              <Link href="/beranda" className="inline-block bg-slate-900 text-white font-bold py-2 px-6 rounded-xl hover:bg-slate-800">Buka UBOS</Link>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Komunitas Founder</h3>
              <p className="text-slate-600 mb-4">Grup WhatsApp eksklusif untuk diskusi strategi marketing dan update fitur UBOS.</p>
              <a href="#" className="inline-block bg-emerald-100 text-emerald-800 font-bold py-2 px-6 rounded-xl hover:bg-emerald-200">Gabung Grup WA</a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-b from-emerald-600 to-emerald-900 p-8 text-center text-white relative">
          <div className="absolute top-4 right-4">
            <Link href="/" className="text-emerald-200 hover:text-white">Batal</Link>
          </div>
          <h2 className="text-3xl font-black mb-2">Founder Pass</h2>
          <p className="text-emerald-100 text-sm">Selesaikan investasi Anda untuk membuka seluruh fitur UBOS tanpa batas seumur hidup.</p>
        </div>
        
        <div className="p-8">
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-100">
            <div>
              <p className="font-bold text-slate-800">Paket Founder Pass</p>
              <p className="text-xs text-slate-500">Akses Lifetime + Semua Fitur</p>
            </div>
            <p className="font-black text-xl text-slate-900">Rp 399.000</p>
          </div>
          
          <ul className="space-y-3 mb-8">
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
              <span>Akses Semua Modul Tanpa Batas</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
              <span>Marketing Engine & Rekomendasi AI</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
              <span>Free Update Seumur Hidup</span>
            </li>
          </ul>

          <button 
            onClick={handleCheckout} 
            disabled={payLoading}
            className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-50"
          >
            {payLoading ? "Memproses..." : "Lanjutkan Pembayaran"}
          </button>
          
          <p className="text-center text-xs text-slate-400 mt-4">
            Pembayaran diproses secara aman oleh Mayar.id
          </p>
        </div>
      </div>
    </div>
  )
}
