'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, ChevronDown, ChevronUp, BrainCircuit } from 'lucide-react';

export default function AIBanner() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedState = localStorage.getItem('ubos_ai_banner_collapsed');
    if (savedState === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('ubos_ai_banner_collapsed', String(newState));
  };

  if (!mounted) return null; // Avoid hydration mismatch

  // Determine insight based on pathname
  let insightTitle = "Insight Harian";
  let insightDesc = "Logaritma AI siap membantu menganalisa dan mengembangkan bisnis Anda secara otomatis.";

  if (pathname.includes('/pos')) {
    insightTitle = "Rekomendasi Up-Sell";
    insightDesc = "Gunakan fitur rekomendasi menu cerdas untuk menawarkan produk tambahan kepada pelanggan Anda hari ini.";
  } else if (pathname.includes('/inventory')) {
    insightTitle = "Prediksi Stok AI";
    insightDesc = "Peringatan: Stok 'Kopi Susu' diprediksi habis pada akhir pekan ini. Pertimbangkan untuk segera melakukan restock.";
  } else if (pathname.includes('/crm')) {
    insightTitle = "Analisis Pelanggan";
    insightDesc = "Ada 5 pelanggan loyal yang belum berkunjung bulan ini. Tawarkan promo khusus melalui WhatsApp untuk menarik mereka kembali.";
  } else if (pathname.includes('/finance')) {
    insightTitle = "Pola Keuangan";
    insightDesc = "Pola pengeluaran minggu ini menunjukkan peningkatan 15% pada biaya operasional. Evaluasi kembali pembelian stok Anda.";
  } else if (pathname.includes('/online-orders')) {
    insightTitle = "Pesanan Online";
    insightDesc = "Waktu respons pesanan Anda sangat baik! Pertahankan rata-rata waktu proses di bawah 5 menit untuk meningkatkan rating toko.";
  } else if (pathname === '/member' || pathname.match(/^\/ubos\/[^\/]+\/[^\/]+$/)) {
    // Dashboard
    insightTitle = "Capai Target Bulan Ini";
    insightDesc = "Tentukan target profit bersih dan biarkan AI kami memberikan rekomendasi operasional harian.";
  }

  if (isCollapsed) {
    return (
      <div className="w-full bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors z-40 relative" onClick={toggleCollapse}>
        <div className="flex items-center gap-2">
          <BrainCircuit size={16} className="text-[#3B5BDB]" />
          <span className="text-xs font-black text-[#3B5BDB]">LOGARITMA AI ASISTEN</span>
          <span className="text-xs text-slate-500 font-medium ml-2 hidden md:inline-block">- {insightTitle}</span>
        </div>
        <button className="text-slate-400 hover:text-slate-600 rounded-full p-1 bg-slate-100">
          <ChevronDown size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-blue-50 to-emerald-50 border-b border-slate-200 p-4 relative transition-all duration-300 z-40">
      <button 
        onClick={toggleCollapse}
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-white/50 rounded-full p-1 shadow-sm transition-colors"
      >
        <ChevronUp size={16} />
      </button>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-blue-100">
          <BrainCircuit size={24} className="text-[#3B5BDB]" />
        </div>
        <div className="flex-1 pr-8">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-slate-900 text-sm md:text-base">{insightTitle}</h3>
            <span className="bg-[#3B5BDB]/10 text-[#3B5BDB] text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
              <Sparkles size={10} /> AI Asisten
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed max-w-2xl">
            {insightDesc}
          </p>
        </div>
      </div>
    </div>
  );
}
