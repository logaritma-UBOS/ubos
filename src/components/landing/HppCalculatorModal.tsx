'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calculator, ArrowRight, Store, Printer, ShoppingBag, Wrench, Percent, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HppCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Category = 'kuliner' | 'percetakan' | 'ritel' | 'jasa';
type Channel = 'offline' | 'shopeefood' | 'grabfood' | 'gofood';

export default function HppCalculatorModal({ isOpen, onClose }: HppCalculatorModalProps) {
  const router = useRouter();
  const [category, setCategory] = useState<Category>('kuliner');
  const [hpp, setHpp] = useState<string>('15000');
  const [margin, setMargin] = useState<number>(40);
  const [channel, setChannel] = useState<Channel>('offline');

  // Helper to format currency
  const formatRp = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Calculations
  const hppValue = parseInt(hpp.replace(/\D/g, '') || '0', 10);
  
  let platformCut = 0;
  if (category === 'kuliner') {
    if (channel === 'shopeefood') platformCut = 0.20;
    if (channel === 'grabfood') platformCut = 0.20;
    if (channel === 'gofood') platformCut = 0.20;
  }

  // Base desired price before platform cut
  const baseDesiredPrice = hppValue + (hppValue * (margin / 100));
  
  // Final Sell Price taking platform cut into account
  // Sell Price = BaseDesiredPrice / (1 - platformCut)
  const sellPrice = platformCut > 0 ? baseDesiredPrice / (1 - platformCut) : baseDesiredPrice;
  
  const platformFee = sellPrice * platformCut;
  const netProfit = sellPrice - platformFee - hppValue;

  const handleHppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setHpp(raw);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          />
          
          <div className="fixed inset-0 pointer-events-none z-[101] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl pointer-events-auto flex flex-col overflow-hidden max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                    <Calculator size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Kalkulator HPP & Margin</h2>
                    <p className="text-xs font-medium text-slate-500">Hitung otomatis harga jual anti rugi</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto hide-scrollbar flex flex-col gap-6">
                
                {/* 1. Category */}
                <div className="space-y-3 shrink-0">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">1. Pilih Kategori Usaha</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'kuliner', label: 'Kuliner', icon: Store },
                      { id: 'percetakan', label: 'Percetakan', icon: Printer },
                      { id: 'ritel', label: 'Ritel', icon: ShoppingBag },
                      { id: 'jasa', label: 'Jasa', icon: Wrench },
                    ].map((cat) => {
                      const Icon = cat.icon;
                      const isActive = category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setCategory(cat.id as Category);
                            if (cat.id !== 'kuliner') setChannel('offline');
                          }}
                          className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                            isActive 
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                              : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <Icon size={20} />
                          <span className="text-xs font-bold">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Inputs */}
                <div className="grid sm:grid-cols-2 gap-5 shrink-0">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <DollarSign size={14}/> Total HPP / Modal Dasar
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</span>
                      <input
                        type="text"
                        value={hppValue.toLocaleString('id-ID')}
                        onChange={handleHppChange}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Percent size={14}/> Target Margin Laba
                      </label>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">
                        {margin}%
                      </span>
                    </div>
                    <div className="pt-2">
                      <input
                        type="range"
                        min="5"
                        max="200"
                        step="5"
                        value={margin}
                        onChange={(e) => setMargin(parseInt(e.target.value))}
                        className="w-full accent-emerald-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
                        <span>5%</span>
                        <span>100%</span>
                        <span>200%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Channels (Only Kuliner) */}
                {category === 'kuliner' && (
                  <div className="space-y-3 shrink-0">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Channel Penjualan</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'offline', label: 'Toko Offline (0%)' },
                        { id: 'shopeefood', label: 'ShopeeFood (20%)' },
                        { id: 'grabfood', label: 'GrabFood (20%)' },
                        { id: 'gofood', label: 'GoFood (20%)' },
                      ].map((ch) => (
                        <button
                          key={ch.id}
                          onClick={() => setChannel(ch.id as Channel)}
                          className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                            channel === ch.id
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/20'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {ch.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Results Board */}
                <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden shrink-0">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
                  
                  <div className="relative z-10 flex flex-col sm:flex-row gap-6">
                    <div className="flex-1 space-y-1 border-b sm:border-b-0 sm:border-r border-white/10 pb-4 sm:pb-0 sm:pr-6">
                      <p className="text-xs font-medium text-slate-400">Rekomendasi Harga Jual</p>
                      <p className="text-3xl font-black tracking-tight text-white">
                        {formatRp(sellPrice)}
                      </p>
                      {platformCut > 0 && (
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400"></span>
                          Potongan {channel}: {formatRp(platformFee)}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-medium text-slate-400">Estimasi Profit Bersih</p>
                      <p className="text-3xl font-black tracking-tight text-emerald-400">
                        {formatRp(netProfit)}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Net Margin: {((netProfit / sellPrice) * 100 || 0).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer CTA */}
              <div className="bg-slate-50 p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs font-semibold text-slate-600 text-center sm:text-left flex-1 max-w-xs leading-relaxed">
                  Mau kalkulasi resep otomatis, potong stok bahan baku, dan pantau laba kasir secara lengkap?
                </p>
                <button
                  onClick={() => router.push('/auth/daftar')}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group"
                >
                  <span>Aktifkan Fitur Lengkap di UBOS (Gratis 7 Hari)</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
