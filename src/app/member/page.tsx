'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Target, AlertTriangle, ArrowRight, Package, Wallet, CheckCircle2, MonitorPlay, LogOut, Megaphone, Printer, Handshake, MessageCircle, X, Loader2, ShoppingBag, Shirt, Lock, Home, Wrench, Star, BookOpen, HelpCircle, Info, Flame, Copy, FileText, Download, Camera, Users, Video, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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

          // Benar-benar tidak ada sesi → redirect ke halaman login member
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
        
        {/* A. Compact Sub-Header – persistent across all tabs */}
        <div className="flex items-center justify-between p-4 bg-blue-600 rounded-2xl text-white shadow-md gap-3">
          {/* Left: greeting + status badge */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg shrink-0 shadow-inner">
              {trialDaysLeft > 0 ? '🎁' : '🔒'}
            </div>
            <div className="min-w-0">
              <p className="font-black text-sm md:text-base leading-tight truncate max-w-[140px] md:max-w-[180px]">
                Halo, {merchant?.nama_usaha || merchant?.owner_name || 'Member'}!
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
                  <><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" /> Aktif – Sisa {trialDaysLeft} Hari</>
                ) : (
                  <><span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" /> Lisensi Expired</>
                )}
              </button>
            </div>
          </div>

          {/* Right: upgrade button */}
          <button
            onClick={() => setShowPaywallModal(true)}
            className="shrink-0 text-xs md:text-sm font-bold bg-amber-400 hover:bg-amber-300 text-slate-900 px-3 py-2 rounded-xl transition-transform active:scale-95 shadow-md flex items-center gap-1 whitespace-nowrap"
          >
            ⚡ Upgrade Rp 49.000
          </button>
        </div>

        {/* ── UNIFIED MOBILE-FIRST LAYOUT: tabbed content ─────────────────── */}
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
                      <h4 className="text-base font-bold text-slate-900 mb-1 leading-tight">Aplikasi Kasir F&B Anti-Bocor & Pengunci Profit</h4>
                      <p className="text-slate-600 text-sm mb-0 leading-relaxed">
                        UBOS F&B dibikin khusus buat bantuin kamu ngunci target untung bulanan tanpa ribet. Gak cuma buat kasir biasa, tapi otomatis pisahin uang modal belanja besok sama untung bersih kamu hari ini, jadi uang usaha gak kecampur uang pribadi!
                      </p>
                    </div>

                    {trialDaysLeft > 0 ? (
                      <div className="space-y-3">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            const category = (merchant?.kategori_usaha || 'kuliner').toLowerCase().split(' ')[0] || 'kuliner';
                            if (!merchant?.user_id) {
                              toast.error("Silakan login atau daftar untuk menggunakan modul ini.", {
                                description: "Akses terbatas khusus member terdaftar.",
                                icon: <Lock className="w-5 h-5 text-amber-500" />
                              });
                              router.push(`/auth?mode=register&category=${encodeURIComponent(category)}`);
                              return;
                            }
                            const slug = (merchant.nama_usaha || 'merchant').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
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
                      <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Cara Gampang Mulainya:</p>
                      
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
                      <h4 className="text-base font-bold text-slate-900 mb-1">Tools Kontrol Antrean & HPP Kertas</h4>
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
                      <h4 className="text-base font-bold text-slate-900 mb-1">Manajemen Stok Anti Dead-Stock</h4>
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
                      <h4 className="text-base font-bold text-slate-900 mb-1">Tracking Slot & Nota Otomatis</h4>
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

          {/* Tab: Affiliate */}
          {activeTab === 'affiliate' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Program Kemitraan</h2>
                <p className="text-slate-500 text-sm font-medium">Hasilkan komisi berulang dengan referral.</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-purple-700 to-purple-600 p-6 flex items-center justify-between relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="text-[9px] font-black uppercase tracking-wider text-purple-200 mb-1">Affiliate Program</div>
                    <h3 className="text-xl font-black text-white leading-tight">Pasif Komisi<br/>Logaritma</h3>
                  </div>
                  <div className="absolute -right-4 -bottom-4 opacity-20 rotate-12">
                    <Handshake size={80} className="text-white" />
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-slate-600 font-medium mb-5">
                    Rekomendasikan UBOS ke sesama pemilik usaha. Dapatkan komisi <strong className="text-purple-600 font-black">20%</strong> setiap kali teman Anda mengaktifkan modul.
                  </p>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={() => setShowFeatureComingSoonModal(true)}
                      className="w-full bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 font-bold py-3 px-4 rounded-xl flex items-center justify-between transition-colors shadow-sm"
                    >
                      <span className="flex items-center gap-3"><Copy size={18} /> Salin Link Referral</span>
                      <ArrowRight size={16} className="opacity-50" />
                    </button>
                    
                    <button 
                      onClick={() => setShowFeatureComingSoonModal(true)}
                      className="w-full bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 font-bold py-3 px-4 rounded-xl flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-3"><Wallet size={18} className="text-emerald-500" /> Lihat Saldo & Komisi</span>
                      <ArrowRight size={16} className="opacity-50" />
                    </button>

                    <button 
                      onClick={() => setShowFeatureComingSoonModal(true)}
                      className="w-full bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 font-bold py-3 px-4 rounded-xl flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-3"><Download size={18} className="text-blue-500" /> Download Bahan Promosi</span>
                      <ArrowRight size={16} className="opacity-50" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Services */}
          {activeTab === 'services' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Services Ekstra</h2>
                <p className="text-slate-500 text-sm font-medium">Layanan pengembang bisnis dari Logaritma.</p>
              </div>
              
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 flex items-center justify-between relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="text-[9px] font-black uppercase tracking-wider text-orange-200 mb-1">Ecosystem Services</div>
                    <h3 className="text-xl font-black text-white leading-tight">Solusi Ekstra<br/>Pengembang Bisnis</h3>
                  </div>
                  <div className="absolute -right-4 -bottom-4 opacity-20 rotate-12">
                    <Wrench size={80} className="text-white" />
                  </div>
                </div>
                
                <div className="p-5">
                  <p className="text-sm text-slate-600 font-medium mb-5">
                    Solusi cetak kemasan, stiker glossy, banner toko, hingga foto produk profesional dari Logaritma Ecosystem.
                  </p>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={() => handleUpsellRequest('Stiker & Spanduk')}
                      disabled={requestingUpsell === 'Stiker & Spanduk'}
                      className="w-full bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 font-bold py-3 px-4 rounded-xl flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        {requestingUpsell === 'Stiker & Spanduk' ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} className="text-orange-500" />} 
                        Pesan Stiker & Spanduk
                      </span>
                      <ArrowRight size={16} className="opacity-50" />
                    </button>

                    <button 
                      onClick={() => handleUpsellRequest('Foto Menu Kuliner')}
                      disabled={requestingUpsell === 'Foto Menu Kuliner'}
                      className="w-full bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 font-bold py-3 px-4 rounded-xl flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        {requestingUpsell === 'Foto Menu Kuliner' ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} className="text-blue-500" />} 
                        Jasa Foto Menu Pro
                      </span>
                      <ArrowRight size={16} className="opacity-50" />
                    </button>

                    <button 
                      onClick={() => handleUpsellRequest('Konsultasi Setup POS')}
                      disabled={requestingUpsell === 'Konsultasi Setup POS'}
                      className="w-full bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 font-bold py-3 px-4 rounded-xl flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        {requestingUpsell === 'Konsultasi Setup POS' ? <Loader2 size={18} className="animate-spin" /> : <Users size={18} className="text-emerald-500" />} 
                        Konsultasi Setup POS On-Site
                      </span>
                      <ArrowRight size={16} className="opacity-50" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
                      onClick={() => toast.info('Sedang dialihkan ke modul panduan...')}
                      className="w-full bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 font-bold py-3 px-4 rounded-xl flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-3"><BookOpen size={18} className="text-teal-600" /> Panduan Penggunaan POS</span>
                      <ArrowRight size={16} className="opacity-50" />
                    </button>

                    <button 
                      onClick={() => toast.info('Fitur E-Book akan segera hadir.')}
                      className="w-full bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 font-bold py-3 px-4 rounded-xl flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-3"><FileText size={18} className="text-amber-500" /> E-Book: Mengunci Profit</span>
                      <ArrowRight size={16} className="opacity-50" />
                    </button>

                    <button 
                      onClick={() => toast.info('Buka YouTube Logaritma...')}
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
                      href="https://wa.me/6281211638357?text=Halo%20Admin%20Logaritma%2C%20saya%20butuh%20bantuan%20terkait%20akun%20member%20saya..."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold py-3 px-4 rounded-xl flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-3"><MessageCircle size={18} /> Tanya CS via WhatsApp</span>
                      <ArrowRight size={16} className="opacity-50" />
                    </a>

                    <button 
                      onClick={() => toast.info('Sedang dialihkan ke Grup Telegram...')}
                      className="w-full bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 font-bold py-3 px-4 rounded-xl flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-3"><Users size={18} className="text-blue-500" /> Gabung Komunitas Owner</span>
                      <ArrowRight size={16} className="opacity-50" />
                    </button>

                    <button 
                      onClick={() => toast.info('Membuka pusat panduan FAQ...')}
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

      {/* ── MOBILE BOTTOM NAVIGATION BAR ──────────────────────────────────── */}
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
                  href={`https://wa.me/6281211638357?text=Halo%20Admin%20Logaritma%2C%20masa%20aktif%20trial%20untuk%20toko%20${encodeURIComponent(merchant?.nama_usaha || merchant?.owner_name || 'saya')}%20sudah%20habis.%20Saya%20ingin%20perpanjang%20Lisensi%20Premium%20UBOS%20paket%20promo%20Rp%2049.000%2Fbulan.%20Bagaimana%20alur%20pembayarannya%3F`}
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
