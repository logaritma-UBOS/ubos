'use client';

import { useState, useEffect } from 'react';
import { Target, TrendingUp, Wallet, AlertCircle, Sparkles, Calendar } from 'lucide-react';

export default function TargetCycleProgress({ target, budget, startDate, endDate, currentOmzet, currentProfit, currentSpending }: any) {
  const [daysLeft, setDaysLeft] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    setDaysLeft(Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24))));
    
    // Progres berdasarkan pencapaian profit terhadap target
    const p = Math.min(Math.round((currentProfit / target) * 100), 100);
    setProgress(p);
  }, [currentProfit, target, endDate]);

  const isExpired = daysLeft === 0;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Target size={20} /></div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Siklus Target Aktif</h2>
            <p className="text-xs text-slate-500">{startDate} s/d {endDate}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${isExpired ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
          {isExpired ? 'Periode Berakhir' : `${daysLeft} Hari Lagi`}
        </div>
      </div>

      {/* Progress Bar Utama */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-500">Pencapaian Profit</span>
          <span className="text-blue-600">{progress}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
          <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Grid Data */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-50 p-3 rounded-xl">
          <p className="text-[9px] font-bold text-slate-400 uppercase">Omzet</p>
          <p className="text-xs font-bold text-slate-900 truncate">Rp {(currentOmzet/1000000).toFixed(1)}jt</p>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl">
          <p className="text-[9px] font-bold text-slate-400 uppercase">Laba Bersih</p>
          <p className="text-xs font-bold text-slate-900 truncate">Rp {(currentProfit/1000000).toFixed(1)}jt</p>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl">
          <p className="text-[9px] font-bold text-slate-400 uppercase">Pengeluaran</p>
          <p className="text-xs font-bold text-slate-900 truncate">Rp {(currentSpending/1000000).toFixed(1)}jt</p>
        </div>
      </div>

      {/* AI Back-Mapping Evaluation */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 flex gap-3">
        <Sparkles size={24} className="text-blue-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-blue-900 uppercase">Evaluasi Logaritma</h4>
          <p className="text-[11px] text-blue-700 mt-1 leading-relaxed">
            {progress > 70 ? "Performa sangat baik! Pertahankan rasio belanja agar margin tetap terjaga." : 
             progress > 30 ? "Sedang berjalan. Fokus pada peningkatan volume penjualan untuk mencapai target." : 
             "Perlu akselerasi. Cek kembali efisiensi modal dan strategi harga Anda."}
          </p>
        </div>
      </div>
    </div>
  );
}