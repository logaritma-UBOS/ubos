'use client';

import { useSearchParams } from 'next/navigation';
import { Rocket, Sparkles, Megaphone, Brush, Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'meta-ads';

  const serviceData: Record<string, { title: string; icon: any; color: string; bg: string }> = {
    'meta-ads': {
      title: 'Jasa Meta Ads',
      icon: Megaphone,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    'branding': {
      title: 'Branding & Desain',
      icon: Brush,
      color: 'text-fuchsia-500',
      bg: 'bg-fuchsia-50',
    },
    'hardware': {
      title: 'Produk Pendukung Kasir',
      icon: Printer,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
    }
  };

  const current = serviceData[type] || serviceData['meta-ads'];
  const Icon = current.icon;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto min-h-[70vh] flex flex-col justify-center items-center text-center">
      
      <div className="mb-12 absolute top-24 left-6 md:left-12">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium">
          <ArrowLeft size={18} />
          Kembali
        </button>
      </div>

      <div className="relative mb-8">
        <div className={`w-28 h-28 ${current.bg} rounded-3xl flex items-center justify-center animate-bounce-slow shadow-xl shadow-slate-200/50 relative z-10`}>
          <Icon size={56} className={current.color} />
        </div>
        <div className="absolute -top-4 -right-4 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center z-20 animate-spin-slow">
          <Sparkles size={20} className="text-amber-500" />
        </div>
      </div>

      <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
        {current.title}
      </h1>
      
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-transparent bg-clip-text text-xl md:text-2xl font-black uppercase tracking-widest mb-6">
        Coming Soon
      </div>

      <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed mb-10">
        Fitur dan layanan ini sedang dalam tahap pengembangan oleh <span className="font-bold text-slate-700">Tim Logaritma</span>. Kami sedang mempersiapkan pengalaman terbaik untuk membantu melejitkan bisnis Anda!
      </p>

      <div className="inline-flex items-center gap-3 bg-slate-50 border border-slate-200 px-6 py-3 rounded-full">
        <Rocket size={20} className="text-[#4F75FF]" />
        <span className="text-slate-600 font-medium">Nantikan peluncuran resminya!</span>
      </div>

    </div>
  );
}
