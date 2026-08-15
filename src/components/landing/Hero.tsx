'use client';

import React from 'react';
import { 
  Sparkles, ArrowRight, CheckCircle2, 
  ChevronRight, Calculator
} from 'lucide-react';

export default function Hero({ onOpenEnrollment, onOpenCurriculum }) {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-mesh-glow">
      
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-500/15 via-sky-400/10 to-emerald-400/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Announcement Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200 shadow-sm text-[10px] sm:text-xs font-semibold text-rose-700 hover:border-rose-300 transition-all cursor-default text-center">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="font-extrabold text-rose-800 uppercase tracking-wide leading-snug">
              KHUSUS UNTUK ANDA PEMILIK BISNIS KULINER, PERCETAKAN, RITEL, & JASA YANG RELA BANTING TULANG TIAP HARI...
            </span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.18]">
            Capek Kerja Keras Setiap Hari, Tapi Bisnis Cuma <br className="hidden sm:inline" />
            <span className="text-gradient-blue-emerald">Jalan Di Tempat</span> dan Nggak Pernah Nyampai Target?
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-3xl mx-auto">
            Saatnya tinggalkan cara lama yang cuma bikin pusing! Kenalkan <strong className="text-slate-900 font-bold underline decoration-emerald-400 decoration-2 underline-offset-4">Metode Logaritma</strong> dengan pendekatan <em className="italic font-semibold text-slate-800">Backward Mapping</em>—sistem yang membantu Anda menembus target bisnis dari <strong>Outcome hingga Impact nyata</strong>, bukan sekadar jualan tanpa arah.
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onOpenEnrollment('Uji Coba Gratis Logaritma POS')}
              className="btn-gradient-primary w-full sm:w-auto text-sm font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 group"
            >
              <span>Coba Demo Kasir Gratis</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onOpenCurriculum({ title: 'Solusi Modul Kasir & Margin Guard Logaritma.id', category: 'Semua Modul' })}
              className="w-full sm:w-auto text-sm font-semibold px-7 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 hover:border-slate-300 shadow-sm flex items-center justify-center gap-2 transition-all"
            >
              <Calculator className="w-4 h-4 text-blue-600" />
              <span>Hitung HPP Bisnismu</span>
            </button>
          </div>

          {/* Key Value Micro Badges */}
          <div className="pt-4 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Deteksi Anti Dead-Stock AI</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Hitung HPP & Biaya Tersembunyi Presisi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Kasir POS Offline & QRIS Gratis</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
