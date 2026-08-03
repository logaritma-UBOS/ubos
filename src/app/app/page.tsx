'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Target, TrendingUp, AlertTriangle, ArrowRight, Package, Wallet, CheckCircle2, MonitorPlay, LogOut, Megaphone, Printer, Handshake, MessageCircle, X, Loader2, ShoppingBag, Shirt, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function MemberDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [merchant, setMerchant] = useState<any>(null);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number>(0);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  const [showWaitingModal, setShowWaitingModal] = useState(false);
  const [waitingCategory, setWaitingCategory] = useState('');
  const [waitingForm, setWaitingForm] = useState({ nama: '', whatsapp: '' });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestingUpsell, setRequestingUpsell] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (isMounted) setLoading(false);
          router.push('/');
          return;
        }

        const { data: merchantData } = await supabase
          .from('merchants')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (merchantData && isMounted) {
          setMerchant(merchantData);
          
          let expiresDate = new Date();
          if (merchantData.trial_expires_at) {
            expiresDate = new Date(merchantData.trial_expires_at);
          } else if (merchantData.created_at) {
            expiresDate = new Date(merchantData.created_at);
            expiresDate.setDate(expiresDate.getDate() + 7);
          }
          
          const now = new Date();
          const diff = Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          setTrialDaysLeft(diff > 0 ? diff : 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('expired') === 'true') {
        setShowPaywallModal(true);
      }
    }

    return () => { isMounted = false; };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };


  const handlePayWithMayar = async () => {
    setIsCreatingPayment(true);
    try {
      const res = await fetch('/api/mayar/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: merchant?.id,
          name: merchant?.nama_usaha || merchant?.owner_name,
          phone: merchant?.whatsapp,
          email: merchant?.email
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan saat memproses pembayaran');

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Gagal mendapatkan link pembayaran');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const openWaitingList = (kategori: string) => {
    setWaitingCategory(kategori);
    setWaitingForm({ nama: merchant?.nama_usaha || merchant?.owner_name || '', whatsapp: merchant?.whatsapp || '' });
    setSubmitSuccess(false);
    setShowWaitingModal(true);
  };

  const handleWaitingListSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.from('waiting_list').insert([
        {
          nama_usaha: waitingForm.nama,
          whatsapp: waitingForm.whatsapp,
          kategori_usaha: waitingCategory
        }
      ]);
      if (error) throw error;
      setSubmitSuccess(true);
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan, silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpsellRequest = async (product: string) => {
    if (!merchant) return;
    setRequestingUpsell(product);
    try {
      const currentHistory = Array.isArray(merchant.upsell_history) ? merchant.upsell_history : [];
      const newRequest = {
        product,
        status: 'Pending',
        requested_at: new Date().toISOString()
      };
      const updatedHistory = [...currentHistory, newRequest];
      
      const { error } = await supabase
        .from('merchants')
        .update({ upsell_history: updatedHistory })
        .eq('id', merchant.id);
        
      if (error) throw error;
      
      setMerchant({ ...merchant, upsell_history: updatedHistory });
      toast.success('Permintaan Anda telah dicatat! Tim Logaritma akan segera menghubungi Anda via WA.', { duration: 5000 });
    } catch (err) {
      console.error(err);
      toast.error('Gagal memproses permintaan, coba lagi nanti.');
    } finally {
      setRequestingUpsell(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-primary"></div>
      </div>
    );
  }

  const kategori = merchant?.kategori_usaha?.toLowerCase() || '';
  const isKuliner = kategori.includes('kuliner') || kategori.includes('f&b');
  const isPercetakan = kategori.includes('percetakan') || kategori.includes('fotokopi');
  const isRitel = kategori.includes('ritel') || kategori.includes('toko');
  const isLaundry = kategori.includes('laundry') || kategori.includes('jasa');
  const isLainnya = !isKuliner && !isPercetakan && !isRitel && !isLaundry;

  return (
    <div className="min-h-[100dvh] bg-slate-50 selection:bg-primary/20">
      
      {/* Portal Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/images/logo-logaritma.png" alt="Logaritma Logo" className="w-8 h-8 object-contain" />
            <div className="flex flex-col">
              <span className="font-black text-slate-800 tracking-tight text-xl leading-none">LOGARITMA.ID</span>
              <span className="text-[10px] font-bold text-blue-600 tracking-wide">Member Area</span>
            </div>
          </div>
          <button onClick={handleLogout} className="text-sm font-bold text-slate-500 hover:text-danger transition-colors flex items-center gap-2 bg-slate-100 hover:bg-red-50 px-3 py-1.5 rounded-lg">
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        
        {/* A. Header Status Akun & License */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 to-slate-900 text-white rounded-3xl p-8 shadow-xl shadow-blue-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Target size={150} />
          </div>
          <div className="relative z-10 space-y-2">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Halo, {merchant?.nama_usaha || merchant?.owner_name || 'Member'}!</h1>
            <p className="text-blue-100 font-medium">Selamat datang di Pusat Kontrol Ekosistem Logaritma.</p>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-3">
            <div className="bg-blue-500/20 backdrop-blur-md border border-blue-500/30 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:bg-blue-500/30 transition-colors" onClick={() => setShowPaywallModal(true)}>
               <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl">{trialDaysLeft > 0 ? '🎁' : '🔒'}</div>
               <div>
                 <p className="text-xs font-bold text-blue-300 uppercase tracking-wider">Status Lisensi</p>
                 <p className="font-bold text-lg text-white leading-tight">
                   {trialDaysLeft > 0 ? `Aktif` : `Expired`} 
                   <span className="text-sm font-medium opacity-80 ml-1">
                     {trialDaysLeft > 0 ? `(Sisa ${trialDaysLeft} Hari)` : `(Silakan Upgrade)`}
                   </span>
                 </p>
               </div>
            </div>
            
            <button 
              onClick={() => setShowPaywallModal(true)}
              className="bg-amber-400 hover:bg-amber-300 text-amber-900 font-black px-4 py-3 rounded-xl transition-transform active:scale-95 shadow-lg shadow-amber-400/20 w-full md:w-auto flex items-center justify-center gap-2"
            >
              ⚡ Upgrade Premium Rp 49.000
            </button>
          </div>
        </div>

        {/* B. Main Module Launchpad */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Modul Utama Anda</h2>
              <p className="text-slate-500 font-medium">Akses aplikasi dan tools khusus sesuai kategori bisnis Anda.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-1 gap-6">
            
            {isKuliner && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row group hover:shadow-xl transition-all duration-300">
                <div className="md:w-1/3 bg-slate-900 relative p-8 flex flex-col justify-center overflow-hidden">
                  <div className="absolute top-4 left-4 px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-md backdrop-blur-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Tersedia
                  </div>
                  <h3 className="text-3xl font-black text-white relative z-10 mt-6">UBOS F&B</h3>
                  <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
                    <Package size={150} />
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-center">
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Aplikasi Kasir & Margin Guard</h4>
                  <p className="text-slate-500 font-medium mb-6">Kelola Point of Sales (POS), Manajemen Stok Bahan Baku, HPP Porsi, dan Kontrol Profit harian Anda dalam satu dashboard.</p>
                  
                  {trialDaysLeft > 0 ? (
                    <a 
                      href="/ubos"
                      className="w-full md:w-auto self-start bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                      Buka Application UBOS Kuliner <ArrowRight size={18} />
                    </a>
                  ) : (
                    <button 
                      onClick={() => setShowPaywallModal(true)}
                      className="w-full md:w-auto self-start bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 px-8 rounded-xl transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
                    >
                      <Lock size={18} className="text-amber-400" />
                      Lisensi Expired - Upgrade Sekarang
                    </button>
                  )}
                </div>
              </div>
            )}

            {isPercetakan && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row group hover:shadow-xl transition-all duration-300">
                <div className="md:w-1/3 bg-slate-800 relative p-8 flex flex-col justify-center overflow-hidden">
                  <div className="absolute top-4 left-4 px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-wider rounded-md backdrop-blur-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    Sedang Disiapkan
                  </div>
                  <h3 className="text-3xl font-black text-white relative z-10 mt-6">UBOS Percetakan & Fotokopi</h3>
                  <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
                    <Printer size={150} />
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg text-sm font-bold mb-4 w-fit border border-amber-200">
                    <AlertTriangle size={16} /> Akses VVIP Prioritas untuk Anda
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Tools Kontrol Antrean & HPP Kertas</h4>
                  <p className="text-slate-500 font-medium mb-6">Kami sedang meracik fitur khusus untuk menghitung HPP tinta/kertas dan manajemen order cetak. Anda berada di daftar prioritas kami.</p>
                  <button 
                    onClick={() => openWaitingList('Jasa Percetakan')}
                    className="w-full md:w-auto self-start bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-8 rounded-xl transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    Dapatkan Akses Prioritas Launching <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {isRitel && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row group hover:shadow-xl transition-all duration-300">
                <div className="md:w-1/3 bg-slate-800 relative p-8 flex flex-col justify-center overflow-hidden">
                  <div className="absolute top-4 left-4 px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-wider rounded-md backdrop-blur-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    SEDANG DISIAPKAN (WAITING LIST)
                  </div>
                  <h3 className="text-3xl font-black text-white relative z-10 mt-6">UBOS Toko & Ritel</h3>
                  <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
                    <ShoppingBag size={150} />
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg text-sm font-bold mb-4 w-fit border border-amber-200">
                    <AlertTriangle size={16} /> Akses VVIP Prioritas Launching untuk Anda
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Manajemen Stok Anti Dead-Stock & Peringatan Barcode Expired</h4>
                  <p className="text-slate-500 font-medium mb-6">Sistem Kasir Minimarket & Olshop dengan Hitung Target Sales Harian sedang dalam tahap finalisasi.</p>
                  <button 
                    onClick={() => openWaitingList('Toko & Ritel')}
                    className="w-full md:w-auto self-start bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-8 rounded-xl transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    Dapatkan Akses Prioritas UBOS Ritel <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {isLaundry && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row group hover:shadow-xl transition-all duration-300">
                <div className="md:w-1/3 bg-slate-800 relative p-8 flex flex-col justify-center overflow-hidden">
                  <div className="absolute top-4 left-4 px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-wider rounded-md backdrop-blur-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    SEDANG DISIAPKAN (WAITING LIST)
                  </div>
                  <h3 className="text-3xl font-black text-white relative z-10 mt-6">UBOS Laundry & Jasa</h3>
                  <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
                    <Shirt size={150} />
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg text-sm font-bold mb-4 w-fit border border-amber-200">
                    <AlertTriangle size={16} /> Akses VVIP Prioritas Launching untuk Anda
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Tracking Slot Jam Kerja, Layanan Cuci/Setrika Kiloan & Satuan</h4>
                  <p className="text-slate-500 font-medium mb-6">Kalkulator Otomatis Komisi Staf/Karyawan Cuci sedang dalam tahap pengerjaan prioritas oleh tim.</p>
                  <button 
                    onClick={() => openWaitingList('Laundry & Jasa')}
                    className="w-full md:w-auto self-start bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-8 rounded-xl transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    Dapatkan Akses Prioritas UBOS Laundry <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {isLainnya && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row group hover:shadow-xl transition-all duration-300">
                <div className="md:w-1/3 bg-slate-700 relative p-8 flex flex-col justify-center overflow-hidden">
                  <div className="absolute top-4 left-4 px-2.5 py-1 bg-slate-500/20 border border-slate-400/30 text-slate-300 text-[10px] font-black uppercase tracking-wider rounded-md backdrop-blur-sm flex items-center gap-1.5">
                    Waiting List
                  </div>
                  <h3 className="text-3xl font-black text-white relative z-10 mt-6">Modul {merchant?.kategori_usaha || 'Lainnya'}</h3>
                  <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
                    <Target size={150} />
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-center">
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Dalam Tahap Pengembangan</h4>
                  <p className="text-slate-500 font-medium mb-6">Fitur spesifik untuk kategori usaha Anda saat ini sedang dikembangkan oleh tim Logaritma. Bergabunglah dengan antrean prioritas.</p>
                  <button 
                    onClick={() => openWaitingList(merchant?.kategori_usaha || 'Lainnya')}
                    className="w-full md:w-auto self-start bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 px-8 rounded-xl transition-transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    Dapatkan Akses Prioritas Launching <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* C. Support System & Services Logaritma */}
        <div className="space-y-6 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Support System & Services</h2>
              <p className="text-slate-500 font-medium">Layanan tambahan untuk mempercepat pertumbuhan bisnis Anda.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Megaphone size={24} />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight">📢 Iklankan Bisnis Anda (Meta Ads)</h3>
              <p className="text-sm text-slate-500 font-medium mb-6 flex-1">Services pengelolaan iklan Meta Ads dari Tim Logaritma untuk datangkan pelanggan secara otomatis.</p>
              <button 
                onClick={() => handleUpsellRequest('Jasa Iklan Meta Ads')}
                disabled={requestingUpsell === 'Jasa Iklan Meta Ads'}
                className="w-full border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {requestingUpsell === 'Jasa Iklan Meta Ads' ? <Loader2 size={18} className="animate-spin"/> : 'Pilih Paket Iklan'}
              </button>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <Printer size={24} />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight">🖨️ Mini Printer Thermal Logaritma</h3>
              <p className="text-sm text-slate-500 font-medium mb-6 flex-1">Cetak struk kasir tanpa kabel via Bluetooth. Kompatibel 100% dengan aplikasi kasir UBOS.</p>
              <button 
                onClick={() => handleUpsellRequest('Mini Printer Thermal')}
                disabled={requestingUpsell === 'Mini Printer Thermal'}
                className="w-full border-2 border-slate-200 hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {requestingUpsell === 'Mini Printer Thermal' ? <Loader2 size={18} className="animate-spin"/> : 'Pesan Mini Printer'}
              </button>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Handshake size={24} />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight">🤝 Program Affiliate Logaritma</h3>
              <p className="text-sm text-slate-500 font-medium mb-6 flex-1">Dapatkan komisi berulang dengan merekomendasikan Metoda Logaritma & UBOS ke jaringan UMKM Anda.</p>
              <button 
                onClick={() => handleUpsellRequest('Program Affiliate')}
                disabled={requestingUpsell === 'Program Affiliate'}
                className="w-full border-2 border-slate-200 hover:border-purple-600 hover:bg-purple-50 hover:text-purple-700 text-slate-700 font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {requestingUpsell === 'Program Affiliate' ? <Loader2 size={18} className="animate-spin"/> : 'Daftar Affiliator'}
              </button>
            </div>
          </div>
        </div>

        {/* D. Pusat Edukasi & Komunitas */}
        <div className="space-y-6 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Pusat Edukasi & Bantuan</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-lg flex items-center justify-between group cursor-pointer hover:bg-slate-800 transition-colors">
              <div>
                <h3 className="text-xl font-black mb-2">Masterclass Metoda Logaritma</h3>
                <p className="text-sm text-slate-400 font-medium">Pelajari rahasia pola pikir "Tarik Mundur Target Profit".</p>
              </div>
              <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <MonitorPlay size={28} className="text-white" />
              </div>
            </div>

            <a 
              href="https://wa.me/6285179660408?text=Halo%20Admin%20Logaritma%2C%20saya%20butuh%20bantuan%20terkait%20akun%20member%20saya..."
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-emerald-500 text-white p-8 rounded-3xl shadow-lg flex items-center justify-between group cursor-pointer hover:bg-emerald-600 transition-colors block"
            >
              <div>
                <h3 className="text-xl font-black mb-2">Konsultasi Langsung</h3>
                <p className="text-sm text-emerald-100 font-medium">Ada kendala? Hubungi tim support via WhatsApp Admin.</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <MessageCircle size={28} className="text-white" />
              </div>
            </a>
          </div>
        </div>

      </main>

      {/* Waiting List Modal */}
      {showWaitingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-10 rotate-12">
                <Target size={80} />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-black text-slate-900">Akses Prioritas UBOS</h3>
                <p className="text-sm text-slate-500 font-bold text-primary mt-1">{waitingCategory}</p>
              </div>
              <button onClick={() => setShowWaitingModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 relative z-10">
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              {submitSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-xl font-black text-slate-900">Masuk Daftar VVIP!</h4>
                  <p className="text-slate-500 font-medium">Terima kasih! Nomor WhatsApp Anda telah masuk dalam daftar prioritas VVIP. Kami akan menghubungi Anda begitu modul resmi diluncurkan.</p>
                  <button 
                    onClick={() => setShowWaitingModal(false)}
                    className="mt-4 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors"
                  >
                    Kembali ke Dashboard
                  </button>
                </div>
              ) : (
                <form onSubmit={handleWaitingListSubmit} className="space-y-4">
                  <p className="text-sm text-slate-600 font-medium mb-6">
                    Kami sedang meracik fitur khusus untuk <span className="font-bold text-slate-900">{waitingCategory}</span>. Masukkan WhatsApp aktif Anda untuk menjadi yang pertama menerima kabar saat fitur dirilis.
                  </p>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Usaha / Toko</label>
                    <input 
                      required
                      type="text" 
                      value={waitingForm.nama}
                      onChange={e => setWaitingForm({...waitingForm, nama: e.target.value})}
                      placeholder="Masukkan nama usaha Anda"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nomor WhatsApp Aktif</label>
                    <input 
                      required
                      type="tel" 
                      value={waitingForm.whatsapp}
                      onChange={e => setWaitingForm({...waitingForm, whatsapp: e.target.value})}
                      placeholder="Contoh: 081234567890"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-xl shadow-lg shadow-primary/30 transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 mt-4"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>Dapatkan Akses Prioritas Launching <ArrowRight size={18} /></>
                    )}
                  </button>
                </form>
              )}
            </div>
            
          </div>
        </div>
      )}

      {/* Paywall Renewal Modal */}
      {showPaywallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200 relative">
            
            <button onClick={() => setShowPaywallModal(false)} className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 z-10 transition-colors">
              <X size={18} />
            </button>
            
            <div className="p-8 text-center space-y-4">
              <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-2 rotate-12 shadow-sm border border-amber-200">
                <Lock size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {trialDaysLeft > 0 ? 'Upgrade Premium UBOS' : 'Masa Coba Gratis Anda Telah Berakhir'}
              </h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto">Tetap kunci batas belanja harian, pantau profit bersih, dan operasionalkan kasir toko Anda tanpa henti.</p>
              
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl mt-4">
                <p className="text-xs font-bold text-blue-700 leading-relaxed">
                  ℹ️ Sisa hari aktif trial/lisensi Anda saat ini tidak akan hangus, melainkan langsung otomatis ditambahkan <span className="text-blue-800 font-black bg-blue-200 px-1 rounded">+30 hari</span> setelah pembayaran selesai.
                </p>
              </div>
              
              <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-red-500/20">
                  🔥 Diskon Khusus UMKM 50%
                </div>
                
                <p className="text-slate-400 font-bold line-through mt-2 mb-1">Rp 99.000/bulan</p>
                <div className="flex items-end justify-center gap-1 text-primary">
                  <span className="text-3xl font-black">Rp 49.000</span>
                  <span className="font-bold mb-1">/ bulan</span>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <button 
                  onClick={handlePayWithMayar}
                  disabled={isCreatingPayment}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 px-6 rounded-xl transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
                >
                  {isCreatingPayment ? (
                    <><Loader2 className="animate-spin" size={20} /> Memproses...</>
                  ) : (
                    <><Wallet size={20} /> Bayar Otomatis Rp 49.000 (QRIS/e-Wallet/VA)</>
                  )}
                </button>
                
                <a 
                  href={`https://wa.me/6285179660408?text=Halo%20Admin%20Logaritma%2C%20masa%20aktif%20trial%20untuk%20toko%20${encodeURIComponent(merchant?.nama_usaha || merchant?.owner_name || 'saya')}%20sudah%20habis.%20Saya%20ingin%20perpanjang%20Lisensi%20Premium%20UBOS%20paket%20promo%20Rp%2049.000%2Fbulan.%20Bagaimana%20alur%20pembayarannya%3F`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} /> Konsultasi / Transfer Manual via WA
                </a>
              </div>
            </div>
            
          </div>
        </div>
      )}


    </div>
  );
}
