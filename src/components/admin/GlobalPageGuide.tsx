'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Lightbulb, X, Info, CheckCircle2 } from 'lucide-react';

const PAGE_GUIDES: Record<string, { title: string, purpose: string, actions: string[], statusInfo?: string }> = {
  '/admin': {
    title: 'Ringkasan Bisnis',
    purpose: 'Melihat gambaran besar kesehatan bisnis, operasional, dan pendapatan.',
    actions: [
      '1. Pantau status server secara rutin.',
      '2. Cek jumlah pengunjung dan konversi toko.',
      '3. Awasi pertumbuhan MRR bulan ini.'
    ],
    statusInfo: 'Uptime: Persentase server hidup. MRR: Estimasi pendapatan rutin per bulan.'
  },
  '/admin/founder/workspace': {
    title: 'Ruang Kerja Founder',
    purpose: 'Tempat kolaborasi cepat antar founder dan input manual calon prospek.',
    actions: [
      '1. Tambahkan catatan ide atau instruksi penting.',
      '2. Input manual prospek atau import CSV.',
      '3. Hubungi prospek langsung via Fonnte.'
    ],
    statusInfo: 'Status Hasil merepresentasikan perkembangan lead (Baru, Trial, Premium, atau Lost).'
  },
  '/admin/founder/treasury': {
    title: 'Kas & Bagi Hasil',
    purpose: 'Pusat kontrol modal operasional dan perhitungan royalti bersih dari Mayar.',
    actions: [
      '1. Pantau sisa modal disetor (Kas awal).',
      '2. Catat biaya operasional (OPEX) bulanan.',
      '3. Pantau saldo siap tarik dari Revenue Mayar.'
    ],
    statusInfo: 'Royalti otomatis dihitung berdasarkan persen kepemilikan dikali sisa saldo bersih Mayar setelah dipotong OPEX 20%.'
  },
  '/admin/tech/ubos': {
    title: 'Fitur Kasir & Toko',
    purpose: 'Melihat tingkat pemakaian modul UBOS oleh merchant.',
    actions: [
      '1. Analisis modul apa yang paling sering dipakai.',
      '2. Periksa limit resource yang dikonsumsi.',
      '3. Rencanakan optimasi jika ada bottleneck.'
    ]
  },
  '/admin/tech/ai-copilot': {
    title: 'Atur Otak AI',
    purpose: 'Mengatur prompt dan parameter untuk AI Copilot Logaritma.',
    actions: [
      '1. Sesuaikan persona agen AI.',
      '2. Update instruksi basis pengetahuan.',
      '3. Pantau performa balasan AI.'
    ]
  },
  '/admin/tech/health': {
    title: 'Kesehatan Server',
    purpose: 'Memantau uptime Supabase, API eksternal, dan Vercel.',
    actions: [
      '1. Cek jika ada API yang sering timeout.',
      '2. Pastikan webhook Mayar & Fonnte aktif.',
      '3. Tangani error log secepatnya.'
    ]
  },
  '/admin/growth/funnel': {
    title: 'Arus Calon Pelanggan',
    purpose: 'Memantau corong konversi dari kunjungan hingga berbayar.',
    actions: [
      '1. Identifikasi di mana prospek paling banyak berhenti.',
      '2. Optimasi halaman dengan tingkat bounce rate tinggi.',
      '3. Jalankan kampanye retargeting.'
    ]
  },
  '/admin/growth/affiliate': {
    title: 'Bagi Hasil Mitra',
    purpose: 'Mengatur jaringan affiliate dan komisi mereka.',
    actions: [
      '1. Setujui permintaan pendaftaran affiliate baru.',
      '2. Pantau jumlah klik dari link mereka.',
      '3. Verifikasi jumlah closing dari setiap mitra.'
    ],
    statusInfo: 'Komisi: Rp 19.600 flat per closing valid.'
  },
  '/admin/growth/store': {
    title: 'Toko Alat & Layanan',
    purpose: 'Menjual hardware (printer, scanner) & layanan digital.',
    actions: [
      '1. Pantau pesanan produk fisik masuk.',
      '2. Teruskan pesanan ke vendor afiliasi Shopee.',
      '3. Proses layanan digital (Set up ads/foto).'
    ]
  },
  '/admin/ops/merchants': {
    title: 'Daftar Toko & Kasir',
    purpose: 'Database seluruh tenant yang menggunakan ekosistem UBOS.',
    actions: [
      '1. Pantau merchant baru yang mendaftar.',
      '2. Hubungi merchant yang masa trialnya hampir habis.',
      '3. Berikan dukungan teknis jika ada keluhan.'
    ],
    statusInfo: 'Trial: Sedang masa coba. Premium: Berbayar aktif. Expired: Trial/Langganan habis.'
  },
  '/admin/ops/wa-crm': {
    title: 'Riwayat Pesan WA',
    purpose: 'Memantau log aktivitas pengiriman pesan otomatis via Fonnte.',
    actions: [
      '1. Cek pesan broadcast yang gagal terkirim.',
      '2. Pantau balasan otomatis dari sistem.',
      '3. Sesuaikan template pesan jika konversi rendah.'
    ]
  },
  '/admin/ops/tickets': {
    title: 'Pusat Bantuan Toko',
    purpose: 'Menangani keluhan dan pertanyaan dari merchant.',
    actions: [
      '1. Balas tiket dengan status "Open" secepatnya.',
      '2. Eskalasi tiket ke tim teknis jika ada bug.',
      '3. Tutup tiket jika masalah selesai.'
    ],
    statusInfo: 'Open: Butuh tanggapan. In Progress: Sedang dikerjakan. Resolved: Selesai.'
  },
  '/admin/finance/mrr': {
    title: 'Pendapatan Langganan',
    purpose: 'Memantau metrik MRR (Monthly Recurring Revenue) dari biaya langganan.',
    actions: [
      '1. Pantau tren pendapatan bulanan.',
      '2. Analisis rasio churn (merchant berhenti berlangganan).',
      '3. Proyeksikan arus kas bulan depan.'
    ]
  },
  '/admin/finance/affiliate-payout': {
    title: 'Pencairan Komisi',
    purpose: 'Mengelola permintaan penarikan dana dari mitra affiliate.',
    actions: [
      '1. Verifikasi saldo mitra sudah mencapai batas.',
      '2. Transfer secara manual atau via Mayar.',
      '3. Tandai status menjadi Paid dengan melampirkan bukti.'
    ],
    statusInfo: 'Pending: Menunggu ditransfer. Processed: Selesai ditransfer. Rejected: Ada indikasi fraud.'
  },
  '/admin/finance/streams': {
    title: '5 Sumber Uang Masuk',
    purpose: 'Membedah asal muasal uang yang masuk ke Logaritma.',
    actions: [
      '1. Evaluasi proporsi langganan vs hardware vs jasa.',
      '2. Identifikasi layanan yang paling profit.',
      '3. Lacak history transaksi kas manual.'
    ]
  }
};

export default function GlobalPageGuide() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const guide = PAGE_GUIDES[pathname];
  if (!guide) return null;

  return (
    <>
      <div className="flex justify-end mb-4 relative z-40">
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold transition-colors shadow-sm"
        >
          <Lightbulb size={14} className="text-amber-400" />
          Panduan Halaman Ini
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="bg-slate-950 p-5 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Lightbulb size={20} className="text-amber-400" />
                <h2 className="text-lg font-black text-white">{guide.title}</h2>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Info size={12} /> Tujuan Halaman
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {guide.purpose}
                </p>
              </div>

              <div>
                <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Yang Harus Dilakukan Tim
                </h3>
                <ul className="space-y-2">
                  {guide.actions.map((act, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-blue-500 shrink-0 mt-0.5">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {guide.statusInfo && (
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                  <h3 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">
                    Arti Status / Data
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {guide.statusInfo}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/30 text-center">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
              >
                Mengerti
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
