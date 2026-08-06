'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ShoppingBag, Package, Wallet, Activity, TrendingUp, Target, CreditCard, ShieldCheck, Store, Sparkles, Megaphone, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import CurrencyInput from '@/components/CurrencyInput';
import { useAILogaritmaEngine } from '@/hooks/useAILogaritmaEngine';
import Copilot from '@/components/Copilot';
import CopilotWidget from '@/components/CopilotWidget';

export default function UBOSDashboard() {
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingTarget, setOnboardingTarget] = useState('5000000');
  const router = useRouter();
  const params = useParams();
  
  const { aiState } = useAILogaritmaEngine();

  // States for Calculators
  const [targetProfit, setTargetProfit] = useState<string>('5000000');
  const [budgetBelanja, setBudgetBelanja] = useState<string>('300000');
  const [showTargetModal, setShowTargetModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchMerchant = async () => {
      // 1. Cek Supabase Auth session (login via WA + Password)
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase.from('merchants').select('*').eq('user_id', user.id).single();
        if (isMounted) setMerchant(data);
        
        // Verify slug
        if (data && params.slug) {
          const expectedSlug = (data.nama_usaha || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          if (expectedSlug !== params.slug) {
            router.push(`/ubos/${params.category || 'kuliner'}/${expectedSlug}`);
            return;
          }
        }

        if (data) {
          if (data.brand_color) {
            document.documentElement.style.setProperty('--brand-color', data.brand_color);
          }
          const { data: products } = await supabase.from('products').select('id').eq('merchant_id', data.id).limit(1);
          if (!products || products.length === 0) setShowOnboarding(true);
        }

        const savedTarget = localStorage.getItem('targetProfit');
        if (savedTarget && isMounted) setTargetProfit(savedTarget);
        if (isMounted) setLoading(false);
        return;
      }

      // 2. Fallback: Cek wa_member_session (login via WA saja dari /member/login)
      try {
        const waSession = localStorage.getItem('wa_member_session');
        if (waSession) {
          const session = JSON.parse(waSession);
          const phone = (session.no_wa || '').replace(/\D/g, '');

          if (phone) {
            // Ambil data merchant dari server (bypass RLS)
            const res = await fetch(`/api/check-phone?phone=${encodeURIComponent(phone)}`);
            const result = await res.json();

            if (result.found) {
              // Build merchant object dari session + API result
              const merchantData = {
                nama_usaha: result.nama_usaha || session.nama_usaha || '',
                kategori_usaha: result.kategori_usaha || session.kategori || 'Kuliner & F&B',
                whatsapp: phone,
                // data lain dari session jika ada
                ...session,
              };
              if (isMounted) setMerchant(merchantData);

              const savedTarget = localStorage.getItem('targetProfit');
              if (savedTarget && isMounted) setTargetProfit(savedTarget);
              if (isMounted) setLoading(false);
              return;
            }
          }
        }
      } catch (_) {}

      // 3. Tidak ada sesi → arahkan ke halaman login member
      if (isMounted) {
        toast.error(`Silakan login dengan Nomor WhatsApp untuk mengakses modul ${params.slug || 'Usaha'}.`);
        router.push('/member/login');
      }
    };
    fetchMerchant();
    
    return () => {
      isMounted = false;
    };
  }, [router, params]);

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse flex flex-col items-center justify-center min-h-[50vh]"><Store size={48} className="mb-4 text-blue-200" /><p>Memuat Dashboard...</p></div>;

  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  const profitVal = parseInt(targetProfit) || 0;
  const omzetTarget = profitVal / 0.4; // Asumsi margin 40%
  const harianTarget = omzetTarget / 30;
  const porsiHarian = Math.ceil(harianTarget / 25000); // Asumsi harga rata-rata 25k

  // Dynamic Brand Color
  const primaryColor = merchant?.brand_color || '#1d4ed8';

  return (
    <div className="pb-24 md:pb-10 bg-slate-50 min-h-screen">
      {/* 1. Header Banner Atas (Dynamic Brand Color) */}
      <div 
        className="text-white p-4 md:p-10 pb-4 md:pb-8 rounded-b-[1.5rem] md:rounded-b-[2rem] shadow-xl relative"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`
        }}
      >
        {/* Abstract Background Decoration - Wrapped to contain overflow */}
        <div className="absolute inset-0 overflow-hidden rounded-b-[1.5rem] md:rounded-b-[2rem] pointer-events-none">
          <div className="absolute top-0 right-0 p-4 md:p-8 opacity-10">
            <Store size={150} className="transform rotate-12 translate-x-8 -translate-y-8 md:w-[200px] md:h-[200px]" />
          </div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          <div className="flex flex-row items-center gap-4 w-full md:w-auto text-left">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-md rounded-2xl flex shrink-0 items-center justify-center border border-white/20 shadow-inner">
              {merchant?.logo_url ? (
                <img src={merchant.logo_url} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <Store size={32} className="text-white drop-shadow-md" />
              )}
            </div>
            <div>
              <div className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-3 mb-1 md:mb-2">
                <h1 className="text-2xl md:text-4xl font-black tracking-tight drop-shadow-sm">{merchant?.nama_usaha || 'Outlet Anda'}</h1>
                <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-2 md:px-3 py-1 rounded-full border border-white/20 w-fit">
                  <Sparkles size={12} className="text-white" />
                  <span className="text-[10px] md:text-xs font-bold tracking-wider text-white">AI LOGARITMA</span>
                </div>
              </div>
              <p className="text-white/90 text-xs md:text-base font-medium max-w-md mt-1.5 md:mt-0">Ringkasan performa dan rekomendasi cerdas untuk memacu profit outlet Anda hari ini.</p>
            </div>
          </div>
          
          <button 
            onClick={() => setShowTargetModal(true)}
            className="w-full md:w-auto bg-white px-6 py-3 md:px-5 md:py-2.5 rounded-[1.5rem] md:rounded-xl font-black transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-xl md:shadow-md mt-4 md:mt-0 text-sm md:text-base mb-[-36px] md:mb-0 md:mr-4 relative z-30" 
            style={{ color: primaryColor }}
          >
            <Target size={20} />
            TENTUKAN TARGET
          </button>
        </div>
      </div>

      {/* Onboarding Modal Step 1 */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Target size={120} />
            </div>
            <div className="relative z-10 text-center space-y-6">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                <Target size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Selamat Datang!</h2>
                <p className="text-slate-500 font-medium">Mari mulai dengan visi yang jelas. Berapa Target Profit Bersih yang Ingin Anda Capai Bulan Ini?</p>
              </div>
              <div className="relative">
                <CurrencyInput
                  value={onboardingTarget}
                  onChange={setOnboardingTarget}
                  icon="Rp"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-black text-2xl text-indigo-900 focus:outline-none focus:border-indigo-500 transition-colors text-center"
                />
              </div>
              <button 
                onClick={() => {
                  localStorage.setItem('targetProfit', onboardingTarget);
                  router.push(`/ubos/${params.category}/${params.slug}/inventory?onboarding=true`);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                Lanjut: Input Produk Pertama <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tentukan Target Modal */}
      {showTargetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowTargetModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-20"
            >
              <AlertCircle size={20} />
            </button>
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Target size={120} />
            </div>
            <div className="relative z-10 text-center space-y-6">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                <Target size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Tentukan Target Baru</h2>
                {localStorage.getItem('targetProfit') ? (
                  <div className="bg-amber-50 text-amber-800 p-3 rounded-xl mb-4 text-sm font-medium border border-amber-200">
                    Target Anda sebelumnya adalah <strong>{formatIDR(parseInt(localStorage.getItem('targetProfit') || '0'))}</strong>.<br/>Yakin ingin mengubah target ini?
                  </div>
                ) : (
                  <p className="text-slate-500 font-medium text-sm mb-4">Tentukan target profit bersih bulanan Anda.</p>
                )}
              </div>
              <div className="relative">
                <CurrencyInput
                  value={targetProfit}
                  onChange={setTargetProfit}
                  icon="Rp"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-black text-2xl text-indigo-900 focus:outline-none focus:border-indigo-500 transition-colors text-center"
                />
              </div>
              <button 
                onClick={() => {
                  localStorage.setItem('targetProfit', targetProfit);
                  toast.success('Target berhasil dikunci!');
                  setShowTargetModal(false);
                  window.dispatchEvent(new Event('storage')); // Trigger update for other components if needed
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                Kunci Target
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6 md:px-10 mt-2 md:-mt-2 relative z-20 space-y-8">
        
        {/* 2. Top Stats Grid - 4 Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <Wallet size={24} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Pendapatan</p>
            <p className="text-2xl font-black text-slate-900">{formatIDR(aiState.dailyOmzet)}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
              <TrendingUp size={24} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Profit Bersih (Margin Guard)</p>
            <p className="text-2xl font-black text-slate-900">{formatIDR(aiState.dailyProfit)}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
              <Activity size={24} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Transaksi</p>
            <p className="text-2xl font-black text-slate-900">{aiState.totalTransactions}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
              <Package size={24} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Stok Kritis</p>
            <p className="text-2xl font-black text-slate-900">{aiState.lowStockItems.length} Item</p>
          </div>
        </div>

        {/* 3. AI Logaritma Copilot Widget */}
        <div className="mb-6">
          {merchant?.id && <CopilotWidget merchantId={merchant.id} />}
        </div>

        {/* 3b. AI Logaritma Copilot (Inline Widget) */}
        <div>
          <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <Sparkles className="text-indigo-600" size={20} /> Asisten AI Logaritma
          </h2>
          <div className="h-[450px]">
            <Copilot inline={true} />
          </div>
        </div>

        {/* 4. Interactive Logaritma Tools */}
        <div className="grid md:grid-cols-2 gap-6 pt-4">
          {/* Card Left: Pola Pikir Tarik Mundur Profit */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Target size={24} /></div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Pola Pikir Tarik Mundur Profit</h2>
                <p className="text-sm text-slate-500 font-medium">Hitung target harian dari impian bulanan</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Profit Bulanan Bersih</label>
                <div className="relative">
                  <CurrencyInput
                    value={targetProfit}
                    onChange={() => {}}
                    icon="Rp"
                    disabled
                    readOnly
                    className="w-full pl-12 pr-4 py-4 bg-slate-100 border border-slate-200 rounded-xl font-black text-xl text-slate-500 cursor-not-allowed opacity-80"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <ShieldCheck size={18} className="text-slate-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl border border-indigo-100">
                <p className="text-sm font-medium text-indigo-800 mb-4">Agar untung {formatIDR(profitVal)}/bulan, target kasir Anda hari ini:</p>
                <div className="flex justify-between items-center py-3 border-b border-indigo-200/50">
                  <span className="text-sm font-bold text-indigo-700">Target Omzet Harian</span>
                  <span className="font-black text-indigo-900 text-lg">{formatIDR(harianTarget)}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm font-bold text-indigo-700">Estimasi Terjual</span>
                  <span className="font-black text-indigo-900 text-lg">{porsiHarian} Porsi/hari</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Right: Kontrol Batas Belanja Pagi */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><CreditCard size={24} /></div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Kontrol Batas Belanja Pagi</h2>
                <p className="text-sm text-slate-500 font-medium">Amankan modal agar tak gerus profit</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Batas Budget Belanja Hari Ini</label>
                <div className="relative">
                  <CurrencyInput
                    value={budgetBelanja}
                    onChange={setBudgetBelanja}
                    icon="Rp"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-black text-xl text-emerald-900 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-100">
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Terpakai (POS)</p>
                    <p className="font-black text-emerald-900 text-lg mt-1">Rp 0</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sisa Budget Aman</p>
                    <p className="font-bold text-emerald-600 text-lg mt-1">{formatIDR(parseInt(budgetBelanja) || 0)}</p>
                  </div>
                </div>
                <div className="w-full bg-emerald-200/60 rounded-full h-3 mt-4 overflow-hidden relative">
                  <div className="bg-emerald-500 h-3 rounded-full relative z-10" style={{ width: '15%' }}></div>
                </div>
                <p className="text-xs font-bold text-emerald-700 mt-3 text-center">Anda menggunakan 15% dari budget hari ini.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
