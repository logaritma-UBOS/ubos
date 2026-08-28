"use client"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { IconCatalog, IconHistory, IconInsights, IconWarning, IconTrendingUp, IconCash } from "@/components/ui/Icons"

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // States for FAQ Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const faqs = [
    { q: "Apakah UBOS cocok untuk bisnis F&B?", a: "Sangat cocok. UBOS dilengkapi dengan fitur manajemen bahan baku (resep) dan kalkulator HPP otomatis untuk bisnis kuliner." },
    { q: "Apakah bisa digunakan untuk toko retail atau jasa?", a: "Tentu. Anda bisa mematikan fitur resep dan menggunakan UBOS murni sebagai sistem kasir (POS), pencatatan inventaris, atau pemantauan layanan jasa." },
    { q: "Apakah butuh koneksi internet yang cepat?", a: "UBOS dirancang agar tetap bisa memproses transaksi pada kondisi offline (Pending state), dan akan otomatis sinkronisasi saat internet kembali stabil." },
  ]

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-emerald-200">
      
      {/* SECTION 1: TOP ANNOUNCEMENT & HERO */}
      {/* Top Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-2 text-center font-medium tracking-wide">
        Menerapkan metode Logaritma Backward Mapping &middot; <Link href="/register" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">Pelajari Lebih Lanjut</Link>
      </div>

      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center shrink-0 hover:opacity-90 transition-opacity">
            <Image alt="UBOS" className="h-8 w-auto object-contain" height={32} priority src="/logo-ubos.png" width={100}/>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#masalah" className="hover:text-emerald-600 transition-colors">Masalah</a>
            <a href="#cara-kerja" className="hover:text-emerald-600 transition-colors">Cara Kerja</a>
            <a href="#fitur" className="hover:text-emerald-600 transition-colors">Fitur</a>
          </nav>
          
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden md:inline-flex items-center px-4 py-2 text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">
              Masuk
            </Link>
            <Link href="/register" className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-sm transition-all hover:-translate-y-0.5">
              Mulai Gratis
            </Link>
            
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-slate-500 hover:text-emerald-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 absolute top-16 left-0 right-0 shadow-lg">
            <div className="px-4 py-4 flex flex-col gap-4">
              <a href="#masalah" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-slate-600 hover:text-emerald-600">Masalah</a>
              <a href="#cara-kerja" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-slate-600 hover:text-emerald-600">Cara Kerja</a>
              <a href="#fitur" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-slate-600 hover:text-emerald-600">Fitur</a>
              <div className="pt-4 mt-2 border-t border-slate-100">
                <Link href="/login" className="flex items-center justify-center w-full px-4 py-3 mb-2 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">
                  Masuk ke Aplikasi
                </Link>
                <Link href="/register" className="flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm">
                  Daftar Sekarang
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden border-b border-slate-200 [background:radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-32 relative z-10 animate-fade-up">
          <div className="text-center max-w-4xl mx-auto">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6">
              {/* Ping Dot Animasi Halus */}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              
              {/* SVG Lightning Icon */}
              <svg className="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>

              <span>UMKM BUSINESS OPERATION SYSTEM</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-3xl mx-auto mb-4">
              Satu Sistem untuk Tahu Kondisi Bisnis, Temukan Masalah, dan Ambil <span className="text-blue-600">Langkah Nyata</span>.
            </h1>
            
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
              Hitung HPP otomatis, catat transaksi kasir POS, dan dapatkan rekomendasi operasional harian dalam 10 detik.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
              <Link href="/register" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3 rounded-full shadow-md shadow-blue-600/20 text-sm transition-all text-center">
                Daftar Sekarang &rarr;
              </Link>
              <Link href="/login" className="w-full sm:w-auto bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-6 py-3 rounded-full text-sm flex items-center justify-center gap-2 transition-all">
                Demo Preview
              </Link>
            </div>
          </div>
          
          {/* Hero Visual Mockup */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
            <div className="relative rounded-2xl md:rounded-[2rem] bg-white border border-slate-200 p-4 shadow-2xl shadow-slate-900/10 overflow-hidden transform transition-all duration-700 hover:shadow-blue-900/5">
              <div className="absolute top-0 w-full h-12 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-2 left-0">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Kondisi Bisnis Hari Ini</p>
                  <p className="text-3xl font-black text-slate-900 mb-2">Rp 1.450.000</p>
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                    <div className="bg-blue-500 h-2 rounded-full w-[65%]"></div>
                  </div>
                  <p className="text-xs font-semibold text-blue-600">65% dari target tercapai</p>
                </div>
                <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100 flex flex-col justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">? Prioritas Tindakan</p>
                  <p className="text-lg font-bold text-slate-900 mb-1 leading-snug">Buat Promo Diskon Spesial Sore</p>
                  <p className="text-sm text-slate-600">Lalu lintas pengunjung sedang turun. Berikan diskon untuk dorong penjualan.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: PROBLEM AGITATION (Dark Section) */}
      <section id="masalah" className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-3xl p-8 lg:p-12 text-white my-12 shadow-2xl relative overflow-hidden">
            {/* Dark background pattern */}
            <div className="absolute inset-0 opacity-10 [background:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="relative z-10 text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4 leading-tight">
                Buka Usaha Tiap Hari, Tapi Nggak Tahu Masalahnya di Mana?
              </h2>
              <p className="text-lg text-slate-400 font-medium">Banyak UMKM yang jago jualan, tapi kebingungan mengelola operasional di belakang layar.</p>
            </div>
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/20">
                <IconWarning className="w-8 h-8 text-rose-400 mb-4" />
                <h3 className="text-lg font-bold mb-2 text-slate-100">HPP Meleset</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Harga bahan baku naik, porsi tidak standar, akhirnya margin tergerus tanpa disadari.</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/20">
                <IconTrendingUp className="w-8 h-8 text-amber-400 mb-4" />
                <h3 className="text-lg font-bold mb-2 text-slate-100">Margin Tipis</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Merasa ramai pembeli, tapi saat dihitung untung bersihnya hampir tidak ada sisa.</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/20">
                <IconInsights className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="text-lg font-bold mb-2 text-slate-100">Toko Sepi Tanpa Solusi</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Hanya bisa pasrah saat omzet turun karena tidak tahu metrik mana yang salah.</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/20">
                <IconHistory className="w-8 h-8 text-emerald-400 mb-4" />
                <h3 className="text-lg font-bold mb-2 text-slate-100">Laporan Manual Rumit</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Waktu habis untuk merekap nota kertas dan hitung stok manual tiap malam.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: CARA KERJA (Backward Mapping) */}
      <section id="cara-kerja" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-blue-600 font-black tracking-widest text-xs uppercase mb-2 block">Metode Kami</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
              4 Langkah Cerdas Backward Mapping
            </h2>
            <p className="text-lg text-slate-600">Sistem yang tidak sekadar mencatat, tapi memandu Anda untuk bertindak.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center relative">
              <div className="w-16 h-16 mx-auto bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-black text-2xl mb-4 shadow-sm border border-blue-100">1</div>
              <h4 className="font-bold text-slate-900 text-lg mb-2">Tentukan Target</h4>
              <p className="text-sm text-slate-500 leading-relaxed">Tetapkan target omzet harian Anda agar sistem memiliki acuan tujuan yang jelas.</p>
              <div className="hidden md:block absolute top-8 left-[60%] w-full h-px bg-slate-200 border-t border-dashed border-slate-300"></div>
            </div>
            <div className="text-center relative">
              <div className="w-16 h-16 mx-auto bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-black text-2xl mb-4 shadow-sm border border-blue-100">2</div>
              <h4 className="font-bold text-slate-900 text-lg mb-2">Pantau Gap Real-time</h4>
              <p className="text-sm text-slate-500 leading-relaxed">Setiap transaksi POS otomatis memotong gap (kekurangan) target Anda secara real-time.</p>
              <div className="hidden md:block absolute top-8 left-[60%] w-full h-px bg-slate-200 border-t border-dashed border-slate-300"></div>
            </div>
            <div className="text-center relative">
              <div className="w-16 h-16 mx-auto bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-black text-2xl mb-4 shadow-sm border border-blue-100">3</div>
              <h4 className="font-bold text-slate-900 text-lg mb-2">Temukan Penyebab</h4>
              <p className="text-sm text-slate-500 leading-relaxed">Sistem menganalisis data (seperti AOV rendah atau stok kosong) jika target berpotensi tidak tercapai.</p>
              <div className="hidden md:block absolute top-8 left-[60%] w-full h-px bg-slate-200 border-t border-dashed border-slate-300"></div>
            </div>
            <div className="text-center relative">
              <div className="w-16 h-16 mx-auto bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-black text-2xl mb-4 shadow-sm border border-emerald-100">4</div>
              <h4 className="font-bold text-slate-900 text-lg mb-2">Eksekusi Rekomendasi</h4>
              <p className="text-sm text-slate-500 leading-relaxed">Sistem memberikan menu tindakan langsung (seperti Buat Promo atau Restock) untuk menutup celah.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: FITUR UNGGULAN */}
      <section id="fitur" className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">Fitur Terintegrasi Secara Sempurna</h2>
            <p className="text-lg text-slate-600">Alat operasional lengkap untuk semua kebutuhan UMKM modern.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100">
                <IconCatalog className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Kalkulator HPP & Resep</h3>
              <p className="text-slate-600 leading-relaxed">Hitung harga pokok penjualan secara dinamis dari level bahan baku. Margin keuntungan Anda terjamin akurat di setiap transaksi.</p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
                <IconCash className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Kasir POS Offline-Ready</h3>
              <p className="text-slate-600 leading-relaxed">Catat pesanan pelanggan dengan cepat walau tanpa internet. Transaksi akan sinkron otomatis saat koneksi kembali stabil.</p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 border border-blue-100">
                <IconInsights className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Logaritma Engine</h3>
              <p className="text-slate-600 leading-relaxed">Mesin cerdas di balik layar yang terus memantau metrik bisnis Anda dan menyajikan prioritas tindakan hari ini untuk menekan kerugian.</p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 border border-orange-100">
                <IconHistory className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Kontrol Stok & Inventaris</h3>
              <p className="text-slate-600 leading-relaxed">Otomatis potong stok bahan saat produk terjual. Dapatkan peringatan saat barang mulai menipis sebelum kehabisan.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: FAQ & FINAL CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Pertanyaan yang Sering Diajukan</h2>
          </div>
          <div className="space-y-4 mb-20">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 transition-colors">
                <button 
                  onClick={() => toggleFaq(idx)} 
                  className="w-full px-6 py-4 flex items-center justify-between font-bold text-slate-800 text-left focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <svg className={"w-5 h-5 text-slate-400 transform transition-transform "} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-200 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* FINAL CTA CARD */}
          <div className="bg-emerald-600 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-emerald-900/20">
            <div className="absolute inset-0 opacity-10 [background:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black mb-4">Kendalikan Angka Bisnis Anda Sekarang</h2>
              <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
                Tinggalkan cara lama yang membingungkan. Bergabung dengan ekosistem UBOS untuk mendiagnosis masalah bisnis secara otomatis.
              </p>
              <Link href="/register" className="inline-flex items-center justify-center rounded-full px-10 py-4 text-base font-bold text-emerald-700 bg-white hover:bg-emerald-50 shadow-lg transition-all hover:-translate-y-1">
                Daftar Akun Gratis &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white py-10 sm:py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm gap-4">
          <Link href="/" className="inline-block opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
            <Image alt="UBOS" className="h-6 w-auto object-contain" height={24} src="/logo-ubos.png" width={80}/>
          </Link>
          <div>&copy; 2026 UBOS by Logaritma. Hak cipta dilindungi.</div>
        </div>
      </footer>

    </div>
  )
}
