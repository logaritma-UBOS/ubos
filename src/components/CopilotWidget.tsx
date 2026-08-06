'use client';

import { useState } from 'react';
import { Sparkles, Activity, Target, ArrowRight, Loader2, Bot, WrenchIcon, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

type WidgetState = 'idle' | 'loading' | 'result' | 'maintenance';

export default function CopilotWidget({ merchantId }: { merchantId: string }) {
  const [state, setState] = useState<WidgetState>('idle');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [maintenanceMsg, setMaintenanceMsg] = useState('');

  const requestAnalysis = async () => {
    setState('loading');
    setAnalysis(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch('/api/copilot/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ merchantId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memuat Copilot');

      setAnalysis(data.result);
      setState('result');
    } catch (err: any) {
      setMaintenanceMsg(err.message || 'Terjadi gangguan teknis pada AI.');
      setState('maintenance');
    }
  };

  const getStatusColor = (text: string) => {
    if (text.includes('On-Track')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (text.includes('Darurat')) return 'bg-rose-100 text-rose-700 border-rose-200';
    return 'bg-amber-100 text-amber-700 border-amber-200';
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 md:p-8 rounded-3xl border border-indigo-900/50 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Bot size={120} />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="text-emerald-400" size={24} />
            <h2 className="text-2xl font-black text-white">Logaritma AI Copilot</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Asisten AI pribadi yang menganalisa performa penjualan hari ini, mengecek HPP, dan memberikan langkah strategis instan untuk mengamankan profit harian Anda.
          </p>
        </div>

        {(state === 'idle' || state === 'result') && (
          <button
            onClick={requestAnalysis}
            className="shrink-0 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <Target size={20} />
            {state === 'result' ? 'Perbarui Analisa' : 'Minta Solusi Copilot Hari Ini'}
          </button>
        )}

        {state === 'loading' && (
          <div className="shrink-0 flex items-center gap-3 text-emerald-400 font-bold text-sm">
            <Loader2 size={20} className="animate-spin" />
            AI sedang menganalisa toko Anda...
          </div>
        )}
      </div>

      {/* ── MAINTENANCE STATE ── */}
      {state === 'maintenance' && (
        <div className="mt-8 bg-amber-500/10 border border-amber-400/30 rounded-2xl p-6 animate-in slide-in-from-bottom-4 duration-500 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/20 flex items-center justify-center shrink-0 animate-pulse">
              <WrenchIcon size={28} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-white font-black text-lg leading-tight">
                🔧 AI Logaritma Sedang Maintenance
              </h3>
              <p className="text-amber-200/80 text-sm mt-1 leading-relaxed">
                Sistem AI kami sedang diperbarui untuk memberikan analisa yang lebih akurat. Silakan coba kembali beberapa saat lagi.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 bg-slate-900/50 rounded-xl px-4 py-3">
            <Clock size={14} className="text-slate-400 shrink-0" />
            <p className="text-slate-400 text-xs leading-relaxed">
              Estimasi selesai: <span className="text-slate-300 font-bold">beberapa menit lagi</span>. Tim teknisi Logaritma sudah mengetahui dan sedang memperbaiki.
            </p>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={requestAnalysis}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
            >
              <Loader2 size={13} /> Coba Lagi Sekarang
            </button>
          </div>
        </div>
      )}

      {/* ── RESULT STATE ── */}
      {state === 'result' && analysis && (
        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 animate-in slide-in-from-bottom-4 duration-500 relative z-10">
          <div className="space-y-4 text-white text-sm">
            {analysis.split('\n').map((line, i) => {
              if (line.includes('Status Target:')) {
                return (
                  <div key={i} className="flex items-center gap-3 mb-4">
                    <span className="font-bold text-slate-300 uppercase tracking-wider text-xs">Status Hari Ini</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-black border ${getStatusColor(line)}`}>
                      {line.replace('📊 Status Target:', '').trim()}
                    </span>
                  </div>
                );
              }
              if (line.includes('Analisa Singkat:')) {
                return (
                  <div key={i} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                    <div className="font-bold text-emerald-400 mb-1 flex items-center gap-2">
                      <Activity size={16} /> Analisa Eksekutif
                    </div>
                    <p className="text-slate-200 leading-relaxed">
                      {line.replace('🔍 Analisa Singkat:', '').trim()}
                    </p>
                  </div>
                );
              }
              if (line.includes('Rekomendasi Eksekusi:')) {
                return (
                  <div key={i} className="pt-4">
                    <div className="font-bold text-emerald-400 mb-3 flex items-center gap-2">
                      <ArrowRight size={16} /> Action Plan Detik Ini
                    </div>
                  </div>
                );
              }
              if (line.trim().startsWith('1.') || line.trim().startsWith('2.') || line.trim().startsWith('3.') || line.trim().startsWith('-')) {
                return (
                  <div key={i} className="flex items-start gap-3 ml-2 mb-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0"></div>
                    <p className="text-slate-200 leading-relaxed">{line.replace(/^[1-3]\.\s|- /, '')}</p>
                  </div>
                );
              }
              return line.trim() ? <p key={i} className="text-slate-300">{line}</p> : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
