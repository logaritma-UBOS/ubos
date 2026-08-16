'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Search, Sparkles, MessageCircle } from 'lucide-react';

export default function FAQSection({ onOpenEnrollment }) {
  const [openIndex, setOpenIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const faqs = [
    {
      category: 'hpp',
      question: 'Bagaimana cara Logaritma.id menghitung HPP (Harga Pokok Penjualan) secara presisi?',
      answer: 'Logaritma.id tidak hanya menghitung harga beli barang dari supplier. Sistem kami memperhitungkan biaya bahan baku tersembunyi, ongkos kirim modal, biaya listrik/kemasan per porsi/unit, hingga tingkat penyusutan. Dengan begitu, Anda mengetahui modal bersih asli dan tidak akan pernah menjual rugi.'
    },
    {
      category: 'deadstock',
      question: 'Bagaimana fitur Anti Dead-Stock Logaritma AI bekerja?',
      answer: 'Logaritma AI memindai pergerakan stok inventori Anda 24/7. Apabila terdapat produk yang tidak bergerak lebih dari 30 hari atau mendekati tanggal expired, sistem secara otomatis memberikan notifikasi peringatan dan merekomendasikan paket promo bundling agar modal Anda tidak mengendap di gudang.'
    },
    {
      category: 'perangkat',
      question: 'Apakah Logaritma.id mendukung printer thermal bluetooth & barcode scanner HP?',
      answer: 'Ya! Logaritma.id dirancang sangat fleksibel. Anda dapat menggunakan smartphone Android/iOS, Tablet, atau Laptop. Sistem secara native mendukung printer thermal bluetooth/USB standar dan bisa memanfaatkan kamera HP sebagai scanner barcode kilat.'
    },
    {
      category: 'offline',
      question: 'Apakah aplikasi kasir ini tetap bisa dipakai saat koneksi internet mati (offline)?',
      answer: 'Tentu saja! Fitur Kasir POS Logaritma.id dilengkapi teknologi Offline-First Auto Sync. Anda tetap dapat melayani transaksi kasir dan cetak struk tanpa internet. Begitu koneksi internet tersambung kembali, seluruh data akan tersinkronisasi otomatis ke cloud server.'
    },
    {
      category: 'harga',
      question: 'Berapa biaya langganan Logaritma.id dan apakah ada uji coba gratis?',
      answer: 'Logaritma.id menyediakan uji coba gratis selama 7 hari penuh tanpa perlu kartu kredit. Paket langganan resmi dimulai dari Rp 49.000 / bulan untuk UMKM Starter, sangat terjangkau dibanding potensi modal mati yang diselamatkan setiap bulannya.'
    },
    {
      category: 'cabang',
      question: 'Apakah Logaritma.id cocok untuk usaha grosir atau toko multi-cabang?',
      answer: 'Sangat cocok. Anda dapat mengelola puluhan toko atau gudang cukup dari 1 akun dashboard terpusat. Dilengkapi fitur mutasi stok antar cabang, harga grosir bertingkat (ecer, reseller, agen), serta pembagian otorisasi supervisor.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCat = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <section id="faq" className="py-20 md:py-28 bg-slate-50 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" /> FAQ & Pusat Informasi Logaritma.id
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Pertanyaan Yang Sering <span className="text-gradient-blue-emerald">Diajukan Pelaku UMKM</span>
          </h2>
          <p className="text-slate-600 text-base max-w-xl mx-auto">
            Temukan jawaban lengkap mengenai fitur HPP, kasir POS, anti dead-stock, dan langganan.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="relative max-w-xl mx-auto mb-8">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari pertanyaan (contoh: HPP, Dead-Stock, Printer, Offline, Harga)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm text-slate-800"
          />
        </div>

        {/* Category Pills */}
        <div className="flex justify-center gap-2 mb-10 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'Semua Pertanyaan' },
            { id: 'hpp', label: 'HPP & Margin Guard' },
            { id: 'deadstock', label: 'Fitur Anti Dead-Stock AI' },
            { id: 'perangkat', label: 'Printer & Perangkat' },
            { id: 'offline', label: 'Offline Sync & Mode' },
            { id: 'harga', label: 'Harga & Uji Coba' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:border-blue-300 transition-all overflow-hidden"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-base sm:text-lg focus:outline-none"
                  >
                    <span>{faq.question}</span>
                    <div className={`p-1.5 rounded-full bg-slate-100 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 bg-blue-100 text-blue-600' : 'text-slate-500'}`}>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4 animate-in fade-in duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
              Tidak ada pertanyaan yang sesuai dengan pencarian Anda.
            </div>
          )}
        </div>

        {/* Additional Help CTA */}
        <div className="mt-12 text-center bg-white p-6 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">Masih Butuh Bantuan / Konsultasi HPP?</div>
              <div className="text-xs text-slate-500">Tim Konsultan Logaritma.id siap membantu setting awal usahamu 24/7.</div>
            </div>
          </div>
          <button
            onClick={() => window.open('https://wa.me/6281211638357?text=Halo%20Reza,%20saya%20butuh%20bantuan%20konsultasi%20HPP%20dari%20Logaritma.id', '_blank')}
            className="text-xs font-bold px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all whitespace-nowrap"
          >
            Tanya via WhatsApp →
          </button>
        </div>

      </div>
    </section>
  );
}
