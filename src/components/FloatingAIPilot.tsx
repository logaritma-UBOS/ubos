'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, X, ChevronRight, BrainCircuit } from 'lucide-react';
import { useAILogaritmaEngine } from '@/hooks/useAILogaritmaEngine';

export default function FloatingAIPilot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { aiState } = useAILogaritmaEngine();

  // Helper to format currency
  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  // Generate context-aware recommendations
  const getContextualAdvice = () => {
    if (pathname === '/pos') {
      return (
        <div className="space-y-3 text-sm">
          <p className="font-bold text-slate-800">💡 Margin Guard Aktif</p>
          <p className="text-slate-600">
            Sistem saat ini menjaga profit bersih Anda. Jika menggunakan GoFood/GrabFood/ShopeeFood, harga jual otomatis disesuaikan agar Anda tetap mencapai target margin.
          </p>
          <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
            <p className="text-indigo-800 font-bold mb-1">Target Harian</p>
            <p className="text-indigo-900">Profit: {formatIDR(aiState.dailyProfit)}</p>
          </div>
        </div>
      );
    }
    
    if (pathname.includes('/inventory')) {
      return (
        <div className="space-y-3 text-sm">
          <p className="font-bold text-slate-800">⚠️ Analisis Stok Kritis</p>
          {aiState.lowStockItems.length > 0 ? (
            <p className="text-slate-600">
              Ada {aiState.lowStockItems.length} produk/bahan baku yang menipis. Cek HPP sebelum restock untuk memastikan modal belanja tetap efisien.
            </p>
          ) : (
            <p className="text-slate-600">
              Stok bahan baku Anda terpantau aman hari ini.
            </p>
          )}
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 mt-2">
            <p className="text-amber-800 font-bold mb-1">Cegah Pemborosan</p>
            <p className="text-amber-900 text-xs">Pastikan input gramatur resep presisi agar HPP akurat.</p>
          </div>
        </div>
      );
    }

    if (pathname === '/settings') {
      return (
        <div className="space-y-3 text-sm">
          <p className="font-bold text-slate-800">🎯 Kalibrasi Target Profit</p>
          <p className="text-slate-600">
            Target Anda saat ini adalah {formatIDR(aiState.targetProfitMonthly)}. AI Logaritma akan menggunakan angka ini untuk memandu operasional harian Anda di Dashboard.
          </p>
        </div>
      );
    }

    // Default (Dashboard /ubos)
    return (
      <div className="space-y-3 text-sm">
        <p className="font-bold text-slate-800">🚀 Status Performa Hari Ini</p>
        <p className="text-slate-600">
          Total Omzet: <strong>{formatIDR(aiState.dailyOmzet)}</strong> <br/>
          Sisa Budget Belanja: <strong>{formatIDR(aiState.remainingMorningBudget)}</strong>
        </p>
        {aiState.isOverBudget && (
          <div className="bg-rose-50 p-3 rounded-lg border border-rose-100 mt-2">
            <p className="text-rose-800 font-bold mb-1">Peringatan Budget</p>
            <p className="text-rose-900 text-xs">Anda sudah melewati batas belanja pagi! Kurangi pengeluaran agar target profit tercapai.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-6 md:bottom-8 md:right-8 z-50 p-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl hover:shadow-indigo-500/30 transition-transform active:scale-95 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <Sparkles size={24} className="animate-pulse" />
      </button>

      {/* AI Panel Modal/Popover */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 w-[340px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-300">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <BrainCircuit size={20} className="text-blue-200" />
              <h3 className="font-black tracking-wider text-sm">AI LOGARITMA PILOT</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-1 bg-white/10 rounded-full transition-colors">
              <X size={16} />
            </button>
          </div>
          
          <div className="p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <Sparkles size={16} className="text-indigo-600" />
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 flex-1">
                {getContextualAdvice()}
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-100 p-4 bg-slate-50">
            <button 
              onClick={() => setIsOpen(false)}
              className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              Tutup Panel AI
            </button>
          </div>
        </div>
      )}
    </>
  );
}
