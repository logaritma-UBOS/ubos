'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Target, Cog, ListTodo, Wrench, Menu, X, CheckCircle2, ArrowDown, Map as MapIcon } from 'lucide-react';

export default function LandingPage() {
  const [showPlaceholder, setShowPlaceholder] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ── Analytics Tracker ──
  const trackEvent = async (eventType: string) => {
    try {
      const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          metadata: {
            referrer: document.referrer || 'Direct',
            is_mobile: isMobile,
            timestamp: new Date().toISOString(),
          },
        }),
      });
    } catch (_) { /* silent */ }
  };

  useEffect(() => {
    trackEvent('page_view');
    const trackVisitor = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        await fetch('/api/track-visitor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referrer: document.referrer,
            utm_source: urlParams.get('utm_source'),
            utm_medium: urlParams.get('utm_medium'),
            utm_campaign: urlParams.get('utm_campaign'),
            path: window.location.pathname,
            session_id: sessionStorage.getItem('logaritma_session_id') || Math.random().toString(36).substring(2)
          })
        });
      } catch (e) {
        console.error('Failed to log visitor', e);
      }
    };
    trackVisitor();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // ───────────────────────

  const router = useRouter();

  const handleCTA = () => {
    trackEvent('click_cta_mapping');
    router.push('/backward-mapping');
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-600/20 overflow-x-hidden">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src="/assets/images/logo-logaritma.png" alt="Logaritma Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
            <span className="font-black tracking-tight text-xl sm:text-2xl text-slate-900">Logaritma<span className="text-blue-600">.id</span></span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 font-bold text-sm text-slate-700">
            <a href="#masalah" className="hover:text-blue-600 transition-colors">Masalah Utama</a>
            <a href="#backward-mapping" className="hover:text-blue-600 transition-colors">Cara Kerja</a>
            <a href="#solusi" className="hover:text-blue-600 transition-colors">Solusi</a>
            <button onClick={handleCTA} className="bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-blue-600 transition-colors">
              Mulai Pemetaan
            </button>
          </div>
          
          <div className="md:hidden flex items-center">
            <button 
              className="p-2 text-slate-700 hover:text-blue-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
            >
              <div className="px-6 py-6 flex flex-col gap-5 font-bold text-lg text-slate-700">
                <a href="#masalah" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-blue-600 block">Masalah Utama</a>
                <a href="#backward-mapping" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-blue-600 block">Cara Kerja</a>
                <a href="#solusi" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-blue-600 block">Solusi</a>
                <button onClick={() => { setIsMobileMenuOpen(false); handleCTA(); }} className="mt-4 bg-slate-900 text-white px-4 py-4 rounded-xl w-full text-center">
                  Mulai Pemetaan
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 sm:pt-40 pb-20 sm:pb-28 px-4 sm:px-6 max-w-5xl mx-auto text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-600 font-bold text-[10px] sm:text-xs tracking-[0.1em] uppercase border border-red-100 mb-8"
        >
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          Khusus untuk Anda yang sedang mengejar target
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }} 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight text-slate-900 mb-6"
        >
          Punya Target Besar, Tapi Bingung <span className="text-blue-600">Langkah Nyata</span> Untuk Mencapainya?
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }} 
          className="text-lg sm:text-xl md:text-2xl text-slate-600 font-medium max-w-3xl mx-auto leading-relaxed mb-10"
        >
          Berhentilah menebak-nebak. Pendekatan <span className="font-bold text-slate-900 border-b-2 border-blue-600">Backward Mapping</span> Logaritma akan membedah target akhir Anda menjadi langkah-langkah harian yang pasti dan terukur.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }} 
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
        >
          <button onClick={handleCTA} className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 sm:py-5 rounded-full font-black text-lg sm:text-xl hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/20 hover:-translate-y-1 transition-all">
            Mulai Pemetaan Target
          </button>
          
          <a 
            href="#video-panduan" 
            className="w-full sm:w-auto bg-white text-slate-800 border-2 border-slate-200 px-8 py-4 sm:py-5 rounded-full font-bold text-lg hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
          >
            <Play size={24} className="fill-slate-800 text-slate-800" /> Lihat Cara Kerja Logaritma
          </a>
        </motion.div>
      </section>

      {/* SECTION MASALAH */}
      <section id="masalah" className="py-24 bg-slate-50 border-t border-slate-200 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-8 leading-tight tracking-tight">
            Target Sudah Ada, Tapi <br className="hidden md:block" /> Eksekusi Masih Berantakan?
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 font-medium max-w-3xl mx-auto leading-relaxed">
            Banyak pebisnis dan profesional gagal bukan karena targetnya salah, melainkan karena <strong className="text-slate-900 bg-yellow-100 px-1 rounded">mereka tidak tahu aktivitas spesifik apa yang harus dilakukan setiap harinya</strong> untuk mencapai target tersebut. Anda sibuk, tapi seolah jalan di tempat.
          </p>
        </motion.div>
      </section>

      {/* SECTION BACKWARD MAPPING */}
      <section id="backward-mapping" className="py-24 sm:py-32 bg-white px-4 sm:px-6 overflow-hidden">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } }
          }}
          className="max-w-6xl mx-auto text-center"
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-bold text-xs tracking-widest uppercase mb-6">
            Metode Kerja
          </motion.div>
          <motion.h2 variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-16 tracking-tight">
            Alur Logaritma Backward Mapping
          </motion.h2>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
            
            {/* Background Line for Desktop */}
            <motion.div variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1 } }} transition={{ duration: 0.8 }} className="hidden md:block absolute top-12 left-[10%] right-[10%] h-1 bg-slate-100 z-0 rounded-full origin-left"></motion.div>
            
            {[
              { title: "Target", desc: "Tentukan gol akhir atau angka", icon: Target },
              { title: "Pemetaan", desc: "Tarik mundur alurnya", icon: MapIcon },
              { title: "Kebutuhan", desc: "Analisis gap yang ada", icon: Cog },
              { title: "Action Plan", desc: "Langkah harian terukur", icon: ListTodo },
              { title: "Sistem", desc: "Alat pendukung eksekusi", icon: Wrench }
            ].map((step, i) => (
              <motion.div key={i} variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} className="flex flex-row md:flex-col items-center gap-6 md:gap-4 text-left md:text-center w-full md:w-auto relative z-10 bg-white p-6 md:p-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-slate-100 md:border-none">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-3xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100 text-blue-600 flex items-center justify-center font-black text-2xl shrink-0 hover:scale-110 transition-transform">
                  <step.icon size={32} strokeWidth={2.5} />
                </div>
                <div className="flex-1 md:mt-4">
                  <h3 className="font-black text-slate-900 text-lg sm:text-xl mb-1">{step.title}</h3>
                  <p className="text-slate-500 font-medium text-sm sm:text-base leading-snug">{step.desc}</p>
                </div>
                {/* Mobile arrows */}
                {i < 4 && <ArrowDown className="md:hidden text-slate-200 absolute -bottom-6 left-1/2 -translate-x-1/2 z-0" size={24} />}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION VIDEO PANDUAN */}
      <section id="video-panduan" className="py-24 sm:py-32 bg-slate-50 px-4 sm:px-6 relative border-t border-slate-200">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-red-50 text-red-600 font-bold text-xs tracking-widest uppercase mb-6 border border-red-100 gap-2">
            <Play size={14} className="fill-red-600" /> VIDEO PANDUAN
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            Belum Tahu Cara Kerjanya?
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed mb-12">
            Lihat cara Logaritma membantu Anda memetakan target menjadi langkah yang lebih jelas.
          </p>

          <div className="relative max-w-4xl mx-auto">
            {/* Subtle glow effect behind the video */}
            <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[2rem] sm:rounded-[3rem] blur-xl opacity-20 z-0"></div>
            
            {/* 16:9 Aspect ratio container */}
            <div className="w-full aspect-video rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden border-4 sm:border-8 border-white bg-slate-900 z-10">
              <iframe 
                src="https://www.youtube.com/embed/4i8HLUOZAu0" 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </div>
          </div>
          
          <p className="mt-8 text-slate-500 font-medium text-sm sm:text-base max-w-lg mx-auto">
            Mulai dari target Anda. Logaritma membantu memetakan kebutuhan sampai langkah berikutnya.
          </p>
        </motion.div>
      </section>

      {/* SECTION SOLUSI */}
      <section id="solusi" className="py-24 sm:py-32 bg-slate-900 text-white px-4 sm:px-6 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto text-center relative z-10"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-8 leading-tight tracking-tight">
            Sistem Mengikuti Kebutuhan Anda, Bukan Sebaliknya.
          </h2>
          <p className="text-lg sm:text-xl text-slate-400 font-medium leading-relaxed mb-16 max-w-3xl mx-auto">
            Kami tidak memaksa Anda memakai sistem yang tidak Anda butuhkan. Setelah melakukan pemetaan, kami akan memberikan arahan solusi spesifik yang tepat untuk Anda.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-left">
            <motion.div whileHover={{ y: -5 }} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 sm:p-10 rounded-[2rem] hover:bg-slate-800 transition-colors cursor-default">
              <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                <Wrench size={32} />
              </div>
              <h3 className="text-2xl font-black mb-4 text-white">UBOS & Coway</h3>
              <p className="text-slate-400 font-medium leading-relaxed text-lg">
                Jika dari pemetaan terdeteksi bahwa bisnis Anda cocok, sistem mungkin merekomendasikan alat canggih seperti UBOS (Unified Business Operating System) atau produk pendukung operasional Coway untuk mengakselerasi pencapaian Anda.
              </p>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 sm:p-10 rounded-[2rem] hover:bg-slate-800 transition-colors cursor-default">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                <ListTodo size={32} />
              </div>
              <h3 className="text-2xl font-black mb-4 text-white">Manual Action Plan</h3>
              <p className="text-slate-400 font-medium leading-relaxed text-lg">
                Jika Anda belum memenuhi kriteria sistem otomatis, Anda tetap membawa pulang <strong className="text-emerald-400">Peta Singkat dan Prioritas Tindakan</strong> yang tajam untuk dieksekusi secara mandiri.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>


      {/* SECTION CTA AKHIR */}
      <section className="py-24 sm:py-32 bg-blue-600 px-4 sm:px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-10 leading-tight tracking-tight">
            Sudah Tahu Target Anda?
          </h2>
          <button 
            onClick={handleCTA} 
            className="w-full sm:w-auto bg-white text-slate-900 px-10 py-5 sm:py-6 rounded-full font-black text-xl sm:text-2xl hover:bg-slate-50 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/20 transition-all"
          >
            Mulai Dari Target Anda
          </button>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 text-center text-slate-500 font-medium text-sm bg-white">
        <p>&copy; {new Date().getFullYear()} Logaritma.id - Hak Cipta Dilindungi.</p>
      </footer>

      {/* Modal Placeholder */}
      <AnimatePresence>
        {showPlaceholder && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-8 w-full max-w-[calc(100vw-32px)] sm:max-w-sm relative text-center shadow-2xl"
            >
              <button 
                onClick={() => setShowPlaceholder(false)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Play size={32} className="fill-blue-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">Video Belum Tersedia</h3>
              <p className="text-slate-500 font-medium mb-8 text-base">
                Video panduan masih dalam proses produksi. (Placeholder URL YouTube)
              </p>
              <button 
                onClick={() => setShowPlaceholder(false)} 
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors text-base"
              >
                Tutup
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
