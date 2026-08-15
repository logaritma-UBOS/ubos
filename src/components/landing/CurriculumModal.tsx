'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, Download, Code, Layers, FileText, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function CurriculumModal({ program, onClose, onEnroll }) {
  if (!program) return null;

  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const defaultPhases = [
    {
      phase: 'Fase 1 — Import Katalog & Penetapan HPP Presisi',
      duration: 'Hari ke-1',
      topics: [
        'Import otomatis puluhan ribu produk via Excel / Barcode Scanner HP',
        'Penetapan HPP Bahan Baku, packaging, ongkir, & penyusutan per unit',
        'Setting kunci Margin Guard minimal (cegah jual rugi otomatis)'
      ],
      project: 'Output: Katalog & HPP Presisi Terkunci 100%'
    },
    {
      phase: 'Fase 2 — Setup Kasir POS & Koneksi Printer Thermal',
      duration: 'Hari ke-2',
      topics: [
        'Koneksi Kasir POS ke Printer Thermal Bluetooth / USB',
        'Aktifkan sistem pembayaran QRIS gratis tanpa biaya MDR tinggi',
        'Setting struk kustom (Logo toko, alamat, pesan terima kasih WA)'
      ],
      project: 'Output: Kasir POS Kilat Siap Transaksi'
    },
    {
      phase: 'Fase 3 — Aktivasi Logaritma AI Margin Guard & Dead-Stock',
      duration: 'Hari ke-3',
      topics: [
        'Pemasangan Sensor AI untuk deteksi barang laku lambat (>30 hari)',
        'Notifikasi peringatan stok minimum & rekomendasi promo bundling',
        'Otomatisasi catatan utang pelanggan & pencatatan kas masuk/keluar'
      ],
      project: 'Output: Sistem Anti Dead-Stock Bekerja 24/7'
    },
    {
      phase: 'Fase 4 — Laporan Profit Bersih & Multi-Cabang Sync',
      duration: 'Hari ke-4 & Seterusnya',
      topics: [
        'Audit laporan rugi-laba real-time bersih tanpa perlu rekap manual',
        'Sinkronisasi stok antar gudang & toko multi-cabang terpusat',
        'Otorisasi supervisi karyawan (cegah manipulasi harga kasir)'
      ],
      project: 'Output: Dashboard Kontrol Finansial Terpusat'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 flex items-start justify-between relative overflow-hidden">
          <div className="space-y-2 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" /> Panduan Rincian Modul Logaritma.id
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{program.title}</h2>
            <p className="text-xs sm:text-sm text-slate-300 font-normal">
              Solusi Operasional Bisnis Berbasis Logaritma AI & Margin Guard {new Date().getFullYear()}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          
          {/* Quick Info Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
            <div>
              <div className="text-slate-400 font-medium">Waktu Implementasi</div>
              <div className="font-bold text-slate-900">5 Menit Onboarding</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Konektivitas</div>
              <div className="font-bold text-slate-900">Offline & Online</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Status Proteksi</div>
              <div className="font-bold text-emerald-600">Margin Guard Active</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Garansi Uji Coba</div>
              <div className="font-bold text-blue-600">14 Hari Gratis</div>
            </div>
          </div>

          {/* Timeline Phases */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>Langkah Onboarding & Alur Kerja Modul</span>
            </h3>

            <div className="space-y-4">
              {defaultPhases.map((phaseItem, index) => (
                <div key={index} className="bg-slate-50 rounded-2xl p-5 border border-slate-200/70 hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-extrabold text-sm text-blue-700">{phaseItem.phase}</span>
                    <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                      {phaseItem.duration}
                    </span>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-600 mb-3">
                    {phaseItem.topics.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                    <span className="font-bold text-slate-800">Target Output Operasional:</span>
                    <span className="font-semibold text-emerald-700">{phaseItem.project}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tools & Mentors Note */}
          <div className="bg-blue-50/70 border border-blue-200 p-5 rounded-2xl text-xs space-y-2 text-blue-900">
            <div className="font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Pendampingan Setup Gratis Oleh Tim Specialist Logaritma.id</span>
            </div>
            <p className="text-blue-800 font-normal leading-relaxed">
              Tim support Logaritma.id siap membantu input data awal toko Anda secara gratis melalui WhatsApp atau panggilan video.
            </p>
          </div>

        </div>

        {/* Modal Footer CTAs */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={handleDownload}
            className="w-full sm:w-auto text-xs font-bold px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>{downloadSuccess ? '✓ PDF Modul Terunduh!' : 'Unduh Panduan Fitur PDF'}</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="text-xs font-semibold px-4 py-3 text-slate-600 hover:text-slate-900"
            >
              Tutup
            </button>
            <button
              onClick={() => {
                onClose();
                onEnroll(program.title);
              }}
              className="btn-gradient-primary w-full sm:w-auto text-xs font-extrabold px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Aktivasi Uji Coba Gratis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
