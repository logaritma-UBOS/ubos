'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowRight, XCircle, CheckCircle2, ChevronRight, HelpCircle, X, User, ShoppingBag, PieChart, SplitSquareHorizontal, ArrowDownToLine, Phone, Target } from 'lucide-react';
import { toast } from 'sonner';

export default function LandingPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showDevPopup, setShowDevPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const trackEvent = async (eventType) => {
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

  const openRegisterModal = (kategori) => {
    if (kategori) {
      setFormData({ ...formData, category: kategori });
    }
    setShowModal(true);
  };

  const faqs = [
    { q: "Apa bedanya UBOS dengan Aplikasi Kasir (POS) di luaran sana?", a: "Kasir biasa hanya mencatat uang masuk dan keluar. UBOS adalah 'Toolset Eksekusi Metode Logaritma' yang bekerja mundur: Anda masukkan target profit, UBOS akan mengunci maksimal belanja bahan harian (Margin Guard) agar profit tersebut PASTI tercapai, bukan sekadar sisa-sisa." },
    { q: "Bagaimana cara UBOS mengatasi potongan Grab/Gojek/ShopeeFood?", a: "UBOS punya fitur Markup Harga Platform otomatis. Sistem akan menghitungkan harga jual yang pas untuk Gofood (35%), Grabfood (45%), atau ShopeeFood (50%) agar profit bersih Anda tidak tergerus komisi aplikator." },
    { q: "Apakah ini bikin repot karyawan di kasir?", a: "Sama sekali tidak! Justru karyawan Anda hanya perlu klik-klik pesanan (sangat simpel). Sistem kerumitan HPP dan Margin Guard berjalan otomatis di belakang layar untuk Anda sang Owner." }
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let cleanWA = formData.whatsapp.replace(/\D/g, '');
      if (cleanWA.length < 10) {
        throw new Error("Nomor WhatsApp tidak valid. Minimal 10 digit.");
      }
      if (cleanWA.startsWith('0')) cleanWA = '62' + cleanWA.slice(1);
      else if (cleanWA.startsWith('8')) cleanWA = '62' + cleanWA;
      
      const { data: existingWa } = await supabase
        .from('merchants')
        .select('id')
        .eq('whatsapp', cleanWA)
        .maybeSingle();

      if (existingWa) {
        toast.error("Nomor WhatsApp ini sudah terdaftar. Silakan login untuk melanjutkan.");
        router.push('/auth');
        return;
      }

      const isFnB = formData.category === "Kuliner & F&B";
      const funnelDest = isFnB ? 'UBOS' : 'MEMBER_AREA';

      const leadData = {
        nama_usaha: formData.merchantName,
        whatsapp: cleanWA,
        kategori_usaha: formData.category,
      };
      
      localStorage.setItem('ubos_lead', JSON.stringify(leadData));
      if (isFnB) {
        localStorage.setItem('ubos_temp_pass', formData.password);
      }

      // Panggil API Route untuk bypass RLS & Handle Cek/Insert
      const res = await fetch('/api/leads/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_usaha: formData.merchantName,
          no_wa: cleanWA,
          kategori: formData.category,
          password: formData.password,
          funnel_destination: funnelDest
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
          // TAMPILKAN HTML ERROR AGAR BISA DIBACA!
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
        
        if (result.data?.funnel_destination === 'UBOS' || isFnB) {
          router.push(`/ubos`);
        } else {
          setShowDevPopup(true);
        }
        return;
      }
      
      // AUTO-WELCOME WA VIA FONNTE (HANYA UNTUK USER BARU)
      try {
        const welcomeMessage = `Halo {nama_usaha}! 🚀\n\nSelamat bergabung di ekosistem Logaritma UBOS.\nPendaftaran Anda telah kami terima.\n\nSilakan akses dashboard Anda melalui tautan berikut:\n{link_dashboard}\n\nJika ada pertanyaan, jangan ragu membalas pesan ini!\n\n- Tim Logaritma`;
        
        fetch('/api/wa/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target: cleanWA,
            message: welcomeMessage,
            nama_usaha: formData.merchantName,
            funnel_destination: funnelDest
          })
        }).catch(err => console.error("Fonnte trigger err:", err));
      } catch (waErr) {
        console.error("Gagal mengirim WA Welcome:", waErr);
      }
      
      setShowModal(false);

      if (isFnB) {
        toast.success("Berhasil! Mengalihkan ke Dashboard UBOS...");
        router.push(`/ubos`);
      } else {
        setShowDevPopup(true);
      }
      
    } catch (err) {
      toast.error(err.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-500/20 text-slate-800">
      
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-blue-600 text-white text-center py-1.5 sm:py-2 px-2 sm:px-4 text-[10px] sm:text-sm font-bold tracking-wide relative z-50">
        ⚠️ PROMO LAUNCHING: Coba Gratis UBOS Toolset 7 Hari • Tanpa Potongan Platform & Tanpa Kartu Kredit!
      </div>

      {/* Top Navigation */}
      <nav className="sticky top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-slate-200 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-12 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img src="/assets/images/logo-logaritma.png" alt="Logaritma Logo" className="w-6 h-6 sm:w-8 sm:h-8 object-contain shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="font-black text-slate-900 tracking-tight text-sm sm:text-xl leading-none">LOGARITMA.ID</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#solusi" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Fitur Toolset</a>
            <a href="#faq" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">FAQ</a>
            <a href="/auth" className="text-sm font-black text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2 bg-slate-100 px-4 py-1.5 rounded-full"><User size={14} /> Login UBOS</a>
          </div>

          <div className="flex items-center shrink-0 md:hidden">
            <a href="/auth" className="text-sm sm:text-base font-semibold text-slate-500 hover:text-slate-900 bg-slate-100 px-4 py-2 rounded-full">Login UBOS</a>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="pt-5 sm:pt-8 pb-4 sm:pb-6 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center space-y-4 sm:space-y-6"
        >
          {/* Pre-headline */}
          <div className="inline-flex items-center justify-center text-center w-fit mx-auto bg-blue-100 text-blue-700 px-4 py-1.5 rounded-[1.25rem] sm:rounded-full text-[10px] sm:text-xs font-black tracking-widest border border-blue-200 uppercase shadow-sm leading-tight">
            <span>🔴 Peringatan untuk Owner F&B,<br className="block sm:hidden" /> Ritel, & Percetakan</span>
          </div>
          
          {/* Main Headline */}
          <h1 className="text-[32px] sm:text-4xl md:text-5xl lg:text-[54px] font-black text-slate-900 leading-snug sm:leading-[1.1] tracking-tight">
            Awas 'Bocor Halus'! Kelihatan Laris Manis di Kasir, Tapi Pas Dihitung Ulang <span className="text-blue-600 border-b-[4px] border-blue-500 pb-0.5 inline-block">Ternyata Malah Tekor!</span>
          </h1>
          
          {/* Sub-headline */}
          <p className="text-sm sm:text-base text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
            Jangan biarkan keuntungan usahamu habis tergerus potongan komisi delivery online dan kalkulasi HPP yang salah. <strong className="text-slate-900">Stop tebak-tebakan profit!</strong> Kenalkan UBOS Toolset: cara praktis mengunci target profit bulanan dan memisahkan kas modal belanja otomatis lewat Metode Logaritma (Metode Tarik Mundur).
          </p>

          <div className="w-full flex flex-col items-center gap-4 sm:gap-6 pt-2 sm:pt-4">
            {/* Primary CTA */}
            <button 
              onClick={() => { trackEvent('click_cta_register'); openRegisterModal(); }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-xl font-bold py-3.5 sm:py-5 px-6 sm:px-12 rounded-full shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all active:scale-95 flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto group border-b-[3px] sm:border-b-4 border-blue-800"
            >
              AMANKAN PROFIT BISNIS SAYA SEKARANG <ArrowRight className="shrink-0 group-hover:translate-x-2 transition-transform" strokeWidth={3} size={20} />
            </button>
            
            {/* Micro-trust */}
            <p className="text-xs sm:text-sm font-bold text-slate-500 flex items-center justify-center gap-1.5 leading-tight text-center">
              <ShieldCheck size={16} className="text-emerald-500 shrink-0" /> Sudah Digunakan Ratusan Pemilik UMKM untuk Mengunci Margin.
            </p>
          </div>
        </motion.div>
      </section>

      {/* 3. PROBLEM & AGITATION SECTION */}
      <section className="pt-10 pb-16 sm:pt-14 sm:pb-20 px-4 sm:px-6 bg-slate-900 text-white relative border-y-8 border-blue-600 overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-4xl font-black mb-3 sm:mb-4 leading-tight text-white px-2">
              Apakah Toko Anda Sedang Mengalami 3 'Bocor Halus' Ini?
            </h2>
            <div className="w-16 sm:w-24 h-1.5 bg-blue-500 mx-auto rounded-full"></div>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 sm:gap-8 mt-12 sm:mt-0">
            {/* Card 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              className="bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-xl relative mt-4 md:mt-0"
            >
              <div className="absolute -top-6 -left-2 sm:-left-4 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-2xl border-4 border-slate-900">1</div>
              <div className="mb-5 sm:mb-6 text-blue-400"><ShoppingBag size={42} strokeWidth={1.5} /></div>
              <h3 className="text-lg sm:text-xl font-black mb-3 leading-snug">Omzet Rame, Tapi Uang Modal & Untung Nyampur Aduk</h3>
              <p className="text-slate-400 font-medium leading-relaxed text-sm">
                Hari ini laku keras, tapi uang kasir langsung kepakai belanja bahan besok. Giliran akhir bulan mau gaji diri sendiri, kas malah kosong melompong.
              </p>
            </motion.div>
            
            {/* Card 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-xl relative mt-4 md:mt-0"
            >
              <div className="absolute -top-6 -left-2 sm:-left-4 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-2xl border-4 border-slate-900">2</div>
              <div className="mb-5 sm:mb-6 text-blue-400"><ArrowDownToLine size={42} strokeWidth={1.5} /></div>
              <h3 className="text-lg sm:text-xl font-black mb-3 leading-snug">Laris di Aplikasi Online, Tapi Tekor di Komisi Platform</h3>
              <p className="text-slate-400 font-medium leading-relaxed text-sm">
                Orderan Gofood/Grab/ShopeeFood meledak, tapi karena salah hitung HPP dan gak markup harga jual yang benar, 35%-50% omzet raib dipotong komisi. Lelah doang!
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-xl relative mt-4 md:mt-0"
            >
              <div className="absolute -top-6 -left-2 sm:-left-4 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-2xl border-4 border-slate-900">3</div>
              <div className="mb-5 sm:mb-6 text-blue-400"><XCircle size={42} strokeWidth={1.5} /></div>
              <h3 className="text-lg sm:text-xl font-black mb-3 leading-snug">Capek Jadi Pemadam Kebakaran Operasional</h3>
              <p className="text-slate-400 font-medium leading-relaxed text-sm">
                Tiap hari pusing mikirin stok bahan baku yang tiba-tiba hilang/basi. Operasional berantakan, Anda ngurusin semuanya sendirian sampai gak ada waktu mikirin strategi bisnis.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. SOLUTION & POSITIONING SECTION */}
      <section id="solusi" className="py-16 sm:py-24 px-4 sm:px-6 bg-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto"
          >
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4 sm:mb-6 leading-tight tracking-tight">
              UBOS <span className="text-blue-600 underline decoration-blue-200">Bukan Sekadar Kasir Biasa.</span> Ini Adalah Toolset Pengeksekusi Metode Logaritma!
            </h2>
            <p className="text-sm sm:text-lg text-slate-600 font-medium leading-relaxed">
              Buang jauh-jauh bayangan tentang aplikasi kasir yang cuma bisa nge-print struk. Anggap UBOS sebagai <strong className="text-slate-900">Tim Spesialis Finansial Virtual</strong> Anda. Cukup luangkan 15-20 menit sehari, sistem akan bekerja untuk Anda:
            </p>
          </motion.div>

          <div className="space-y-16 sm:space-y-24">
            {/* Modul 0 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7 }}
              className="flex flex-col md:flex-row items-center gap-8 md:gap-16"
            >
              <div className="w-full md:w-1/2">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-6 sm:p-8 shadow-inner relative overflow-hidden h-56 sm:h-64 flex items-center justify-center">
                  <div className="absolute -right-6 -bottom-6 sm:-right-10 sm:-bottom-10 text-blue-200"><Target size={180} /></div>
                  <div className="relative z-10 text-center">
                    <div className="text-blue-800 font-black text-4xl sm:text-5xl mb-2">Rp 15.000.000</div>
                    <div className="bg-white text-blue-800 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-sm inline-block uppercase tracking-wider">Target Profit Terkunci</div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <div className="inline-block bg-blue-100 text-blue-800 font-black px-3 py-1 rounded-md text-[10px] sm:text-sm mb-3 sm:mb-4">MODUL 0: Metode Tarik Mundur</div>
                <h3 className="text-xl sm:text-3xl font-black text-slate-900 mb-3 sm:mb-4 leading-tight">Masukkan Target Profit, Biar Sistem Yang Mikir Batas Belanja!</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium mb-4 sm:mb-6">
                  Pendekatan tradisional: Jualan - Biaya = Laba (Kalau sisa). <br className="hidden sm:block"/>
                  <strong>Pendekatan Logaritma:</strong> Jualan - LABA = Biaya Maksimal. <br className="hidden sm:block"/>
                  Anda cukup ketik target profit bulanan yang ingin dibawa pulang. UBOS otomatis memecahnya jadi target omset harian dan MENGUNCI batas maksimal belanja operasional (Margin Guard) per harinya.
                </p>
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-slate-700 font-bold"><CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5 sm:mt-0" size={20} /> Gak ada lagi cerita 'uangnya habis buat muter'.</li>
                </ul>
              </div>
            </motion.div>

            {/* Modul 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7 }}
              className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16"
            >
              <div className="w-full md:w-1/2">
                <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 sm:p-8 shadow-inner relative overflow-hidden h-56 sm:h-64 flex items-center justify-center">
                  <div className="absolute -left-6 -bottom-6 sm:-left-10 sm:-bottom-10 text-amber-200"><PieChart size={180} /></div>
                  <div className="relative z-10 flex flex-col gap-3 w-full max-w-[280px]">
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-amber-100 flex justify-between items-center">
                      <span className="font-bold text-slate-600 text-xs sm:text-sm">ShopeeFood (50%)</span>
                      <span className="font-black text-emerald-600 text-xs sm:text-base">Aman</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-amber-100 flex justify-between items-center">
                      <span className="font-bold text-slate-600 text-xs sm:text-sm">GrabFood (45%)</span>
                      <span className="font-black text-emerald-600 text-xs sm:text-base">Aman</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <div className="inline-block bg-amber-100 text-amber-800 font-black px-3 py-1 rounded-md text-[10px] sm:text-sm mb-3 sm:mb-4">MODUL 2: Margin Guard & HPP Otomatis</div>
                <h3 className="text-xl sm:text-3xl font-black text-slate-900 mb-3 sm:mb-4 leading-tight">Harga Jual Otomatis Menyesuaikan Komisi Platform</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium mb-4 sm:mb-6">
                  Input harga modal (HPP) bahan baku Anda. Ketika ada pesanan dari Gofood, Grabfood, atau ShopeeFood, UBOS secara pintar me-markup harga jual agar potongan komisi 35% - 50% aplikator tidak memakan margin profit asli Anda.
                </p>
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-slate-700 font-bold"><CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5 sm:mt-0" size={20} /> Margin aman dari 'gigitan' komisi siluman.</li>
                </ul>
              </div>
            </motion.div>

            {/* Modul 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7 }}
              className="flex flex-col md:flex-row items-center gap-8 md:gap-16"
            >
              <div className="w-full md:w-1/2">
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-inner relative overflow-hidden h-56 sm:h-64 flex items-center justify-center">
                  <div className="absolute -right-6 -bottom-6 sm:-right-10 sm:-bottom-10 text-emerald-200"><SplitSquareHorizontal size={180} /></div>
                  <div className="relative z-10 text-center w-full max-w-[280px] space-y-2">
                    <div className="bg-emerald-600 text-white p-2 sm:p-2.5 rounded-lg font-black text-xs sm:text-sm shadow-md">Kas Belanja Bahan: Rp 300.000</div>
                    <div className="bg-blue-600 text-white p-2 sm:p-2.5 rounded-lg font-black text-xs sm:text-sm shadow-md">Kas Operasional: Rp 50.000</div>
                    <div className="bg-blue-600 text-white p-2 sm:p-2.5 rounded-lg font-black text-xs sm:text-sm shadow-md">PROFIT BERSIH: Rp 150.000</div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <div className="inline-block bg-emerald-100 text-emerald-800 font-black px-3 py-1 rounded-md text-[10px] sm:text-sm mb-3 sm:mb-4">MODUL 3: Auto-Split Wallet</div>
                <h3 className="text-xl sm:text-3xl font-black text-slate-900 mb-3 sm:mb-4 leading-tight">Close Shift, Uang Langsung Terpisah Otomatis!</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium mb-4 sm:mb-6">
                  Tiap kali warung/toko tutup (Close Shift), UBOS langsung membedah total omzet hari itu ke dalam laci (wallet) virtual secara spesifik: Mana jatah untuk beli bahan besok pagi, mana untuk bayar operasional bulanan, dan mana PROFIT BERSIH HARI INI yang berhak Anda kantongi!
                </p>
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-slate-700 font-bold"><CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5 sm:mt-0" size={20} /> Gak ada alasan lagi uang modal kepakai pribadi.</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. OFFER, FAQ & CLOSING P.S. */}
      
      {/* Offer Banner */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-14 text-center border-b-[6px] sm:border-b-8 border-blue-600 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-blue-500/10 blur-[80px] rounded-full"></div>
          
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-4 sm:mb-6 relative z-10 leading-tight">
            Ambil Kendali Bisnismu Hari Ini. Stop Biarkan Profit Menguap!
          </h2>
          <p className="text-sm sm:text-lg text-slate-300 font-medium mb-8 sm:mb-10 max-w-2xl mx-auto relative z-10">
            Daftar sekarang dan nikmati full akses ke seluruh modul Toolset Logaritma. Tidak ada potongan transaksi, tidak perlu kartu kredit.
          </p>
          
          <button 
            onClick={() => { trackEvent('click_cta_register'); openRegisterModal(); }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-2xl font-black py-4 sm:py-6 px-6 sm:px-10 rounded-full shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all active:scale-95 flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto mx-auto group border-b-[3px] sm:border-b-4 border-blue-800 relative z-10"
          >
            COBA UBOS TOOLSET GRATIS 7 HARI <ArrowRight className="shrink-0 group-hover:translate-x-2 transition-transform" strokeWidth={3} size={20} />
          </button>
        </motion.div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-12 sm:py-16 px-4 sm:px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 sm:mb-10"
          >
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 mb-2 sm:mb-4">Tanya Jawab (FAQ) Singkat</h2>
          </motion.div>
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 sm:p-6 flex items-start justify-between text-left group"
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
                      className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 text-xs sm:text-base text-slate-600 leading-relaxed font-medium pl-10 sm:pl-14"
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

      {/* Closing P.S. */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-slate-100 border-t border-slate-200 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 sm:p-10 shadow-sm inline-block text-left w-full sm:w-auto">
            <h3 className="font-black text-lg sm:text-xl text-amber-900 mb-3 sm:mb-4">P.S. (Postscript):</h3>
            <p className="text-sm sm:text-base text-amber-800 font-medium leading-relaxed mb-3 sm:mb-4">
              Setiap hari Anda menunda merapikan sistem kasir dan HPP, sama dengan <strong className="text-blue-700">membiarkan uang ratusan ribu menguap bocor</strong> tanpa Anda sadari.
            </p>
            <p className="text-sm sm:text-base text-amber-800 font-medium leading-relaxed font-bold">
              Ambil keputusan cerdas hari ini. Mumpung masa <strong className="bg-amber-200 px-1 rounded">TRIAL 7 HARI GRATIS</strong> masih dibuka untuk umum.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 sm:py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <span className="font-black text-slate-800 text-lg sm:text-xl tracking-tight">LOGARITMA.ID</span>
          </div>
          <p className="text-slate-500 font-bold text-xs sm:text-sm">Sistem Eksekusi Logaritma © {new Date().getFullYear()}</p>
        </div>
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
    </div>
  );
}


