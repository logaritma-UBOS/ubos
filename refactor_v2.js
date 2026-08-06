const fs = require('fs');

const pageContent = `'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowRight, XCircle, CheckCircle2, ChevronRight, HelpCircle, X, User, ShoppingBag, PieChart, SplitSquareHorizontal, ArrowDownToLine, Phone, Target } from 'lucide-react';
import { toast } from 'sonner';

export default function LandingPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
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
    ownerName: '',
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
      let cleanWA = formData.whatsapp.replace(/\\D/g, '');
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

      const leadData = {
        nama_usaha: formData.merchantName,
        owner_name: formData.ownerName,
        whatsapp: cleanWA,
        kategori_usaha: formData.category,
      };
      
      localStorage.setItem('ubos_lead', JSON.stringify(leadData));

      await supabase.from('leads').insert([
        {
          nama_pemilik: formData.ownerName,
          nama_usaha: formData.merchantName,
          no_wa: cleanWA,
          kategori: formData.category,
          status: 'New Lead'
        }
      ]);
      toast.success("Berhasil! Mengalihkan ke Member Area...");
      setShowModal(false);
      const categoryParam = encodeURIComponent(formData.category.toLowerCase().split(' ')[0] || 'kuliner');
      router.push(\`/member?category=\${categoryParam}\`);
      
    } catch (err) {
      toast.error(err.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-rose-500/20 text-slate-800">
      
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-rose-600 text-white text-center py-2 px-4 text-xs sm:text-sm font-bold tracking-wide relative z-50">
        ⚠️ PROMO LAUNCHING: Coba Gratis UBOS Toolset 7 Hari • Tanpa Potongan Platform & Tanpa Kartu Kredit!
      </div>

      {/* Top Navigation */}
      <nav className="sticky top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-slate-200 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img src="/assets/images/logo-logaritma.png" alt="Logaritma Logo" className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="font-black text-slate-900 tracking-tight text-base sm:text-xl leading-none">LOGARITMA.ID</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#solusi" className="text-sm font-bold text-slate-600 hover:text-rose-600 transition-colors">Fitur Toolset</a>
            <a href="#faq" className="text-sm font-bold text-slate-600 hover:text-rose-600 transition-colors">FAQ</a>
            <a href="/member/login" className="text-sm font-black text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2 bg-slate-100 px-4 py-1.5 rounded-full"><User size={14} /> Member Area</a>
          </div>

          <div className="flex items-center shrink-0 md:hidden">
            <a href="/member/login" className="text-xs font-bold text-slate-500 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-full">Login</a>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="pt-16 pb-20 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Pre-headline */}
          <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black tracking-widest border border-rose-200 uppercase shadow-sm">
            🔴 Peringatan untuk Owner F&B, Ritel, & Percetakan
          </div>
          
          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black text-slate-900 leading-[1.1] tracking-tight">
            Awas 'Bocor Halus'! Kelihatan Laris Manis di Kasir, Tapi Pas Dihitung Ulang <span className="text-rose-600 underline decoration-rose-300 underline-offset-4">Ternyata Malah Tekor!</span>
          </h1>
          
          {/* Sub-headline */}
          <p className="text-base sm:text-lg text-slate-600 mt-6 max-w-3xl mx-auto leading-relaxed font-medium">
            Jangan biarkan keuntungan usahamu habis tergerus potongan komisi delivery online dan kalkulasi HPP yang salah. <strong className="text-slate-900">Stop tebak-tebakan profit!</strong> Kenalkan UBOS Toolset: cara praktis mengunci target profit bulanan dan memisahkan kas modal belanja secara otomatis lewat Metode Logaritma (Metode Tarik Mundur).
          </p>

          <div className="pt-8 flex flex-col items-center gap-4">
            {/* Primary CTA */}
            <button 
              onClick={() => { trackEvent('click_cta_register'); openRegisterModal(); }}
              className="bg-rose-600 hover:bg-rose-700 text-white text-lg sm:text-xl font-black py-5 px-8 sm:px-12 rounded-full shadow-xl shadow-rose-600/30 hover:shadow-rose-600/50 transition-all active:scale-95 flex items-center justify-center gap-3 w-full sm:w-auto group border-b-4 border-rose-800"
            >
              AMANKAN PROFIT BISNIS SAYA SEKARANG <ArrowRight className="shrink-0 group-hover:translate-x-2 transition-transform" strokeWidth={3} />
            </button>
            
            {/* Micro-trust */}
            <p className="text-sm font-bold text-slate-500 mt-3 flex items-center justify-center gap-2">
              <ShieldCheck size={18} className="text-emerald-500" /> Sudah Digunakan Ratusan Pemilik UMKM untuk Mengunci Margin & Mencegah Kasir Tekor.
            </p>
          </div>
        </motion.div>
      </section>

      {/* 3. PROBLEM & AGITATION SECTION */}
      <section className="py-20 px-4 sm:px-6 bg-slate-900 text-white relative border-y-8 border-rose-600">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-black mb-4 leading-tight text-white">
              Apakah Toko Anda Sedang Mengalami 3 'Bocor Halus' Ini?
            </h2>
            <div className="w-24 h-1.5 bg-rose-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {/* Card 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl relative"
            >
              <div className="absolute -top-6 -left-4 w-12 h-12 bg-rose-600 text-white rounded-full flex items-center justify-center font-black text-2xl border-4 border-slate-900">1</div>
              <div className="mb-6 text-rose-400"><ShoppingBag size={48} strokeWidth={1.5} /></div>
              <h3 className="text-xl font-black mb-3 leading-snug">Omzet Rame, Tapi Uang Modal & Untung Nyampur Aduk</h3>
              <p className="text-slate-400 font-medium leading-relaxed text-sm">
                Hari ini laku keras, tapi uang kasir langsung kepakai belanja bahan besok. Giliran akhir bulan mau gaji diri sendiri, kas malah kosong melompong.
              </p>
            </motion.div>
            
            {/* Card 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl relative"
            >
              <div className="absolute -top-6 -left-4 w-12 h-12 bg-rose-600 text-white rounded-full flex items-center justify-center font-black text-2xl border-4 border-slate-900">2</div>
              <div className="mb-6 text-rose-400"><ArrowDownToLine size={48} strokeWidth={1.5} /></div>
              <h3 className="text-xl font-black mb-3 leading-snug">Laris di Aplikasi Online, Tapi Tekor di Komisi Platform</h3>
              <p className="text-slate-400 font-medium leading-relaxed text-sm">
                Orderan Gofood/Grab/ShopeeFood meledak, tapi karena salah hitung HPP dan gak markup harga jual yang benar, 35%-50% omzet raib dipotong komisi. Lelah doang!
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl relative"
            >
              <div className="absolute -top-6 -left-4 w-12 h-12 bg-rose-600 text-white rounded-full flex items-center justify-center font-black text-2xl border-4 border-slate-900">3</div>
              <div className="mb-6 text-rose-400"><XCircle size={48} strokeWidth={1.5} /></div>
              <h3 className="text-xl font-black mb-3 leading-snug">Capek Jadi Pemadam Kebakaran Operasional</h3>
              <p className="text-slate-400 font-medium leading-relaxed text-sm">
                Tiap hari pusing mikirin stok bahan baku yang tiba-tiba hilang/basi. Operasional berantakan, Anda ngurusin semuanya sendirian sampai gak ada waktu mikirin strategi bisnis.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. SOLUTION & POSITIONING SECTION */}
      <section id="solusi" className="py-24 px-4 sm:px-6 bg-white relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
              UBOS <span className="text-rose-600 underline decoration-rose-200">Bukan Sekadar Kasir Biasa.</span> Ini Adalah Toolset Pengeksekusi Metode Logaritma!
            </h2>
            <p className="text-lg text-slate-600 font-medium leading-relaxed">
              Buang jauh-jauh bayangan tentang aplikasi kasir yang cuma bisa nge-print struk. Anggap UBOS sebagai <strong className="text-slate-900">Tim Spesialis Finansial Virtual</strong> Anda. Cukup luangkan 15-20 menit sehari, sistem akan bekerja untuk Anda:
            </p>
          </div>

          <div className="space-y-16">
            {/* Modul 0 */}
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
              <div className="w-full md:w-1/2">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-8 shadow-inner relative overflow-hidden h-64 flex items-center justify-center">
                  <div className="absolute -right-10 -bottom-10 text-blue-200"><Target size={200} /></div>
                  <div className="relative z-10 text-center">
                    <div className="text-blue-800 font-black text-5xl mb-2">Rp 15.000.000</div>
                    <div className="bg-white text-blue-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm inline-block uppercase tracking-wider">Target Profit Terkunci</div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <div className="inline-block bg-blue-100 text-blue-800 font-black px-3 py-1 rounded-md text-sm mb-4">MODUL 0: Metode Tarik Mundur</div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 leading-tight">Masukkan Target Profit, Biar Sistem Yang Mikir Batas Belanja!</h3>
                <p className="text-slate-600 leading-relaxed font-medium mb-6">
                  Pendekatan tradisional: Jualan - Biaya = Laba (Kalau sisa). <br/>
                  <strong>Pendekatan Logaritma:</strong> Jualan - LABA = Biaya Maksimal. <br/>
                  Anda cukup ketik target profit bulanan yang ingin dibawa pulang. UBOS otomatis memecahnya jadi target omset harian dan MENGUNCI batas maksimal belanja operasional (Margin Guard) per harinya.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-slate-700 font-bold"><CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" /> Gak ada lagi cerita 'uangnya habis buat muter'.</li>
                </ul>
              </div>
            </div>

            {/* Modul 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-10 md:gap-16">
              <div className="w-full md:w-1/2">
                <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-8 shadow-inner relative overflow-hidden h-64 flex items-center justify-center">
                  <div className="absolute -left-10 -bottom-10 text-amber-200"><PieChart size={200} /></div>
                  <div className="relative z-10 flex flex-col gap-3 w-full max-w-xs">
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-amber-100 flex justify-between items-center">
                      <span className="font-bold text-slate-600 text-sm">ShopeeFood (50%)</span>
                      <span className="font-black text-emerald-600">Aman</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-amber-100 flex justify-between items-center">
                      <span className="font-bold text-slate-600 text-sm">GrabFood (45%)</span>
                      <span className="font-black text-emerald-600">Aman</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <div className="inline-block bg-amber-100 text-amber-800 font-black px-3 py-1 rounded-md text-sm mb-4">MODUL 2: Margin Guard & HPP Otomatis</div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 leading-tight">Harga Jual Otomatis Menyesuaikan Komisi Platform</h3>
                <p className="text-slate-600 leading-relaxed font-medium mb-6">
                  Input harga modal (HPP) bahan baku Anda. Ketika ada pesanan dari Gofood, Grabfood, atau ShopeeFood, UBOS secara pintar me-markup harga jual agar potongan komisi 35% - 50% aplikator tidak memakan margin profit asli Anda.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-slate-700 font-bold"><CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" /> Margin aman dari 'gigitan' komisi siluman.</li>
                </ul>
              </div>
            </div>

            {/* Modul 3 */}
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
              <div className="w-full md:w-1/2">
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-8 shadow-inner relative overflow-hidden h-64 flex items-center justify-center">
                  <div className="absolute -right-10 -bottom-10 text-emerald-200"><SplitSquareHorizontal size={200} /></div>
                  <div className="relative z-10 text-center w-full max-w-xs space-y-2">
                    <div className="bg-emerald-600 text-white p-2 rounded-lg font-black text-sm">Kas Belanja Bahan: Rp 300.000</div>
                    <div className="bg-blue-600 text-white p-2 rounded-lg font-black text-sm">Kas Operasional: Rp 50.000</div>
                    <div className="bg-rose-600 text-white p-2 rounded-lg font-black text-sm">PROFIT BERSIH: Rp 150.000</div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <div className="inline-block bg-emerald-100 text-emerald-800 font-black px-3 py-1 rounded-md text-sm mb-4">MODUL 3: Auto-Split Wallet</div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 leading-tight">Close Shift, Uang Langsung Terpisah Otomatis!</h3>
                <p className="text-slate-600 leading-relaxed font-medium mb-6">
                  Tiap kali warung/toko tutup (Close Shift), UBOS langsung membedah total omzet hari itu ke dalam laci (wallet) virtual secara spesifik: Mana jatah untuk beli bahan besok pagi, mana untuk bayar operasional bulanan, dan mana PROFIT BERSIH HARI INI yang berhak Anda kantongi!
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-slate-700 font-bold"><CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" /> Gak ada alasan lagi uang modal kepakai pribadi.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. OFFER, FAQ & CLOSING P.S. */}
      
      {/* Offer Banner */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto bg-slate-900 rounded-[2.5rem] p-8 sm:p-14 text-center border-b-8 border-rose-600 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-[80px] rounded-full"></div>
          
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 relative z-10 leading-tight">
            Ambil Kendali Bisnismu Hari Ini. Stop Biarkan Profit Menguap!
          </h2>
          <p className="text-lg text-slate-300 font-medium mb-10 max-w-2xl mx-auto relative z-10">
            Daftar sekarang dan nikmati full akses ke seluruh modul Toolset Logaritma. Tidak ada potongan transaksi, tidak perlu kartu kredit.
          </p>
          
          <button 
            onClick={() => { trackEvent('click_cta_register'); openRegisterModal(); }}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xl sm:text-2xl font-black py-6 px-10 rounded-full shadow-xl shadow-rose-600/30 hover:shadow-rose-600/50 transition-all active:scale-95 flex items-center justify-center gap-3 w-full sm:w-auto mx-auto group border-b-4 border-rose-800 relative z-10"
          >
            COBA UBOS TOOLSET GRATIS 7 HARI <ArrowRight className="shrink-0 group-hover:translate-x-2 transition-transform" strokeWidth={3} />
          </button>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 px-4 sm:px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">Tanya Jawab (FAQ) Singkat</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 sm:p-6 flex items-start justify-between text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 text-blue-500 group-hover:text-rose-600 transition-colors"><HelpCircle size={20} /></div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-800">{faq.q}</h3>
                  </div>
                  <ChevronRight className={\`mt-1 shrink-0 transition-transform duration-300 \${openFaq === idx ? 'rotate-90 text-rose-600' : 'text-slate-400'}\`} />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 text-slate-600 leading-relaxed font-medium pl-[3.25rem] sm:pl-14"
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

      {/* Closing P.S. */}
      <section className="py-16 px-4 sm:px-6 bg-slate-100 border-t border-slate-200 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 sm:p-10 shadow-sm inline-block text-left">
            <h3 className="font-black text-xl text-amber-900 mb-4">P.S. (Postscript):</h3>
            <p className="text-amber-800 font-medium leading-relaxed mb-4">
              Setiap hari Anda menunda merapikan sistem kasir dan HPP, sama dengan <strong>membiarkan uang ratusan ribu menguap bocor</strong> tanpa Anda sadari.
            </p>
            <p className="text-amber-800 font-medium leading-relaxed font-bold">
              Ambil keputusan cerdas hari ini. Mumpung masa <strong>TRIAL 7 HARI GRATIS</strong> masih dibuka untuk umum.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <span className="font-black text-slate-800 text-xl tracking-tight">LOGARITMA.ID</span>
          </div>
          <p className="text-slate-500 font-bold text-sm">Sistem Eksekusi Logaritma © {new Date().getFullYear()}</p>
        </div>
      </footer>

      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border-4 border-white">
            <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black text-slate-900 leading-tight mb-1">Mulai Amankan Profit!</h3>
                <p className="text-sm text-slate-500 font-bold">Daftar instan. Gratis 7 Hari.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors relative z-10">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto">
              <form id="register-modal" onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Nama Pemilik Usaha</label>
                  <input required type="text" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} placeholder="Sesuai KTP/Panggilan" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-rose-500 focus:bg-white transition-all font-bold text-slate-800" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Nama Usaha / Toko</label>
                  <input required type="text" value={formData.merchantName} onChange={e => setFormData({...formData, merchantName: e.target.value})} placeholder="Nama Brand Anda" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-rose-500 focus:bg-white transition-all font-bold text-slate-800" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Nomor WhatsApp Aktif</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Phone size={18} />
                    </div>
                    <input required type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} placeholder="0812xxxx..." className="w-full pl-12 pr-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-rose-500 focus:bg-white transition-all font-bold text-slate-800" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Kategori Usaha</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-rose-500 focus:bg-white transition-all font-bold text-slate-800 appearance-none">
                    <option value="Kuliner & F&B">Kuliner & F&B (Warung, Resto, Cafe)</option>
                    <option value="Fotokopi & Percetakan">Fotokopi & Percetakan</option>
                    <option value="Toko & Ritel">Toko & Ritel (Minimarket, Olshop)</option>
                    <option value="Laundry & Jasa">Laundry & Jasa</option>
                  </select>
                </div>
              </form>
            </div>

            <div className="p-6 sm:p-8 pt-0 bg-white mt-2">
              <button disabled={loading} form="register-modal" type="submit" className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-black text-lg py-5 rounded-2xl transition-all shadow-xl shadow-rose-600/20 flex items-center justify-center gap-2 border-b-4 border-rose-800">
                {loading ? <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span> : <>MASUK KE DASHBOARD SEKARANG <ArrowRight size={20} strokeWidth={3} /></>}
              </button>
              <p className="text-center text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest flex items-center justify-center gap-1">
                <ShieldCheck size={12} /> 100% Aman & Terenkripsi
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync('src/app/page.tsx', pageContent, 'utf8');
console.log("Landing page completely refactored to Option 2 Direct Response style.");
