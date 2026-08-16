'use client';

import React from 'react';
import { 
  ShieldCheck, AlertTriangle, ShoppingBag, Bot, LineChart, Store,
  Sparkles, CheckCircle, ArrowUpRight, Zap
} from 'lucide-react';
import FeatureDetailModal from './FeatureDetailModal';

export default function BentoGrid({ onOpenEnrollment }) {
  const [selectedFeature, setSelectedFeature] = React.useState<any>(null);

  const bentoItems = [
    {
      id: 1,
      colSpan: 'lg:col-span-2',
      badge: 'Margin Guard Technology',
      title: 'Kunci Margin Keuntungan & Presisi HPP Asli',
      desc: 'Bukan sekadar mencatat harga beli. Logaritma.id secara presisi menghitung biaya bahan baku tersembunyi, packaging, ongkir, penyusutan, hingga biaya operasional per unit sehingga Anda tidak pernah jual rugi.',
      icon: ShieldCheck,
      accent: 'from-blue-600 to-sky-500',
      bgGlow: 'bg-blue-500/10',
      stats: 'Akurasi HPP 99.8%',
      highlightTag: 'Margin Protektor'
    },
    {
      id: 2,
      colSpan: 'lg:col-span-1',
      badge: 'Anti Dead-Stock',
      title: 'Deteksi Dini Dead-Stock AI',
      desc: 'Sistem pintar mendeteksi barang laku lambat dan memberi rekomendasi strategi promo bundling sebelum modal Anda mengendap di gudang.',
      icon: AlertTriangle,
      accent: 'from-emerald-500 to-teal-400',
      bgGlow: 'bg-emerald-500/10',
      stats: 'Hemat Jutaan Modal',
      highlightTag: 'Bebas Stok Mati'
    },
    {
      id: 3,
      colSpan: 'lg:col-span-1',
      badge: 'Kasir POS Super Kilat',
      title: 'Aplikasi Kasir POS & QRIS Instant',
      desc: 'Transaksi kasir cepat dalam hitungan detik, koneksi ke printer thermal bluetooth, scan barcode HP, dan terima pembayaran QRIS instant.',
      icon: ShoppingBag,
      accent: 'from-emerald-600 to-blue-600',
      bgGlow: 'bg-emerald-500/10',
      stats: 'Offline & Online Sync',
      highlightTag: 'Respon 0.1 Detik'
    },
    {
      id: 4,
      colSpan: 'lg:col-span-2',
      badge: 'Logaritma AI Copilot',
      title: 'Logaritma AI: Asisten Rekomendasi Bisnis 24/7',
      desc: 'Layaknya memiliki konsultan bisnis pribadi. AI Logaritma menganalisis jam ramai toko, produk mana yang harus di-restok, dan strategi diskon mana yang paling menguntungkan.',
      icon: Bot,
      accent: 'from-sky-500 to-indigo-600',
      bgGlow: 'bg-sky-500/10',
      stats: 'AI Business Consultant',
      highlightTag: 'Smart Advisor'
    },
    {
      id: 5,
      colSpan: 'lg:col-span-1',
      badge: 'Laporan Finansial',
      title: 'Audit Profit Bersih Real-Time',
      desc: 'Jangan tertipu omset tinggi. Logaritma.id langsung menampilkan profit bersih dingin yang siap dimasukkan ke kantong secara otomatis.',
      icon: LineChart,
      accent: 'from-emerald-500 to-green-600',
      bgGlow: 'bg-emerald-500/10',
      stats: 'Real Net Profit Audit',
      highlightTag: 'Bebas Rekap Manual'
    },
    {
      id: 6,
      colSpan: 'lg:col-span-2',
      badge: 'Multi-Store Expansion',
      title: 'Manajemen Multi-Cabang & Inventori Terpusat',
      desc: 'Pantau 10+ toko, warung, atau cabang percetakan Anda hanya dari satu dashboard HP/Laptop. Atur hak akses karyawan dan stok transfer antar gudang secara transparan.',
      icon: Store,
      accent: 'from-blue-600 to-emerald-500',
      bgGlow: 'bg-blue-500/10',
      stats: 'Multi-Branch Ready',
      highlightTag: 'Kontrol Terpusat'
    }
  ];

  return (
    <section id="bento" className="py-20 md:py-28 bg-white relative">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Keunggulan Logaritma UBOS (UMKM Operating System)
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Dirancang Khusus Untuk Melindungi <br />
            <span className="text-gradient-blue-emerald">Margin & Modal Bisnis UMKM</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Kami menggabungkan kemudahan kasir POS modern dengan kecerdasan Logaritma AI untuk memastikan bisnis Anda tidak sekadar berjualan tanpa arah.
          </p>
        </div>

        {/* Bento Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {bentoItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`${item.colSpan} group relative rounded-3xl bg-slate-50/70 hover:bg-white border border-slate-200/70 hover:border-blue-300 shadow-sm hover:shadow-xl transition-all duration-300 p-7 md:p-8 flex flex-col justify-between overflow-hidden hover:-translate-y-1`}
              >
                {/* Background Ambient Glow on Hover */}
                <div className={`absolute top-0 right-0 w-48 h-48 rounded-full ${item.bgGlow} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -z-10`} />

                <div>
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white to-slate-100 border border-slate-200/80 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-blue-600 group-hover:text-emerald-600 transition-colors" />
                    </div>

                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-slate-200/60 text-slate-700 group-hover:bg-emerald-100 group-hover:text-emerald-800 transition-colors">
                      {item.highlightTag}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors mb-3 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>

                {/* Footer Stat / Action */}
                <div className="mt-8 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    {item.stats}
                  </span>
                  <button 
                    onClick={() => setSelectedFeature(item)}
                    className="font-bold text-blue-600 hover:text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition-all"
                  >
                    <span>Pelajari Fitur</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Highlight Box */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-xl font-extrabold">Ingin Tahu Berapa HPP Asli & Profit Bersih Tokomu?</h4>
            <p className="text-sm text-blue-100 font-normal">Dapatkan audit margin gratis bersama Konsultan Bisnis Logaritma.id.</p>
          </div>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-chat-widget'))}
            className="whitespace-nowrap px-6 py-3.5 bg-white text-slate-900 hover:bg-slate-100 text-xs font-extrabold rounded-2xl shadow-lg transition-all transform active:scale-95 hover:scale-105"
          >
            Konsultasi HPP Gratis →
          </button>
        </div>

      </div>

      <FeatureDetailModal 
        feature={selectedFeature} 
        isOpen={!!selectedFeature} 
        onClose={() => setSelectedFeature(null)} 
      />

    </section>
  );
}
