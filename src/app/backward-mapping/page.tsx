'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, ShieldAlert, CheckCircle2, Settings, ArrowDown, ChevronRight, Zap, Briefcase, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { getRecommendations, getSolutionColorClasses } from '@/lib/solutions/engine';
import { TargetData, TargetType, TargetPeriod, MappingResult, runLogaritmaEngine, formatCurrency, formatNumber } from '@/lib/solutions/mappingBuilder';

export default function BackwardMappingPage() {
  // Inputs
  const [profession, setProfession] = useState('UMKM');
  const [businessType, setBusinessType] = useState('F&B');
  const [targetType, setTargetType] = useState<TargetType>('REVENUE');
  const [targetValue, setTargetValue] = useState<string>('');
  const [targetPeriod, setTargetPeriod] = useState<TargetPeriod>('MONTHLY');
  const [currentValue, setCurrentValue] = useState<string>('');
  const [mainProblem, setMainProblem] = useState<string>('Tidak tahu masalahnya');

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [result, setResult] = useState<MappingResult | null>(null);
  
  // UI State
  const [showActionPlan, setShowActionPlan] = useState(false);
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

  const PROBLEMS = [
    'HPP terlalu tinggi',
    'Penjualan kurang',
    'Pelanggan tidak repeat',
    'Operasional tidak efisien',
    'Profit kecil',
    'Tidak tahu masalahnya',
    'Lainnya'
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
    setShowActionPlan(false);
    
    // Simulate slight delay for "AI thinking" effect
    setTimeout(() => {
      const tVal = parseFloat(targetValue.replace(/[^0-9]/g, '')) || 0;
      const cVal = parseFloat(currentValue.replace(/[^0-9]/g, '')) || 0;
      
      const targetData: TargetData = {
        type: targetType,
        value: tVal,
        currentValue: cVal,
        unit: 'IDR',
        period: targetPeriod,
        mainProblem
      };

      const engineResult = runLogaritmaEngine(targetData, profession, businessType);
      setResult(engineResult);
      
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
    return {
      profesi: profession === 'UMKM' ? `UMKM ${businessType}` : profession,
      tujuan: targetType,
      target: `${tValStr} ${targetPeriod}`,
      caraMencapai: result?.actionPlan.map(a => a.title).join(', ') || ''
    };
  };

  const recommendations = hasAnalyzed && result ? getRecommendations(compileRecommendationInput()) : [];
  
  // Ambil URL spesifik tool prioritas dan berikan context URL params
  let priorityToolUrl = '#';
  let priorityToolCta = 'Gunakan Sekarang';
  let priorityToolColorClass = 'bg-blue-600 text-white hover:bg-blue-700';

  if (result) {
    if (result.priority.toolKey === 'hpp_ai') {
      priorityToolUrl = `/hpp?from=mapping&prof=${encodeURIComponent(profession)}&gap=${result.gapValue}`;
      priorityToolCta = 'Hitung HPP dengan AI →';
    } else {
      const rec = recommendations.find(r => r.triggerKeywords.includes(result.priority.toolKey)) || recommendations[0];
      if (rec) {
        priorityToolUrl = rec.destinationUrl;
        priorityToolCta = `Gunakan ${rec.name} →`;
        priorityToolColorClass = getSolutionColorClasses(rec.color).button;
      }
    }
  }

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
            <div className="relative z-10 space-y-4">
              <div>
                <label className="block text-lg font-black text-slate-800 mb-1">Kondisi Anda sekarang?</label>
                <p className="text-sm text-slate-500 mb-3 font-medium">Masukkan pencapaian Anda saat ini.</p>
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
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Yang paling terasa saat ini:</label>
                <select 
                  value={mainProblem} 
                  onChange={(e) => setMainProblem(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  {PROBLEMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
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

        {/* RESULTS SECTION - PROGRESSIVE DISCLOSURE */}
        <AnimatePresence>
          {hasAnalyzed && result && (
            <motion.div 
              ref={resultsRef}
              initial={{ opacity: 0, y: 50 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="w-full max-w-3xl mx-auto pb-24"
            >
              
              {/* BAGIAN 1: AHA MOMENT - SUMMARY */}
              <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden mb-12 ring-4 ring-slate-800/50">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                
                <div className="grid grid-cols-1 gap-6 relative z-10">
                  <div className="flex justify-between items-center border-b border-slate-700/50 pb-4">
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Target Anda</div>
                    <div className="text-xl sm:text-2xl font-black text-white">
                      {targetType === 'REVENUE' 
                        ? formatCurrency(parseFloat(targetValue.replace(/[^0-9]/g, '')) || 0) 
                        : formatNumber(parseFloat(targetValue.replace(/[^0-9]/g, '')) || 0)}
                      <span className="text-sm font-medium text-slate-400 ml-1">
                        /{targetPeriod === 'MONTHLY' ? 'bulan' : targetPeriod === 'DAILY' ? 'hari' : targetPeriod === 'WEEKLY' ? 'minggu' : 'tahun'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-700/50 pb-4">
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Saat Ini</div>
                    <div className="text-xl sm:text-2xl font-black text-slate-300">
                      {currentValue 
                        ? (targetType === 'REVENUE' 
                            ? formatCurrency(parseFloat(currentValue.replace(/[^0-9]/g, '')) || 0) 
                            : formatNumber(parseFloat(currentValue.replace(/[^0-9]/g, '')) || 0)) 
                        : '0'}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="text-sm font-black text-red-400 uppercase tracking-widest bg-red-400/10 px-3 py-1 rounded-full border border-red-400/20">GAP</div>
                    <div className="text-2xl sm:text-3xl font-black text-red-400">
                      {targetType === 'REVENUE' 
                        ? formatCurrency(result.gapValue) 
                        : formatNumber(result.gapValue)}
                    </div>
                  </div>
                </div>
              </div>

              {/* ARROW DOWN */}
              <div className="flex justify-center mb-10">
                <ArrowDown className="text-slate-300 w-8 h-8 animate-bounce" />
              </div>

              {/* BAGIAN 2: 3 FAKTOR UTAMA */}
              <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
                  Menurut Metode Logaritma...
                </h2>
                <p className="text-slate-600 font-medium text-lg">Ada 3 hal yang paling perlu diperhatikan:</p>
              </div>

              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl mb-12">
                <div className="space-y-4">
                  {result.factors.map((factor, i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-black text-lg shrink-0">
                        {i + 1}
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-slate-800">
                        {factor}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BAGIAN 4: ACTION PLAN (PROGRESSIVE DISCLOSURE) */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm mb-12 overflow-hidden">
                <button 
                  onClick={() => setShowActionPlan(!showActionPlan)}
                  className="w-full flex items-center justify-between p-6 sm:p-8 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-slate-400" size={24} />
                    <span className="text-lg font-bold text-slate-700">Lihat detail Action Plan</span>
                  </div>
                  <ChevronDown className={`text-slate-400 transition-transform ${showActionPlan ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {showActionPlan && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100 bg-slate-50"
                    >
                      <div className="p-6 sm:p-8 space-y-4">
                        <h4 className="font-black text-slate-800 mb-4">Action Plan Anda:</h4>
                        {result.actionPlan.map((plan, i) => (
                          <div key={i} className="flex gap-4 items-start">
                            <div className="w-8 h-8 rounded-lg bg-white text-slate-600 flex items-center justify-center font-bold shrink-0 border border-slate-200 shadow-sm">{i + 1}</div>
                            <div className="pt-1">
                              <div className="font-bold text-slate-900">{plan.title}</div>
                              <div className="text-sm font-medium text-slate-500 mt-1">{plan.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              
{/* BAGIAN 3: PRIORITAS (CTA BESAR) */}
              <div className="text-center mb-10">
                <h2 className="text-xl sm:text-2xl font-black text-red-600 mb-2 flex items-center justify-center gap-2">
                  <Zap className="fill-red-600" /> MULAI DARI SINI
                </h2>
              </div>

              <div className="bg-blue-50 rounded-3xl p-6 sm:p-10 border border-blue-200 shadow-2xl mb-12 ring-4 ring-blue-500/10">
                <h3 className="text-2xl sm:text-3xl font-black text-blue-900 mb-4">{result.priority.title}</h3>
                <p className="text-blue-800 font-medium text-lg mb-8 leading-relaxed">
                  {result.priority.description}
                </p>
                <a 
                  href={priorityToolUrl}
                  className={`block w-full text-center font-black text-xl py-5 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all ${priorityToolColorClass}`}
                >
                  {priorityToolCta}
                </a>
              </div>

              {/* BAGIAN 5: SISTEM REKOMENDASI TAMBAHAN */}
              {recommendations.length > 0 && recommendations.filter(r => r.triggerKeywords.includes(result.priority.toolKey) === false).length > 0 && (
                <div className="mt-16">
                  <h3 className="text-lg font-bold text-slate-500 text-center mb-6">Sistem tambahan untuk eksekusi:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {recommendations.filter(r => r.triggerKeywords.includes(result.priority.toolKey) === false).map((sol) => (
                      <a 
                        key={sol.id}
                        href={sol.destinationUrl}
                        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center group"
                      >
                        <h4 className="font-black text-slate-800 text-lg mb-2 group-hover:text-blue-600 transition-colors">{sol.name}</h4>
                        <p className="text-sm text-slate-500 font-medium">{sol.description}</p>
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
