'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X, ChevronRight, Store, ChefHat, Printer, ShoppingBag, Shirt, Smartphone, LineChart, Banknote, HelpCircle, Check, ArrowRight, ShoppingCart, Wallet, TrendingUp, Activity, Package, Megaphone, User, Sparkles, MessageCircle, Bot } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LandingPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Analytics Tracker ──────────────────────────────────────
  const trackEvent = async (eventType: 'page_view' | 'cta_click', ctaName?: string) => {
    try {
      const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
      const params = new URLSearchParams(window.location.search);
      await supabase.from('visitor_analytics').insert({
        event_type: eventType,
        cta_name: ctaName || null,
        device_type: isMobile ? 'Mobile' : 'Desktop',
        referrer: document.referrer || 'Direct',
        utm_source: params.get('utm_source') || null,
        utm_medium: params.get('utm_medium') || null,
        utm_campaign: params.get('utm_campaign') || null,
      });
    } catch (_) { /* silent — analytics should never break UX */ }
  };

  useEffect(() => { trackEvent('page_view'); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // ────────────────────────────────────────────────────────────

  const [formData, setFormData] = useState({
    ownerName: '',
    merchantName: '',
    whatsapp: '',
    category: 'Kuliner & F&B'
  });
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const openRegisterModal = (kategori?: string) => {
    if (kategori) {
      setFormData({ ...formData, category: kategori });
    }
    setShowModal(true);
  };

  const faqs = [
    { q: "Apakah aplikasi ini harus pakai laptop atau komputer?", a: "Tidak perlu! Logaritma & UBOS dirancang khusus agar 100% nyaman dan lancar digunakan langsung dari HP (Android & iOS) maupun Tablet Anda." },
    { q: "Apakah bikin HP lemot atau makan memori besar?", a: "Sangat ringan! Aplikasi ini berbasis teknologi web modern yang hemat memori dan hemat kuota data. Tidak perlu install aplikasi berat dari App Store/Play Store, langsung akses dari browser HP Anda." }
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanWA = formData.whatsapp.replace(/\D/g, '');
      if (cleanWA.length < 10) {
        throw new Error("Nomor WhatsApp tidak valid. Minimal 10 digit.");
      }
      
      // 1. Cek apakah WA sudah terdaftar di database merchants
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

      // 2. Simpan sebagai lead di localStorage
      const leadData = {
        nama_usaha: formData.merchantName,
        owner_name: formData.ownerName,
        whatsapp: cleanWA,
        kategori_usaha: formData.category,
      };
      
      localStorage.setItem('ubos_lead', JSON.stringify(leadData));

      // 3. (Opsional) Catat ke waiting_list
      await supabase.from('waiting_list').insert([
        {
          nama_usaha: formData.merchantName,
          whatsapp: cleanWA,
          kategori_usaha: formData.category
        }
      ]);

      toast.success("Berhasil! Mengalihkan ke Member Area...");
      router.push('/member');
      
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary/20">
      
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/images/logo-logaritma.png" alt="Logaritma Logo" className="w-8 h-8 object-contain" />
            <div className="flex flex-col">
              <span className="font-black text-slate-800 tracking-tight text-xl leading-none">LOGARITMA.ID</span>
              <span className="text-[10px] font-bold text-blue-600 tracking-wide">by Logaritma Ecosystem</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Metoda Logaritma</a>
            <a href="#" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Produk & Tools</a>
            <a href="#" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Harga</a>
            <a href="/auth" className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors">Member Login</a>
          </div>

          <button 
            onClick={() => { trackEvent('cta_click', 'Register'); router.push('/auth'); }}
            className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-full transition-colors shadow-md shadow-blue-600/20"
          >
            Mulai Gratis
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-16 px-4 md:px-6 max-w-4xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6 md:space-y-8"
        >
          <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border border-blue-500/30 uppercase">
            <span>📱</span> 100% Nyaman di Smartphone Anda
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">
            Stop Cuma Pakai Aplikasi Kasir Biasa! Waktunya Gunakan UBOS.
          </h1>
          
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 mt-3 leading-snug">
            Sistem Otomatis Terpadu yang Menuntut Usaha Anda Mencapai Target Profit Bersih Bulan Ini.
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-slate-600 mt-4 max-w-2xl mx-auto leading-relaxed">
            Menggabungkan Kasir, Laba-Rugi, Inventory, Margin Guard, dan Logaritma AI ke dalam Ekosistem Metoda Tarik Mundur. Cukup tentukan target profit bulanan, UBOS pecah jadi Action Plan Harian di HP Anda.
          </p>

          <div className="pt-4 md:pt-8 flex flex-col items-center gap-6">
            <button 
              onClick={() => { trackEvent('cta_click', 'Register'); router.push('/auth'); }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-base md:text-xl font-black py-4 md:py-5 px-4 md:px-10 rounded-2xl shadow-xl shadow-blue-500/30 transition-transform active:scale-95 flex items-center gap-2 md:gap-3 w-full max-w-md mx-auto justify-center group leading-snug"
            >
              Aktifkan Sistem UBOS & Logaritma AI (Coba Gratis) <ArrowRight className="ml-1 md:ml-2 shrink-0 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex flex-wrap justify-center gap-4 text-sm font-bold text-slate-500">
              <span className="flex items-center gap-1.5"><Sparkles size={16} className="text-blue-500" /> All-in-One Tools</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-blue-500" /> Action Plan Otomatis</span>
              <span className="flex items-center gap-1.5"><Bot size={16} className="text-blue-500" /> Berbasis Logaritma AI</span>
            </div>
          </div>
        </motion.div>

        {/* Smartphone Mockup */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
          transition={{ 
            opacity: { duration: 0.8 },
            scale: { duration: 0.8 },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="mt-10 md:mt-16 mx-auto w-full max-w-[320px] relative"
        >
          <div className="relative rounded-[2.5rem] border-[8px] border-slate-900 bg-slate-900 shadow-2xl overflow-hidden aspect-[9/19] flex flex-col">
            <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 z-20 rounded-b-3xl w-40 mx-auto"></div>
            {/* Fake App Content */}
            <div className="bg-slate-50 flex-1 w-full flex flex-col relative pb-20 overflow-hidden">
              
              {/* Header Banner Dinamis (Atas) */}
              <header className="relative bg-gradient-to-r from-blue-600 to-indigo-600 pt-10 pb-12 px-5 text-left rounded-b-[2rem]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                    <Store size={20} />
                  </div>
                  <div>
                    <h2 className="text-white font-black text-lg tracking-tight leading-none mb-1">Warung Makan Logaritma</h2>
                    <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-100 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      🤖 AI LOGARITMA ACTIVE
                    </span>
                  </div>
                </div>
                <p className="text-blue-100 text-[11px] font-medium leading-relaxed max-w-[90%]">
                  Ringkasan performa dan rekomendasi cerdas untuk memacu profit outlet Anda hari ini.
                </p>
              </header>

              {/* Floating Overlapping Button */}
              <div className="px-5 -mt-6 relative z-10">
                <button className="w-full bg-white hover:bg-slate-50 text-indigo-600 font-black py-3.5 rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center gap-2 active:scale-95 transition-all text-sm">
                  <ShoppingCart size={18} /> BUKA POS KASIR
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-4 flex-1 space-y-4 overflow-y-auto hide-scrollbar">
                
                {/* 2x2 Grid Stat Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-left">
                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-2">
                      <Wallet size={16} />
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Pendapatan</p>
                    <p className="text-sm font-black text-slate-900">Rp 1.250.000</p>
                  </div>
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-left">
                    <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-2">
                      <TrendingUp size={16} />
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Profit Bersih</p>
                    <p className="text-sm font-black text-slate-900">Rp 450.000</p>
                  </div>
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-left">
                    <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-2">
                      <Activity size={16} />
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Transaksi</p>
                    <p className="text-sm font-black text-slate-900">18 Nota</p>
                  </div>
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-left">
                    <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-2">
                      <Package size={16} />
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Stok Kritis</p>
                    <p className="text-sm font-black text-slate-900">2 Item</p>
                  </div>
                </div>

                {/* Widget AI Recommendations */}
                <div className="space-y-3">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-3 rounded-2xl flex items-start gap-3 text-left">
                    <div className="bg-white p-1.5 rounded-full shadow-sm text-amber-500 shrink-0">
                      <AlertCircle size={16} />
                    </div>
                    <div>
                      <h3 className="font-bold text-amber-900 text-[10px] tracking-wide uppercase mb-0.5">Peringatan Belanja Pagi</h3>
                      <p className="text-amber-800 text-[10px] font-medium leading-tight">Sisa batas maksimal belanja bahan hari ini adalah <span className="font-bold">Rp 150.000</span> untuk menjaga profit.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-3 rounded-2xl flex items-start gap-3 text-left">
                    <div className="bg-white p-1.5 rounded-full shadow-sm text-emerald-500 shrink-0">
                      <Megaphone size={16} />
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-900 text-[10px] tracking-wide uppercase mb-0.5">Saran Promo Sore</h3>
                      <p className="text-emerald-800 text-[10px] font-medium leading-tight">Segera restock: Kopi Susu, Gula Aren menipis.</p>
                    </div>
                  </div>
                </div>

              </div>
              
              {/* Fake Bottom Nav */}
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-between pb-4">
                <div className="flex flex-col items-center text-blue-600"><div className="p-1"><Activity size={20} /></div><span className="text-[8px] font-bold">Dashboard</span></div>
                <div className="flex flex-col items-center text-slate-400"><div className="p-1"><ShoppingCart size={20} /></div><span className="text-[8px] font-bold">POS</span></div>
                <div className="flex flex-col items-center text-slate-400"><div className="p-1"><Package size={20} /></div><span className="text-[8px] font-bold">Stok</span></div>
                <div className="flex flex-col items-center text-slate-400"><div className="p-1"><Wallet size={20} /></div><span className="text-[8px] font-bold">Finance</span></div>
                <div className="flex flex-col items-center text-slate-400"><div className="p-1"><User size={20} /></div><span className="text-[8px] font-bold">Settings</span></div>
              </div>
              
              {/* Fake Floating AI Pilot Button */}
              <div className="absolute bottom-16 right-4 p-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
                <Sparkles size={16} />
              </div>

            </div>
          </div>
          {/* Decorative glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-500/20 blur-[100px] -z-10 rounded-full"></div>
        </motion.div>
      </section>

      {/* Feature Highlights HP-First */}
      <section className="py-20 px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-lg sm:text-xl md:text-3xl font-black text-slate-900 mb-4 leading-normal">Pegang Kontrol Bisnis dari HP</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">Kelola omset, awasi karyawan, dan pastikan margin aman tanpa harus standby di toko.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.0 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center hover:-translate-y-1 transition-transform relative overflow-hidden"
            >
              <div className="w-16 h-16 mx-auto bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                <Banknote size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">Kontrol Belanja Pagi</h3>
              <p className="text-slate-500 font-medium leading-relaxed">Cek & kunci modal belanja bahan baku saat Anda masih di rumah atau di pasar. Karyawan hanya belanja sesuai budget sistem.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center hover:-translate-y-1 transition-transform relative overflow-hidden"
            >
              <div className="w-16 h-16 mx-auto bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Smartphone size={32} />
              </div>
              <div className="flex justify-center mb-5">
                <div className="bg-slate-50 rounded-xl py-1.5 px-3 flex items-center gap-2 text-[11px] font-bold border border-slate-200 text-slate-700 shadow-sm">
                  <ShoppingCart size={12} className="text-blue-600" /> + Bayar Rp 25.000
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">Kasir HP Anti-Ribet</h3>
              <p className="text-slate-500 font-medium leading-relaxed">Karyawan dan kasir Anda tinggal tap-tap layar HP untuk mencatat transaksi harian. Tampilan kasir super simpel dan cepat.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center hover:-translate-y-1 transition-transform relative overflow-hidden"
            >
              <div className="w-16 h-16 mx-auto bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <LineChart size={32} />
              </div>
              <div className="flex justify-center mb-5">
                <div className="bg-emerald-50 rounded-full px-3 py-1 flex items-center gap-1 text-[11px] font-bold text-emerald-600 border border-emerald-200">
                  <TrendingUp size={12} /> Profit Naik +24%
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">Laporan Profit Real-time</h3>
              <p className="text-slate-500 font-medium leading-relaxed">Pantau keuntungan bersih hari ini kapan saja dan di mana saja langsung dari saku Anda. Bebas khawatir uang hilang/selisih.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Metoda Logaritma & Logaritma AI Section */}
      <section className="py-20 px-6 bg-slate-900 text-white relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 bg-blue-600/20 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 bg-indigo-600/20 blur-[100px] rounded-full"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border border-blue-500/30 uppercase mb-4"
            >
              <Sparkles size={14} /> Rahasia Sukses Logaritma
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg sm:text-xl md:text-3xl font-black mb-6 leading-normal"
            >
              Metoda Tarik Mundur & Logaritma AI
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-slate-300 text-lg max-w-3xl mx-auto"
            >
              Berhenti menebak-nebak! UBOS bekerja mundur dari target keuntungan Anda, memberikan batasan dan panduan harian yang pasti untuk dicapai.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Metoda Tarik Mundur */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 font-black text-xl shadow-lg shadow-blue-900/50">1</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Input Target Profit Bersih</h3>
                  <p className="text-slate-400 leading-relaxed">Anda cukup tentukan berapa rupiah profit bersih yang INGIN dibawa pulang bulan ini.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 font-black text-xl shadow-lg shadow-indigo-900/50">2</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">UBOS Breakdown Action Plan</h3>
                  <p className="text-slate-400 leading-relaxed">Sistem secara otomatis memecah target Anda menjadi kewajiban omset harian dan MENGUNCI batas maksimal belanja bahan baku harian (Margin Guard).</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shrink-0 font-black text-xl shadow-lg shadow-emerald-900/50">3</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Eksekusi 15 Menit / Hari</h3>
                  <p className="text-slate-400 leading-relaxed">Karyawan Anda hanya bertugas mengeksekusi di lapangan tanpa pusing berhitung. Anda cukup pantau hasil eksekusinya 15 menit per hari via HP.</p>
                </div>
              </div>
            </motion.div>

            {/* Logaritma AI */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-slate-800/50 border border-slate-700 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Bot size={120} />
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl relative z-10">
                <Bot size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-black mb-4 relative z-10">Didampingi Logaritma AI</h3>
              <p className="text-slate-300 leading-relaxed mb-6 relative z-10">
                Lupakan dashboard angka yang membingungkan. <strong>Logaritma AI</strong> bertindak sebagai Asisten Cerdas Harian Anda. AI kami akan secara proaktif:
              </p>
              <ul className="space-y-4 relative z-10">
                <li className="flex gap-3 items-start">
                  <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">Memberi tahu barang apa yang harus di-restock HARI INI agar omset besok aman.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">Menyembunyikan menu Kasir yang margin-nya sedang tipis (HPP bahan melonjak).</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">Mengirim WA harian ringkasan kinerja outlet langsung ke nomor Anda.</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimoni Section */}
      <section className="py-12 md:py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto my-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-white shadow-xl shadow-blue-900/20 relative overflow-visible text-center md:text-left flex flex-col md:flex-row items-center gap-8"
          >
            {/* Quote Icon Background */}
            <div className="absolute top-0 right-4 text-[120px] leading-none font-serif opacity-10 select-none">"</div>
            
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/20 shrink-0">
              <Store size={40} className="text-blue-100" />
            </div>
            
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-100 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30 mb-4 shadow-sm backdrop-blur-sm relative z-10">
                <Check size={14} /> Pengguna Aktif UBOS Kuliner
              </div>
              <p className="text-lg md:text-xl font-medium leading-relaxed mb-6 text-blue-50 relative z-10">
                "Sebelumnya bahan baku sering over-budget dan kas akhir bulan tipis. Setelah pakai Metoda Logaritma & UBOS, batas belanja pagi terkunci dan margin profit stabil naik."
              </p>
              <div className="relative z-10">
                <h4 className="font-black text-lg">Owner Warunk Arsi</h4>
                <p className="text-blue-200 text-sm">Bekasi, Jawa Barat</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Segmentasi Kategori */}
      <section className="py-20 px-6 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="text-lg sm:text-xl md:text-3xl font-black text-slate-900 mb-4 leading-normal"
            >
              Solusi Pilihan Jenis Usaha Anda
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-slate-500"
            >
              Pilih modul yang paling sesuai dengan karakteristik bisnis yang Anda jalankan.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Kuliner */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-shadow group"
            >
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <ChefHat size={24} />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Ready / Bisa Dipakai</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-3">Kuliner & F&B</h3>
              <p className="text-sm text-slate-500 font-medium mb-6">Fitur lengkap Margin Guard, HPP Porsi, dan Kontrol Kas Belanja Pagi untuk Warung, Resto & Cafe.</p>
              <button onClick={() => openRegisterModal('Kuliner & F&B')} className="text-primary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">Pilih Modul <ChevronRight size={16} /></button>
            </motion.div>

            {/* Fotokopi */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-shadow group"
            >
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <Printer size={24} />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-2 w-2 rounded-full bg-amber-500"></span>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">VVIP Trial Dibuka</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-3">Jasa Percetakan</h3>
              <p className="text-sm text-slate-500 font-medium mb-6">Estimasi HPP Kertas/Tinta, Kontrol QC, dan Manajemen Antrean Cetak & Fotokopi.</p>
              <button onClick={() => openRegisterModal('Fotokopi & Percetakan')} className="text-primary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">Daftar Trial <ChevronRight size={16} /></button>
            </motion.div>

            {/* Ritel */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-slate-50 border border-slate-200 rounded-3xl p-6 opacity-75 hover:opacity-100 shadow-sm transition-all relative overflow-hidden"
            >
              <div className="w-12 h-12 bg-slate-200 text-slate-600 rounded-2xl flex items-center justify-center mb-6">
                <ShoppingBag size={24} />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-2 w-2 rounded-full bg-slate-400"></span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Waiting List</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-3">Toko & Ritel</h3>
              <p className="text-sm text-slate-500 font-medium mb-6">Manajemen Stok Anti Dead-Stock dan Target Sales Harian untuk minimarket & olshop.</p>
              <button onClick={() => openRegisterModal('Toko & Ritel')} className="text-slate-500 font-bold text-sm flex items-center gap-1">Ikut Waiting List <ChevronRight size={16} /></button>
            </motion.div>

            {/* Laundry */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="bg-slate-50 border border-slate-200 rounded-3xl p-6 opacity-75 hover:opacity-100 shadow-sm transition-all"
            >
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Shirt size={24} />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-2 w-2 rounded-full bg-slate-400"></span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Waiting List</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-3">Laundry & Jasa</h3>
              <p className="text-sm text-slate-500 font-medium mb-6">Tracking Slot Jam Kerja, layanan cuci/setrika & hitungan Komisi Staf otomatis.</p>
              <button onClick={() => openRegisterModal('Laundry & Jasa')} className="text-slate-500 font-bold text-sm flex items-center gap-1">Ikut Waiting List <ChevronRight size={16} /></button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mobile-First FAQ */}
      <section className="py-20 px-6 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-lg sm:text-xl md:text-3xl font-black mb-4 leading-normal">Pertanyaan Seputar Akses HP</h2>
            <p className="text-slate-400">Paling sering ditanyakan oleh rekan-rekan UMKM.</p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-3xl overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-6 md:p-8 flex items-start justify-between text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 text-blue-400 group-hover:text-blue-300 transition-colors"><HelpCircle size={24} /></div>
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-100 transition-colors">{faq.q}</h3>
                  </div>
                  <ChevronRight className={`mt-2 shrink-0 transition-transform duration-300 ${openFaq === idx ? 'rotate-90 text-blue-400' : 'text-slate-500 group-hover:text-blue-300'}`} />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 md:px-8 pb-6 md:pb-8 text-slate-300 leading-relaxed font-medium pl-16 md:pl-[4.5rem]"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-xl font-black text-slate-900">Mulai Akses UBOS</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Daftar instan. Langsung masuk ke Dashboard.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="register-modal" onSubmit={handleRegister} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Pemilik Usaha</label>
                  <input 
                    required
                    type="text" 
                    value={formData.ownerName}
                    onChange={e => setFormData({...formData, ownerName: e.target.value})}
                    placeholder="Misal: Budi Santoso"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Usaha / Toko</label>
                  <input 
                    required
                    type="text" 
                    value={formData.merchantName}
                    onChange={e => setFormData({...formData, merchantName: e.target.value})}
                    placeholder="Misal: Kedai Kopi Senja"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nomor WhatsApp</label>
                  <input 
                    required
                    type="tel" 
                    value={formData.whatsapp}
                    onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                    placeholder="081234567890"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">*Pastikan nomor aktif untuk kebutuhan login dan notifikasi AI</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kategori Usaha</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none font-medium text-slate-800"
                  >
                    <option value="Kuliner & F&B">Kuliner & F&B (Warung, Resto, Cafe)</option>
                    <option value="Fotokopi & Percetakan">Fotokopi & Percetakan</option>
                    <option value="Toko & Ritel">Toko & Ritel (Minimarket, Olshop)</option>
                    <option value="Laundry & Jasa">Laundry & Jasa</option>
                  </select>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-100 bg-white">
              <button 
                type="submit"
                form="register-modal"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-xl shadow-lg shadow-primary/30 transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>Masuk ke Dashboard Member Area <ChevronRight size={18} /></>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12 px-6 mt-10 text-center text-slate-500 font-medium text-sm">
        <p>© 2026 LOGARITMA.ID. All rights reserved.</p>
        <p className="mt-4 inline-flex items-center gap-2">Customer Support: <a href="https://wa.me/6281211638357?text=Halo%20Admin%20Logaritma%2C%20saya%20tertarik%20bertanya%20mengenai%20aplikasi%20UBOS..." target="_blank" rel="noopener noreferrer" className="text-[#25D366] font-bold hover:underline flex items-center gap-1"><MessageCircle size={16} /> 081211638357</a></p>
      </footer>

      {/* Floating WhatsApp CTA */}
      <motion.a 
        href="https://wa.me/6281211638357?text=Halo%20Admin%20Logaritma%2C%20saya%20tertarik%20bertanya%20mengenai%20aplikasi%20UBOS..."
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent('cta_click', 'WhatsApp')}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-30 bg-[#25D366] hover:bg-[#1ebd5a] text-white shadow-lg shadow-[#25D366]/30 px-4 md:px-5 py-3 md:py-3.5 rounded-full flex items-center gap-2 font-bold text-sm transition-transform hover:-translate-y-1"
      >
        <span className="text-xl leading-none">💬</span> <span className="hidden md:inline">Tanya CS / </span>Konsultasi WA
      </motion.a>

    </div>
  );
}

