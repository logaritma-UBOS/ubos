"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function MobileBottomNav() {
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const pathname = usePathname()
  
  // Don't show bottom nav on pages that have their own full-screen layouts
  // like /kasir or auth pages.
  if (pathname === '/login' || pathname === '/register' || pathname === '/reset-sandi' || pathname?.startsWith('/kasir')) {
    return null
  }

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/"
    return pathname?.startsWith(path)
  }

  const navItemClass = (path: string) => 
    `flex flex-col items-center justify-center w-[20%] h-full ${isActive(path) ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-700'}`

  const moreMenuLinks = [
    { label: "Stok & Supplier", href: "/stok", icon: "📦" },
    { label: "Toko Online", href: "/toko-online", icon: "🌐" },
    { label: "Pelanggan", href: "/pelanggan", icon: "👥" },
    { label: "Pengeluaran", href: "/pengeluaran", icon: "💸" },
    { label: "Promo", href: "/promo", icon: "🎟️" },
    { label: "Marketing", href: "/marketing", icon: "📱" },
    { label: "Konten", href: "/konten", icon: "📝" },
    { label: "Wawasan Bisnis", href: "/wawasan-bisnis", icon: "📊" },
    { label: "Performa Produk", href: "/performa-produk", icon: "📈" },
    { label: "Performa AOV", href: "/performa-aov", icon: "💰" },
    { label: "Laporan", href: "/laporan", icon: "📑" },
  ]

  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-sm border-t border-gray-200 flex justify-around items-center h-[68px] z-[60] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe">
        <Link href="/beranda" className={navItemClass("/")}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span className="text-[10px] font-bold mt-0.5">Beranda</span>
        </Link>
        <Link href="/katalog" className={navItemClass("/katalog")}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
          <span className="text-[10px] font-semibold mt-0.5">Katalog</span>
        </Link>

        {/* KASIR */}
        <div className="relative w-[20%] flex justify-center -mt-7">
          <Link href="/kasir" className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full flex flex-col items-center justify-center text-white shadow-xl shadow-emerald-500/30 border-[3px] border-white active:scale-95 transition-all">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Link>
        </div>

        <Link href="/riwayat" className={navItemClass("/riwayat")}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px] font-semibold mt-0.5">Riwayat</span>
        </Link>

        <button 
          onClick={() => setIsMoreOpen(true)}
          className={`flex flex-col items-center justify-center w-[20%] h-full ${isMoreOpen ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-700'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
          <span className="text-[10px] font-semibold mt-0.5">Lainnya</span>
        </button>
      </div>

      {/* MORE MENU BOTTOM SHEET */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-[70] flex justify-center items-end bg-slate-900/40 backdrop-blur-sm sm:items-center p-0 lg:hidden" onClick={() => setIsMoreOpen(false)}>
          <div 
            className="bg-white w-full max-h-[85vh] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Menu Lainnya</h2>
              <button onClick={() => setIsMoreOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 font-bold">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 pb-safe">
              <div className="grid grid-cols-3 gap-3">
                {moreMenuLinks.map((link, i) => (
                  <Link 
                    key={i} 
                    href={link.href} 
                    onClick={() => setIsMoreOpen(false)}
                    className="flex flex-col items-center justify-center gap-2 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-95 transition-all text-center"
                  >
                    <span className="text-2xl">{link.icon}</span>
                    <span className="text-[10px] font-semibold text-gray-700 leading-tight">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
