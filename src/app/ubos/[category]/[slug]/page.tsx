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
  const [timeFilter, setTimeFilter] = useState('Hari Ini');
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

return (
    <div className="pb-24 md:pb-10 bg-slate-50 min-h-screen">
      
      {/* Tentukan Target Modal */}
      {showTargetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
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
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <Target size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Tentukan Target Baru</h2>
                {typeof window !== 'undefined' && localStorage.getItem('targetProfit') ? (
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
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-black text-2xl text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors text-center"
                />
              </div>
              <button 
                onClick={() => {
                  localStorage.setItem('targetProfit', targetProfit);
                  toast.success('Target berhasil dikunci!');
                  setShowTargetModal(false);
                  window.dispatchEvent(new Event('storage'));
                }}
                className="w-full btn-gradient-primary border-none text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                Kunci Target
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4 md:p-8 relative z-20 space-y-6">
        
        {/* Promo Banner Majoo Style */}
        <div className="w-full bg-emerald-50 rounded-2xl border border-emerald-100 overflow-hidden relative shadow-sm">
          <div className="flex flex-col md:flex-row items-center">
            <div className="p-6 md:p-8 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-emerald-500 rounded-md flex items-center justify-center font-bold text-white text-xs">U</div>
                <span className="font-black text-emerald-600 text-lg tracking-tight">Capital</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2">BERANI TUMBUH, MODAL SIAP DUKUNG</h2>
              <p className="text-slate-600 font-medium text-sm mb-4">Hingga 280jt cair &le;2 hari. Pengajuan &plusmn;10mnt, langsung dari Logaritma*</p>
              <button className="text-emerald-600 font-bold text-sm hover:underline">Ajukan Sekarang</button>
            </div>
            <div className="hidden md:block w-1/3 bg-emerald-100 h-full min-h-[160px] relative">
              <div className="absolute inset-0 bg-gradient-to-l from-emerald-500/20 to-transparent"></div>
              {/* Graphic Placeholder */}
            </div>
          </div>
        </div>

        {/* Onboarding Widget Majoo Style */}
        {showOnboarding && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 mb-6">
            {/* Header Green */}
            <div className="bg-emerald-500 p-5 md:p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="text-lg md:text-xl font-bold">Langkah Mudah Buka Outlet</h3>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <span className="font-bold text-sm">0/3</span>
                <div className="flex-1 md:w-64 h-3 bg-emerald-600/50 rounded-full overflow-hidden">
                  <div className="w-0 h-full bg-white rounded-full"></div>
                </div>
              </div>
            </div>
            
            {/* Content Cards */}
            <div className="p-5 md:p-6 pb-0 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 -mt-2">
              <button 
                onClick={() => setShowTargetModal(true)}
                className="bg-white p-5 rounded-xl flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-l-4 border-emerald-500 hover:-translate-y-1 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Target size={20} className="text-emerald-500" />
                  <span className="font-medium text-slate-700">Siapkan Produk</span>
                </div>
                <ArrowRight size={18} className="text-slate-400 group-hover:text-emerald-500" />
              </button>
              
              <button 
                onClick={() => router.push(`/ubos/${params.category || 'kuliner'}/${params.slug}/inventory`)}
                className="bg-white p-5 rounded-xl flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-l-4 border-emerald-500 hover:-translate-y-1 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Package size={20} className="text-emerald-500" />
                  <span className="font-medium text-slate-700">Informasi Karyawan</span>
                </div>
                <ArrowRight size={18} className="text-slate-400 group-hover:text-emerald-500" />
              </button>

              <button 
                onClick={() => router.push('/settings')}
                className="bg-white p-5 rounded-xl flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-l-4 border-emerald-500 hover:-translate-y-1 transition-all group mb-6 md:mb-0"
              >
                <div className="flex items-center gap-3">
                  <Store size={20} className="text-emerald-500" />
                  <span className="font-medium text-slate-700">Lengkapi Data Outlet</span>
                </div>
                <ArrowRight size={18} className="text-slate-400 group-hover:text-emerald-500" />
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Penjualan Header & Filter Majoo Style */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-medium text-slate-900 flex items-center gap-2">
                Dashboard Penjualan <AlertCircle size={20} className="text-emerald-500" />
              </h2>
              <p className="text-sm text-slate-500 mt-1">Diperbarui {new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}, {new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center gap-4 mt-2 border-t border-slate-100 pt-4">
              {/* Segmented Control */}
              <div className="flex rounded-lg border border-slate-200 w-full md:w-auto overflow-hidden">
                {['Harian', 'Mingguan', 'Bulan'].map((filter, idx) => (
                  <button 
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`flex-1 md:flex-none px-6 py-2 text-sm font-medium transition-colors ${timeFilter === filter ? 'bg-emerald-500 text-white' : 'text-slate-600 bg-white hover:bg-slate-50'} ${idx !== 0 ? 'border-l border-slate-200' : ''}`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              
              {/* Date Picker Dummy */}
              <div className="flex items-center justify-between border border-slate-200 rounded-lg bg-white px-4 py-2 text-sm text-slate-700 w-full md:w-64">
                <span className="cursor-pointer font-bold">&lt;</span>
                <span>15 Agt 26 - 15 Agt 26</span>
                <span className="cursor-pointer font-bold">&gt;</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Top Stats Grid - 4 Metric Cards */}


        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-6 rounded-3xl">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <Wallet size={24} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Pendapatan</p>
            <p className="text-2xl font-black text-slate-900">{formatIDR(aiState.dailyOmzet)}</p>
          </div>
          <div className="glass-card p-6 rounded-3xl">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
              <TrendingUp size={24} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Profit Bersih (Margin Guard)</p>
            <p className="text-2xl font-black text-slate-900">{formatIDR(aiState.dailyProfit)}</p>
          </div>
          <div className="glass-card p-6 rounded-3xl">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
              <Activity size={24} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Transaksi</p>
            <p className="text-2xl font-black text-slate-900">{aiState.totalTransactions}</p>
          </div>
          <div className="glass-card p-6 rounded-3xl">
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
            <Sparkles className="text-emerald-600" size={20} /> Asisten AI Logaritma
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
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><Target size={24} /></div>
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
                  <span className="font-black text-slate-900 text-lg">{formatIDR(harianTarget)}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm font-bold text-indigo-700">Estimasi Terjual</span>
                  <span className="font-black text-slate-900 text-lg">{porsiHarian} Porsi/hari</span>
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
