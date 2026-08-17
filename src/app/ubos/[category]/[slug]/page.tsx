'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ShoppingBag, Package, Wallet, Activity, TrendingUp, Target, CreditCard, ShieldCheck, Store, Sparkles, Megaphone, AlertCircle, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import CurrencyInput from '@/components/CurrencyInput';
import { useAILogaritmaEngine } from '@/hooks/useAILogaritmaEngine';
import Copilot from '@/components/Copilot';
import CopilotWidget from '@/components/CopilotWidget';
import AIBanner from '@/components/AIBanner';

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
    <div className="pb-24 md:pb-10 bg-[#F8FAFC] min-h-screen font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Tentukan Target Modal */}
      {showTargetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            <button 
              onClick={() => setShowTargetModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors z-20"
            >
              <X size={20} />
            </button>
            <div className="relative z-10 text-center space-y-5">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto ring-4 ring-blue-50/50">
                <Target size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Target Bulanan</h2>
                <p className="text-slate-500 font-medium text-sm">Tentukan target profit bersih.</p>
              </div>
              <div className="relative">
                <CurrencyInput
                  value={targetProfit}
                  onChange={setTargetProfit}
                  icon="Rp"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xl text-slate-900 focus:outline-none focus:border-blue-500 transition-colors text-center"
                />
              </div>
              <button 
                onClick={() => {
                  localStorage.setItem('targetProfit', targetProfit);
                  toast.success('Target berhasil dikunci!');
                  setShowTargetModal(false);
                  window.dispatchEvent(new Event('storage'));
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                Simpan Target
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 md:p-8 relative z-20 space-y-6">
        
        {/* Modern Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              Dashboard {params.category ? String(params.category).charAt(0).toUpperCase() + String(params.category).slice(1) : ''}
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">Live</span>
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              {new Date().toLocaleDateString('id-ID', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})}
            </p>
          </div>
          <div className="flex items-center gap-3">
             <button 
              onClick={() => setShowTargetModal(true)}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm shadow-sm" 
            >
              <Target size={16} className="text-blue-600" />
              Target: {formatIDR(parseInt(targetProfit))}
            </button>
          </div>
        </div>

        <AIBanner 
          actionButton={
            <button 
              onClick={() => setShowTargetModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 text-sm active:scale-95" 
            >
              <Target size={16} />
              Tentukan Target Omzet
            </button>
          }
        />

        {/* BENTO BOX GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
          
          {/* LEFT COLUMN: Main Stats & POS Tools (Span 8) */}
          <div className="md:col-span-8 space-y-6">
            
            {/* Top 4 Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-200 transition-colors">
                <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center mb-3">
                  <Wallet size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pendapatan</p>
                  <p className="text-xl font-bold text-slate-900">{formatIDR(aiState.dailyOmzet)}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-emerald-200 transition-colors relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10"><TrendingUp size={48} /></div>
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3 relative z-10">
                  <TrendingUp size={20} />
                </div>
                <div className="relative z-10">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Profit Bersih</p>
                  <p className="text-xl font-bold text-slate-900">{formatIDR(aiState.dailyProfit)}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-colors">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-3">
                  <Activity size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Transaksi</p>
                  <p className="text-xl font-bold text-slate-900">{aiState.totalTransactions} <span className="text-sm font-medium text-slate-400 normal-case">Nota</span></p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-rose-200 transition-colors">
                <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-3">
                  <Package size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Stok Kritis</p>
                  <p className="text-xl font-bold text-slate-900">{aiState.lowStockItems.length} <span className="text-sm font-medium text-slate-400 normal-case">Item</span></p>
                </div>
              </div>
            </div>

            {/* Middle Row: Backward Mapping Calc & Budget */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Tarik Mundur Profit */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-700"><Target size={20} /></div>
                  <h2 className="text-base font-bold text-slate-900">Misi Hari Ini</h2>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <span className="text-sm font-medium text-slate-500">Target Omzet (Estimasi)</span>
                    <span className="font-bold text-slate-900">{formatIDR(harianTarget)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-500">Volume Terjual</span>
                    <span className="font-bold text-slate-900">{porsiHarian} Porsi / Item</span>
                  </div>
                </div>
              </div>

              {/* Batas Belanja Pagi */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-700"><CreditCard size={20} /></div>
                  <h2 className="text-base font-bold text-slate-900">Kontrol Belanja</h2>
                </div>
                
                <div className="relative mb-4">
                  <CurrencyInput
                    value={budgetBelanja}
                    onChange={setBudgetBelanja}
                    icon="Rp"
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:border-slate-400 transition-colors text-sm"
                  />
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Terpakai</p>
                  <p className="font-bold text-slate-900 text-sm">Rp 0 <span className="text-slate-400 font-medium">/ {formatIDR(parseInt(budgetBelanja) || 0)}</span></p>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full w-[15%]"></div>
                </div>
              </div>
            </div>

            {/* Chart Area Dummy (Clean Look) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
               <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-slate-900">Trend Penjualan</h2>
                <div className="flex gap-2">
                  {['7H', '30H'].map((filter) => (
                    <button key={filter} className={`px-3 py-1 text-xs font-bold rounded-lg border ${filter === '7H' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`}>
                      {filter}
                    </button>
                  ))}
                </div>
               </div>
               <div className="h-48 flex items-end justify-between gap-2 px-2">
                 {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                    <div key={i} className="w-full bg-blue-50 rounded-t-md relative group hover:bg-blue-100 transition-colors" style={{ height: `${h}%` }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Rp {(h * 12345).toLocaleString('id-ID')}
                      </div>
                    </div>
                 ))}
               </div>
               <div className="flex justify-between mt-3 text-xs font-medium text-slate-400 px-2">
                 <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span>
               </div>
            </div>

          </div>

          {/* RIGHT COLUMN: AI Copilot (Span 4) */}
          <div className="md:col-span-4 h-full">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-inner">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-sm">AI Copilot</h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Logaritma Engine</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-0 relative">
                <Copilot inline={true} category={params.category as string} />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
