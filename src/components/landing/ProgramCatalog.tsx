'use client';

import React, { useState } from 'react';
import { 
  Utensils, Printer, Store, Shirt, Clock, 
  Sparkles, CheckCircle2, ArrowRight, BookOpen, Star, Zap
} from 'lucide-react';

export default function ProgramCatalog({ onOpenCurriculum, onOpenEnrollment }) {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Semua Sektor UMKM' },
    { id: 'fnb', label: 'Kuliner & FnB', icon: Utensils },
    { id: 'printing', label: 'Percetakan Digital', icon: Printer },
    { id: 'retail', label: 'Retail & Toko', icon: Store },
    { id: 'jasa', label: 'Jasa & Service', icon: Shirt },
  ];

  const programs = [
    {
      id: 'fnb-pos',
      category: 'fnb',
      title: 'Solusi Kuliner & FnB',
      level: 'Sistem Kasir & Presisi HPP Resep',
      duration: 'BOM HPP Bahan Baku Per Porsi',
      schedule: 'Fitur Order Meja & Cetak Struk Dapur',
      rating: '4.95/5 (1.500+ Kuliner)',
      description: 'Hitung HPP bahan baku (BOM) presisi hingga ke gramasi gula & bumbu per porsi. Stok bahan berkurang otomatis tiap porsi terjual. Bebas bon bocor.',
      tools: ['HPP Resep BOM', 'Print Struk Dapur', 'QR Order Meja', 'Stok Bahan Baku'],
      originalPrice: 'Rp 149.000',
      discountPrice: 'Rp 49.000',
      installment: 'Langganan Rp 49rb/bln',
      badge: '🔥 Paling Laris Kuliner',
      badgeColor: 'bg-rose-500 text-white',
      featured: true,
      syllabusPhases: [
        'Modul 1: Penginputan Resep & HPP Bahan Baku Per Porsi',
        'Modul 2: Penataan Meja, Order QR & Transaksi Kasir POS',
        'Modul 3: Otomatisasi Pengurangan Stok Bahan di Dapur',
        'Modul 4: Laporan Harian Food Cost & Margin Keuntungan'
      ]
    },
    {
      id: 'print-pos',
      category: 'printing',
      title: 'Solusi Percetakan & Digital Print',
      level: 'Kalkulator HPP Cetak & Kasir Custom',
      duration: 'Hitung HPP Kertas, Tinta & Finishing',
      schedule: 'Fitur Harga Variatif & Diskon Volume',
      rating: '4.92/5 (820+ Percetakan)',
      description: 'Solusi khusus percetakan offset & digital. Hitung otomatis HPP per lembar/meter persegi, biaya tinta, bahan terbuang (wastage), dan nota DP pesanan.',
      tools: ['Kalkulator HPP Cetak', 'Nota DP & Pelunasan', 'Stok Kertas & Tinta', 'Diskon Grosir Volume'],
      originalPrice: 'Rp 149.000',
      discountPrice: 'Rp 49.000',
      installment: 'Langganan Rp 49rb/bln',
      badge: '🎨 Khusus Percetakan',
      badgeColor: 'bg-purple-600 text-white',
      featured: true,
      syllabusPhases: [
        'Modul 1: Setting Rumus HPP Kertas, Tinta & Wastage Per Meter',
        'Modul 2: Pembuatan Nota Order SPK Percetakan & Pencatatan DP',
        'Modul 3: Tracking Status Order Cetak (Antrian -> Proses -> Selesai)',
        'Modul 4: Laporan Profit Harian Per Mesin Cetak'
      ]
    },
    {
      id: 'retail-pos',
      category: 'retail',
      title: 'Solusi Retail & Toko Kelontong',
      level: 'Aplikasi Kasir POS & Margin Guard',
      duration: 'Setup 5 Menit Langsung Pakai',
      schedule: 'Support Printer Bluetooth & Barcode Scanner',
      rating: '4.9/5 (2.400+ Toko)',
      description: 'Lacak stok barcode puluhan ribu produk, dapatkan warning produk mengendap (anti dead-stock), cetak struk thermal, dan catat utang pelanggan dengan rapi.',
      tools: ['Kasir Barcode', 'Peringatan Dead-Stock', 'Buku Utang Digital', 'Laporan Harian WA'],
      originalPrice: 'Rp 149.000',
      discountPrice: 'Rp 49.000',
      installment: 'Langganan Rp 49rb/bln',
      badge: '⚡ Ritel & Warung',
      badgeColor: 'bg-emerald-600 text-white',
      featured: true,
      syllabusPhases: [
        'Modul 1: Import Katalog Barang via Barcode / Excel (5 Menit)',
        'Modul 2: Setting Kasir POS & Hubungkan Printer Thermal Bluetooth',
        'Modul 3: Aktivasi Logaritma AI Margin Guard & Alert Dead-Stock',
        'Modul 4: Manajemen Utang Pelanggan & Laporan Profit Bersih'
      ]
    },
    {
      id: 'jasa-pos',
      category: 'jasa',
      title: 'Solusi Jasa & Laundry Service',
      level: 'Tracking Nota WA & Stok Deterjen',
      duration: 'Kiloan, Satuan & Express',
      schedule: 'Nota WhatsApp & Rak Simpan',
      rating: '4.88/5 (950+ Jasa)',
      description: 'Lacak posisi pakaian cucian & order jasa pelanggan, kirim nota otomatis via WhatsApp saat pekerjaan selesai, dan hitung pemakaian HPP bahan.',
      tools: ['Nota WA Otomatis', 'Tracking Rak Simpan', 'HPP Deterjen/Bahan', 'Laporan Kasir'],
      originalPrice: 'Rp 149.000',
      discountPrice: 'Rp 49.000',
      installment: 'Langganan Rp 49rb/bln',
      badge: '🧺 Laundry & Jasa',
      badgeColor: 'bg-blue-600 text-white',
      featured: true,
      syllabusPhases: [
        'Modul 1: Penerimaan Order Kiloan/Satuan & Kirim Nota WA',
        'Modul 2: Penentuan Nomor Rak & Status Progress Washing',
        'Modul 3: Otomatisasi HPP Deterjen & Parfum Per Kilo',
        'Modul 4: Laporan Kasir & Pengambilan Cucian Pelanggan'
      ]
    }
  ];

  const filteredPrograms = activeCategory === 'all' 
    ? programs 
    : programs.filter(p => p.category === activeCategory);

  return (
    <section id="programs" className="py-20 md:py-28 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            Solusi Paket Logaritma.id — Flat Rp 49rb/bulan
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Pilih Solusi Kasir & Margin Guard <span className="text-gradient-blue-emerald">Sesuai Jenis Bisnismu</span>
          </h2>
          <p className="text-slate-600 text-base">
            4 Solusi Utama UMKM: Kuliner, Percetakan, Retail, & Jasa. Semua paket seharga flat Rp 49.000 / bulan.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 border ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/20'
                    : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:border-slate-300'
                }`}
              >
                {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Program Cards Grid - 4 Columns grid or 2x2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPrograms.map((program) => (
            <div
              key={program.id}
              className="group bg-white rounded-3xl border border-slate-200/80 hover:border-blue-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative hover:-translate-y-1"
            >
              
              {/* Badge */}
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full ${program.badgeColor} shadow-sm`}>
                    {program.badge}
                  </span>
                  <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {program.rating}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors mb-2 leading-snug">
                  {program.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                  {program.description}
                </p>

                {/* Duration & Schedule tags */}
                <div className="space-y-1.5 text-xs text-slate-500 mb-5 border-t border-b border-slate-100 py-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-semibold text-slate-700">{program.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{program.schedule}</span>
                  </div>
                </div>

                {/* Tools Stack Chips */}
                <div>
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Fitur Unggulan Modul</div>
                  <div className="flex flex-wrap gap-1.5">
                    {program.tools.map((t) => (
                      <span key={t} className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200/60">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price & Action Footer */}
              <div className="p-6 pt-4 bg-slate-50/80 border-t border-slate-100">
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <div className="text-xs text-slate-400 line-through font-medium">{program.originalPrice}</div>
                    <div className="text-2xl font-extrabold text-slate-900">{program.discountPrice}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-200 inline-block">
                      {program.installment}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => window.location.href = '/auth/daftar'}
                    className="btn-gradient-primary w-full text-xs font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md"
                  >
                    <span>Coba Gratis 14 Hari</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onOpenCurriculum(program)}
                    className="w-full text-xs font-semibold py-2 text-slate-700 hover:text-blue-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
                  >
                    Lihat Rincian Modul
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
