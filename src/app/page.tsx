'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowRight, XCircle, CheckCircle2, ChevronRight, HelpCircle, X, User, ShoppingBag, PieChart, SplitSquareHorizontal, ArrowDownToLine, Phone, Target, Zap, BrainCircuit, Activity, LineChart, Quote, Utensils, Printer, Store, Wrench } from 'lucide-react';
import { toast } from 'sonner';

function normalizePhone(phone: string) {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  return cleaned;
}

export default function LandingPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showDevPopup, setShowDevPopup] = useState(false);
  const [showExistingPopup, setShowExistingPopup] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [dashboardLink, setDashboardLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
    } catch (_) {}
  };

  useEffect(() => {
    trackEvent('page_view');
    
    // Save affiliate referral to localStorage (30 days expiry implied by localstorage permanence until cleared)
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      localStorage.setItem('affiliate_ref', ref);
    }

    const trackVisitor = async () => {
      try {
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
      } catch (e) {}
    };
    trackVisitor();
  }, []);

  const [formData, setFormData] = useState({
    password: '',
    merchantName: '',
    whatsapp: '',
    category: 'Kuliner & F&B'
  });

  const faqs = [
    { q: "Apa bedanya UBOS dengan Aplikasi Kasir (POS) di luaran sana?", a: "Kasir biasa hanya mencatat uang masuk dan keluar. UBOS adalah 'Toolset Eksekusi Metode Logaritma' yang bekerja mundur: Anda masukkan target profit, UBOS akan mengunci maksimal belanja bahan harian (Margin Guard) agar profit tersebut PASTI tercapai, bukan sekadar sisa-sisa." },
    { q: "Bagaimana cara UBOS mengatasi potongan Grab/Gojek/ShopeeFood?", a: "UBOS punya fitur Markup Harga Platform otomatis. Sistem akan menghitungkan harga jual yang pas untuk Gofood (35%), Grabfood (45%), atau ShopeeFood (50%) agar profit bersih Anda tidak tergerus komisi aplikator." },
    { q: "Apakah ini bikin repot karyawan di kasir?", a: "Sama sekali tidak! Justru karyawan Anda hanya perlu klik-klik pesanan (sangat simpel). Sistem kerumitan HPP dan Margin Guard berjalan otomatis di belakang layar untuk Anda sang Owner." }
  ];

  const openRegisterModal = (kategori?: string) => {
    if (kategori) {
      setFormData({ ...formData, category: kategori });
    }
    setShowModal(true);
  };

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      let cleanWA = normalizePhone(formData.whatsapp);
      if (cleanWA.length < 10) {
        throw new Error("Nomor WhatsApp tidak valid. Minimal 10 digit.");
      }
      
      const { data: existingWaMerchant } = await supabase
        .from('merchants')
        .select('id')
        .eq('whatsapp', cleanWA)
        .maybeSingle();

      const { data: existingWaLead } = await supabase
        .from('leads')
        .select('id')
        .eq('no_wa', cleanWA)
        .maybeSingle();

      if (existingWaMerchant || existingWaLead) {
        setShowModal(false);
        setShowExistingPopup(true);
        return;
      }

      const isFnB = formData.category === "Kuliner & F&B";
      const isPercetakan = formData.category.includes("Percetakan") || formData.category === "Percetakan & ATK";
      const funnelDest = (isFnB || isPercetakan) ? 'UBOS' : 'MEMBER_AREA';

      const leadData = {
        nama_usaha: formData.merchantName,
        whatsapp: cleanWA,
        kategori_usaha: formData.category,
      };
      
      localStorage.setItem('ubos_lead', JSON.stringify(leadData));
      if (isFnB || isPercetakan) {
        localStorage.setItem('ubos_temp_pass', formData.password);
      }

      // Ambil ref dari LocalStorage (atau URL jika belum tersimpan)
      let refId = null;
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        refId = urlParams.get('ref') || localStorage.getItem('affiliate_ref');
      }

      // Panggil API Route untuk bypass RLS & Handle Cek/Insert
      const res = await fetch('/api/leads/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_usaha: formData.merchantName,
          no_wa: cleanWA,
          kategori: formData.category,
          password: formData.password,
          funnel_destination: funnelDest,
          ref_id: refId
        })
      });

      let result;
      try {
        const textRes = await res.text();
        try {
          result = JSON.parse(textRes);
        } catch (e) {
          console.error("Non-JSON Response from API:", textRes.substring(0, 200));
          if (res.status === 404) {
            throw new Error('Sistem sedang dalam proses pembaruan (Vercel Deploying). Mohon tunggu 1-2 menit lalu coba lagi.');
          }
          throw new Error('500 Error: ' + textRes.substring(0, 100));
        }
      } catch (e: any) {
        throw new Error(e.message || 'Terjadi kesalahan sistem.');
      }

      if (!res.ok || !result.success) {
        throw new Error(result?.error || 'Gagal mendaftar. Silakan coba lagi.');
      }

      if (!result.isNew) {
        // PENANGANAN USER LAMA (EXISTING USER)
        setShowModal(false);
        toast.success("Login berhasil! Mengalihkan...");
        
        localStorage.setItem('wa_member_session', JSON.stringify({
          no_wa: cleanWA,
          nama_usaha: formData.merchantName,
          kategori: formData.category
        }));

        if (result.data?.funnel_destination === 'UBOS' || isFnB || isPercetakan) {
          const slug = formData.merchantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'dashboard';
          if (isPercetakan || formData.category.toLowerCase().includes('percetakan')) {
            router.push(`/ubos/percetakan/${slug}`);
          } else {
            router.push(`/ubos/kuliner/${slug}`);
          }
        } else {
          setShowDevPopup(true);
        }
        return;
      }
      
      // AUTO-WELCOME WA VIA FONNTE (HANYA UNTUK USER BARU)
      const katSlug = formData.category.toLowerCase().split(' ')[0].replace(/[^a-z]+/g, '');
      const merchantSlug = formData.merchantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'dashboard';
      const dashboardUrl = `https://logaritma.id/ubos/${katSlug}/${merchantSlug}`;

      try {
        const welcomeMessage = `Selamat Datang di Logaritma UBOS! 🚀\n\nHai Kak dari ${formData.merchantName}, pendaftaran akun Anda telah berhasil.\nBerikut adalah detail akun akses Anda:\n\n• Nama Usaha : ${formData.merchantName}\n• Kategori   : ${formData.category}\n• No WhatsApp: ${cleanWA}\n• Password   : ${formData.password}\n\nSilakan klik link di bawah untuk langsung masuk ke Dashboard Bisnis Anda:\n${dashboardUrl}\n\nSimpan pesan ini agar Anda tidak lupa password akses Anda.\nTerimakasih dan selamat mengunci profit harian!`;
        
        const waRes = await fetch('/api/wa/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target: cleanWA,
            message: welcomeMessage
          })
        });

        const waData = await waRes.json();
        if (!waRes.ok || !waData.success) {
          toast.warning(`Peringatan: Pesan WA gagal terkirim. Pastikan nomor ${cleanWA} terdaftar di WhatsApp.`, { duration: 8000 });
        }
      } catch (waErr) {
        console.error("Gagal mengirim WA Welcome:", waErr);
        toast.warning("Peringatan: Gagal terhubung ke server WhatsApp. Pastikan koneksi stabil.");
      }
      
      setShowModal(false);

      // SET WA MEMBER SESSION TO BYPASS LOGIN ON DASHBOARD
      localStorage.setItem('wa_member_session', JSON.stringify({
        no_wa: cleanWA,
        nama_usaha: formData.merchantName,
        kategori: formData.category
      }));

      // AUTO LOGIN & REDIRECT SETELAH DAFTAR
      try {
        const dummyEmail = `${cleanWA}@logaritma.id`;
        let authUser = null;
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: dummyEmail,
          password: formData.password
        });

        if (signUpError && signUpError.message.toLowerCase().includes('already registered')) {
          const { data: signInData } = await supabase.auth.signInWithPassword({
            email: dummyEmail,
            password: formData.password
          });
          authUser = signInData?.user;
        } else {
          authUser = signUpData?.user;
        }

        if (authUser) {
          // Cek apakah merchant sudah ada untuk user ini (menghindari duplicate RLS error)
          const { data: existingM } = await supabase.from('merchants').select('id').eq('user_id', authUser.id).maybeSingle();
          
          if (!existingM) {
            await supabase.from('merchants').insert([{
              user_id: authUser.id,
              nama_usaha: formData.merchantName,
              whatsapp: cleanWA,
              kategori_usaha: formData.category,
              created_at: new Date().toISOString()
            }]);
          }
          supabase.from('leads').update({ status: 'Converted' }).eq('no_wa', cleanWA).then();
        }
      } catch (authErr) {
        console.error("Auto login error:", authErr);
      }

      setDashboardLink(dashboardUrl);
      setShowWelcomePopup(true);
      
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('sudah terdaftar')) {
        setShowModal(false);
        setShowExistingPopup(true);
      } else {
        toast.error(err.message || 'Terjadi kesalahan.');
      }
    } finally {
      setLoading(false);
    }
  };

  const animProps = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.5, ease: "easeOut" }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-500/20 text-slate-800">
      
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-red-600 text-white text-center py-2 px-2 sm:px-4 text-[11px] sm:text-sm font-bold tracking-wide relative z-50"
      >
        ⚠️ KUNCI TARGET BISNIS ANDA: Metode Logaritma (Backward Mapping) + UBOS & Logaritma AI!
      </motion.div>

      {/* Top Navigation */}
      <motion.nav 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="sticky top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-slate-200 z-40 shadow-sm"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img src="/assets/images/logo-logaritma.png" alt="Logaritma Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="font-black text-slate-900 tracking-tight text-lg sm:text-2xl leading-none">LOGARITMA.ID</span>
            </div>
          </div>
          <div className="flex items-center shrink-0">
            <a href="/auth" className="text-sm sm:text-base font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-5 py-2 rounded-full transition-colors flex items-center gap-2">
              <User size={16} /> Login
            </a>
          </div>
        </div>
      </motion.nav>

      {/* 2. HERO SECTION */}
      <section className="pt-8 sm:pt-14 pb-12 sm:pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <div className="flex flex-col items-center space-y-5 sm:space-y-7">
          
          <motion.div {...animProps}>
            <div className="inline-flex items-center justify-center text-center w-fit mx-auto bg-red-100 text-red-700 px-4 py-2 rounded-full text-[10px] sm:text-xs font-black tracking-widest border border-red-200 uppercase shadow-sm leading-tight">
              <span>🔴 Khusus untuk Anda Pemilik Bisnis Kuliner, Percetakan, Ritel, & Jasa yang Rela Banting Tulang Tiap Hari...</span>
            </div>
          </motion.div>
          
          <motion.h1 
            {...animProps} transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.2] sm:leading-[1.1] tracking-tight"
          >
            Capek Kerja Keras Setiap Hari, Tapi Bisnis Cuma <span className="bg-yellow-300 px-2 py-0.5 rounded-lg inline-block transform -rotate-1 mt-1">Jalan Di Tempat</span> dan Nggak Pernah Nyampai Target?
          </motion.h1>
          
          <motion.p 
            {...animProps} transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
            className="text-sm sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            Saatnya tinggalkan cara lama yang cuma bikin pusing! Kenalkan <strong>Metode Logaritma</strong> dengan pendekatan <em>Backward Mapping</em>—sistem yang membantu Anda menembus target bisnis dari <strong>Outcome hingga Impact nyata</strong>, bukan sekadar jualan tanpa arah.
          </motion.p>

          <motion.div 
            {...animProps} transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
            className="w-full flex flex-col items-center gap-3 sm:gap-4 pt-4 sm:pt-6"
          >
            <button 
              onClick={() => { trackEvent('click_cta_register'); openRegisterModal(); }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-xl font-black py-4 sm:py-5 px-6 sm:px-12 rounded-full shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all active:scale-95 flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto group border-b-[4px] border-blue-800"
            >
              👉 [ SAYA MAU CAPAI TARGET BISNIS SEKARANG! ]
            </button>
            <p className="text-xs sm:text-sm font-bold text-slate-500 flex items-center justify-center gap-1.5 leading-tight text-center">
              <ShieldCheck size={16} className="text-blue-500 shrink-0" /> Gunakan UBOS & Dampingi Bisnis Anda dengan Logaritma AI
            </p>
          </motion.div>
        </div>
      </section>

      {/* 3. PROBLEM & AGITATION SECTION */}
      <section className="pt-12 pb-16 sm:pt-16 sm:pb-20 px-4 sm:px-6 bg-slate-900 text-white relative border-y-8 border-red-600 overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div {...animProps} className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-black mb-4 leading-tight text-white px-2">
              Mari Bicara Jujur... <span className="text-red-400">Pernah Mengalami Hal Ini?</span>
            </h2>
            <div className="w-16 sm:w-24 h-1.5 bg-red-500 mx-auto rounded-full"></div>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {[
              { text: "Punya target omset tinggi, tapi bingung besok harus ngapain secara operasional?" },
              { text: "Catatan keuangan ada, laporan rapi, tapi pas akhir bulan tetep bingung: 'Duitnya lari ke mana ya?'" },
              { text: "Beli banyak software & tools bisnis, tapi akhirnya cuma jadi 'pajangan' karena nggak tau cara pakainya buat ngejar target?" },
              { text: "Merasa jalan sendirian, nggak ada yang ngingetin saat operasional mulai melenceng dari jalur?" }
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.15 }}
                className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg flex items-start gap-4"
              >
                <XCircle size={28} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-slate-300 font-semibold text-sm sm:text-base leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>

          <motion.div 
             {...animProps} transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
             className="mt-12 bg-red-600/20 border border-red-500/50 p-6 sm:p-10 rounded-3xl text-center"
          >
            <p className="text-base sm:text-xl font-medium leading-relaxed">
              Kalau jawaban Anda <strong className="text-yellow-400 text-xl sm:text-2xl font-black">YA</strong>, jujur... Anda <strong>TIDAK sendirian</strong>. <br className="hidden sm:block" />
              Ribuan owner UMKM terjebak dalam lingkaran setan yang sama: <br />
              <strong className="text-white bg-red-600 px-3 py-1.5 rounded-lg inline-block mt-3 font-black text-sm sm:text-lg uppercase tracking-wide">Sibuk di Output (kegiatan harian), tapi Nggak Pernah Dapet Outcome & Impact-nya!</strong>
            </p>
          </motion.div>
        </div>
      </section>

      {/* 4. THE SOLUTION & CONCEPT */}
      <section id="solusi" className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-50 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...animProps}>
            <div className="inline-block bg-blue-100 text-blue-800 font-black px-4 py-1.5 rounded-lg text-xs sm:text-sm mb-6 uppercase tracking-wider border border-blue-200 shadow-sm">
              Bukan Sekadar Tools Biasa. Ini Adalah 'Sistem Navigasi Bisnis' Anda!
            </div>
          </motion.div>
          
          <motion.div {...animProps} transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }} className="bg-white border-2 border-slate-200 p-8 sm:p-12 rounded-[2rem] shadow-xl mb-12 relative">
            <Quote className="absolute top-6 left-6 text-slate-100 w-16 h-16" />
            <p className="text-base sm:text-xl text-slate-700 font-medium leading-relaxed relative z-10 text-left sm:text-center px-2 sm:px-8">
              Bayangkan kalau Anda mau pergi ke Jakarta dari Bandung. Apakah Anda langsung tancap gas tanpa tahu jalurnya? Tentu tidak! <strong>Anda tentukan dulu tujuannya (Target/Impact)</strong>, baru ditarik mundur menentukan rutenya (<em>Backward Mapping</em>). Itulah <strong className="bg-yellow-200 px-2 py-0.5 rounded">Metode Logaritma</strong>.
            </p>
          </motion.div>
          
          <motion.p {...animProps} transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }} className="text-base sm:text-2xl text-slate-800 font-bold leading-relaxed max-w-3xl mx-auto">
            Di Logaritma.id, kami <strong className="text-red-600 underline">tidak memberikan tools pasif</strong> yang cuma nunggu diisi data. Kami memberikan <strong>UBOS (Universal Business Operational System)</strong> yang dipadu dengan <strong>Logaritma AI</strong>.
          </motion.p>
        </div>
      </section>

      {/* 5. THE POWER OF UBOS & LOGARITMA AI */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white relative border-t border-slate-200">
        <div className="max-w-5xl mx-auto">
          <motion.div {...animProps} className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
              2 Pilar Utama Yang Akan <span className="bg-yellow-300 px-2 py-0.5 rounded-lg inline-block transform -rotate-1 mt-1">Mengubah Cara Anda</span> Menjalankan Bisnis:
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
            {/* Pilar 1 */}
            <motion.div {...animProps} transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }} className="bg-blue-50 border-2 border-blue-200 p-8 sm:p-10 rounded-[2rem] relative overflow-hidden group hover:border-blue-400 transition-colors shadow-lg">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform">
                <Activity size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Pilar 1: UBOS</h3>
              <p className="text-xs sm:text-sm font-bold text-blue-700 uppercase tracking-widest mb-4">Universal Business Operational System</p>
              <p className="text-slate-600 font-medium mb-8">Sistem operasional fleksibel yang dirancang khusus untuk sektor Kuliner, Percetakan, Ritel, dan Jasa.</p>
              
              <ul className="space-y-5">
                <li className="flex items-start gap-4">
                  <CheckCircle2 size={24} className="text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-sm sm:text-base font-semibold text-slate-700 leading-relaxed"><strong>Backward Mapping Framework</strong> — Memecah target besar tahunan/bulanan Anda menjadi action plan harian yang sangat jelas untuk tim.</p>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle2 size={24} className="text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-sm sm:text-base font-semibold text-slate-700 leading-relaxed"><strong>Fokus pada Outcome & Impact</strong> — Bukan cuma nyatat transaksi, tapi memastikan setiap langkah operasional berdampak langsung ke profit.</p>
                </li>
              </ul>
            </motion.div>

            {/* Pilar 2 */}
            <motion.div {...animProps} transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }} className="bg-indigo-50 border-2 border-indigo-200 p-8 sm:p-10 rounded-[2rem] relative overflow-hidden group hover:border-indigo-400 transition-colors shadow-lg">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform">
                <BrainCircuit size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Pilar 2: Logaritma AI</h3>
              <p className="text-xs sm:text-sm font-bold text-indigo-700 uppercase tracking-widest mb-4">Asisten Bisnis 24/7</p>
              <p className="text-slate-600 font-medium mb-8">Bukan sekadar AI generik. Ini adalah <strong>Co-Pilot bisnis Anda</strong>.</p>
              
              <ul className="space-y-5">
                <li className="flex items-start gap-4">
                  <Zap size={24} className="text-indigo-600 shrink-0 mt-0.5" fill="currentColor" />
                  <p className="text-sm sm:text-base font-semibold text-slate-700 leading-relaxed"><strong>AKTIF</strong> — Dia yang bakal nagih dan ngingetin Anda! <em className="bg-white px-2 py-1 rounded inline-block mt-2 shadow-sm text-indigo-900 border border-indigo-100 font-bold">"Bos, penjualan minggu ini kurang 15% dari target. Yuk jalankan strategi promo A!"</em></p>
                </li>
                <li className="flex items-start gap-4">
                  <LineChart size={24} className="text-indigo-600 shrink-0 mt-0.5" />
                  <p className="text-sm sm:text-base font-semibold text-slate-700 leading-relaxed"><strong>REAKTIF</strong> — Bingung mengambil keputusan? Tanya Logaritma AI kapan saja, dan dapatkan analisis berbasis data bisnis Anda sendiri.</p>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. SOCIAL PROOF & CALLOUT */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-900 text-white relative">
        <div className="max-w-5xl mx-auto">
          {/* Quote Box */}
          <motion.div {...animProps} className="bg-slate-800/80 border border-slate-700 rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto mb-16 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-[50px] rounded-full"></div>
            <p className="text-lg sm:text-2xl font-medium leading-relaxed italic text-slate-300 relative z-10">
              "Aset terbesar seorang Owner Bisnis bukanlah seberapa keras dia bekerja, tapi <strong className="text-white underline decoration-blue-500">seberapa tepat SISTEM</strong> yang membimbing jalannya setiap hari."
            </p>
          </motion.div>

          <motion.div {...animProps} transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }} className="text-center mb-10 sm:mb-14">
            <h3 className="text-2xl sm:text-3xl font-black text-white">Cocok untuk Anda yang memiliki bisnis:</h3>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: Utensils, title: "Kuliner", desc: "Atur target harian, kontrol bahan baku, & kejar margin presisi." },
              { icon: Printer, title: "Percetakan", desc: "Petakan kapasitas produksi dengan target revenue harian." },
              { icon: Store, title: "Ritel", desc: "Jaga ketersediaan stok & pergerakan omset tanpa takut bocor." },
              { icon: Wrench, title: "Jasa", desc: "Hitung capacity rate dan pastikan setiap project menghasilkan profit riil." }
            ].map((b, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 + (i * 0.1) }}
                className="bg-slate-800 p-6 sm:p-8 rounded-[2rem] border border-slate-700 hover:border-blue-500 transition-colors text-center flex flex-col items-center"
              >
                <b.icon size={42} className="text-blue-400 mb-5" />
                <h4 className="text-xl font-black mb-3 text-white">{b.title}</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CLOSING & CALL TO ACTION */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 relative bg-white border-t border-slate-200">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-blue-900 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-16 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/30 blur-[80px] rounded-full"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-800/50 blur-[80px] rounded-full"></div>

          <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 sm:mb-8 relative z-10 leading-tight">
            Jangan Biarkan Bisnis Anda Jalan <span className="text-yellow-300">Tanpa Arah</span> Satu Hari Pun Lagi!
          </h2>
          <p className="text-base sm:text-lg text-blue-100 font-medium mb-10 sm:mb-12 max-w-2xl mx-auto relative z-10 leading-relaxed">
            Pilihan ada di tangan Anda hari ini: Tetap pakai cara lama yang bikin lelah tanpa hasil pasti... atau <strong className="text-white bg-blue-800/50 px-2 py-0.5 rounded">mulai gunakan Metode Logaritma</strong> yang siap membimbing Anda mencapai Outcome & Impact yang selama ini diimpikan.
          </p>
          
          <button 
            onClick={() => { trackEvent('click_cta_register'); openRegisterModal(); }}
            className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 text-sm sm:text-xl font-black py-5 sm:py-6 px-6 sm:px-10 rounded-full shadow-xl shadow-yellow-400/30 hover:shadow-yellow-400/50 transition-all active:scale-95 flex items-center justify-center w-full sm:w-auto mx-auto group border-b-[5px] border-yellow-600 relative z-10"
          >
            👉 [ KLIK DI SINI UNTUK MULAI BERSAMA LOGARITMA.ID ]
          </button>
          <p className="text-blue-200 text-xs sm:text-sm font-bold mt-5 relative z-10">Mulai petakan target bisnis Anda dengan UBOS & Logaritma AI sekarang!</p>
        </motion.div>
      </section>

      {/* 8. FAQ Section */}
      <section id="faq" className="py-16 sm:py-20 px-4 sm:px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto">
          <motion.div {...animProps} className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 sm:mb-4">Tanya Jawab (FAQ) Singkat</h2>
          </motion.div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, ease: "easeOut", delay: idx * 0.1 }}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 sm:p-6 flex items-start justify-between text-left group"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="mt-0.5 text-blue-500 group-hover:text-blue-600 transition-colors"><HelpCircle size={18} className="sm:w-5 sm:h-5" /></div>
                    <h3 className="text-sm sm:text-lg font-bold text-slate-800">{faq.q}</h3>
                  </div>
                  <ChevronRight className={`mt-1 shrink-0 transition-transform duration-300 ${openFaq === idx ? 'rotate-90 text-blue-600' : 'text-slate-400'}`} size={18} />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 text-sm sm:text-base text-slate-600 leading-relaxed font-medium pl-11 sm:pl-14"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 sm:py-10 px-6">
        <motion.div {...animProps} className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <span className="font-black text-slate-800 text-lg sm:text-xl tracking-tight">LOGARITMA.ID</span>
          </div>
          <p className="text-slate-500 font-bold text-xs sm:text-sm">Sistem Eksekusi Logaritma © {new Date().getFullYear()}</p>
        </motion.div>
      </footer>

      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl sm:rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border-[3px] sm:border-4 border-white">
            <div className="p-5 sm:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50 relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-blue-500/5 rounded-full -mr-8 -mt-8 sm:-mr-10 sm:-mt-10"></div>
              <div className="relative z-10">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-1">Mulai Amankan Profit!</h3>
                <p className="text-xs sm:text-sm text-slate-500 font-bold">Daftar instan. Gratis 7 Hari.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors relative z-10">
                <X size={18} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-8 overflow-y-auto">
              <form id="register-modal" onSubmit={handleRegister} className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-2">Nama Usaha / Toko</label>
                  <input required type="text" value={formData.merchantName} onChange={e => setFormData({...formData, merchantName: e.target.value})} placeholder="Nama Brand Anda" className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-slate-50 border-2 border-slate-200 rounded-xl sm:rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-800 text-sm sm:text-base" />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-2">Nomor WhatsApp Aktif</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none text-slate-400">
                      <Phone size={16} className="sm:w-4 sm:h-4" />
                    </div>
                    <input required type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} placeholder="0812xxxx..." className="w-full pl-10 sm:pl-12 pr-4 sm:pr-5 py-3 sm:py-4 bg-slate-50 border-2 border-slate-200 rounded-xl sm:rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-800 text-sm sm:text-base" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-2">Password Login</label>
                  <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Minimal 6 karakter" minLength={6} className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-slate-50 border-2 border-slate-200 rounded-xl sm:rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-800 text-sm sm:text-base" />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-2">Kategori Usaha</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-slate-50 border-2 border-slate-200 rounded-xl sm:rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-800 appearance-none text-sm sm:text-base">
                    <option value="Kuliner & F&B">Kuliner & F&B</option>
                    <option value="Percetakan">Percetakan</option>
                    <option value="Ritel">Ritel</option>
                    <option value="Jasa / Lainnya">Jasa / Lainnya</option>
                  </select>
                </div>
              </form>
            </div>

            <div className="p-5 sm:p-8 pt-0 bg-white mt-1 sm:mt-2 shrink-0">
              <button disabled={loading} form="register-modal" type="submit" className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black text-sm sm:text-lg py-4 sm:py-5 rounded-xl sm:rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 border-b-4 border-blue-800">
                {loading ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> : <>MASUK KE DASHBOARD SEKARANG <ArrowRight size={18} strokeWidth={3} className="sm:w-5 sm:h-5" /></>}
              </button>
              <p className="text-center text-[9px] sm:text-[10px] font-bold text-slate-400 mt-3 sm:mt-4 uppercase tracking-widest flex items-center justify-center gap-1">
                <ShieldCheck size={10} className="sm:w-3 sm:h-3" /> 100% Aman & Terenkripsi
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dev Popup Modal */}
      {showDevPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl sm:rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col p-6 sm:p-8 text-center relative border-[3px] sm:border-4 border-white">
            <button onClick={() => setShowDevPopup(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
              <X size={16} strokeWidth={2.5} />
            </button>
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Target size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-2 sm:mb-3">
              Modul {formData.category} Sedang Dalam Pengembangan 🚀
            </h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6 sm:mb-8">
              Modul khusus kategori ini sedang kami siapkan untuk pengalaman terbaik Anda. Saat ini Anda dapat mengakses Member Area Logaritma untuk menikmati materi edukasi, modul pendukung, dan support system kami.
            </p>
            <button onClick={() => { setShowDevPopup(false); router.push('/member'); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm sm:text-lg py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
              Masuk ke Member Area <ArrowRight size={18} strokeWidth={3} />
            </button>
          </div>
        </div>
      )}

      {/* Existing User Popup */}
      {showExistingPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl sm:rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col p-6 sm:p-8 text-center relative border-[3px] sm:border-4 border-white">
            <button onClick={() => setShowExistingPopup(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
              <X size={16} strokeWidth={2.5} />
            </button>
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <User size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-2 sm:mb-3">
              Nomor WhatsApp Ini Sudah Terdaftar!
            </h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6 sm:mb-8">
              Silakan masuk menggunakan password Anda.
            </p>
            <button onClick={() => { setShowExistingPopup(false); window.location.href = 'https://www.logaritma.id/auth'; }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm sm:text-lg py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
              Masuk / Login <ArrowRight size={18} strokeWidth={3} />
            </button>
          </div>
        </div>
      )}

      {/* Welcome Popup */}
      {showWelcomePopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl sm:rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col p-6 sm:p-8 text-center relative border-[3px] sm:border-4 border-white">
            <button onClick={() => setShowWelcomePopup(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
              <X size={16} strokeWidth={2.5} />
            </button>
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <CheckCircle2 size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-2 sm:mb-3">
              Selamat Bergabung! 🎉
            </h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6 sm:mb-8">
              Akun Anda telah aktif. Detail akses telah dikirimkan ke WhatsApp Anda.
            </p>
            <button onClick={() => { setShowWelcomePopup(false); window.location.href = dashboardLink; }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm sm:text-lg py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
              🚀 Masuk ke Dashboard UBOS
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
