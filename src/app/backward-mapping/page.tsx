'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, ShieldAlert, CheckCircle2, Settings, ArrowDown, ChevronRight, Zap, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { getRecommendations, getSolutionColorClasses } from '@/lib/solutions/engine';
import { TargetData, TargetType, TargetPeriod, MappingStep, NeedData, ActionPlan, buildMapping, analyzeNeeds, generateActionPlan, formatCurrency, formatNumber } from '@/lib/solutions/mappingBuilder';

export default function BackwardMappingPage() {
  // Inputs
  const [profession, setProfession] = useState('UMKM');
  const [businessType, setBusinessType] = useState('F&B');
  const [targetType, setTargetType] = useState<TargetType>('REVENUE');
  const [targetValue, setTargetValue] = useState<string>('');
  const [targetPeriod, setTargetPeriod] = useState<TargetPeriod>('MONTHLY');
  const [currentValue, setCurrentValue] = useState<string>('');

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [mapping, setMapping] = useState<MappingStep[]>([]);
  const [needs, setNeeds] = useState<NeedData | null>(null);
  const [actionPlan, setActionPlan] = useState<ActionPlan[]>([]);
  
  const resultsRef = useRef<HTMLDivElement>(null);

  const PROFESSIONS = [
    'UMKM', 
    'Marketing / Agen Coway', 
    'Konten Kreator', 
    'Karyawan', 
    'Freelancer',
    'Profesional'
  ];

  const BUSINESS_TYPES = [
    'F&B', 'Fotocopy', 'Percetakan', 'Retail', 'Jasa', 'Lainnya'
  ];

  // Number input formatter
  const handleNumberInput = (val: string, setter: (v: string) => void) => {
    const numericValue = val.replace(/\D/g, '');
    if (!numericValue) {
      setter('');
      return;
    }
    if (targetType === 'REVENUE') {
      const formatted = parseInt(numericValue, 10).toLocaleString('id-ID');
      setter(formatted);
    } else {
      setter(numericValue);
    }
  };

  const handleAnalyze = () => {
    if (!targetValue) return;
    
    setIsAnalyzing(true);
    
    // Simulate slight delay for "AI thinking" effect
    setTimeout(() => {
      const tVal = parseFloat(targetValue.replace(/[^0-9]/g, '')) || 0;
      const cVal = parseFloat(currentValue.replace(/[^0-9]/g, '')) || 0;
      
      const targetData: TargetData = {
        type: targetType,
        value: tVal,
        currentValue: cVal,
        unit: 'IDR',
        period: targetPeriod
      };

      const newMapping = buildMapping(targetData, profession, businessType);
      const newNeeds = analyzeNeeds(targetData);
      const newActionPlan = generateActionPlan(targetData, newNeeds, profession);

      setMapping(newMapping);
      setNeeds(newNeeds);
      setActionPlan(newActionPlan);
      
      setIsAnalyzing(false);
      setHasAnalyzed(true);

      // Scroll to results after short delay
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      
    }, 800);
  };

  const compileRecommendationInput = () => {
    const numericVal = parseFloat(targetValue.replace(/[^0-9]/g, '')) || 0;
    const tValStr = targetType === 'REVENUE' ? formatCurrency(numericVal) : targetValue;
    const cPlan = actionPlan.map(a => a.action).join(', ');
    return {
      profesi: profession === 'UMKM' ? `UMKM ${businessType}` : profession,
      tujuan: targetType,
      target: `${tValStr} ${targetPeriod}`,
      caraMencapai: cPlan
    };
  };

  const recommendations = hasAnalyzed ? getRecommendations(compileRecommendationInput()) : [];

  return (
    <div className="min-h-screen bg-[#fafbfc] font-sans text-slate-900 overflow-x-hidden flex flex-col">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-center sm:justify-start sticky top-0 z-50 shrink-0 shadow-sm">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
          <img src="/assets/images/logo-logaritma.png" alt="Logaritma Logo" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
          <span className="font-black tracking-tight text-base sm:text-xl">LOGARITMA.ID</span>
        </Link>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col items-center p-4 sm:p-6 lg:p-10 w-full relative">
        
        {/* INPUT SECTION */}
        <div className="w-full max-w-3xl mx-auto mb-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 mb-4 tracking-tight">Mulai dari target Anda.</h1>
            <p className="text-slate-500 font-medium text-lg sm:text-xl">Ceritakan kondisi Anda. Kami bantu petakan langkahnya.</p>
          </div>

          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-8 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60 -mr-20 -mt-20 pointer-events-none"></div>

            {/* Q1: Profesi */}
            <div className="relative z-10">
              <label className="block text-lg font-black text-slate-800 mb-3">Siapa Anda?</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <select 
                  value={profession} 
                  onChange={(e) => setProfession(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>

                {profession === 'UMKM' && (
                  <select 
                    value={businessType} 
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    {BUSINESS_TYPES.map(bt => <option key={bt} value={bt}>Bidang {bt}</option>)}
                  </select>
                )}
              </div>
            </div>

            {/* Q2: Target */}
            <div className="relative z-10">
              <label className="block text-lg font-black text-slate-800 mb-3">Target Anda?</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  {targetType === 'REVENUE' && <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>}
                  <input 
                    type="text" 
                    value={targetValue} 
                    onChange={(e) => handleNumberInput(e.target.value, setTargetValue)}
                    placeholder={targetType === 'REVENUE' ? "Misal: 100.000.000" : "Misal: 1000"}
                    className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-4 font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${targetType === 'REVENUE' ? 'pl-10 pr-4' : 'px-4'}`}
                  />
                </div>
                <select 
                  value={targetType} 
                  onChange={(e) => {
                    const newType = e.target.value as TargetType;
                    setTargetType(newType);
                    if (targetValue) {
                      const numeric = targetValue.replace(/\D/g, '');
                      setTargetValue(newType === 'REVENUE' ? parseInt(numeric, 10).toLocaleString('id-ID') : numeric);
                    }
                    if (currentValue) {
                      const numeric = currentValue.replace(/\D/g, '');
                      setCurrentValue(newType === 'REVENUE' ? parseInt(numeric, 10).toLocaleString('id-ID') : numeric);
                    }
                  }}
                  className="sm:w-1/3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="REVENUE">Omzet</option>
                  <option value="LEADS">Leads</option>
                  <option value="TRANSACTION">Transaksi</option>
                  <option value="FOLLOWERS">Followers</option>
                </select>
                <select 
                  value={targetPeriod} 
                  onChange={(e) => setTargetPeriod(e.target.value as TargetPeriod)}
                  className="sm:w-1/4 bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="MONTHLY">Per Bulan</option>
                  <option value="WEEKLY">Per Minggu</option>
                  <option value="DAILY">Per Hari</option>
                </select>
              </div>
            </div>

            {/* Q3: Kondisi Saat Ini */}
            <div className="relative z-10">
              <label className="block text-lg font-black text-slate-800 mb-1">Kondisi Anda sekarang?</label>
              <p className="text-sm text-slate-500 mb-3 font-medium">Masukkan pencapaian rata-rata Anda saat ini untuk metrik yang sama.</p>
              <div className="relative w-full">
                {targetType === 'REVENUE' && <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>}
                <input 
                  type="text" 
                  value={currentValue} 
                  onChange={(e) => handleNumberInput(e.target.value, setCurrentValue)}
                  placeholder={targetType === 'REVENUE' ? "Misal: 50.000.000 (Kosongkan jika dari nol)" : "Misal: 100 (Kosongkan jika dari nol)"}
                  className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-4 font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${targetType === 'REVENUE' ? 'pl-10 pr-4' : 'px-4'}`}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 relative z-10">
              <button
                onClick={handleAnalyze}
                disabled={!targetValue || isAnalyzing}
                className="w-full bg-blue-600 text-white font-black text-lg py-5 rounded-2xl shadow-xl shadow-blue-600/30 hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-3"
              >
                {isAnalyzing ? (
                  <span className="flex items-center gap-2">
                    <Zap className="animate-pulse" /> Memproses Data...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    ANALISIS DENGAN METODE LOGARITMA <ArrowDown size={22} />
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RESULTS SECTION */}
        <AnimatePresence>
          {hasAnalyzed && needs && (
            <motion.div 
              ref={resultsRef}
              initial={{ opacity: 0, y: 50 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="w-full max-w-4xl mx-auto pb-24"
            >
              
              {/* 1. SUMMARY BOX */}
              <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden mb-12">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 relative z-10 divide-y sm:divide-y-0 sm:divide-x divide-slate-700">
                  <div className="text-center px-4">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Target Anda</div>
                    <div className="text-2xl sm:text-3xl font-black text-white">
                      {targetType === 'REVENUE' 
                        ? formatCurrency(parseFloat(targetValue.replace(/[^0-9]/g, '')) || 0) 
                        : formatNumber(parseFloat(targetValue.replace(/[^0-9]/g, '')) || 0)}
                    </div>
                  </div>
                  <div className="text-center px-4 pt-6 sm:pt-0">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Kondisi Saat Ini</div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-300">
                      {currentValue 
                        ? (targetType === 'REVENUE' 
                            ? formatCurrency(parseFloat(currentValue.replace(/[^0-9]/g, '')) || 0) 
                            : formatNumber(parseFloat(currentValue.replace(/[^0-9]/g, '')) || 0)) 
                        : '0'}
                    </div>
                  </div>
                  <div className="text-center px-4 pt-6 sm:pt-0">
                    <div className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">GAP</div>
                    <div className="text-2xl sm:text-3xl font-black text-red-400">
                      {targetType === 'REVENUE' 
                        ? formatCurrency(needs.gapValue) 
                        : formatNumber(needs.gapValue)}
                    </div>
                  </div>
                </div>
              </div>

              {/* ARROW DOWN */}
              <div className="flex justify-center mb-12">
                <ArrowDown className="text-slate-300 w-8 h-8" />
              </div>

              {/* 2. PEMETAAN LOGARITMA */}
              <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 flex items-center justify-center gap-3">
                  <Target className="text-blue-600" /> Pemetaan Logaritma
                </h2>
                <p className="text-slate-600 font-medium">Pemecahan target menjadi elemen yang bisa dikontrol harian.</p>
              </div>

              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl mb-12">
                <div className="flex flex-col relative">
                  <div className="absolute top-8 bottom-8 left-[23px] sm:left-[39px] w-1 bg-slate-100 rounded-full z-0"></div>
                  
                  {mapping.map((m, i) => (
                    <div key={i} className="relative z-10 flex gap-4 sm:gap-6 items-start mb-8 last:mb-0">
                      <div className="w-12 h-12 sm:w-20 sm:h-20 shrink-0 bg-blue-50 text-blue-600 rounded-2xl flex flex-col items-center justify-center font-black text-lg sm:text-2xl ring-4 ring-white">
                        {i + 1}
                      </div>
                      <div className="pt-1 sm:pt-3">
                        <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{m.label}</div>
                        <div className="text-xl sm:text-3xl font-black text-slate-900">{m.value}</div>
                        {m.subLabel && <div className="mt-2 text-sm font-medium text-slate-600 bg-slate-100 inline-block px-3 py-1 rounded-lg">{m.subLabel}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ARROW DOWN */}
              <div className="flex justify-center mb-12">
                <ArrowDown className="text-slate-300 w-8 h-8" />
              </div>

              {/* 3. PRIORITAS / REKOMENDASI SISTEM */}
              <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-3xl font-black text-emerald-900 mb-2 flex items-center justify-center gap-3">
                  <Zap className="text-emerald-500 fill-emerald-500" /> Prioritas & Sistem
                </h2>
                <p className="text-slate-600 font-medium">Alat yang paling dibutuhkan untuk mengeksekusi rencana ini.</p>
              </div>

              {recommendations.length > 0 && (
                <div className="grid grid-cols-1 gap-6 mb-16">
                  {recommendations.map((sol, index) => {
                    const colors = getSolutionColorClasses(sol.color);
                    return (
                      <div key={sol.id} className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-2xl relative overflow-hidden ring-1 ring-black/5">
                        {index === 0 && <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 font-bold text-xs px-4 py-1.5 rounded-full shadow-sm">Prioritas #1</div>}
                        
                        <div className="flex flex-col lg:flex-row justify-between gap-8 items-center lg:items-start">
                          <div className="flex-1 text-center lg:text-left">
                            <h3 className={`text-3xl font-black mb-3 ${colors.text}`}>{sol.name}</h3>
                            <p className="text-slate-600 font-medium text-lg mb-6 leading-relaxed">{sol.description}</p>
                            <span className={`inline-block text-sm font-bold px-4 py-2 rounded-full ${colors.badge}`}>{sol.price}</span>
                          </div>
                          <div className="shrink-0 w-full lg:w-auto">
                            <a href={sol.destinationUrl} className={`w-full lg:w-auto font-black text-lg py-5 px-10 rounded-2xl shadow-xl active:scale-95 transition-all text-center flex items-center justify-center gap-2 ${colors.button}`}>
                              Gunakan Sekarang <ChevronRight size={22} />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 4. ACTION PLAN */}
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm mt-8">
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <CheckCircle2 className="text-blue-600" /> Action Plan Anda
                </h3>
                <div className="space-y-4">
                  {actionPlan.map((plan, i) => (
                    <div key={i} className="flex gap-4 items-start p-4 bg-slate-50 rounded-2xl">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold shrink-0">{i + 1}</div>
                      <div>
                        <div className="font-bold text-slate-900">{plan.action}</div>
                        <div className="text-sm font-medium text-slate-500 mt-1">{plan.expectedResult}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
