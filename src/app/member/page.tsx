'use client';

import { Component, FormEvent, ReactNode, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Target, AlertTriangle, ArrowRight, Package, Wallet, CheckCircle2, MonitorPlay, LogOut, Megaphone, Printer, Handshake, MessageCircle, X, Loader2, ShoppingBag, Shirt, Lock, Home, Wrench, Star, BookOpen, HelpCircle, Info, Flame, Copy, FileText, Download, Camera, Users, Video, ShoppingCart, Search, ChevronDown, ChevronUp, LayoutGrid, Rocket, TrendingUp, ShieldCheck, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const faqData = {
  kasir: [
    { q: 'Apakah UBOS bisa jalan tanpa internet (Offline)?', a: 'Bisa! Kasir UBOS tetap bisa digunakan saat internet mati. Data transaksi akan otomatis tersinkronisasi ke server saat koneksi internet kembali normal.' },
    { q: 'Bagaimana cara update stok menu yang habis?', a: 'Buka modul F&B > Pilih menu Inventori > Pilih bahan baku/menu > Klik Sesuaikan Stok. Stok akan langsung update secara real-time di kasir.' }
  ],
  margin: [
    { q: 'Bagaimana Margin Guard menghitung HPP otomatis?', a: 'Margin Guard membaca resep yang sudah kamu input. Jika harga bahan baku di pasar naik, sistem otomatis memberikan notifikasi dan menyarankan harga jual baru.' },
    { q: 'Bagaimana cara memisahkan komisi Gofood/Grabfood?', a: 'Gunakan fitur Markup Harga Platform di pengaturan menu. Sistem akan otomatis memisahkan komisi 20% milik aplikator sehingga profit bersihmu tetap utuh.' }
  ],
  akun: [
    { q: 'Ganti HP atau Browser, kenapa disuruh daftar lagi?', a: 'Tenang, data Anda aman. Pastikan memasukkan nomor WhatsApp yang sama. Anda akan diarahkan ke halaman login untuk memasukkan password, bukan mendaftar ulang.' },
    { q: 'Bagaimana cara perpanjang lisensi member?', a: 'Klik tombol "Perpanjang Lisensi" di halaman depan Member Area, lakukan pembayaran, dan akun Anda akan aktif kembali secara instan.' },
    { q: 'Saya lupa password, bagaimana cara resetnya?', a: 'Saat ini reset password bisa dibantu oleh tim CS kami. Silakan klik tombol "Chat CS Admin" di bawah dan informasikan nomor WhatsApp Anda.' }
  ]
};

class ServicesErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('Services tab error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          Terjadi kesalahan saat memuat layanan. Silakan muat ulang halaman atau hubungi admin.
        </div>
      );
    }

    return this.props.children;
  }
}

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
  const [activeTab, setActiveTab] = useState<'modul' | 'affiliate' | 'services' | 'edukasi' | 'bantuan'>('modul');
  const [showFeatureComingSoonModal, setShowFeatureComingSoonModal] = useState(false);
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false);
  const [faqSearchTerm, setFaqSearchTerm] = useState('');
  const [faqActiveTab, setFaqActiveTab] = useState<'kasir' | 'margin' | 'akun'>('kasir');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const [cetakType, setCetakType] = useState('Cetak Stiker');
  const [cetakQty, setCetakQty] = useState('100');
  const [cetakName, setCetakName] = useState('');
  const [cetakPhone, setCetakPhone] = useState('');
  const [cetakNotes, setCetakNotes] = useState('');
  const [customCompany, setCustomCompany] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [customIndustry, setCustomIndustry] = useState('Kuliner & F&B');
  const [customBudget, setCustomBudget] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  // Affiliate State
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutForm, setPayoutForm] = useState({ bank_name: 'BCA', account_number: '', account_name: '', amount: '' });
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  const safeOpenUrl = (url?: string) => {
    if (!url || typeof window === 'undefined') return;
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to open URL', error);
    }
  };

  const buildWhatsAppLink = (message: string = '') =>
    `https://wa.me/6285179660408?text=${encodeURIComponent(message)}`;

  const handleWhatsAppOpen = (message: string) => {
    if (!message) return;
    safeOpenUrl(buildWhatsAppLink(message));
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const getRefLink = () => {
    if (!merchant) return 'https://logaritma.id';
    // Gunakan merchant.slug jika ada dari DB, atau generate dari nama usaha, fallback ke id/no_wa
    const slugBasis = merchant.slug || (merchant.nama_usaha ? generateSlug(merchant.nama_usaha) : merchant.id || merchant.no_wa);
    return `https://logaritma.id?ref=${slugBasis}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getRefLink());
    toast.success('Link Referral disalin!');
  };

  const handleShareWA = () => {
    const text = `Halo kawan bisnis! Saya pakai Logaritma UBOS buat rapihin laporan & kunci profit usaha. Coba gratis 14 hari pake link rekomendasi saya ini ya: ${getRefLink()}`;
    safeOpenUrl(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const handleSubmitPayout = async (e: FormEvent) => {
    e.preventDefault();
    if (!merchant?.id) {
      toast.error('Gagal memproses. Sesi merchant tidak valid.');
      return;
    }
    const { amount, bank_name, account_number, account_name } = payoutForm;
    if (Number(amount) < 50000) {
      toast.error('Minimum penarikan saldo adalah Rp 50.000');
      return;
    }

    setIsSubmittingPayout(true);
    const loadingToast = toast.loading('Memproses pengajuan tarik saldo melalui Mayar...');
    try {
      const res = await fetch('/api/affiliate/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_id: merchant.id,
          bank_name,
          account_number,
          account_name,
          amount: Number(amount)
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Terjadi kesalahan saat memproses pencairan');
      }
      
      toast.success('Pengajuan berhasil! Dana sedang diproses oleh Mayar.', { id: loadingToast });
      setShowPayoutModal(false);
      setPayoutForm({ bank_name: 'BCA', account_number: '', account_name: '', amount: '' });
      
      // Update local state temporarily
      setMerchant(prev => prev ? { ...prev, commission_balance: (prev.commission_balance || 0) - Number(amount) } : prev);
    } catch (err: any) {
      toast.error('Gagal mengajukan penarikan: ' + err.message, { id: loadingToast });
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        // Cek 1: Supabase session (user login ke UBOS App dengan password)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          // Cek 2: Semua kemungkinan sesi di localStorage
          let sessionData: any = null;

          try {
            // Prioritas: wa_member_session (dari /member/login)
            const waSession = localStorage.getItem('wa_member_session');
            if (waSession) {
              sessionData = JSON.parse(waSession);
            }
          } catch (_) {}

          if (!sessionData) {
            try {
              // Fallback: ubos_lead (dari form pendaftaran landing page)
              const leadStr = localStorage.getItem('ubos_lead');
              if (leadStr) {
                const leadData = JSON.parse(leadStr);
                // ubos_lead format: { nama_usaha, owner_name, whatsapp, kategori_usaha }
                sessionData = {
                  nama_usaha: leadData.nama_usaha || '',
                  nama_pemilik: leadData.owner_name || leadData.nama_pemilik || '',
                  no_wa: leadData.whatsapp || '',
                  kategori: leadData.kategori_usaha || 'Kuliner & F&B',
                };
              }
            } catch (_) {}
          }

          if (sessionData && isMounted) {
            setMerchant(sessionData);
            setTrialDaysLeft(7);
            setLoading(false);
            return;
          }

          // Benar-benar tidak ada sesi ??? redirect ke halaman login member
          if (isMounted) {
            setLoading(false);
            router.push('/member/login');
          }
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
          const merchantStatus = merchantData.status || 'Trial';
          
          if (merchantStatus === 'Premium' && merchantData.expired_at) {
            expiresDate = new Date(merchantData.expired_at);
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

  // Extreme Funneling: Track member area visit (Warm Market signal)
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        await fetch('/api/track-visitor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referrer: document.referrer,
            utm_source: urlParams.get('utm_source') || 'member_area',
            utm_medium: urlParams.get('utm_medium'),
            utm_campaign: urlParams.get('utm_campaign'),
            path: '/member',
          })
        });
      } catch (_) { /* silent */ }
    };
    trackVisitor();
  }, []);

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
          merchantId: merchant?.id || merchant?.no_wa || merchant?.whatsapp || null,
          name: merchant?.nama_usaha || merchant?.owner_name || merchant?.nama_pemilik || 'Member',
          phone: merchant?.whatsapp || merchant?.no_wa || '',
          email: merchant?.email || ''
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan saat memproses pembayaran');

      if (data.url) {
        safeOpenUrl(data.url);
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
    if (!merchant?.id) return;
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
  let urlCategory = '';
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    urlCategory = params.get('category') || '';
  }

  const rawCategory = (urlCategory || merchant?.kategori_usaha || merchant?.kategori || '').toLowerCase();
  
  let isKuliner = false;
  let isPercetakan = false;
  let isRitel = false;
  let isLaundry = false;
  let isLainnya = false;

  if (rawCategory.includes('kuliner') || rawCategory.includes('f&b') || rawCategory.includes('warung')) {
    isKuliner = true;
  } else if (rawCategory.includes('percetakan') || rawCategory.includes('fotokopi')) {
    isPercetakan = true;
  } else if (rawCategory.includes('ritel') || rawCategory.includes('toko') || rawCategory.includes('grosir')) {
    isRitel = true;
  } else if (rawCategory.includes('laundry') || rawCategory.includes('jasa')) {
    isLaundry = true;
  } else {
    isLainnya = true;
  }

  return (
    <div className="min-h-screen bg-slate-100 selection:bg-primary/20 flex flex-col items-center">
      <div className="w-full max-w-md md:max-w-xl mx-auto min-h-screen bg-slate-50 pb-24 shadow-sm border-x border-slate-100 relative">
      
      {/* Portal Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 w-full">
        <div className="px-4 md:px-6 h-16 flex items-center justify-between">
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

      <main className="px-4 py-4 space-y-4">
        
        {/* A. Compact Sub-Header / Welcome Banner */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl bg-blue-600 text-white shadow-md">
          {/* Left: Identitas User */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg shrink-0 shadow-inner">
              {trialDaysLeft > 0 ? '🔥' : '⚠️'}
            </div>
            <div>
              <p className="font-bold text-lg sm:text-xl break-words leading-tight">
                {merchant?.nama_usaha || merchant?.owner_name || 'Member'}
              </p>
              <button
                onClick={() => setShowPaywallModal(true)}
                className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full mt-1 transition-colors ${
                  trialDaysLeft > 0
                    ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                    : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                }`}
              >
                {trialDaysLeft > 0 ? (
                  <><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" /> AKTIF • SISA {trialDaysLeft} HARI</>
                ) : (
                  <><span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" /> MASA AKTIF HABIS</>
                )}
              </button>
            </div>
          </div>

          {/* Right: CTA Button */}
          <button
            onClick={() => setShowPaywallModal(true)}
            className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-4 py-2.5 rounded-xl shadow-md text-center text-sm transition-all"
          >
             ⚡ {trialDaysLeft <= 0 ? 'Aktifkan Premium' : 'Upgrade Rp 49.000'}
          </button>
        </div>

        {/* ?????? UNIFIED MOBILE-FIRST LAYOUT: tabbed content ????????????????????????????????????????????????????????? */}
        <div className="space-y-6 pt-2">

          {/* Tab: Modul */}
          {activeTab === 'modul' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Modul Utama Anda</h2>
                <p className="text-slate-500 text-sm font-medium">Navigasi profit harian bisnis Anda.</p>
              </div>
              
              {isKuliner && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="bg-gradient-to-br from-blue-900 to-blue-800 relative p-6 flex flex-col justify-center overflow-hidden">
                    <div className="absolute top-3 left-3 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-wider rounded-md flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> READY / BISA DIPAKAI
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
                      <ShoppingBag size={100} />
                    </div>
                    <h3 className="text-2xl font-black text-white mt-5 relative z-10">UBOS F&B</h3>
                  </div>
                  <div className="p-5 flex flex-col gap-4">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 mb-1 leading-tight">Toolset Eksekusi Logaritma Anti-Bocor & Pengunci Profit</h4>
                      <p className="text-slate-600 text-sm mb-0 leading-relaxed">
                        UBOS BUKAN SEKADAR Aplikasi Kasir/POS biasa! Ini adalah Toolset Eksekusi Utama dari Metode Logaritma yang dibikin khusus buat bantuin kamu ngunci target untung bulanan. Secara otomatis sistem akan memisahkan uang modal belanja besok dan profit bersih hari ini, jadi uang usaha gak pernah kecampur uang pribadi!
                      </p>
                    </div>

                    {trialDaysLeft > 0 ? (
                      <div className="space-y-3">
                        <button 
                          onClick={async (e) => {
                            e.preventDefault();
                            const category = (merchant?.kategori_usaha || 'kuliner').toLowerCase().split(' ')[0] || 'kuliner';
                            
                            if (!merchant?.user_id) {
                              // Cek apakah nomor WA sudah terdaftar di database via server API
                              const phone = (merchant?.no_wa || merchant?.whatsapp || '').replace(/\D/g, '');
                              if (phone) {
                                try {
                                  const res = await fetch(`/api/check-phone?phone=${encodeURIComponent(phone)}`);
                                  const result = await res.json();
                                  
                                  if (result.found) {
                                    // Nomor terdaftar, arahkan ke halaman login password
                                    toast.info("Silakan masukkan password untuk mengakses modul.");
                                    router.push(`/auth?mode=login`);
                                    return;
                                  }
                                } catch (err) {
                                  console.error(err);
                                }
                              }

                              toast.error("Silakan login atau daftar untuk menggunakan modul ini.", {
                                description: "Akses terbatas khusus member terdaftar.",
                                icon: <Lock className="w-5 h-5 text-amber-500" />
                              });
                              router.push(`/auth?mode=register&category=${encodeURIComponent(category)}`);
                              return;
                            }
                            
                            const slug = ((merchant?.nama_usaha || merchant?.owner_name || 'merchant').toLowerCase() || 'merchant').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                            router.push(`/ubos/${encodeURIComponent(category)}/${slug}`);
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md"
                        >
                          Buka Modul F&B <ArrowRight size={16} />
                        </button>
                        
                        <div className="grid grid-cols-2 gap-2 mt-2">
                           <button className="bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-600 font-semibold py-2 px-3 rounded-lg text-xs flex flex-col items-center justify-center gap-1.5 transition-colors" onClick={() => toast.info('Fitur dalam modul. Buka Modul F&B terlebih dahulu.')}>
                             <ShoppingCart size={18} className="text-blue-500" />
                             Kasir (POS)
                           </button>
                           <button className="bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-600 font-semibold py-2 px-3 rounded-lg text-xs flex flex-col items-center justify-center gap-1.5 transition-colors" onClick={() => toast.info('Fitur dalam modul. Buka Modul F&B terlebih dahulu.')}>
                             <Package size={18} className="text-emerald-500" />
                             Stok Menu
                           </button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setShowPaywallModal(true)} className="w-full bg-blue-900 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2"><Lock size={16} className="text-amber-400" /> Lisensi Expired</button>
                    )}
                    
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Cara Eksekusi Metode Logaritma dengan UBOS:</p>
                      
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">1</div>
                          <p className="text-xs text-slate-700 leading-snug"><strong className="text-slate-900 block">Tentukan Target</strong> Set target untung bersih bulanan, UBOS bakal hitungin target harianmu otomatis.</p>
                        </div>
                        
                        <div className="flex gap-3">
                          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">2</div>
                          <p className="text-xs text-slate-700 leading-snug"><strong className="text-slate-900 block">Tambah Produk</strong> Masukkan menu andalanmu beserta HPP (harga modal) supaya sistem bisa hitung profit.</p>
                        </div>
                        
                        <div className="flex gap-3">
                          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">3</div>
                          <p className="text-xs text-slate-700 leading-snug"><strong className="text-slate-900 block">Atur Profil</strong> Lengkapi nama toko & jam buka supaya Asisten AI bisa kasih saran penjualan presisi.</p>
                        </div>
                        
                        <div className="flex gap-3">
                          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">4</div>
                          <p className="text-xs text-slate-700 leading-snug"><strong className="text-slate-900 block">Gunakan POS Kasir</strong> Catat pesanan Dine-in/Online. Potongan komisi Ojol otomatis terhitung!</p>
                        </div>
                        
                        <div className="flex gap-3">
                          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">5</div>
                          <p className="text-xs text-slate-700 leading-snug"><strong className="text-slate-900 block">Cek Finance di Akhir</strong> Tiap tutup warung, uang kasir otomatis terbagi rapi buat modal belanja besok & untung bersihmu.</p>
                        </div>
                        
                        <div className="flex gap-3">
                          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">6</div>
                          <p className="text-xs text-slate-700 leading-snug"><strong className="text-slate-900 block">Asisten AI Logaritma</strong> Dapatkan saran pintar otomatis tiap hari buat naikin omzet dan cegah stok bahan baku kehabisan!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {isPercetakan && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="bg-gradient-to-br from-blue-900 to-blue-800 relative p-6 flex flex-col justify-center overflow-hidden">
                    <div className="absolute top-3 left-3 px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[9px] font-black uppercase tracking-wider rounded-md flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> VVIP TRIAL
                    </div>
                    <h3 className="text-2xl font-black text-white mt-5">UBOS Percetakan & Fotokopi</h3>
                  </div>
                  <div className="p-5 flex flex-col gap-4">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 mb-1">Toolset Logaritma: Kontrol Antrean & HPP Kertas</h4>
                      <p className="text-slate-500 text-sm font-medium">Kalkulator HPP bahan, estimasi harga cepat, dan manajemen antrean antinumpuk.</p>
                    </div>
                    <button onClick={() => openWaitingList('Jasa Percetakan')} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2">Daftar Trial Percetakan <ArrowRight size={16} /></button>
                  </div>
                </div>
              )}
              {isRitel && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="bg-gradient-to-br from-blue-900 to-blue-800 relative p-6 flex flex-col justify-center overflow-hidden">
                    <div className="absolute top-3 left-3 px-2 py-0.5 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[9px] font-black uppercase tracking-wider rounded-md flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> WAITING LIST
                    </div>
                    <h3 className="text-2xl font-black text-white mt-5">UBOS Toko & Ritel</h3>
                  </div>
                  <div className="p-5 flex flex-col gap-4">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 mb-1">Toolset Logaritma: Stok & Kontrol Margin Ritel</h4>
                      <p className="text-slate-500 text-sm font-medium">Sistem inventaris anti-stok mati, cetak barcode, dan batas belanja harian.</p>
                    </div>
                    <button onClick={() => openWaitingList('Toko & Ritel')} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2">Ikut Waiting List <ArrowRight size={16} /></button>
                  </div>
                </div>
              )}
              {isLaundry && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="bg-gradient-to-br from-blue-900 to-blue-800 relative p-6 flex flex-col justify-center overflow-hidden">
                    <div className="absolute top-3 left-3 px-2 py-0.5 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[9px] font-black uppercase tracking-wider rounded-md flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> WAITING LIST
                    </div>
                    <h3 className="text-2xl font-black text-white mt-5">UBOS Laundry & Jasa</h3>
                  </div>
                  <div className="p-5 flex flex-col gap-4">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 mb-1">Toolset Logaritma: Tracking & Profitabilitas Jasa</h4>
                      <p className="text-slate-500 text-sm font-medium">Pelacak status cucian, sistem nota WhatsApp otomatis, dan hitung komisi staf.</p>
                    </div>
                    <button onClick={() => openWaitingList('Laundry & Jasa')} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2">Ikut Waiting List <ArrowRight size={16} /></button>
                  </div>
                </div>
              )}
              {isLainnya && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="bg-gradient-to-br from-blue-900 to-blue-800 relative p-6 flex flex-col justify-center">
                    <div className="text-[9px] font-black uppercase tracking-wider text-blue-200 mb-1">Waiting List</div>
                    <h3 className="text-2xl font-black text-white">Modul {merchant?.kategori_usaha || 'Lainnya'}</h3>
                  </div>
                  <div className="p-5 flex flex-col gap-4">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 mb-1">Dalam Tahap Pengembangan</h4>
                      <p className="text-slate-500 text-sm font-medium">Fitur spesifik untuk kategori usaha Anda saat ini sedang diracik oleh tim Logaritma.</p>
                    </div>
                    <button onClick={() => openWaitingList(merchant?.kategori_usaha || 'Lainnya')} className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2">Dapatkan Akses Prioritas <ArrowRight size={16} /></button>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* Tab: Edukasi */}
          {activeTab === 'edukasi' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Logaritma Academy</h2>
                <p className="text-slate-500 text-sm font-medium">Bongkar rahasia profit owner cerdas.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group">
                  <div className="h-40 w-full relative overflow-hidden bg-slate-100">
                    <img src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop" alt="E-Book" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-md shadow-sm">
                      BEST SELLER
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h4 className="text-sm font-black text-slate-800 line-clamp-2 leading-tight mb-2">E-Book: Rahasia Mengunci Profit UMKM</h4>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">Pelajari fondasi Metode Logaritma untuk memisahkan uang modal & untung.</p>
                    <div className="mt-auto">
                      <p className="text-slate-400 text-xs line-through font-medium">Rp 99.000</p>
                      <p className="text-primary font-black text-lg mb-4">Rp 49.000</p>
                      <button onClick={() => window.open('https://wa.me/6285179660408?text=Halo%20Admin%20Logaritma%2C%20saya%20mau%20pesan%20E-Book%20Mengunci%20Profit', '_blank')} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5">
                        Pesan via WhatsApp <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group">
                  <div className="h-40 w-full relative overflow-hidden bg-slate-100">
                    <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop" alt="Masterclass" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-md shadow-sm">
                      FREE VIDEO
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h4 className="text-sm font-black text-slate-800 line-clamp-2 leading-tight mb-2">Panduan Masterclass POS Kasir</h4>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">Kumpulan tutorial cara eksekusi Metode Logaritma pakai UBOS dalam 30 menit.</p>
                    <div className="mt-auto">
                      <p className="text-emerald-500 font-black text-lg mb-4 mt-4">GRATIS</p>
                      <button onClick={() => alert('Video tutorial sedang dalam penyusunan.')} className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5">
                        Tonton Sekarang <MonitorPlay size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mini Landing Page Edukasi */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 mt-8 shadow-sm">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-teal-600">
                  <ShieldCheck size={14} /> Upgrade Mindset
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-4">
                  Skill Mentok, Bisnis Otomatis Mentok!
                </h3>
                <p className="text-slate-600 font-medium leading-relaxed mb-6 text-sm sm:text-base">
                  Banyak pengusaha UMKM gagal scale-up bukan karena kurang kerja keras, tapi karena buta finansial usahanya sendiri. Di Logaritma Academy, kami bongkar rahasia owner sukses yang bisa jalan-jalan sementara bisnisnya tetap jalan rapi tanpa bocor operasional. <strong>Penting banget buat paham Mindset dan fondasi Metode Logaritma</strong> sebelum atau sambil kamu eksekusi operasional di UBOS.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex gap-3">
                    <CheckCircle2 className="text-teal-500 shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-slate-700 font-bold">Materi teruji langsung dari praktisi lapangan.</p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="text-teal-500 shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-slate-700 font-bold">Kuasai ilmunya, lalu jalankan sistemnya pakai UBOS.</p>
                  </div>
                </div>
                <button onClick={() => window.open('https://wa.me/6285179660408?text=Halo%20Admin%20Logaritma%2C%20saya%20mau%20konsultasi%20modul%20edukasi%20Logaritma...', '_blank')} className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-black py-4 px-8 rounded-2xl transition-transform active:scale-95 shadow-xl shadow-teal-600/20 flex items-center justify-center gap-2">
                  Upgrade Ilmu Sekarang <ArrowRight size={18} />
                </button>
              </div>

            </div>
          )}
          {/* Tab: Affiliate */}
          {activeTab === 'affiliate' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-24">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Program Kemitraan</h2>
                <p className="text-slate-500 text-sm font-medium">Hasilkan komisi berulang dengan membagikan Logaritma ke rekan pengusaha Anda.</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total Klik Link</p>
                  <p className="text-2xl font-black text-slate-900">{merchant?.affiliate_clicks || 0}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">Leads Mendaftar</p>
                  <p className="text-2xl font-black text-slate-900">{merchant?.affiliate_leads || 0}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">Premium Aktif</p>
                  <p className="text-2xl font-black text-slate-900">{merchant?.affiliate_converted || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 shadow-sm text-white relative overflow-hidden">
                  <Wallet size={64} className="absolute -right-4 -bottom-4 opacity-10" />
                  <p className="text-xs text-emerald-100 font-bold uppercase mb-1 relative z-10">Saldo Komisi</p>
                  <p className="text-2xl font-black relative z-10">Rp {(merchant?.commission_balance || 0).toLocaleString('id-ID')}</p>
                </div>
              </div>

              {/* Action Area */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-purple-700 to-purple-600 p-6 flex items-center justify-between relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="text-[10px] font-black uppercase tracking-wider text-purple-200 mb-1 flex items-center gap-2"><Handshake size={14}/> Affiliate Dashboard</div>
                    <h3 className="text-xl font-black text-white leading-tight">Sebarkan & Dapatkan 40%</h3>
                  </div>
                </div>
                <div className="p-6 md:p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Link Referral Unik Anda</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 overflow-x-auto whitespace-nowrap">
                        {getRefLink()}
                      </div>
                      <button onClick={handleCopyLink} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shrink-0">
                        <Copy size={16} /> Salin Link
                      </button>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <button onClick={handleShareWA} className="w-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
                      <MessageCircle size={18} /> Share ke WhatsApp
                    </button>
                    <button onClick={() => setShowPayoutModal(true)} className="w-full bg-emerald-600 text-white hover:bg-emerald-700 font-black py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20">
                      <Wallet size={18} /> Tarik Saldo Komisi
                    </button>
                  </div>
                </div>
              </div>

              {/* Marketing Kit */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
                <h3 className="text-lg font-black text-slate-900 mb-2 flex items-center gap-2"><Megaphone size={20} className="text-orange-500" /> Marketing Kit Siap Pakai</h3>
                <p className="text-sm text-slate-500 mb-6">Tinggal *copy-paste* teks di bawah ini ke Story WhatsApp, Grup, atau Caption Instagram.</p>

                <div className="space-y-4">
                  {[
                    { title: 'Teks WA Santai (Teman/Kenalan)', text: `Halo kawan bisnis! 👋\n\nSaya lagi pakai Logaritma UBOS nih buat rapihin laporan & kunci profit usaha. Beneran praktis banget buat pantau HPP & penjualan tiap hari.\n\nKebetulan ada free trial 14 hari, cobain deh pake link rekomendasi saya ini:\n${getRefLink()}\n\nSemoga bisnis makin lancar ya! 🚀` },
                    { title: 'Caption Instagram / Facebook', text: `Capek ngurusin stok berantakan & duit bocor gak ketahuan? 😫\n\nSama, dulu saya juga gitu. Sampai akhirnya pakai Logaritma UBOS! Sistem kasir sekaligus pencatat HPP yang super detail & gampang banget dipakainya.\n\nBuat temen-temen pengusaha yang mau rapihin sistem, yuk cobain gratis 14 hari klik link di bawah ini 👇\n\n${getRefLink()}\n\n#LogaritmaUBOS #SistemKasir #SolusiBisnis #UMKMNaikKelas` },
                    { title: 'Teks Ajakan Grup Pengusaha', text: `Izin share buat teman-teman di grup 🙏\n\nBuat yang lagi pusing cari sistem kasir yang bisa misahin komisi Gofood/Grabfood otomatis dan ngitung HPP detail, saya highly recommend pakai *Logaritma UBOS*.\n\nSistemnya dirancang khusus buat cegah kebocoran profit. Mumpung lagi ada free trial 14 hari, bisa langsung daftar lewat link ini ya:\n${getRefLink()}` }
                  ].map((kit, i) => (
                    <div key={i} className="border border-slate-200 rounded-2xl p-5 bg-slate-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-slate-800">{kit.title}</span>
                        <button onClick={() => { navigator.clipboard.writeText(kit.text); toast.success('Teks disalin!'); }} className="text-purple-600 hover:text-purple-700 bg-purple-100 hover:bg-purple-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                          Salin Teks
                        </button>
                      </div>
                      <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{kit.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Services */}
          {activeTab === 'services' && (
            <ServicesErrorBoundary>
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-24">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Services Ekstra</h2>
                <p className="text-slate-500 text-sm font-medium">Layanan tambahan Logaritma untuk mengakselerasi bisnis Anda.</p>
              </div>

              <div className="flex flex-col gap-6 md:grid md:grid-cols-1">
                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="text-[9px] font-black uppercase tracking-wider text-orange-100 mb-1">Meta Ads Setup</div>
                      <h3 className="text-2xl font-black text-white leading-tight">Paket Iklan Meta Ads</h3>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-20 rotate-12">
                      <Wrench size={80} className="text-white" />
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {[
                      { name: 'Paket 7 Hari', price: 'Rp 150.000', detail: 'Optimasi awal untuk awareness dan traffic cepat.' },
                      { name: 'Paket 14 Hari', price: 'Rp 250.000', detail: 'Kampanye terukur untuk promo menu dan event.' },
                      { name: 'Paket 30 Hari', price: 'Rp 450.000', detail: 'Pendampingan iklan untuk hasil jangka panjang.' },
                    ].map((pkg) => (
                      <div key={pkg.name} className="rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-bold text-slate-600 uppercase tracking-[0.24em]">{pkg.name}</p>
                            <p className="mt-2 text-lg font-black text-slate-900">{pkg.price}</p>
                          </div>
                          <span className="rounded-2xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">Meta Ads</span>
                        </div>
                        <p className="mt-3 text-sm text-slate-500">{pkg.detail}</p>
                        <button
                          type="button"
                          onClick={() => handleWhatsAppOpen(`Halo Admin Logaritma, saya ingin pesan ${pkg.name} Meta Ads. Mohon kirim detail paket dan biaya.`)}
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                        >
                          Pesan via WhatsApp <ArrowRight size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
                  <div className="flex items-center gap-3 text-sm uppercase tracking-[0.24em] text-slate-500 font-bold mb-4">
                    <Printer size={18} className="text-orange-500" /> Cetak & Branding
                  </div>
                  <p className="text-sm text-slate-600 mb-5">Pilih layanan cetak stiker, spanduk, atau foto produk F&B, lalu kirim permintaan ke admin.</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['Cetak Stiker', 'Cetak Spanduk', 'Foto Produk F&B'].map((service) => (
                      <button
                        key={service}
                        type="button"
                        onClick={() => setCetakType(service)}
                        className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${cetakType === service ? 'border-amber-500 bg-amber-500/10 text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'}`}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                  <form onSubmit={(event: FormEvent<HTMLFormElement>) => {
                    event.preventDefault();
                    handleWhatsAppOpen(`Halo Admin Logaritma, saya ingin pesan layanan ${cetakType}. Nama Usaha: ${cetakName || '-'} Nomor WA: ${cetakPhone || '-'} Jumlah/Ukuran: ${cetakQty} Keterangan: ${cetakNotes || '-'}.`);
                  }} className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">
                      Nama Usaha / Kontak
                      <input
                        value={cetakName}
                        onChange={(event) => setCetakName(event.target.value)}
                        placeholder="Warung Makan Sejahtera"
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-amber-500"
                      />
                    </label>
                    <label className="block text-sm font-bold text-slate-700">
                      Nomor WhatsApp
                      <input
                        value={cetakPhone}
                        onChange={(event) => setCetakPhone(event.target.value)}
                        placeholder="0812xxxxxxx"
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-amber-500"
                      />
                    </label>
                    <label className="block text-sm font-bold text-slate-700">
                      Jumlah / Ukuran
                      <input
                        value={cetakQty}
                        onChange={(event) => setCetakQty(event.target.value)}
                        placeholder="100 pcs / 200x50 mm"
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-amber-500"
                      />
                    </label>
                    <label className="block text-sm font-bold text-slate-700">
                      Keterangan
                      <input
                        value={cetakNotes}
                        onChange={(event) => setCetakNotes(event.target.value)}
                        placeholder="Desain logo + nomor meja"
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-amber-500"
                      />
                    </label>
                    <button type="submit" className="w-full rounded-2xl bg-amber-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-amber-400">
                      Kirim Permintaan Cetak via WhatsApp
                    </button>
                  </form>
                </div>
              </div>

              <div className="flex flex-col gap-6 md:grid md:grid-cols-1">
                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
                  <div className="flex items-center gap-3 text-sm uppercase tracking-[0.24em] text-amber-500 font-bold mb-4">
                    <ShoppingBag size={18} /> Hardware Kasir Shopee
                  </div>
                  <p className="text-sm text-slate-600 mb-5">Link Shopee affiliate untuk printer thermal dan kertas kasir yang direkomendasikan.</p>
                  <div className="space-y-4">
                    {[
                      { name: 'Printer Thermal Bluetooth', price: 'Rp 420.000', link: 'https://shopee.co.id', caption: 'Printer mobile cepat untuk nota kasir.' },
                      { name: 'Kertas Kasir Thermal Roll 57x40mm', price: 'Rp 45.000', link: 'https://shopee.co.id', caption: 'Roll kasir standar untuk mesin twin printer.' },
                    ].map((item) => (
                      <div key={item.name} className="rounded-3xl border border-slate-200 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-black text-slate-900">{item.name}</p>
                            <p className="mt-1 text-sm text-slate-500">{item.caption}</p>
                          </div>
                          <span className="text-sm font-black text-amber-500">{item.price}</span>
                        </div>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm font-bold text-amber-700 transition hover:bg-amber-500/20"
                        >
                          Buka Shopee <ArrowRight size={16} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
                  <div className="flex items-center gap-3 text-sm uppercase tracking-[0.24em] text-slate-500 font-bold mb-4">
                    <LayoutGrid size={18} /> Custom Enterprise OS
                  </div>
                  <p className="text-sm text-slate-600 mb-5">Ajukan sistem bisnis kustom untuk operasi, laporan, dan integrasi multi-outlet.</p>
                  <form onSubmit={(event: FormEvent<HTMLFormElement>) => {
                    event.preventDefault();
                    handleWhatsAppOpen(`Halo Admin Logaritma, saya ingin konsultasi Custom Enterprise Operating System untuk bisnis saya. Nama: ${customCompany || '-'} Nomor WA: ${customPhone || '-'} Kategori: ${customIndustry} Anggaran: ${customBudget || '-'} Kebutuhan: ${customNotes || '-'}.`);
                  }} className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">
                      Nama Perusahaan / Usaha
                      <input
                        value={customCompany}
                        onChange={(event) => setCustomCompany(event.target.value)}
                        placeholder="CV Utama Mandiri"
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
                      />
                    </label>
                    <label className="block text-sm font-bold text-slate-700">
                      Nomor WhatsApp
                      <input
                        value={customPhone}
                        onChange={(event) => setCustomPhone(event.target.value)}
                        placeholder="0812xxxxxxx"
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
                      />
                    </label>
                    <label className="block text-sm font-bold text-slate-700">
                      Kategori Bisnis
                      <input
                        value={customIndustry}
                        onChange={(event) => setCustomIndustry(event.target.value)}
                        placeholder="Kuliner & F&B"
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
                      />
                    </label>
                    <label className="block text-sm font-bold text-slate-700">
                      Estimasi Anggaran
                      <input
                        value={customBudget}
                        onChange={(event) => setCustomBudget(event.target.value)}
                        placeholder="Rp 10.000.000"
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
                      />
                    </label>
                    <label className="block text-sm font-bold text-slate-700">
                      Deskripsi Kebutuhan
                      <textarea
                        value={customNotes}
                        onChange={(event) => setCustomNotes(event.target.value)}
                        placeholder="Jelaskan workflow, integrasi, atau fitur khusus yang dibutuhkan."
                        rows={4}
                        className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-500 resize-none"
                      />
                    </label>
                    <button type="submit" className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800">
                      Ajukan Konsultasi via WhatsApp
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </ServicesErrorBoundary>
          )}

          {/* Tab: Edukasi */}
          {activeTab === 'edukasi' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Logaritma Academy</h2>
                <p className="text-slate-500 text-sm font-medium">Tingkatkan skill dan pengetahuan bisnis Anda.</p>
              </div>
              
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 flex items-center justify-between relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="text-[9px] font-black uppercase tracking-wider text-teal-200 mb-1">Knowledge Base</div>
                    <h3 className="text-xl font-black text-white leading-tight">Pusat Belajar<br/>& Strategi</h3>
                  </div>
                  <div className="absolute -right-4 -bottom-4 opacity-20 -rotate-12">
                    <BookOpen size={80} className="text-white" />
                  </div>
                </div>
                
                <div className="p-5">
                  <p className="text-sm text-slate-600 font-medium mb-5">
                    Kumpulan video panduan, template kalkulator HPP, dan e-book strategi membesarkan usaha kuliner.
                  </p>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={() => setShowFeatureComingSoonModal(true)}
                      className="w-full bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 font-bold py-3 px-4 rounded-xl flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-3"><BookOpen size={18} className="text-teal-600" /> Panduan Penggunaan POS</span>
                      <ArrowRight size={16} className="opacity-50" />
                    </button>

                    <button 
                      onClick={() => setShowFeatureComingSoonModal(true)}
                      className="w-full bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 font-bold py-3 px-4 rounded-xl flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-3"><FileText size={18} className="text-amber-500" /> E-Book: Mengunci Profit</span>
                      <ArrowRight size={16} className="opacity-50" />
                    </button>

                    <button 
                      onClick={() => setShowFeatureComingSoonModal(true)}
                      className="w-full bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 font-bold py-3 px-4 rounded-xl flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-3"><Video size={18} className="text-red-500" /> Tonton Tutorial Video</span>
                      <ArrowRight size={16} className="opacity-50" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Bantuan */}
          {activeTab === 'bantuan' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Pusat Bantuan</h2>
                <p className="text-slate-500 text-sm font-medium">Tim support siap membantu kendala Anda.</p>
              </div>
              
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex items-center justify-between relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="text-[9px] font-black uppercase tracking-wider text-blue-200 mb-1">Priority Support</div>
                    <h3 className="text-xl font-black text-white leading-tight">Butuh Bantuan<br/>Teknis?</h3>
                  </div>
                  <div className="absolute -right-4 -bottom-4 opacity-20 -rotate-12">
                    <HelpCircle size={80} className="text-white" />
                  </div>
                </div>
                
                <div className="p-5">
                  <p className="text-sm text-slate-600 font-medium mb-5">
                    Tim support Logaritma siap membantu pertanyaan teknis, kendala kasir, dan penyesuaian akun Anda.
                  </p>
                  
                  <div className="space-y-3">
                    <a
                      href="https://wa.me/6285179660408?text=Halo%20Admin%20Logaritma%2C%20saya%20butuh%20bantuan%20terkait%20akun%20member%20saya..."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold py-3 px-4 rounded-xl flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-3"><MessageCircle size={18} /> Tanya CS via WhatsApp</span>
                      <ArrowRight size={16} className="opacity-50" />
                    </a>

                    <button 
                      onClick={() => setIsCommunityModalOpen(true)}
                      className="w-full bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 font-bold py-3 px-4 rounded-xl flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-3"><Users size={18} className="text-blue-500" /> Gabung Komunitas Owner</span>
                      <ArrowRight size={16} className="opacity-50" />
                    </button>

                    <button 
                      onClick={() => setIsFAQModalOpen(true)}
                      className="w-full bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 font-bold py-3 px-4 rounded-xl flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-3"><HelpCircle size={18} className="text-purple-500" /> Baca FAQ & Solusi Kendala</span>
                      <ArrowRight size={16} className="opacity-50" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* ?????? MOBILE BOTTOM NAVIGATION BAR ???????????????????????????????????????????????????????????????????????????????????????????????????????????? */}
      <nav className="fixed bottom-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] w-full max-w-md md:max-w-xl border-x border-slate-100">
        <div className="flex items-stretch h-16">
          {([
            { key: 'modul',    icon: Home,      label: 'Modul'    },
            { key: 'affiliate', icon: Star,       label: 'Affiliate' },
            { key: 'services', icon: Wrench,    label: 'Services' },
            { key: 'edukasi',  icon: BookOpen,  label: 'Edukasi'  },
            { key: 'bantuan',  icon: HelpCircle, label: 'Bantuan' },
          ] as { key: typeof activeTab; icon: any; label: string }[]).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
                activeTab === key
                  ? 'text-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {activeTab === key && <span className="absolute bottom-0 w-8 h-0.5 bg-blue-600 rounded-t-full" />}
              <Icon size={20} strokeWidth={activeTab === key ? 2.5 : 2} />
              <span className={`text-[10px] font-${activeTab === key ? 'black' : 'bold'} leading-none`}>{label}</span>
            </button>
          ))}
        </div>
      </nav>

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

      {/* FAQ & Troubleshooting Modal */}
      {isFAQModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-6 md:p-8 pb-6 border-b border-slate-100 flex-shrink-0 relative">
              <button 
                onClick={() => { setIsFAQModalOpen(false); setFaqSearchTerm(''); }} 
                className="absolute right-6 top-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
              
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                  <HelpCircle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Pusat Solusi Cepat & FAQ UBOS 💡</h3>
                  <p className="text-sm text-slate-500 font-medium">Jawaban praktis seputar operasional kasir, Margin Guard, hingga pengelolaan akun.</p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="mt-6 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari solusi atau kata kunci masalah..." 
                  value={faqSearchTerm}
                  onChange={(e) => setFaqSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                />
              </div>

              {/* Tabs */}
              <div className="flex overflow-x-auto hide-scrollbar gap-2 mt-4 pb-1">
                {[
                  { id: 'kasir', label: 'Kasir & Stok' },
                  { id: 'margin', label: 'Margin Guard & HPP' },
                  { id: 'akun', label: 'Akun & Akses' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setFaqActiveTab(tab.id as any); setExpandedFAQ(null); }}
                    className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-colors ${faqActiveTab === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Accordion List Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50 custom-scrollbar">
              <div className="space-y-3">
                {faqData[faqActiveTab]
                  .filter(faq => faq.q.toLowerCase().includes(faqSearchTerm.toLowerCase()) || faq.a.toLowerCase().includes(faqSearchTerm.toLowerCase()))
                  .map((faq, index) => (
                    <div key={index} className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md">
                      <button 
                        onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                        className="w-full text-left p-4 flex items-center justify-between gap-4"
                      >
                        <span className="font-bold text-slate-900 text-sm">{faq.q}</span>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${expandedFAQ === index ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
                          {expandedFAQ === index ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                      </button>
                      
                      {expandedFAQ === index && (
                        <div className="p-4 pt-0 text-slate-600 text-sm leading-relaxed border-t border-slate-50 mt-2 bg-slate-50/30">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                  
                {faqData[faqActiveTab].filter(faq => faq.q.toLowerCase().includes(faqSearchTerm.toLowerCase()) || faq.a.toLowerCase().includes(faqSearchTerm.toLowerCase())).length === 0 && (
                  <div className="text-center py-8 text-slate-500 font-medium text-sm">
                    Tidak menemukan jawaban untuk "{faqSearchTerm}"
                  </div>
                )}
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-6 border-t border-slate-100 bg-white flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-500 font-medium">Masih belum menemukan jawaban?</p>
              <button 
                onClick={() => {
                  safeOpenUrl('https://wa.me/6285179660408?text=Halo%20Admin%20Logaritma%2C%20saya%20butuh%20bantuan%20teknis%20dan%20ingin%20bertanya...');
                  setIsFAQModalOpen(false);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-lg shadow-purple-600/20 flex items-center gap-2"
              >
                <MessageCircle size={18} />
                Chat CS Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Community Invitation Modal */}
      {isCommunityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsCommunityModalOpen(false)} 
              className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 z-10 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="p-6 md:p-8 text-center space-y-4">
              {/* Header Visual */}
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 relative z-10">
                <Users size={32} />
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 mb-2">Selamat Datang di Circle Profit Owner F&B! 🤝</h3>
              
              {/* Body Copywriting */}
              <p className="text-slate-600 font-medium text-sm leading-relaxed mb-6">
                Bergabunglah dengan pemilik usaha kuliner lainnya! Tempat berbagi strategi HPP, bedah kasus kebocoran kasir, hingga kolaborasi sesama owner F&B agar bisnis tumbuh konsisten.
              </p>

              {/* Benefits Checklist */}
              <div className="bg-slate-50 rounded-xl p-4 text-left space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700 font-medium">Forum diskusi strategi HPP & Margin Guard</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700 font-medium">Update fitur eksklusif UBOS Logaritma</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700 font-medium">Akses langsung ke tim developer & mentor</span>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => {
                  safeOpenUrl('https://chat.whatsapp.com/Jko4cZMWXca3aLhlR94shj');
                  setIsCommunityModalOpen(false);
                }}
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3.5 px-4 rounded-xl transition-colors shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} />
                Gabung Grup WA Sekarang <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Affiliate Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowPayoutModal(false)} 
              className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 z-10 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Wallet size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Tarik Saldo Komisi</h3>
                  <p className="text-sm text-slate-500">Saldo saat ini: Rp {(merchant?.commission_balance || 0).toLocaleString('id-ID')}</p>
                </div>
              </div>

              <form onSubmit={handleSubmitPayout} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Bank / E-Wallet</label>
                  <select 
                    value={payoutForm.bank_name}
                    onChange={e => setPayoutForm({...payoutForm, bank_name: e.target.value})}
                    required
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-3"
                  >
                    <option value="BCA">BCA</option>
                    <option value="Mandiri">Mandiri</option>
                    <option value="BNI">BNI</option>
                    <option value="BRI">BRI</option>
                    <option value="BSI">BSI</option>
                    <option value="GoPay">GoPay</option>
                    <option value="OVO">OVO</option>
                    <option value="DANA">DANA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nomor Rekening / HP</label>
                  <input 
                    type="text" 
                    value={payoutForm.account_number}
                    onChange={e => setPayoutForm({...payoutForm, account_number: e.target.value})}
                    required
                    placeholder="Contoh: 08123456789 atau 87349123"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-3" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nama Pemilik Rekening</label>
                  <input 
                    type="text" 
                    value={payoutForm.account_name}
                    onChange={e => setPayoutForm({...payoutForm, account_name: e.target.value})}
                    required
                    placeholder="Sesuai nama di rekening/akun"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-3" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Jumlah Penarikan (Rp)</label>
                  <input 
                    type="number" 
                    min="50000"
                    value={payoutForm.amount}
                    onChange={e => setPayoutForm({...payoutForm, amount: e.target.value})}
                    required
                    placeholder="Minimal 50.000"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-3" 
                  />
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button 
                    type="submit" 
                    disabled={isSubmittingPayout || Number(payoutForm.amount) < 50000 || Number(payoutForm.amount) > (merchant?.commission_balance || 0)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 flex justify-center items-center gap-2"
                  >
                    {isSubmittingPayout ? <Loader2 size={18} className="animate-spin" /> : <Wallet size={18} />}
                    Kirim Pengajuan
                  </button>
                  {Number(payoutForm.amount) > (merchant?.commission_balance || 0) && (
                     <p className="text-red-500 text-xs mt-2 text-center font-medium">Saldo tidak mencukupi.</p>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Feature Coming Soon Modal */}
      {showFeatureComingSoonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden text-center animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <MonitorPlay size={120} />
            </div>
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10">
              <Wrench size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 relative z-10">Fitur Sedang Disiapkan!</h3>
            <p className="text-slate-500 font-medium text-sm mb-6 relative z-10">
              Kami sedang meracik fitur ini agar tampil maksimal untuk Anda. Nantikan update terbarunya segera!
            </p>
            <button 
              onClick={() => setShowFeatureComingSoonModal(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl transition-colors relative z-10"
            >
              Mengerti, Tutup
            </button>
          </div>
        </div>
      )}

      {/* Paywall Renewal Modal */}
      {showPaywallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col border border-slate-200 relative custom-scrollbar">
            
            <button onClick={() => setShowPaywallModal(false)} className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 z-10 transition-colors">
              <X size={18} />
            </button>
            
            <div className="p-6 md:p-8 text-center space-y-4">
              <div className="w-14 h-14 bg-amber-100 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-1 rotate-12 shadow-sm border border-amber-200">
                <Lock size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {trialDaysLeft > 0 ? 'Upgrade Premium UBOS' : 'Masa Coba Gratis Anda Telah Berakhir'}
              </h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto text-sm">Tetap kunci batas belanja harian, pantau profit bersih, dan operasionalkan kasir toko Anda tanpa henti.</p>
              
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl mt-4">
                <p className="text-xs font-bold text-blue-700 leading-relaxed">
                  <Info className="w-4 h-4 text-blue-600 inline mr-1 mb-0.5" /> Sisa hari aktif trial/lisensi Anda saat ini tidak akan hangus, melainkan langsung otomatis ditambahkan <span className="text-blue-800 font-black bg-blue-200 px-1 rounded">+30 hari</span> setelah pembayaran selesai.
                </p>
              </div>
              
              <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] md:text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-red-500/20 whitespace-nowrap">
                  <Flame className="w-3.5 h-3.5 text-white inline" /> Diskon Khusus UMKM 50%
                </div>
                
                <p className="text-slate-400 font-bold line-through mt-2 mb-0">Rp 99.000/bulan</p>
                <div className="flex items-end justify-center gap-1 text-primary">
                  <span className="text-3xl font-black">Rp 49.000</span>
                  <span className="font-bold mb-1">/ bulan</span>
                </div>
              </div>

              <div className="pt-2 space-y-3">
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
    </div>
  );
}
