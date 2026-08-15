'use client';

import React, { useState } from 'react';
import { Calculator, TrendingUp, DollarSign, Clock, Award, Sparkles, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function CareerCalculator({ onOpenEnrollment }) {
  const [sector, setSector] = useState('kuliner');
  const [omset, setOmset] = useState(25000000);
  const [targetMarginPercent, setTargetMarginPercent] = useState(35);

  const sectors = [
    { id: 'kuliner', name: 'Kuliner & FnB', defaultMargin: 35, deadstockLeak: 0.12 },
    { id: 'percetakan', name: 'Percetakan Digital', defaultMargin: 30, deadstockLeak: 0.10 },
    { id: 'retail', name: 'Retail & Toko', defaultMargin: 20, deadstockLeak: 0.08 },
    { id: 'jasa', name: 'Jasa & Service', defaultMargin: 40, deadstockLeak: 0.05 },
  ];

  const selectedSectorObj = sectors.find(s => s.id === sector) || sectors[0];
  
  // Real-time calculation math
  const estimatedGrossProfit = Math.round(omset * (targetMarginPercent / 100));
  const estimatedDeadStockSaved = Math.round(omset * selectedSectorObj.deadstockLeak);
  const netProfitClean = estimatedGrossProfit + Math.round(estimatedDeadStockSaved * 0.7);

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <section id="calculator" className="py-20 md:py-28 bg-slate-900 text-white relative overflow-hidden bg-mesh-dark">
      
      {/* Glow ambient background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Calculator className="w-3.5 h-3.5" /> Kalkulator Profit & Margin Guard UMKM
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Hitung HPP Asli & Proyeksi <br />
            <span className="text-gradient-emerald-blue">Penyelamatan Modal Dari Dead-Stock</span>
          </h2>
          <p className="text-slate-400 text-base">
            Uji simulasi nyata bagaimana sistem Logaritma.id mengunci margin keuntungan dan mencegah kerugian barang mengendap.
          </p>
        </div>

        {/* Interactive Box Container */}
        <div className="bg-slate-950/80 rounded-3xl border border-slate-800 p-6 sm:p-10 shadow-2xl backdrop-blur-xl max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Input Sliders & Controls */}
          <div className="lg:col-span-7 space-y-7">
            
            {/* Sector selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                1. Pilih Jenis Sektor Usaha UMKM Anda
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {sectors.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setSector(sec.id);
                      setTargetMarginPercent(sec.defaultMargin);
                    }}
                    className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border text-center ${
                      sector === sec.id
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sec.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Omset Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-300 uppercase tracking-wider">
                  2. Estimasi Omset Penjualan Kotor Per Bulan
                </label>
                <span className="font-mono font-extrabold text-blue-400 text-sm bg-blue-950 px-3 py-1 rounded-lg border border-blue-800">
                  {formatRupiah(omset)} / bln
                </span>
              </div>
              <input
                type="range"
                min="5000000"
                max="100000000"
                step="2500000"
                value={omset}
                onChange={(e) => setOmset(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Rp 5.000.000</span>
                <span>Rp 50.000.000</span>
                <span>Rp 100.000.000</span>
              </div>
            </div>

            {/* Target Margin Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-300 uppercase tracking-wider">
                  3. Target Margin Keuntungan Yang Diinginkan
                </label>
                <span className="font-mono font-extrabold text-emerald-400 text-sm bg-emerald-950 px-3 py-1 rounded-lg border border-emerald-800">
                  {targetMarginPercent}% Margin
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={targetMarginPercent}
                onChange={(e) => setTargetMarginPercent(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>10% (Ritel Tipis)</span>
                <span>35% (Standar FnB)</span>
                <span>60% (High Service)</span>
              </div>
            </div>

          </div>

          {/* Right Column: Calculated ROI Output Card */}
          <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
            
            <div className="border-b border-slate-800 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Estimasi Profit Bersih Dingin</span>
              <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                {formatRupiah(netProfitClean)}
                <span className="text-xs text-slate-400 font-normal"> / bulan</span>
              </div>
              <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Margin Keuntungan Terkunci Aman</span>
              </div>
            </div>

            {/* Key Metric Indicators */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Modal Diselamatkan Dari Dead-Stock:</span>
                <span className="font-bold text-amber-400">+{formatRupiah(estimatedDeadStockSaved)} / bln</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Biaya Langganan Logaritma:</span>
                <span className="font-bold text-sky-400">Flat Rp 49.000 / bln</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Waktu Balik Modal Langganan:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> &lt; 1 Hari Transaksi
                </span>
              </div>
            </div>

            <button
              onClick={() => onOpenEnrollment(`Kalkulator Profit - ${selectedSectorObj.name}`)}
              className="btn-gradient-primary w-full text-xs font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Aktivasi Margin Guard & Coba Gratis</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>

        </div>

      </div>
    </section>
  );
}
