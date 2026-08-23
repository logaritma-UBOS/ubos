'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, Target, Briefcase, TrendingUp, Wrench, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function BackwardMappingPage() {
  const [step, setStep] = useState(1);
  const [tujuan, setTujuan] = useState('');
  const [profesi, setProfesi] = useState('');
  const [profesiManual, setProfesiManual] = useState('');
  const [target, setTarget] = useState('');
  const [caraMencapai, setCaraMencapai] = useState('');
  
  // Lead Capture State
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const PROFESSIONS = [
    'Pemilik Usaha', 'Pedagang', 'Pemilik Warung', 'Pemilik Toko', 
    'Reseller', 'Freelancer', 'Penyedia Jasa', 'Content Creator', 
    'YouTuber', 'TikToker', 'Influencer', 'Blogger', 
    'Karyawan', 'Profesional', 'Pelajar/Mahasiswa', 'Lainnya'
  ];

  const getNormalizedProfesi = (profesiName) => {
    const profLower = profesiName.toLowerCase();
    if (profLower.includes('youtube') || profLower.includes('tiktok') || profLower.includes('influencer') || profLower.includes('content') || profLower.includes('kreator') || profLower.includes('creator') || profLower.includes('blogger')) {
      return 'CREATOR';
    } else if (profLower.includes('dagang') || profLower.includes('reseller') || profLower.includes('toko') || profLower.includes('retail') || profLower.includes('umkm') || profLower.includes('usaha')) {
      return 'RETAIL/UMKM';
    } else if (profLower.includes('barber') || profLower.includes('montir') || profLower.includes('freelance') || profLower.includes('jasa') || profLower.includes('layanan') || profLower.includes('servis') || profLower.includes('profesional')) {
      return 'JASA';
    } else if (profLower.includes('warung') || profLower.includes('kedai') || profLower.includes('makan') || profLower.includes('f&b') || profLower.includes('cafe') || profLower.includes('kafe') || profLower.includes('resto')) {
      return 'F&B';
    }
    return 'LAINNYA';
  };

  const handleNextStep1 = () => { if (tujuan.trim() !== '') setStep(2); };
  const handleNextStep2 = () => { 
    if (profesi.trim() !== '') {
      if (profesi === 'Lainnya' && profesiManual.trim() === '') return;
      setStep(3); 
    }
  };
  const handleNextStep3 = () => { if (target.trim() !== '') setStep(4); };
  const handleNextStep4 = () => { if (caraMencapai.trim() !== '') setStep(5); };

  const handleSaveLead = () => {
    if (!leadName.trim() || !leadPhone.trim()) return;

    const normProf = getNormalizedProfesi(profesi === 'Lainnya' ? profesiManual : profesi);
    const leadData = {
      timestamp: new Date().toISOString(),
      personal_info: {
        name: leadName,
        phone: leadPhone,
        email: leadEmail,
      },
      mapping_data: {
        tujuan,
        profesi: profesi === 'Lainnya' ? profesiManual : profesi,
        target,
        caraMencapai,
        kategori_internal: normProf
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

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden flex flex-col">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between sticky top-0 z-10 shrink-0 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
            <img src="/assets/images/logo-logaritma.png" alt="Logaritma Logo" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
            <span className="font-black tracking-tight text-base sm:text-xl hidden sm:block">LOGARITMA.ID</span>
          </Link>
        </div>
        
        {/* PROGRESS INDICATOR */}
        {step < 5 ? (
          <div className="flex items-center gap-2 text-slate-500 font-bold text-sm sm:text-base bg-slate-100 px-4 py-1.5 rounded-full">
            <span>Langkah {step} dari 4</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm sm:text-base bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
            <CheckCircle2 size={16} />
            <span>Peta Selesai</span>
          </div>
        )}
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 pb-24 sm:pb-12 min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-2xl mx-auto relative flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {/* STEP 1 */}
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full py-8"
              >
                <div className="mb-8">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                    <Target size={24} />
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">
                    Apa yang ingin Anda capai?
                  </h1>
                  <p className="text-base sm:text-lg text-slate-600 font-medium">
                    Tuliskan tujuan utama yang sedang Anda kejar saat ini.
                  </p>
                </div>
                
                <div className="space-y-6">
                  <textarea 
                    value={tujuan}
                    onChange={(e) => setTujuan(e.target.value)}
                    placeholder="Contoh: Saya ingin meningkatkan omset bisnis atau mendapatkan klien baru."
                    className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 sm:p-6 text-lg sm:text-xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all resize-none min-h-[160px] shadow-sm font-medium text-slate-800"
                    autoFocus
                  />
                  
                  <button 
                    onClick={handleNextStep1}
                    disabled={tujuan.trim() === ''}
                    className="w-full bg-blue-600 text-white font-black py-4 sm:py-5 px-6 rounded-2xl text-lg sm:text-xl shadow-lg hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Lanjut <ChevronRight size={24} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full py-8"
              >
                <button 
                  onClick={() => setStep(1)} 
                  className="flex items-center gap-2 text-slate-500 font-bold mb-8 hover:text-slate-900 transition-colors w-fit p-2 -ml-2 rounded-xl hover:bg-slate-200/50"
                >
                  <ArrowLeft size={20} /> Kembali
                </button>
                
                <div className="mb-8">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                    <Briefcase size={24} />
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">
                    Anda menjalankan aktivitas atau profesi apa?
                  </h1>
                </div>
                
                <div className="space-y-6">
                  <div className="relative">
                    <select 
                      value={profesi}
                      onChange={(e) => setProfesi(e.target.value)}
                      className="w-full bg-white border-2 border-slate-200 rounded-3xl py-5 sm:py-6 px-6 text-lg sm:text-xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm font-medium text-slate-800 appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Pilih aktivitas / profesi Anda...</option>
                      {PROFESSIONS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none">
                      <ChevronRight size={20} className="text-slate-400 rotate-90" />
                    </div>
                  </div>

                  {profesi === 'Lainnya' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      className="pt-2"
                    >
                      <input 
                        type="text"
                        value={profesiManual}
                        onChange={(e) => setProfesiManual(e.target.value)}
                        placeholder="Sebutkan profesi Anda..."
                        className="w-full bg-white border-2 border-slate-200 rounded-3xl py-5 sm:py-6 px-6 text-lg sm:text-xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm font-medium text-slate-800"
                        autoFocus
                      />
                    </motion.div>
                  )}
                  
                  <button 
                    onClick={handleNextStep2}
                    disabled={profesi.trim() === '' || (profesi === 'Lainnya' && profesiManual.trim() === '')}
                    className="w-full bg-blue-600 text-white font-black py-4 sm:py-5 px-6 rounded-2xl text-lg sm:text-xl shadow-lg hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Lanjut <ChevronRight size={24} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full py-8"
              >
                <button 
                  onClick={() => setStep(2)} 
                  className="flex items-center gap-2 text-slate-500 font-bold mb-8 hover:text-slate-900 transition-colors w-fit p-2 -ml-2 rounded-xl hover:bg-slate-200/50"
                >
                  <ArrowLeft size={20} /> Kembali
                </button>
                
                <div className="mb-8">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                    <TrendingUp size={24} />
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">
                    Target Anda berapa?
                  </h1>
                  <p className="text-base sm:text-lg text-slate-600 font-medium">
                    Masukkan angka atau jumlah yang spesifik untuk dicapai.
                  </p>
                </div>
                
                <div className="space-y-6">
                  <input 
                    type="text"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="Contoh: Rp 50 Juta per bulan atau 10 Klien baru"
                    className="w-full bg-white border-2 border-slate-200 rounded-3xl py-5 sm:py-6 px-6 text-lg sm:text-xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm font-medium text-slate-800"
                    autoFocus
                  />
                  
                  <button 
                    onClick={handleNextStep3}
                    disabled={target.trim() === ''}
                    className="w-full bg-blue-600 text-white font-black py-4 sm:py-5 px-6 rounded-2xl text-lg sm:text-xl shadow-lg hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Lanjut <ChevronRight size={24} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: CARA MENCAPAI TARGET */}
            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full py-8"
              >
                <button 
                  onClick={() => setStep(3)} 
                  className="flex items-center gap-2 text-slate-500 font-bold mb-8 hover:text-slate-900 transition-colors w-fit p-2 -ml-2 rounded-xl hover:bg-slate-200/50"
                >
                  <ArrowLeft size={20} /> Kembali
                </button>
                
                <div className="mb-8">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                    <Wrench size={24} />
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">
                    Fokus Cara Pencapaian?
                  </h1>
                  <p className="text-base sm:text-lg text-slate-600 font-medium">
                    Pilih opsi yang paling sesuai dengan strategi Anda untuk meraih target tersebut.
                  </p>
                </div>
                
                <div className="space-y-6">
                  {(() => {
                    const normProf = getNormalizedProfesi(profesi === 'Lainnya' ? profesiManual : profesi);
                    let options = [];
                    
                    if (normProf === 'CREATOR') {
                      options = ['AdSense / Monetisasi', 'Endorsement / Sponsorship', 'Affiliate Marketing', 'Menjual Jasa', 'Produk Digital', 'Produk Sendiri', 'Kombinasi Beberapa Cara', 'Belum Tahu'];
                    } else if (normProf === 'JASA') {
                      options = ['Fokus Perbanyak Jumlah Klien', 'Fokus Naikkan Harga Jasa (Premium)', 'Kombinasi Keduanya', 'Belum Tahu'];
                    } else if (normProf === 'RETAIL/UMKM' || normProf === 'F&B') {
                      options = ['Tingkatkan Jumlah Transaksi Harian', 'Naikkan Rata-rata Nilai Transaksi (Upsell)', 'Kombinasi Keduanya', 'Belum Tahu'];
                    } else {
                      options = ['Kerja Ekstra / Lembur', 'Ambil Proyek Sampingan / Freelance', 'Penghematan Pengeluaran', 'Kombinasi Berbagai Cara', 'Belum Tahu'];
                    }

                    return (
                      <div className="flex flex-col gap-3">
                        {options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setCaraMencapai(opt)}
                            className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all font-bold text-base sm:text-lg ${
                              caraMencapai === opt 
                                ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm' 
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                  
                  <button 
                    onClick={handleNextStep4}
                    disabled={caraMencapai.trim() === ''}
                    className="w-full bg-blue-600 text-white font-black py-4 sm:py-5 px-6 rounded-2xl text-lg sm:text-xl shadow-lg hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                  >
                    Lihat Peta & Tools <ChevronRight size={24} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: HASIL (PETA SINGKAT & REKOMENDASI) */}
            {step === 5 && (() => {
              const profLower = profesi.toLowerCase();
              const normalizedProfesi = getNormalizedProfesi(profesi === 'Lainnya' ? profesiManual : profesi);
              const combinedTujuanTarget = `${tujuan} ${target}`.toLowerCase();
              
              const isCoway = combinedTujuanTarget.includes('coway') || combinedTujuanTarget.includes('agen coway') || combinedTujuanTarget.includes('health planner') || profLower.includes('coway') || profLower.includes('health planner');
              
              let isUbos = false;
              if (normalizedProfesi === 'CREATOR') {
                isUbos = false;
              } else if (['RETAIL/UMKM', 'JASA', 'F&B'].includes(normalizedProfesi)) {
                const combined = `${combinedTujuanTarget} ${normalizedProfesi}`.toLowerCase();
                isUbos = combined.includes('bisnis') || combined.includes('jual') || combined.includes('toko') || combined.includes('sales') || combined.includes('omset') || combined.includes('klien') || combined.includes('usaha') || combined.includes('karyawan') || combined.includes('freelance') || combined.includes('jasa') || combined.includes('retail') || combined.includes('umkm') || combined.includes('f&b');
              } else {
                isUbos = false;
              }

              return (
              <motion.div 
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full py-8"
              >
                <div className="mb-8 text-center">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <CheckCircle2 size={32} />
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4 leading-tight">
                    Peta Singkat Anda
                  </h1>
                  <p className="text-slate-500 font-medium text-lg">Pemetaan cepat untuk membantu {profesi === 'Lainnya' ? profesiManual : profesi} mencapai target.</p>
                </div>
                
                <div className="space-y-6">
                  {/* Peta Singkat */}
                  <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
                    
                    {/* Data Pengguna (Input) */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 sm:p-6 mb-10 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-slate-300"></div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Target size={14} /> Data Pemetaan Anda
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tujuan</h4>
                          <p className="text-base sm:text-lg font-black text-slate-800 leading-snug">{tujuan}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Aktivitas / Profesi</h4>
                          <p className="text-base sm:text-lg font-black text-slate-800 leading-snug">{profesi === 'Lainnya' ? profesiManual : profesi}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Target</h4>
                          <p className="text-base sm:text-lg font-black text-slate-800 leading-snug">{target}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Cara Pencapaian</h4>
                          <p className="text-base sm:text-lg font-black text-slate-800 leading-snug">{caraMencapai}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Hasil Analisis Sistem */}
                    <div className="relative">
                      <h3 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <Wrench size={14} /> Hasil Analisis Sistem
                      </h3>
                    
                    {(() => {
                      let kebutuhanUtama = "Optimasi personal atau sistem khusus di luar modul standar";
                      let arahSaran = "Petakan langkah harian yang spesifik menuju target, evaluasi progress setiap minggu, dan terus adaptasi dengan kondisi lapangan.";
                      
                      if (isUbos && !isCoway) {
                        kebutuhanUtama = "Digitalisasi operasional & manajemen skala bisnis";
                      } else if (!isUbos && isCoway) {
                        kebutuhanUtama = "Sistem & Strategi Pemasaran Produk Coway";
                      } else if (isUbos && isCoway) {
                        kebutuhanUtama = "Manajemen prospek dan penjualan produk Coway yang terstruktur";
                      } else {
                        // Tidak ada UBOS dan Coway
                        if (normalizedProfesi === 'CREATOR') {
                          kebutuhanUtama = "Konsistensi produksi konten & pertumbuhan audiens organik";
                          arahSaran = "Fokus pada pembuatan jadwal konten yang konsisten, perluas jejaring dengan kreator lain, dan analisis metrik engagement audiens secara berkala.";
                        } else if (profLower.includes('pelajar') || profLower.includes('mahasiswa')) {
                          kebutuhanUtama = "Manajemen waktu belajar & pengembangan skill terstruktur";
                          arahSaran = "Gunakan tools manajemen waktu untuk menyeimbangkan rutinitas, asah skill di luar akademis yang relevan dengan target, dan bangun portofolio proyek sejak dini.";
                        } else if (profLower.includes('karyawan')) {
                          kebutuhanUtama = "Peningkatan produktivitas & jenjang karir profesional";
                          arahSaran = "Tingkatkan spesialisasi skill Anda, bangun jejaring profesional di dalam maupun luar industri, dan buat target pencapaian terukur per kuartal.";
                        } else {
                          kebutuhanUtama = "Sistem manajemen mandiri & optimasi aktivitas harian";
                          arahSaran = "Petakan langkah harian yang lebih spesifik untuk mencapai target, evaluasi progress setiap minggu, dan terus beradaptasi dengan kendala di lapangan.";
                        }
                      }
                      
                      // TARGET BREAKDOWN LOGIC
                      const parseAndBreakdown = (text, category) => {
                        const str = text.toLowerCase();
                        const isMoney = str.includes('rp') || str.includes('rupiah') || str.includes('juta') || str.includes('jt') || str.includes('ribu') || str.includes('omzet') || str.includes('omset') || str.includes('pendapatan');
                        const cleanStr = str.replace(/rp/g, '').replace(/\./g, '').trim();
                        const match = cleanStr.match(/(\d+)\s*(jt|juta|ribu|k|m|miliar)?/);
                        
                        const formatVal = (v) => {
                          if (v >= 1000000) return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(v/1000000) + ' Juta';
                          if (v >= 1000) return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(v/1000) + ' Ribu';
                          return new Intl.NumberFormat('id-ID').format(v);
                        };

                        if (match) {
                          const num = parseInt(match[1], 10);
                          const mult = match[2];
                          let actualNum = num;
                          
                          if (mult === 'jt' || mult === 'juta') actualNum *= 1000000;
                          else if (mult === 'ribu' || mult === 'k') actualNum *= 1000;
                          else if (mult === 'm' || mult === 'miliar') actualNum *= 1000000000;
                          
                          if (actualNum > 0) {
                            if (isMoney) {
                              if (category === 'CREATOR') {
                                let cpmAssumption = 10000;
                                let viewsNeeded = (actualNum / cpmAssumption) * 1000;
                                let endorseAssumption = actualNum > 5000000 ? 500000 : 100000;
                                let endorseNeeded = Math.ceil(actualNum / endorseAssumption);
                                return `Untuk mencapai target **Rp ${formatVal(actualNum)}/bulan**, Anda bisa menargetkan pencapaian *AdSense/Monetisasi* sebesar **~${formatVal(viewsNeeded)} views**, ATAU mendapatkan **${endorseNeeded} deal endorsement** senilai rata-rata Rp ${formatVal(endorseAssumption)}. Pecah target ini ke dalam jumlah konten per minggu.`;
                              } else if (category === 'RETAIL/UMKM' || category === 'F&B') {
                                let avgTransaction = category === 'F&B' ? 50000 : 100000;
                                let transactionsNeeded = Math.ceil(actualNum / avgTransaction);
                                let dailyTransactions = Math.ceil(transactionsNeeded / 30);
                                return `Untuk omzet bulanan **Rp ${formatVal(actualNum)}**, target harian Anda adalah **Rp ${formatVal(actualNum / 30)}**. Dengan asumsi rata-rata per transaksi Rp ${formatVal(avgTransaction)}, Anda butuh sekitar **${transactionsNeeded} transaksi sebulan** atau **${dailyTransactions} transaksi per hari**.`;
                              } else if (category === 'JASA') {
                                let avgProject = actualNum >= 10000000 ? 5000000 : 1000000;
                                let clientsNeeded = Math.ceil(actualNum / avgProject);
                                let leadsNeeded = clientsNeeded * 5;
                                return `Untuk pendapatan jasa **Rp ${formatVal(actualNum)}**, dengan asumsi nilai per klien Rp ${formatVal(avgProject)}, Anda membutuhkan **${clientsNeeded} klien (closing) per bulan**. Untuk mencapainya, Anda idealnya harus memprospek setidaknya **${leadsNeeded} calon klien potensial** (asumsi konversi 20%).`;
                              } else {
                                return `Untuk mendapatkan ekstra **Rp ${formatVal(actualNum)}**, targetkan pencapaian parsial sebesar **Rp ${formatVal(actualNum / 4)} per minggu**. Petakan apakah ini akan didapat dari bonus, proyek sampingan, atau penghematan anggaran harian.`;
                              }
                            } else {
                              // Non-money with numbers
                              if (category === 'CREATOR') {
                                return `Untuk target **${text}**, pastikan Anda memiliki frekuensi *upload* yang terukur. Kejar pencapaian setidaknya **25% progress setiap minggu** lewat eksperimen konten dan interaksi audiens.`;
                              } else if (category === 'JASA') {
                                let clients = actualNum;
                                return `Untuk mendapatkan **${clients} klien/order**, asumsikan tingkat keberhasilan (*closing rate*) Anda 20%. Artinya Anda perlu menjangkau sekitar **${clients * 5} leads per bulan**, atau **${Math.ceil(clients * 5 / 4)} leads per minggu**.`;
                              }
                              if (actualNum >= 4) {
                                return `Untuk mencapai target total **${actualNum}**, target operasional Anda adalah mengejar **${formatVal(actualNum/4)} per minggu**. Buat daftar KPI harian agar laju pencapaian ini tidak meleset.`;
                              }
                            }
                          }
                        }
                        return `Untuk mewujudkan target "${text}", pecahlah pencapaian Anda menjadi *milestone* mingguan. Evaluasi bagian operasional mana yang paling berdampak dan fokuskan energi Anda di sana.`;
                      };

                      const targetBreakdown = parseAndBreakdown(target, normalizedProfesi);

                      // PRIORITAS TINDAKAN LOGIC
                      let langkah1 = "";
                      let langkah2 = "";
                      let langkah3 = "";

                      if (normalizedProfesi === 'CREATOR') {
                        langkah1 = `Buat *content calendar* mingguan yang mengarah langsung ke tujuan: ${tujuan}.`;
                        langkah2 = "Dedikasikan 1 jam setiap hari untuk berinteraksi dengan audiens atau kreator di *niche* Anda.";
                        langkah3 = "Review performa konten setiap akhir minggu dan gandakan format yang paling banyak menghasilkan *engagement*.";
                      } else if (normalizedProfesi === 'RETAIL/UMKM' || normalizedProfesi === 'F&B') {
                        langkah1 = "Hitung ulang biaya operasional dan HPP untuk memastikan margin mencukupi target Anda.";
                        langkah2 = "Fokus optimasi pada satu kanal promosi utama (misal: Instagram/TikTok/Offline) dan konsisten harian.";
                        langkah3 = isUbos ? "Mulai implementasikan UBOS untuk digitalisasi transaksi dan mencegah kebocoran data." : "Catat semua aliran kas secara disiplin setiap hari tanpa terlewat.";
                      } else if (normalizedProfesi === 'JASA') {
                        langkah1 = "Perbaiki portofolio atau katalog layanan Anda agar terlihat lebih profesional bagi calon klien.";
                        langkah2 = "Hubungi kembali klien lama untuk menawarkan layanan tambahan atau meminta *referral*.";
                        langkah3 = isUbos ? "Gunakan sistem seperti UBOS untuk mengelola *database* klien dan *invoice* secara terpusat." : "Tingkatkan *response rate* harian agar setiap *leads* segera terkonversi.";
                      } else if (profLower.includes('pelajar') || profLower.includes('mahasiswa')) {
                        langkah1 = "Tentukan jam fokus harian yang bebas distraksi untuk mengerjakan prioritas utama Anda.";
                        langkah2 = `Gabung ke komunitas atau forum yang searah dengan tujuan: ${tujuan}.`;
                        langkah3 = "Dokumentasikan setiap hasil belajar sebagai cikal bakal portofolio karir Anda.";
                      } else if (profLower.includes('karyawan')) {
                        langkah1 = "Identifikasi satu keahlian spesifik yang paling berdampak langsung pada target Anda saat ini.";
                        langkah2 = "Komunikasikan *progress* pencapaian Anda secara proaktif kepada atasan setiap minggu.";
                        langkah3 = "Sisihkan waktu di akhir pekan untuk merencanakan target harian di minggu berikutnya.";
                      } else {
                        langkah1 = "Catat semua aktivitas harian yang sering membuang waktu dan eliminasi secara bertahap.";
                        langkah2 = "Pecah tujuan besar Anda menjadi tugas-tugas kecil yang bisa diselesaikan dalam 30 menit.";
                        langkah3 = "Lakukan evaluasi rutin setiap hari Minggu malam untuk mempersiapkan eksekusi minggu berikutnya.";
                      }

                      if (isCoway && !isUbos) {
                         langkah3 = "Gunakan tools digital khusus untuk mengelola prospek, memantau funnel penjualan, dan meningkatkan closing rate penjualan Coway.";
                      }

                      return (
                        <>
                          <div className="mb-8 pb-8 border-b border-slate-100">
                            <h3 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Kebutuhan Utama</h3>
                            <p className="text-lg sm:text-xl font-black text-blue-600 leading-snug">{kebutuhanUtama}</p>
                          </div>
                          
                          <div className="mb-8 pb-8 border-b border-slate-100">
                            <h3 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Arah yang Disarankan</h3>
                            
                            {(!isUbos && !isCoway) ? (
                              <div className="bg-slate-50 border border-slate-200 p-5 sm:p-6 rounded-2xl text-slate-700 text-sm sm:text-base font-medium leading-relaxed shadow-sm">
                                {arahSaran}
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {isUbos && (
                                  <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
                                    <div>
                                      <h4 className="font-black text-blue-900 text-lg mb-1">UBOS</h4>
                                      <p className="text-blue-700/80 text-sm">Unified Business Operating System. Platform lengkap pengelola operasional bisnis untuk menutup gap target Anda.</p>
                                    </div>
                                  </div>
                                )}
                                
                                {isCoway && (
                                  <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
                                    <div>
                                      <h4 className="font-black text-blue-900 text-lg mb-1">Coway</h4>
                                      <p className="text-blue-700/80 text-sm">Platform khusus untuk Health Planner Coway memetakan prospek dan melipatgandakan closing rate.</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="mb-8 pb-8 border-b border-slate-100">
                            <h3 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Target Breakdown</h3>
                            <div className="bg-amber-50 border border-amber-200 p-5 sm:p-6 rounded-2xl text-amber-900 text-sm sm:text-base font-medium leading-relaxed shadow-sm">
                              {/* Simple markdown bold renderer */}
                              {targetBreakdown.split('**').map((text, i) => i % 2 === 1 ? <strong key={i} className="font-black text-amber-950">{text}</strong> : text)}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Prioritas Tindakan</h3>
                            <div className="space-y-3">
                              {[langkah1, langkah2, langkah3].map((langkah, index) => (
                                <div key={index} className="flex gap-3 items-start bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                    {index + 1}
                                  </div>
                                  <p className="text-slate-700 font-medium text-sm sm:text-base leading-relaxed">
                                    {langkah.split('*').map((text, i) => i % 2 === 1 ? <strong key={i} className="font-bold text-slate-900">{text}</strong> : text)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                    </div>
                  </div>

                  {/* Lead Capture Section */}
                  {!isSubmitted ? (
                    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 mt-6">
                      <div className="mb-6">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">Simpan Peta Anda</h2>
                        <p className="text-slate-600 font-medium text-sm sm:text-base">
                          Masukkan detail kontak Anda untuk menyimpan hasil pemetaan ini dan mendapatkan akses ke langkah selanjutnya.
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            value={leadName}
                            onChange={(e) => setLeadName(e.target.value)}
                            placeholder="Contoh: Budi Santoso"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1.5">Nomor WhatsApp <span className="text-red-500">*</span></label>
                          <input 
                            type="tel" 
                            value={leadPhone}
                            onChange={(e) => setLeadPhone(e.target.value)}
                            placeholder="Contoh: 08123456789"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1.5">Email (Opsional)</label>
                          <input 
                            type="email" 
                            value={leadEmail}
                            onChange={(e) => setLeadEmail(e.target.value)}
                            placeholder="Contoh: budi@gmail.com"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-slate-800"
                          />
                        </div>
                        <button 
                          onClick={handleSaveLead}
                          disabled={!leadName.trim() || !leadPhone.trim()}
                          className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-md hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                          Simpan Peta Saya
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200 p-6 sm:p-8 rounded-3xl mt-6 text-center shadow-sm">
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={32} />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-emerald-900 mb-2">Peta Berhasil Disimpan!</h2>
                      
                      {isUbos ? (
                        <>
                          <p className="text-emerald-700 font-medium mb-6">Tingkatkan operasional bisnis Anda sekarang juga.</p>
                          <div className="flex flex-col gap-3">
                            <a href="https://ubos.logaritma.id" className="w-full block bg-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-md hover:bg-blue-700 active:scale-95 transition-all text-center">
                              Mulai dengan UBOS
                            </a>
                            <Link href="/" className="w-full block bg-white border border-emerald-200 text-emerald-700 font-bold py-3 px-6 rounded-xl shadow-sm hover:bg-emerald-100 active:scale-95 transition-all text-center">
                              Kembali ke Halaman Utama
                            </Link>
                          </div>
                        </>
                      ) : isCoway ? (
                        <>
                          <p className="text-emerald-700 font-medium mb-6">Tingkatkan produktivitas penjualan dan kelola prospek Anda dengan sistem khusus agen Coway.</p>
                          <div className="flex flex-col gap-3">
                            <a href="https://coway.logaritma.id" className="w-full block bg-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-md hover:bg-blue-700 active:scale-95 transition-all text-center">
                              Masuk ke Sistem Coway Logaritma
                            </a>
                            <Link href="/" className="w-full block bg-white border border-emerald-200 text-emerald-700 font-bold py-3 px-6 rounded-xl shadow-sm hover:bg-emerald-100 active:scale-95 transition-all text-center">
                              Kembali ke Halaman Utama
                            </Link>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-emerald-700 font-medium mb-6">Anda siap mengeksekusi langkah-langkah di peta Anda.</p>
                          <Link href="/" className="w-full block bg-white border border-emerald-200 text-emerald-700 font-bold py-3 px-6 rounded-xl shadow-sm hover:bg-emerald-100 active:scale-95 transition-all text-center">
                            Kembali ke Halaman Utama
                          </Link>
                        </>
                      )}
                    </div>
                  )}

                  {/* CTA Ulangi Removed - Only available after Lead Capture */}
                </div>
              </motion.div>
              );
            })()}
            
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
