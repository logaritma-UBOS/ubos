'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ShoppingBag, Package, Wallet, Activity, TrendingUp, Target, CreditCard, ShieldCheck, Store, Sparkles, Megaphone, AlertCircle, ArrowRight, X, ClipboardList, Calendar, Printer, FileText, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import CurrencyInput from '@/components/CurrencyInput';
import { useAILogaritmaEngine } from '@/hooks/useAILogaritmaEngine';
import Copilot from '@/components/Copilot';
import CopilotWidget from '@/components/CopilotWidget';
import HeaderAiTrigger from '@/components/ubos/HeaderAiTrigger';

export default function UBOSDashboard() {
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const router = useRouter();
  const params = useParams();
  
  const { aiState } = useAILogaritmaEngine();

  // States untuk Siklus Target & Kontrol Belanja
  const [targetProfit, setTargetProfit] = useState<string>('0');
  const [budgetBelanja, setBudgetBelanja] = useState<string>('0');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [totalTerpakai, setTotalTerpakai] = useState<number>(0);
  const [showTargetModal, setShowTargetModal] = useState(false);

  // Derive basePath from params
  const category = (params.category as string) || 'kuliner';
  const slug = (params.slug as string) || '';
  const basePath = `/ubos/${category}/${slug}`;
  const isPercetakan = category.toLowerCase() === 'percetakan';

  useEffect(() => {
    let isMounted = true;
    const fetchMerchant = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase.from('merchants').select('*').eq('user_id', user.id).single();
        if (isMounted) setMerchant(data);
        
        if (data && params.slug) {
          const expectedSlug = (data.nama_usaha || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          if (expectedSlug !== params.slug) {
            router.push(`/ubos/${params.category || 'kuliner'}/${expectedSlug}`);
            return;
          }
        }

        if (data) {
          const { data: products } = await supabase.from('products').select('*').eq('merchant_id', data.id);
          
          if (!products || products.length === 0) {
            setShowOnboarding(true);
            if (isMounted) setTotalTerpakai(0);
          } else {
            const sumBelanja = products.reduce((acc, item) => {
              const modal = Number(
                item.hpp_dasar || item.hpp || item.modal || item.harga_modal || 
                item.harga_beli || item.modal_satuan || item.capital || 0
              );
              const qty = Number(item.stok || item.qty || item.stock || item.quantity || 1);
              const subtotal = item.total_belanja ? Number(item.total_belanja) : (modal * qty);
              return acc + subtotal;
            }, 0);

            if (isMounted) setTotalTerpakai(sumBelanja);
          }
        }

        // Ambil Data Siklus Target dari LocalStorage
        const slugKey = params.slug || 'default';
        const savedTarget = localStorage.getItem(`targetProfit_${slugKey}`);
        const savedStart = localStorage.getItem(`startDate_${slugKey}`);
        const savedEnd = localStorage.getItem(`endDate_${slugKey}`);
        const savedBudget = localStorage.getItem(`budgetBelanja_${slugKey}`) || localStorage.getItem('budgetBelanja');

        if (savedTarget && parseInt(savedTarget) > 0 && isMounted) {
          setTargetProfit(savedTarget);
          if (savedStart) setStartDate(savedStart);
          if (savedEnd) setEndDate(savedEnd);
          if (savedBudget) setBudgetBelanja(savedBudget);

          const now = new Date();
          const targetEnd = savedEnd ? new Date(savedEnd) : new Date();
          if (savedEnd && now > targetEnd) {
            toast.info('Masa siklus target Anda telah berakhir. Silakan buat target siklus baru.');
            setShowTargetModal(true);
          }
        } else if (isMounted) {
          setTargetProfit('0');
          const today = new Date().toISOString().split('T')[0];
          const nextMonth = new Date();
          nextMonth.setDate(nextMonth.getDate() + 30);
          setStartDate(today);
          setEndDate(nextMonth.toISOString().split('T')[0]);
          setShowTargetModal(true);
        }

        if (isMounted) setLoading(false);
        return;
      }

      try {
        const waSession = localStorage.getItem('wa_member_session');
        if (waSession) {
          const session = JSON.parse(waSession);
          const phone = (session.no_wa || '').replace(/\D/g, '');

          if (phone) {
            const res = await fetch(`/api/check-phone?phone=${encodeURIComponent(phone)}`);
            const result = await res.json();

            if (result.found) {
              const merchantData = {
                nama_usaha: result.nama_usaha || session.nama_usaha || '',
                kategori_usaha: result.kategori_usaha || session.kategori || 'Kuliner & F&B',
                whatsapp: phone,
                ...session,
              };
              if (isMounted) setMerchant(merchantData);

              const slugKey = params.slug || 'default';
              const savedTarget = localStorage.getItem(`targetProfit_${slugKey}`);
              const savedStart = localStorage.getItem(`startDate_${slugKey}`);
              const savedEnd = localStorage.getItem(`endDate_${slugKey}`);
              const savedBudget = localStorage.getItem(`budgetBelanja_${slugKey}`) || localStorage.getItem('budgetBelanja');

              if (savedTarget && parseInt(savedTarget) > 0 && isMounted) {
                setTargetProfit(savedTarget);
                if (savedStart) setStartDate(savedStart);
                if (savedEnd) setEndDate(savedEnd);
                if (savedBudget) setBudgetBelanja(savedBudget);
              } else if (isMounted) {
                setTargetProfit('0');
                const today = new Date().toISOString().split('T')[0];
                const nextMonth = new Date();
                nextMonth.setDate(nextMonth.getDate() + 30);
                setStartDate(today);
                setEndDate(nextMonth.toISOString().split('T')[0]);
                setShowTargetModal(true);
              }

              if (isMounted) setLoading(false);
              return;
            }
          }
        }
      } catch (_) {}

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
  const omzetTarget = profitVal > 0 ? profitVal / 0.4 : 0; 
  const harianTarget = omzetTarget > 0 ? omzetTarget / 30 : 0;

  const budgetNum = parseInt(budgetBelanja) || 1;
  const progressPercent = Math.min(Math.round((totalTerpakai / budgetNum) * 100), 100);
  const dailyProgressPercent = harianTarget > 0 ? Math.min(Math.round((aiState.dailyOmzet / harianTarget) * 100), 100) : 0;

  const calculateDaysLeft = () => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const daysLeft = calculateDaysLeft();
  const cycleProfitProgress = profitVal > 0 ? Math.min(Math.round((aiState.dailyProfit / profitVal) * 100), 100) : 0;

  return (
    <div className="pb-24 md:pb-10 bg-[#F8FAFC] min-h-screen font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Modal Tentukan Target Siklus & Kontrol Belanja */}
      {showTargetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 md:p-8 max-w-md w-full shadow-2xl relative my-auto overflow-y-auto max-h-[85vh] animate-in zoom-in-95 duration-200 border border-slate-100 space-y-4">
            <button 
              onClick={() => {
                if (profitVal <= 0) {
                  toast.error('Silakan tentukan target profit bersih siklus terlebih dahulu!');
                  return;
                }
                setShowTargetModal(false);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors z-20"
            >
              <X size={20} />
            </button>
            <div className="text-center space-y-1.5 pt-2">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto ring-4 ring-blue-50/50">
                <Target size={24} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Siklus Target & Logaritma Bisnis</h2>
              <p className="text-slate-500 font-medium text-xs">Tentukan target profit, kontrol belanja, dan rentang tanggal siklus evaluasi Anda.</p>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Target Profit Bersih Siklus</label>
                <CurrencyInput
                  value={targetProfit}
                  onChange={setTargetProfit}
                  icon="Rp"
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-base text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Batas Kontrol Belanja / Modal</label>
                <CurrencyInput
                  value={budgetBelanja}
                  onChange={setBudgetBelanja}
                  icon="Rp"
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-base text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Tanggal Mulai</label>
                  <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Tanggal Berakhir</label>
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                if (parseInt(targetProfit) <= 0) {
                  toast.error('Target profit harus lebih dari 0!');
                  return;
                }
                if (!startDate || !endDate) {
                  toast.error('Tentukan tanggal mulai dan berakhir siklus!');
                  return;
                }
                const slugKey = params.slug || 'default';
                localStorage.setItem(`targetProfit_${slugKey}`, targetProfit);
                localStorage.setItem(`budgetBelanja_${slugKey}`, budgetBelanja);
                localStorage.setItem(`startDate_${slugKey}`, startDate);
                localStorage.setItem(`endDate_${slugKey}`, endDate);
                
                toast.success('Siklus target & logaritma berhasil dikunci!');
                setShowTargetModal(false);
                window.dispatchEvent(new Event('storage'));
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs mt-2"
            >
              Simpan Siklus & Mulai Evaluasi
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 md:p-8 relative z-20 space-y-6">
        
        {/* Modern Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center flex-wrap gap-2">
              Dashboard {params.category ? String(params.category).charAt(0).toUpperCase() + String(params.category).slice(1) : ''}
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">Live</span>
              <HeaderAiTrigger />
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
              Target: {formatIDR(parseInt(targetProfit) || 0)}
            </button>
          </div>
        </div>

        {/* KHUSUS PERCETAKAN: Target Jasa Cetak & ATK Harian di Bagian Atas */}
        {isPercetakan && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Printer size={18} className="text-[#00C0A3]" />
                  <span className="font-black text-sm text-slate-800">Target Jasa Cetak Harian</span>
                </div>
                <span className="font-black text-lg text-emerald-600">{formatIDR(Math.round(harianTarget * 0.7))}</span>
              </div>
              <div className="text-xs text-slate-400 font-bold flex justify-between">
                <span>Pencapaian: {formatIDR(aiState.dailyOmzet)}</span>
                <span className="text-slate-600">/ {formatIDR(Math.round(harianTarget * 0.7))}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-[#00C0A3] h-full rounded-full transition-all duration-500" style={{ width: `${dailyProgressPercent}%` }}></div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-amber-500" />
                  <span className="font-black text-sm text-slate-800">Target ATK Harian</span>
                </div>
                <span className="font-black text-lg text-amber-600">{formatIDR(Math.round(harianTarget * 0.3))}</span>
              </div>
              <div className="text-xs text-slate-400 font-bold flex justify-between">
                <span>Pencapaian: Rp 0</span>
                <span className="text-slate-600">/ {formatIDR(Math.round(harianTarget * 0.3))}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* BENTO BOX GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
          
          <div className="md:col-span-12 space-y-6">
            
            {/* Top 4 Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* Kartu Pendapatan (DENGAN PROGRESS BAR) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-200 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center">
                    <Wallet size={20} />
                  </div>
                  <span className="text-[10px] font-black text-blue-600">{dailyProgressPercent}%</span>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pendapatan</p>
                  <p className="text-xl font-bold text-slate-900">{formatIDR(aiState.dailyOmzet)}</p>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${dailyProgressPercent}%` }}></div>
                  </div>
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

            {/* Middle Row: Misi Hari Ini, Kontrol Belanja, & Riwayat Transaksi */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Misi Hari Ini */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 rounded-lg text-slate-700"><Target size={20} /></div>
                      <h2 className="text-base font-bold text-slate-900">Misi Hari Ini</h2>
                    </div>
                    {profitVal === 0 && (
                      <button 
                        onClick={() => setShowTargetModal(true)}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        + Atur Target
                      </button>
                    )}
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-500">Target Omzet Harian</span>
                      <span className="font-black text-slate-900">{profitVal === 0 ? 'Rp 0' : formatIDR(harianTarget)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-400">Pencapaian Hari Ini</span>
                      <span className="font-bold text-emerald-600">{formatIDR(aiState.dailyOmzet)} ({dailyProgressPercent}%)</span>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${dailyProgressPercent}%` }}></div>
                </div>
              </div>

              {/* Kontrol Belanja */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-700"><CreditCard size={20} /></div>
                    <h2 className="text-base font-bold text-slate-900">Kontrol Belanja</h2>
                  </div>
                  <div className="relative mb-3">
                    <CurrencyInput
                      value={budgetBelanja}
                      onChange={(val) => {
                        setBudgetBelanja(val);
                        const budgetKey = `budgetBelanja_${params.slug || 'default'}`;
                        localStorage.setItem(budgetKey, val);
                        localStorage.setItem('budgetBelanja', val);
                      }}
                      icon="Rp"
                      className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-slate-400 transition-colors text-sm"
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">Terpakai</span>
                    <span className="font-bold text-slate-900">{formatIDR(totalTerpakai)}</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>

              {/* Riwayat Transaksi */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-700"><ClipboardList size={20} /></div>
                    <h2 className="text-base font-bold text-slate-900">Riwayat Transaksi</h2>
                  </div>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    Kelola dan pantau seluruh catatan transaksi penjualan kasir secara lengkap dan transparan.
                  </p>
                </div>
                <Link 
                  href={`${basePath}/transactions`}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Buka Riwayat Transaksi</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

            </div>

            {/* PANEL SIKLUS TARGET & EVALUASI LOGARITMA */}
            <div className="bg-white p-5 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0"><Target size={22} /></div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base md:text-lg font-bold text-slate-900">Siklus Target & Evaluasi</h2>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold uppercase rounded-full">Aktif</span>
                    </div>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar size={12} className="text-slate-400" />
                      <span>{startDate || 'Mulai'} s.d. {endDate || 'Selesai'}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0">
                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${daysLeft === 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {daysLeft === 0 ? 'Siklus Berakhir' : `${daysLeft} Hari Lagi`}
                  </span>
                  <button 
                    onClick={() => setShowTargetModal(true)}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg transition-all shadow-sm"
                  >
                    Atur Ulang
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500">Pencapaian Profit ({formatIDR(profitVal)})</span>
                  <span className="text-blue-600">{cycleProfitProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/60">
                  <div className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${cycleProfitProgress}%` }}></div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Pendapatan (Omzet)</p>
                  <p className="text-sm md:text-base font-black text-slate-900">{formatIDR(aiState.dailyOmzet)}</p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Akumulasi Laba Bersih</p>
                  <p className="text-sm md:text-base font-black text-emerald-600">{formatIDR(aiState.dailyProfit)}</p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Modal Belanja Terpakai</p>
                  <p className="text-sm md:text-base font-black text-rose-600">{formatIDR(totalTerpakai)}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-white p-4 rounded-xl border border-blue-100/80 flex items-start gap-3 shadow-2xs">
                <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0 mt-0.5 shadow-sm">
                  <Sparkles size={16} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">Evaluasi Back-Mapping Logaritma Bisnis</h4>
                  <p className="text-[11px] text-blue-800/80 leading-relaxed">
                    {cycleProfitProgress >= 80 
                      ? "Performa bisnis Anda sangat luar biasa dan berada di jalur yang tepat (On-Track). Kecepatan pertumbuhan profit memenuhi standar logaritma."
                      : cycleProfitProgress >= 40 
                      ? "Bisnis berjalan stabil namun membutuhkan akselerasi volume penjualan harian untuk mengejar target sebelum tenggat waktu."
                      : "Peringatan Logaritma: Perolehan profit saat ini masih tertinggal. Segera evaluasi harga jual produk dan tingkatkan promosi harian."}
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}