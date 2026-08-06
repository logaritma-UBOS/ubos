const fs = require('fs');

const pageContent = `'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X, ChevronRight, Store, ChefHat, Printer, ShoppingBag, Shirt, Smartphone, LineChart, Banknote, HelpCircle, Check, ArrowRight, ShoppingCart, Wallet, TrendingUp, Activity, Package, Megaphone, User, Sparkles, MessageCircle, Bot, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function LandingPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

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
  const [openFaq, setOpenFaq] = useState(0);

  const openRegisterModal = (kategori) => {
    if (kategori) {
      setFormData({ ...formData, category: kategori });
    }
    setShowModal(true);
  };

  const faqs = [
    { q: "Apakah aplikasi ini harus pakai laptop atau komputer?", a: "Tidak perlu! UBOS dirancang khusus agar 100% nyaman dan lancar digunakan langsung dari HP (Android & iOS) maupun Tablet Anda." },
    { q: "Apakah bikin HP lemot atau makan memori besar?", a: "Sangat ringan! Aplikasi ini berbasis teknologi web modern yang hemat memori dan hemat kuota data. Tidak perlu install aplikasi berat." },
    { q: "Apakah cocok untuk bisnis yang baru mulai?", a: "Sangat cocok! Semakin awal Anda menerapkan Metode Logaritma, semakin cepat bisnis Anda terhindar dari kebocoran finansial." }
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
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary/20">
      
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-slate-200 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img src="/assets/images/logo-logaritma.png" alt="Logaritma Logo" className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="font-black text-slate-800 tracking-tight text-base sm:text-xl leading-none">LOGARITMA.ID</span>
              <span className="hidden sm:inline-block text-[10px] font-bold text-blue-600 tracking-wide">by Logaritma Ecosystem</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Metode Logaritma</a>
            <a href="#" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Fitur UBOS</a>
            <a href="#" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Harga</a>
            <a href="/member/login" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1"><User size={16} /> Member Area</a>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={() => { trackEvent('click_cta_register'); openRegisterModal(); }}
              className="text-xs sm:text-sm font-bold bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-all whitespace-nowrap flex items-center gap-2"
            >
              Coba UBOS Sekarang
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 md:pt-36 pb-16 md:pb-20 px-4 md:px-6 max-w-4xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6 md:space-y-8"
        >
          <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border border-rose-200">
            <AlertTriangle size={14} /> Jualan Rame Tapi Uang Habis Gak Bersisa?
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
            Penerapan Metode Logaritma untuk <span className="text-blue-600">Mengunci Profit & Mengontrol Operasional</span> UMKM
          </h1>
          
          <p className="text-base sm:text-lg text-slate-600 mt-4 max-w-3xl mx-auto leading-relaxed font-medium">
            Udah saatnya stop tebak-tebakan profit! UBOS <strong>BUKAN SEKADAR</strong> Aplikasi Kasir biasa. UBOS adalah <strong>Toolset Eksekusi Utama</strong> yang memaksa bisnis Anda mencapai target untung harian dan otomatis memisahkan uang modal belanja dari uang pribadi.
          </p>

          <div className="pt-4 md:pt-6 flex flex-col items-center gap-6">
            <button 
              onClick={() => { trackEvent('click_cta_register'); openRegisterModal(); }}
              className="bg-slate-900 hover:bg-slate-800 text-white text-lg md:text-xl font-black py-4 md:py-5 px-6 md:px-10 rounded-2xl shadow-xl shadow-slate-900/20 transition-transform active:scale-95 flex items-center gap-3 w-full max-w-md mx-auto justify-center group"
            >
              Gunakan UBOS Toolset <ArrowRight className="shrink-0 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex flex-wrap justify-center gap-4 text-sm font-bold text-slate-500">
              <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-emerald-500" /> Kunci Profit</span>
              <span className="flex items-center gap-1.5"><Wallet size={16} className="text-emerald-500" /> Pisah Modal Otomatis</span>
              <span className="flex items-center gap-1.5"><Bot size={16} className="text-blue-500" /> AI Asisten</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Pain Points / Social Proof */}
      <section className="py-20 px-6 bg-slate-100 border-t border-slate-200 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">Kenapa Cara Lama Bikin Bisnis Susah Gede?</h2>
          <p className="text-slate-600 text-lg mb-12">Bocor halus operasional yang jarang disadari owner UMKM.</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm text-left">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
                <XCircle size={24} />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Kasir Cuma Buat Struk</h3>
              <p className="text-slate-500 text-sm">Aplikasi kasir biasa cuma nyatet transaksi, tapi gak peduli HPP bahan baku lagi naik. Tau-tau akhir bulan rugi.</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm text-left">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
                <XCircle size={24} />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Uang Modal & Untung Nyampur</h3>
              <p className="text-slate-500 text-sm">Hasil jualan hari ini langsung dipakai belanja besok tanpa dipisah. Akhirnya gak tau untung aslinya berapa.</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm text-left">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
                <XCircle size={24} />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Stok Bablas, Karyawan Lupa</h3>
              <p className="text-slate-500 text-sm">Gak ada peringatan stok kritis. Pas rame, bahan habis. Terpaksa nolak pesanan atau beli bahan eceran mahal.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Fitur UBOS / Eksekusi Logaritma */}
      <section className="py-20 px-6 bg-slate-900 text-white relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase mb-4">
              <Sparkles size={14} /> Solusi Eksekusi
            </div>
            <h2 className="text-2xl md:text-4xl font-black mb-6">Bagaimana UBOS Mengeksekusi Metode Logaritma?</h2>
            <p className="text-slate-300 text-lg">Ubah teori finansial yang rumit jadi action plan harian otomatis di layar HP kasir Anda.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 font-black text-xl shadow-lg shadow-blue-900/50">1</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Kunci Target Profit Bulanan</h3>
                  <p className="text-slate-400">Anda cukup input target keuntungan bersih bulan ini. UBOS akan memecahnya menjadi target omset harian yang WAJIB dicapai.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 font-black text-xl shadow-lg shadow-indigo-900/50">2</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Pemisahan Modal Belanja Pagi</h3>
                  <p className="text-slate-400">Setiap pagi, sistem memberi tahu batas pasti uang yang boleh dibelanjakan (Margin Guard) agar profit hari ini tidak tergerus.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shrink-0 font-black text-xl shadow-lg shadow-emerald-900/50">3</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Asisten AI Logaritma</h3>
                  <p className="text-slate-400">Bukan cuma rekap angka. Logaritma AI secara otomatis memberi tahu kapan harus stok barang, kapan bikin promo, dan ngirim rekap via WA.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden">
              <div className="w-full aspect-[4/3] bg-slate-900 rounded-2xl border border-slate-700 shadow-inner flex items-center justify-center flex-col p-6 text-center">
                <ShieldCheck size={64} className="text-emerald-500 mb-4" />
                <h4 className="font-bold text-xl text-white mb-2">Margin Guard Aktif</h4>
                <p className="text-sm text-slate-400">Modal Belanja Maks: <span className="text-emerald-400 font-black">Rp 250.000</span></p>
                <div className="w-full bg-slate-800 rounded-full h-2 mt-4 overflow-hidden">
                  <div className="bg-emerald-500 h-full w-3/4"></div>
                </div>
                <p className="text-xs text-slate-500 mt-2">Karyawan mematuhi batas belanja.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6 bg-blue-600 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500 blur-[100px] rounded-full"></div>
        <div className="max-w-3xl mx-auto text-center relative z-10 text-white">
          <h2 className="text-3xl md:text-5xl font-black mb-6">Udah Capek Jadi "Pemadam Kebakaran" di Bisnis Sendiri?</h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 font-medium">
            Saatnya Anda duduk manis mengatur strategi, biarkan UBOS Toolset yang mengatur kedisiplinan finansial & operasional toko Anda setiap hari.
          </p>
          <button 
            onClick={() => { trackEvent('click_cta_register'); openRegisterModal(); }}
            className="bg-white text-blue-700 text-lg md:text-xl font-black py-5 px-10 rounded-2xl shadow-2xl transition-transform active:scale-95 flex items-center gap-3 w-full max-w-md mx-auto justify-center group"
          >
            Coba UBOS Sekarang <ArrowRight className="shrink-0 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/assets/images/logo-logaritma.png" alt="Logaritma Logo" className="w-8 h-8 object-contain" />
            <span className="font-black text-slate-800 text-xl tracking-tight">LOGARITMA.ID</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-semibold text-slate-500">
            <a href="#" className="hover:text-blue-600">Kebijakan Privasi</a>
            <a href="#" className="hover:text-blue-600">Syarat & Ketentuan</a>
            <a href="/member/login" className="hover:text-blue-600 font-bold">Login Member Area</a>
          </div>
          <p className="text-slate-400 text-sm">© {new Date().getFullYear()} Logaritma Ecosystem. All rights reserved.</p>
        </div>
      </footer>

      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-xl font-black text-slate-900">Gunakan UBOS Toolset</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Langkah awal amankan profit bisnis.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="register-modal" onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Pemilik Usaha</label>
                  <input required type="text" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} placeholder="Misal: Budi Santoso" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Usaha / Toko</label>
                  <input required type="text" value={formData.merchantName} onChange={e => setFormData({...formData, merchantName: e.target.value})} placeholder="Misal: Kedai Kopi Senja" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nomor WhatsApp</label>
                  <input required type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} placeholder="081234567890" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kategori Usaha</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary transition-all font-medium text-slate-800">
                    <option value="Kuliner & F&B">Kuliner & F&B (Warung, Resto, Cafe)</option>
                    <option value="Fotokopi & Percetakan">Fotokopi & Percetakan</option>
                    <option value="Toko & Ritel">Toko & Ritel (Minimarket, Olshop)</option>
                    <option value="Laundry & Jasa">Laundry & Jasa</option>
                  </select>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-100 bg-white">
              <button disabled={loading} form="register-modal" type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
                {loading ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> : <>Daftar Sekarang <ArrowRight size={18} /></>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync('src/app/page.tsx', pageContent, 'utf8');
console.log("Refactored Landing Page successfully.");
