'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Clock, CheckCircle2, MessageCircle } from 'lucide-react';

export default function FinalCTA({ onOpenEnrollment }) {
  // Live Countdown Timer mock
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 38, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Dark Slate Container */}
        <div className="relative rounded-3xl bg-slate-950 text-white p-8 sm:p-14 border border-slate-800 shadow-2xl overflow-hidden bg-mesh-dark">
          
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-emerald-500/20 via-sky-500/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-3xl mx-auto text-center space-y-8 relative z-10">
            
            {/* Top Batch Alert Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Promo Bebas Biaya Setup HPP & Onboarding 100% Gratis</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Stop Biarkan Profit Bisnismu Bocor. <br />
              <span className="text-gradient-emerald-blue">Saatnya Pakai Sistem Logaritma.id!</span>
            </h2>

            <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed">
              Bergabung bersama 5.000+ pelaku UMKM di seluruh Indonesia. Lindungi margin keuntungan, cegah dead-stock, dan hitung profit bersih otomatis.
            </p>

            {/* Live Countdown Timer */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 max-w-md mx-auto flex items-center justify-between text-center">
              <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Bonus Free Onboarding Setup Berakhir Dalam:</span>
              </div>
              <div className="flex gap-2 font-mono font-extrabold text-sm sm:text-base text-emerald-400">
                <span className="bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">{String(timeLeft.hours).padStart(2, '0')}h</span>
                <span className="text-slate-600">:</span>
                <span className="bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">{String(timeLeft.minutes).padStart(2, '0')}m</span>
                <span className="text-slate-600">:</span>
                <span className="bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">{String(timeLeft.seconds).padStart(2, '0')}s</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={() => window.location.href = '/auth/daftar'}
                className="btn-gradient-primary w-full sm:w-auto text-sm font-extrabold px-9 py-4 rounded-xl flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20"
              >
                <span>Coba Gratis 14 Hari Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => window.location.href = '/auth/daftar'}
                className="w-full sm:w-auto text-sm font-semibold px-7 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 flex items-center justify-center gap-2.5 transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Konsultasi via WhatsApp</span>
              </button>
            </div>

            {/* Guarantee Note */}
            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>14 Hari Uji Coba Gratis • Tanpa Kartu Kredit • Setup HPP Dibantu Tim Specialist</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
