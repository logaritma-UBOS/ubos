'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, Target, Briefcase, TrendingUp, CheckCircle2, ShieldAlert, BarChart3, ListTodo, Wrench, Settings } from 'lucide-react';
import Link from 'next/link';
import { getRecommendations, getSolutionColorClasses } from '@/lib/solutions/engine';
import { TargetData, TargetType, TargetPeriod, MappingStep, NeedData, ActionPlan, buildMapping, analyzeNeeds, generateActionPlan, formatCurrency, formatNumber } from '@/lib/solutions/mappingBuilder';

export default function BackwardMappingPage() {
  const [step, setStep] = useState(1);
  
  // Step 1: Profesi
  const [profession, setProfession] = useState('');
  const [businessType, setBusinessType] = useState('');
  
  // Step 2: Target
  const [targetType, setTargetType] = useState<TargetType>('REVENUE');
  const [targetValue, setTargetValue] = useState<string>('');
  const [targetUnit, setTargetUnit] = useState<string>('IDR');
  const [targetPeriod, setTargetPeriod] = useState<TargetPeriod>('MONTHLY');
  const [currentValue, setCurrentValue] = useState<string>(''); // Optional

  // Calculations
  const [mapping, setMapping] = useState<MappingStep[]>([]);
  const [needs, setNeeds] = useState<NeedData | null>(null);
  const [actionPlan, setActionPlan] = useState<ActionPlan[]>([]);
  
  // Lead Capture State
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const handleNextStep1 = () => { 
    if (profession === 'UMKM' && !businessType) return;
    if (profession) setStep(2); 
  };

  const calculateAll = () => {
    const tVal = parseFloat(targetValue.replace(/[^0-9]/g, '')) || 0;
    const cVal = parseFloat(currentValue.replace(/[^0-9]/g, '')) || 0;
    
    const targetData: TargetData = {
      type: targetType,
      value: tVal,
      currentValue: cVal,
      unit: targetUnit,
      period: targetPeriod
    };

    const newMapping = buildMapping(targetData, profession, businessType);
    const newNeeds = analyzeNeeds(targetData);
    const newActionPlan = generateActionPlan(targetData, newNeeds, profession);

    setMapping(newMapping);
    setNeeds(newNeeds);
    setActionPlan(newActionPlan);
  };

  const handleNextStep2 = () => { 
    if (targetValue.trim() !== '') {
      calculateAll();
      setStep(3); 
    }
  };

  const handleSaveLead = () => {
    if (!leadName.trim() || !leadPhone.trim()) return;

    const leadData = {
      timestamp: new Date().toISOString(),
      personal_info: { name: leadName, phone: leadPhone, email: leadEmail },
      mapping_data: {
        profession,
        businessType,
        targetType,
        targetValue,
        currentValue,
        period: targetPeriod
      }
    };
    
    try {
      const existing = JSON.parse(localStorage.getItem('logaritma_leads') || '[]');
      existing.push(leadData);
      localStorage.setItem('logaritma_leads', JSON.stringify(existing));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
    setIsSubmitted(true);
  };

  // Compile input for Recommendation Engine
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

  const recommendations = step >= 6 ? getRecommendations(compileRecommendationInput()) : [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden flex flex-col">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between sticky top-0 z-10 shrink-0 shadow-sm">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
          <img src="/assets/images/logo-logaritma.png" alt="Logaritma Logo" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
          <span className="font-black tracking-tight text-base sm:text-xl hidden sm:block">LOGARITMA.ID</span>
        </Link>
        
        {step < 7 && (
          <div className="flex items-center gap-2 text-slate-500 font-bold text-sm sm:text-base bg-slate-100 px-4 py-1.5 rounded-full">
            <span>Langkah {step} dari 6</span>
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col items-center p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full relative">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: PROFESI */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-2xl mt-8 sm:mt-12">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">Sekarang Anda beraktivitas sebagai apa?</h2>
              <p className="text-slate-500 mb-8 font-medium text-lg">Pilih profesi utama Anda saat ini agar kami bisa menyesuaikan pemetaan.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PROFESSIONS.map((prof) => (
                  <button
                    key={prof}
                    onClick={() => setProfession(prof)}
                    className={`p-5 rounded-2xl border-2 text-left font-bold transition-all ${profession === prof ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md ring-4 ring-blue-600/10' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                  >
                    <Briefcase className={`mb-3 ${profession === prof ? 'text-blue-600' : 'text-slate-400'}`} size={28} />
                    {prof}
                  </button>
                ))}
              </div>

              {profession === 'UMKM' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-8 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 text-lg">Jenis usaha Anda?</h3>
                  <div className="flex flex-wrap gap-3">
                    {BUSINESS_TYPES.map((bt) => (
                      <button
                        key={bt}
                        onClick={() => setBusinessType(bt)}
                        className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all border ${businessType === bt ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                      >
                        {bt}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="mt-10">
                <button
                  onClick={handleNextStep1}
                  disabled={!profession || (profession === 'UMKM' && !businessType)}
                  className="w-full sm:w-auto bg-blue-600 text-white font-bold py-4 px-10 rounded-full shadow-lg shadow-blue-600/25 disabled:opacity-50 disabled:shadow-none hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 text-lg"
                >
                  Lanjut <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: TARGET */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-2xl mt-8 sm:mt-12">
              <button onClick={() => setStep(1)} className="mb-6 flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition-colors">
                <ArrowLeft size={20} /> Kembali
              </button>
              
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">Apa hasil akhir yang ingin dicapai?</h2>
              <p className="text-slate-500 mb-8 font-medium text-lg">Tentukan target spesifik yang bisa diukur.</p>
              
              <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Fokus Target</label>
                  <select 
                    value={targetType} 
                    onChange={(e) => {
                      const newType = e.target.value as TargetType;
                      setTargetType(newType);
                      // Reformat existing values
                      if (targetValue) {
                        const numeric = targetValue.replace(/\D/g, '');
                        setTargetValue(newType === 'REVENUE' ? parseInt(numeric, 10).toLocaleString('id-ID') : numeric);
                      }
                      if (currentValue) {
                        const numeric = currentValue.replace(/\D/g, '');
                        setCurrentValue(newType === 'REVENUE' ? parseInt(numeric, 10).toLocaleString('id-ID') : numeric);
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="REVENUE">Omzet / Pendapatan</option>
                    <option value="LEADS">Leads / Prospek</option>
                    <option value="TRANSACTION">Volume Transaksi</option>
                    <option value="FOLLOWERS">Followers / Audience</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nilai Target</label>
                    <input 
                      type="text" 
                      value={targetValue} 
                      onChange={(e) => handleNumberInput(e.target.value, setTargetValue)}
                      placeholder={targetType === 'REVENUE' ? "Contoh: 30.000.000" : "Contoh: 100"}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Periode</label>
                    <select 
                      value={targetPeriod} 
                      onChange={(e) => setTargetPeriod(e.target.value as TargetPeriod)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="MONTHLY">Per Bulan</option>
                      <option value="WEEKLY">Per Minggu</option>
                      <option value="DAILY">Per Hari</option>
                      <option value="YEARLY">Per Tahun</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Kondisi Saat Ini (Opsional)</label>
                  <p className="text-xs text-slate-500 mb-2">Berapa angka aktual Anda saat ini? Ini membantu kami mengukur gap.</p>
                  <input 
                    type="text" 
                    value={currentValue} 
                    onChange={(e) => handleNumberInput(e.target.value, setCurrentValue)}
                    placeholder={targetType === 'REVENUE' ? "Contoh: 5.000.000 (Kosongkan jika baru mulai)" : "Contoh: 10 (Kosongkan jika baru mulai)"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="mt-10">
                <button
                  onClick={handleNextStep2}
                  disabled={!targetValue}
                  className="w-full sm:w-auto bg-blue-600 text-white font-bold py-4 px-10 rounded-full shadow-lg shadow-blue-600/25 disabled:opacity-50 disabled:shadow-none hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 text-lg"
                >
                  Proses Pemetaan <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: PEMETAAN */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full mt-8 sm:mt-12">
              <div className="text-center mb-12">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Target size={32} />
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">Hasil Pemetaan (Backward Mapping)</h2>
                <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">Kami telah menarik mundur target Anda menjadi elemen-elemen yang lebih kecil dan bisa dikontrol setiap harinya.</p>
              </div>
              
              <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xl max-w-3xl mx-auto">
                <div className="flex flex-col relative">
                  <div className="absolute top-8 bottom-8 left-[23px] sm:left-[39px] w-1 bg-slate-100 rounded-full z-0"></div>
                  
                  {mapping.map((m, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
                      className="relative z-10 flex gap-4 sm:gap-6 items-start mb-8 last:mb-0"
                    >
                      <div className="w-12 h-12 sm:w-20 sm:h-20 shrink-0 bg-blue-600 text-white rounded-2xl flex flex-col items-center justify-center font-black text-lg sm:text-2xl shadow-lg shadow-blue-600/30">
                        {i + 1}
                      </div>
                      <div className="pt-1 sm:pt-3">
                        <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{m.label}</div>
                        <div className="text-xl sm:text-3xl font-black text-slate-900">{m.value}</div>
                        {m.subLabel && <div className="mt-2 text-sm font-medium text-slate-600 bg-slate-100 inline-block px-3 py-1 rounded-lg">{m.subLabel}</div>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-12 text-center">
                <button onClick={() => setStep(4)} className="bg-slate-900 text-white font-bold py-4 px-10 rounded-full shadow-xl hover:bg-slate-800 active:scale-95 transition-all text-lg flex items-center justify-center mx-auto gap-2">
                  Lanjut Analisis Kebutuhan <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: KEBUTUHAN (GAP) */}
          {step === 4 && needs && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-2xl mt-8 sm:mt-12">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">Analisis Kebutuhan & Gap</h2>
              <p className="text-slate-500 mb-10 font-medium text-lg">Perbandingan antara kondisi aktual dan target yang ingin dicapai.</p>
              
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm mb-8">
                <div className="flex flex-col sm:flex-row gap-6 items-center">
                  <div className="flex-1 w-full p-5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Kondisi Saat Ini</div>
                    <div className="text-xl sm:text-2xl font-black text-slate-700">
                      {currentValue 
                        ? (targetType === 'REVENUE' 
                            ? formatCurrency(parseFloat(currentValue.replace(/[^0-9]/g, '')) || 0) 
                            : formatNumber(parseFloat(currentValue.replace(/[^0-9]/g, '')) || 0)) 
                        : 'Belum ada data'}
                    </div>
                  </div>
                  <div className="text-slate-300 font-bold hidden sm:block">VS</div>
                  <div className="flex-1 w-full p-5 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                    <div className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">Target States</div>
                    <div className="text-xl sm:text-2xl font-black text-blue-700">
                      {targetType === 'REVENUE' 
                        ? formatCurrency(parseFloat(targetValue.replace(/[^0-9]/g, '')) || 0) 
                        : formatNumber(parseFloat(targetValue.replace(/[^0-9]/g, '')) || 0)}
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4">
                  <ShieldAlert className="text-red-500 shrink-0 mt-1" size={28} />
                  <div>
                    <h3 className="font-black text-red-900 text-xl mb-2">Identifikasi Gap Utama</h3>
                    <p className="text-red-700 font-medium leading-relaxed">{needs.gapText}</p>
                    <div className="mt-4 flex gap-2">
                      <span className="text-xs font-bold bg-white text-red-600 px-3 py-1 rounded-full shadow-sm">Kategori: {needs.category}</span>
                      <span className="text-xs font-bold bg-white text-slate-500 px-3 py-1 rounded-full shadow-sm">Data Confidence: {needs.confidence}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 text-center">
                <button onClick={() => setStep(5)} className="bg-blue-600 text-white font-bold py-4 px-10 rounded-full shadow-lg shadow-blue-600/25 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center mx-auto gap-2 text-lg">
                  Buat Action Plan <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: ACTION PLAN */}
          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-3xl mt-8 sm:mt-12">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">Action Plan</h2>
              <p className="text-slate-500 mb-10 font-medium text-lg">Tindakan spesifik yang harus dilakukan untuk menutup gap dan mencapai target.</p>
              
              <div className="space-y-4">
                {actionPlan.map((plan, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <div className="w-12 h-12 shrink-0 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black">
                      <ListTodo size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-slate-900 text-lg mb-1">{plan.action}</h3>
                      <p className="text-slate-600 text-sm font-medium mb-3">Target eksekusi: {plan.target}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">Freq: {plan.frequency}</span>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">Metric: {plan.metric}</span>
                      </div>
                    </div>
                    <div className="sm:w-1/3 bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                      <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Expected Result</div>
                      <div className="text-sm font-bold text-emerald-900">{plan.expectedResult}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <button onClick={() => setStep(6)} className="bg-slate-900 text-white font-bold py-4 px-10 rounded-full shadow-xl hover:bg-slate-800 active:scale-95 transition-all text-lg flex items-center justify-center mx-auto gap-2">
                  Lihat Sistem Pendukung <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 6: SISTEM & CAPTURE LEAD */}
          {step === 6 && (
            <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-3xl mt-8 sm:mt-12">
              {!isSubmitted ? (
                <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-200 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
                  <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Settings size={40} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 mb-4">Pemetaan Selesai!</h2>
                  <p className="text-slate-600 font-medium mb-8 max-w-lg mx-auto">Sistem telah menemukan alat (tools) yang paling tepat untuk mengeksekusi Action Plan Anda. Masukkan kontak untuk melihat hasilnya.</p>
                  
                  <div className="max-w-md mx-auto space-y-4 text-left">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Nama Lengkap</label>
                      <input type="text" value={leadName} onChange={e => setLeadName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800" placeholder="Ketik nama Anda..." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Nomor WhatsApp</label>
                      <input type="tel" value={leadPhone} onChange={e => setLeadPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800" placeholder="08xxxxxxxx" />
                    </div>
                    <button onClick={handleSaveLead} disabled={!leadName || !leadPhone} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg mt-4 disabled:opacity-50 hover:bg-blue-700 transition-all">
                      Lihat Hasil Sistem
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-black text-emerald-900 mb-4">Rekomendasi Sistem</h2>
                    <p className="text-emerald-700 font-medium">Berikut adalah alat pendukung eksekusi berdasarkan pemetaan Anda.</p>
                  </div>
                  
                  {recommendations.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                      {recommendations.map((sol, index) => {
                        const colors = getSolutionColorClasses(sol.color);
                        return (
                          <div key={sol.id} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl relative overflow-hidden">
                            {index === 0 && <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 font-bold text-xs px-3 py-1 rounded-full">Primary System</div>}
                            <div className="flex flex-col sm:flex-row justify-between gap-6">
                              <div>
                                <h3 className={`text-2xl font-black mb-2 ${colors.text}`}>{sol.name}</h3>
                                <p className="text-slate-600 font-medium mb-4">{sol.description}</p>
                                <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full ${colors.badge}`}>{sol.price}</span>
                              </div>
                              <div className="shrink-0 flex items-center">
                                <a href={sol.destinationUrl} className={`block w-full sm:w-auto font-bold py-4 px-8 rounded-xl shadow-md active:scale-95 transition-all text-center ${colors.button}`}>
                                  {sol.cta}
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 p-8 rounded-3xl text-center">
                      <ShieldAlert className="text-amber-500 mx-auto mb-4" size={48} />
                      <h3 className="text-2xl font-black text-amber-900 mb-2">Sistem Sedang Dipetakan</h3>
                      <p className="text-amber-700 font-medium">Berdasarkan profil dan kebutuhan Anda, sistem khusus sedang dalam tahap penyusunan. Tim kami akan menghubungi Anda segera.</p>
                    </div>
                  )}

                  <div className="text-center mt-12">
                    <Link href="/" className="inline-block text-slate-500 font-bold hover:text-slate-800 transition-colors">
                      Kembali ke Beranda
                    </Link>
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
