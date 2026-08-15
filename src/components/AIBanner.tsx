'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, ChevronDown, ChevronUp, Bot } from 'lucide-react';

interface AIBannerProps {
  actionButton?: React.ReactNode;
}

export default function AIBanner({ actionButton }: AIBannerProps) {
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
      <div className="w-full relative transition-all duration-300 z-40 mb-6">
        <div 
          className="bg-white rounded-xl p-3 px-4 flex items-center justify-between shadow-sm border border-emerald-100 cursor-pointer hover:bg-slate-50 transition-colors group" 
          onClick={toggleCollapse}
        >
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600">
              <Bot size={16} />
            </div>
            <span className="text-emerald-700 font-bold text-sm tracking-tight">AI Logaritma Copilot</span>
          </div>
          <button className="text-slate-400 group-hover:text-emerald-600 bg-slate-100 group-hover:bg-emerald-50 rounded-full p-1 transition-colors">
            <ChevronDown size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative transition-all duration-300 z-40 mb-6 group/banner animate-in fade-in slide-in-from-top-4">
      {/* AI Copilot Premium Styling */}
      <div className="bg-slate-900 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-2xl relative overflow-hidden border border-slate-800">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B5BDB]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 pointer-events-none"></div>

        <button 
          onClick={toggleCollapse}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 rounded-full p-1.5 backdrop-blur-md transition-colors z-30 cursor-pointer"
        >
          <ChevronUp size={16} />
        </button>

        <div className="flex items-start gap-4 md:gap-5 relative z-10">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner border border-white/20 shrink-0 relative group">
            <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full group-hover:bg-emerald-400/40 transition-all duration-500"></div>
            <Bot size={26} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse-slow" />
          </div>
          <div className="flex-1 pr-8">
            <div className="flex items-center gap-2.5 mb-1.5">
              <h3 className="font-bold text-white text-sm md:text-base tracking-wide">{insightTitle}</h3>
              <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[9px] md:text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <Sparkles size={10} /> Copilot
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-2xl font-medium">
              {insightDesc}
            </p>
            {actionButton && (
              <div className="mt-3">
                {actionButton}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
