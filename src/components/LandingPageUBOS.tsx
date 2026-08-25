"use client";

import { useState } from "react";
import Link from "next/link";
import { LineChart, ShoppingBag, Banknote, AlertTriangle } from "lucide-react";

export default function LandingPageUBOS() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-emerald-500/20 overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-40 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 h-[64px] sm:h-[72px] flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <img src="/icon192.png" alt="UBOS Logo" className="w-8 h-8 object-contain rounded-lg shadow-sm" />
            <span className="font-black tracking-tight text-xl text-slate-900">
              UBOS
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 font-semibold text-sm text-slate-600">
            <a href="#masalah" className="hover:text-emerald-600 transition-colors">Masalah</a>
            <a href="#cara-kerja" className="hover:text-emerald-600 transition-colors">Cara Kerja</a>
            <a href="#solusi" className="hover:text-emerald-600 transition-colors">Solusi</a>
          </div>

          {/* Desktop CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-slate-700 font-semibold text-sm px-4 py-2 rounded-full hover:bg-slate-50 transition-colors">
              Masuk
            </Link>
            <Link href="/register" className="bg-emerald-600 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-emerald-700 transition-colors shadow-sm hover:shadow-emerald-600/20 hover:shadow-lg">
              Mulai Gratis
            </Link>
          </div>

          {/* Mobile: Masuk button + Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <Link href="/login" className="text-emerald-700 font-bold text-sm px-4 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors">
              Masuk
            </Link>
            <button
              className="p-1.5 text-slate-700 hover:text-emerald-600 rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <div 
          className={`md:hidden bg-white border-t border-slate-100 overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="px-5 py-4 flex flex-col gap-2">
            <a href="#masalah" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 font-semibold text-base py-2.5 px-3 rounded-xl hover:bg-slate-50 block">Masalah</a>
            <a href="#cara-kerja" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 font-semibold text-base py-2.5 px-3 rounded-xl hover:bg-slate-50 block">Cara Kerja</a>
            <a href="#solusi" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 font-semibold text-base py-2.5 px-3 rounded-xl hover:bg-slate-50 block">Solusi</a>
            <div className="pt-4 mt-2 border-t border-slate-100">
              <Link href="/register" className="w-full flex items-center justify-center bg-emerald-600 text-white px-4 py-3.5 rounded-2xl font-bold text-base hover:bg-emerald-700 transition-colors">
                Mulai Gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-28 sm:pt-36 pb-16 sm:pb-24 px-5 sm:px-6 max-w-5xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs sm:text-sm font-bold mb-6">
          <LineChart className="w-4 h-4" />
          <span>Sistem Operasi untuk UMKM</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-6">
          Kendali Penuh Atas <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Operasional Usaha Anda</span>
        </h1>
        <p className="text-base sm:text-xl text-slate-600 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
          Ubah data penjualan, stok, dan pengeluaran menjadi keputusan nyata. UBOS tidak hanya mencatat, tapi memberi tahu apa yang harus Anda lakukan hari ini.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link href="/register" className="w-full sm:w-auto bg-emerald-600 text-white px-8 py-3.5 rounded-full font-bold text-base hover:bg-emerald-700 transition-all shadow-sm flex items-center justify-center gap-2">
            Mulai Gratis 
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </Link>
          <Link href="/login" className="w-full sm:w-auto text-slate-700 bg-white border-2 border-slate-200 px-8 py-3.5 rounded-full font-bold text-base hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-center">
            Masuk ke Aplikasi
          </Link>
        </div>
      </section>

      {/* MASALAH SECTION */}
      <section id="masalah" className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 mb-4">Masalah Operasional UMKM</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Kami mengerti mengapa banyak usaha sulit berkembang. Bukan karena kurang kerja keras, tapi karena kehilangan kendali.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Kondisi Kabur", desc: "Tidak tahu persis kesehatan usaha hari ini. Merasa sibuk tapi uang tidak bertambah.", icon: <AlertTriangle className="w-6 h-6 text-red-500" /> },
              { title: "Stok Bocor", desc: "Barang habis tanpa disadari atau uang macet di gudang karena stok berlebihan.", icon: <ShoppingBag className="w-6 h-6 text-orange-500" /> },
              { title: "Akar Masalah", desc: "Omset turun tapi sulit mengetahui bagian mana yang bocor dan harus diperbaiki.", icon: <LineChart className="w-6 h-6 text-indigo-500" /> },
              { title: "Bingung Bertindak", desc: "Punya banyak data pencatatan, namun bingung mengambil keputusan atau tindakan selanjutnya.", icon: <Banknote className="w-6 h-6 text-slate-500" /> },
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-100 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CARA KERJA SECTION */}
      <section id="cara-kerja" className="py-16 sm:py-24 bg-emerald-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-4">Metodologi UBOS</h2>
            <p className="text-emerald-100/80 max-w-2xl mx-auto">Sistem kami bekerja seperti asisten manajerial. Dari pencatatan hingga rekomendasi tindakan.</p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-4 lg:gap-8 text-center">
            {["Data Terpusat", "Analisis Gap", "Rekomendasi", "Tindakan Nyata", "Hasil Operasional"].map((step, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-emerald-800 border-2 border-emerald-400/30 flex items-center justify-center text-lg font-black text-emerald-300 mb-3 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  {i + 1}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mb-1">{step}</h3>
                {i < 4 && <div className="hidden md:block absolute w-6 lg:w-10 h-px bg-emerald-400/30 translate-x-[75px] lg:translate-x-[90px] -translate-y-[45px]" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUSI SECTION */}
      <section id="solusi" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 mb-4">Fitur Utama Terintegrasi</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Semua alat yang Anda butuhkan dalam satu sistem yang saling berhubungan.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Kasir & Penjualan", desc: "Pencatatan kasir cepat, dukung manajemen produk varian, resep, dan laporan omset real-time.", icon: <Banknote /> },
              { title: "Inventory Otomatis", desc: "Stok bahan dan produk otomatis berkurang berdasarkan transaksi. Peringatan stok kritis.", icon: <ShoppingBag /> },
              { title: "Manajemen Keuangan", desc: "Catat pengeluaran, HPP produk otomatis, pantau margin dan profitabilitas setiap produk.", icon: <LineChart /> },
              { title: "Wawasan Bisnis", desc: "Analisis performa jam sibuk, Average Order Value (AOV), dan tren penjualan secara instan.", icon: <LineChart /> },
              { title: "Rekomendasi AI", desc: "Mesin Logaritma menganalisis celah (gap) performa dan memberikan rekomendasi aksi konkret.", icon: <AlertTriangle /> },
              { title: "Backward Mapping", desc: "Petakan tujuan finansial Anda menjadi target harian yang terukur dan harus dicapai.", icon: <LineChart /> },
            ].map((item, i) => (
              <div key={i} className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-100 transition-all">
                <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-emerald-100 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-16 sm:py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-6">Mulai kelola usaha dengan lebih terarah.</h2>
          <Link href="/register" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/25">
            Mulai Gratis Sekarang 
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 bg-white border-t border-slate-100 text-center">
        <p className="text-sm font-semibold text-slate-400">© 2026 UBOS by Logaritma. All rights reserved.</p>
      </footer>
    </div>
  );
}
