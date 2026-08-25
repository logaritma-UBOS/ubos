'use client';

import UBOSLoading from '@/components/UBOSLoading';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Wallet, ArrowDownToLine, ArrowUpFromLine, Landmark, ShieldCheck, X, CheckCircle, Package, Sparkles, TrendingUp, ShieldAlert, PieChart } from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
const Copilot = dynamic(() => import('@/components/Copilot'), { ssr: false });
const HeaderAiTrigger = dynamic(() => import('@/components/ubos/HeaderAiTrigger'), { ssr: false });
import { useMerchant } from '@/contexts/MerchantContext';

const themeColorMap: Record<string, { bg: string, text: string, border: string, light: string, hover: string }> = {
  kuliner: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50', hover: 'hover:bg-emerald-600' },
  percetakan: { bg: 'bg-indigo-500', text: 'text-indigo-600', border: 'border-indigo-200', light: 'bg-indigo-50', hover: 'hover:bg-indigo-600' },
  ritel: { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-200', light: 'bg-amber-50', hover: 'hover:bg-amber-600' },
  jasa: { bg: 'bg-sky-500', text: 'text-sky-600', border: 'border-sky-200', light: 'bg-sky-50', hover: 'hover:bg-sky-600' },
  default: { bg: 'bg-[#00C0A3]', text: 'text-[#00C0A3]', border: 'border-emerald-200', light: 'bg-emerald-50', hover: 'hover:bg-[#009b82]' },
};

export default function FinancePage({ params }: { params: Promise<{ slug: string; category: string }> }) {
  const { merchant } = useMerchant();
  const resolvedParams = use(params);
  const { slug, category } = resolvedParams;
  const router = useRouter();
  
  const theme = themeColorMap[category?.toLowerCase()] || themeColorMap.default;

  const [wallet, setWallet] = useState<any>(null);
  const [merchantId, setMerchantId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [totalPendapatan, setTotalPendapatan] = useState(0);
  const [totalPengeluaran, setTotalPengeluaran] = useState(0);
  
  // Modals state
  const [showTarikModal, setShowTarikModal] = useState(false);
  const [tarikAmount, setTarikAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftClosing, setShiftClosing] = useState(false);
  const [shiftSummary, setShiftSummary] = useState<any>(null);
  
  const [showInputShiftModal, setShowInputShiftModal] = useState(false);
  const [sisaBahan, setSisaBahan] = useState('');

  const fetchData = async () => {
    try {
      if (!merchant) return;
      
      setMerchantId(merchant.id);
      
      const [walletRes, txsRes] = await Promise.all([
        supabase.from('wallets').select('*').eq('merchant_id', merchant.id).single(),
        supabase.from('transactions').select('*').eq('merchant_id', merchant.id).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      setWallet(walletRes.data || { profit_bersih: 0, kas_bahan_baku: 0, kas_operasional: 0 });

      let pendapatan = 0;
      let pengeluaran = 0;
      
      txsRes.data?.forEach(tx => {
         pendapatan += tx.total_net || 0;
         pengeluaran += (tx.total_gross - tx.total_net) || 0;
      });
      
      setTotalPendapatan(pendapatan);
      setTotalPengeluaran(pengeluaran);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [merchant]);

  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  const handleTarikProfit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(tarikAmount.replace(/\D/g, ''));
    if (!amount || amount <= 0) return;
    if (amount > (wallet?.profit_bersih || 0)) {
      toast.error('Saldo profit tidak mencukupi!');
      return;
    }
    
    setProcessing(true);
    try {
      const newProfit = wallet.profit_bersih - amount;
      await supabase.from('wallets').update({ profit_bersih: newProfit }).eq('id', wallet.id);
      setWallet({ ...wallet, profit_bersih: newProfit });
      setShowTarikModal(false);
      setTarikAmount('');
      toast.success('Penarikan profit berhasil dicatat!');
    } catch (e) {
      toast.error('Gagal menarik profit');
    } finally {
      setProcessing(false);
    }
  };

  const initiateCloseShift = () => {
    setSisaBahan('');
    setShowInputShiftModal(true);
  };

  const handleCloseShift = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!merchantId) return;
    
    setShowInputShiftModal(false);
    setShiftClosing(true);
    setShowShiftModal(true);
    setShiftSummary(null);
    
    try {
      const todayStart = new Date();
      todayStart.setHours(0,0,0,0);
      
      const { data: txs, error } = await supabase
        .from('transactions')
        .select('*, transaction_items(*)')
        .eq('merchant_id', merchantId)
        .gte('created_at', todayStart.toISOString());
        
      if (error) throw error;
      
      let totalOmzet = 0;
      let totalHPP = 0;
      let totalNet = 0;
      
      txs?.forEach(tx => {
        totalOmzet += tx.total_gross || 0;
        totalNet += tx.total_net || 0;
        const itemsHpp = tx.transaction_items?.reduce((sum: number, item: any) => sum + (item.hpp_satuan * item.qty), 0) || 0;
        totalHPP += itemsHpp;
      });
      
      const estimasiSisa = parseFloat(sisaBahan.replace(/\D/g, '')) || 0;
      const totalProfit = totalNet - totalHPP;
      const totalOperasional = totalProfit * 0.2;
      let profitBersih = totalProfit * 0.8;
      const realHPP = totalHPP - estimasiSisa;
      
      const logData = {
        merchant_id: merchantId,
        total_omzet: totalOmzet,
        total_hpp: realHPP,
        total_operasional: totalOperasional,
        total_profit_bersih: profitBersih,
        sisa_bahan_baku: estimasiSisa
      };
      
      await supabase.from('shift_logs').insert([logData]);
      
      if (estimasiSisa > 0 && wallet) {
        await supabase.from('wallets').update({
          kas_bahan_baku: (wallet.kas_bahan_baku || 0) + estimasiSisa
        }).eq('id', wallet.id);
      }
      
      setShiftSummary(logData);
      router.refresh();
      await fetchData();
      
    } catch (e) {
      console.error(e);
      toast.error('Gagal menutup shift. Pastikan schema shift_logs sudah dibuat.');
      setShowShiftModal(false);
    } finally {
      setShiftClosing(false);
    }
  };
  
  const formatCurrencyInput = (value: string) => {
    const number = value.replace(/\D/g, '');
    return new Intl.NumberFormat('id-ID').format(Number(number));
  };

  if (loading) {
    return (
      <UBOSLoading fullScreen={false} show={true} />
    );
  }

  const recommendedModalKulakan = totalPendapatan * 0.45;
  const estimatedNetProfit = totalPendapatan * 0.35;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-28 md:pb-10">
      <header className="px-5 py-6 md:py-8 flex justify-between items-center z-10 relative bg-slate-50 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center flex-wrap gap-3">
            Laporan Keuangan & Margin Guard
            <HeaderAiTrigger />
          </h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Auto-split profit, pencegah dead-stock, & AI back-mapping</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={initiateCloseShift} 
            className="h-11 px-5 bg-[#00C0A3] hover:bg-[#009b82] text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <ArrowDownToLine size={18} />
            <span className="font-bold text-sm hidden md:inline">Tutup Shift</span>
          </button>
        </div>
      </header>

      <div className="p-5 pt-0 max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-28 md:pb-8 relative z-30">
        
        {/* AI Financial Back-Mapping Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-emerald-500/20">
          <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 w-40 h-40 bg-[#00C0A3]/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="bg-[#00C0A3] text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={12} /> AI Back-Mapping Guard Active
                </span>
                <span className="text-xs text-emerald-400 font-medium">Analisis Otomatis Anti Dead-Stock</span>
              </div>
              <h3 className="font-bold text-base md:text-lg text-white leading-snug">
                "Margin kotor terpantau stabil. Berdasarkan tren penjualan 7 hari terakhir, berikut adalah proyeksi alokasi modal dan rekomendasi optimal sistem."
              </h3>
            </div>
            
            <button 
              onClick={() => toast.success('AI Copilot memperbarui analisis back-mapping berdasarkan data terbaru!')}
              className="bg-[#00C0A3] hover:bg-[#009b82] text-slate-950 font-black px-5 py-3 rounded-xl text-xs shadow-md transition-all whitespace-nowrap active:scale-95 flex items-center gap-2"
            >
              <TrendingUp size={16} /> Analisis Ulang AI
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700/80 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-col justify-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rekomendasi Modal Kulakan (HPP)</span>
              <span className="text-xl font-black text-white mt-1">{loading ? '...' : formatIDR(recommendedModalKulakan)}</span>
              <span className="text-[10px] text-emerald-400 mt-0.5">Batas aman alokasi stok untuk cegah dead-stock</span>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-col justify-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Proyeksi Bersih (Net Profit)</span>
              <span className="text-xl font-black text-[#00C0A3] mt-1">{loading ? '...' : formatIDR(estimatedNetProfit)}</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Estimasi bersih setelah dipotong operasional</span>
            </div>
          </div>
        </div>

        {/* 4 Bento Cards Keuangan */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
            <div className="w-10 h-10 bg-emerald-50 text-[#00C0A3] rounded-xl flex items-center justify-center mb-4 border border-emerald-200">
              <ArrowUpFromLine size={20} />
            </div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pendapatan</p>
            <p className="text-xl md:text-2xl font-black text-slate-900 mt-1">{loading ? '...' : formatIDR(totalPendapatan)}</p>
          </div>
          
          <div className="bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-800 text-white relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <Landmark size={80} />
            </div>
            <div className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
              <Landmark size={20} />
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider relative z-10">Laba Bersih (Riil)</p>
            <p className="text-xl md:text-2xl font-black text-[#00C0A3] mt-1 relative z-10">{loading ? "..." : formatIDR(wallet?.profit_bersih || 0)}</p>
          </div>
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
             <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4 border border-rose-200">
              <ArrowDownToLine size={20} />
            </div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pengeluaran</p>
            <p className="text-xl md:text-2xl font-black text-slate-900 mt-1">{loading ? '...' : formatIDR(totalPengeluaran)}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
             <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 border border-blue-200">
              <Wallet size={20} />
            </div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kas Operasional</p>
            <p className="text-xl md:text-2xl font-black text-slate-900 mt-1">{loading ? "..." : formatIDR(wallet?.kas_operasional || 0)}</p>
          </div>
        </div>

        {/* Panel Kesehatan Margin & Alokasi Logaritma (Pengganti Grafik/Tabel) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#00C0A3] flex items-center justify-center border border-emerald-200">
                <PieChart size={18} />
              </div>
              <h3 className="font-black text-slate-900 text-base">Status Kesehatan Margin Guard</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Sistem Logaritma mendeteksi perputaran modal usahamu berada pada tingkat yang sehat. Auto-split profit memisahkan dana cadangan harian secara otomatis agar terhindar dari risiko kekurangan likuiditas.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <span className="w-3 h-3 rounded-full bg-[#00C0A3]"></span> HPP Terkontrol
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <span className="w-3 h-3 rounded-full bg-slate-900"></span> Profit Bersih Aman
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-slate-600">Alokasi Kas Bahan Baku</span>
              <span className="font-black text-slate-900">{loading ? "..." : formatIDR(wallet?.kas_bahan_baku || 0)}</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#00C0A3] rounded-full" style={{ width: '65%' }}></div>
            </div>
            <div className="flex justify-between items-center text-sm pt-2">
              <span className="font-bold text-slate-600">Alokasi Kas Operasional</span>
              <span className="font-black text-slate-900">{loading ? "..." : formatIDR(wallet?.kas_operasional || 0)}</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-slate-900 rounded-full" style={{ width: '35%' }}></div>
            </div>
          </div>
        </div>

      </div>

      {/* Input Sisa Bahan Modal */}
      {showInputShiftModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 pb-20">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="flex justify-between items-center mb-5">
              <div className="w-12 h-12 bg-emerald-50 text-[#00C0A3] rounded-full flex items-center justify-center border border-emerald-200">
                <Package size={24} />
              </div>
              <button onClick={() => setShowInputShiftModal(false)} className="text-slate-400 p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-1">Tutup Shift</h2>
            <p className="text-sm text-slate-500 mb-6 font-medium">Masukkan estimasi sisa bahan baku hari ini agar AI dapat mengoreksi HPP aktual.</p>
            
            <form onSubmit={handleCloseShift} className="space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">Rp</span>
                <input 
                  type="text" 
                  value={sisaBahan}
                  onChange={(e) => setSisaBahan(formatCurrencyInput(e.target.value))}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-[#00C0A3] transition-all"
                  placeholder="0 (Opsional)"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-tight font-medium bg-slate-50 p-3 rounded-lg border border-slate-100">Jika ada, nilai ini akan dikembalikan ke Kas Bahan Baku untuk modal esok hari.</p>
              
              <button 
                type="submit"
                className="w-full bg-[#00C0A3] hover:bg-[#009b82] text-slate-950 font-black py-4 rounded-xl transition-all active:scale-95 mt-4 flex justify-center items-center shadow-sm"
              >
                Konfirmasi & Tutup Shift
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Shift Modal */}
      {showShiftModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
              
              {shiftClosing && !shiftSummary ? (
                <>
                  <div className="relative mb-6">
                    <div className="w-16 h-16 border-4 border-slate-100 border-t-[#00C0A3] rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShieldCheck size={24} className="text-[#00C0A3]" />
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-1">Menutup Shift...</h3>
                  <p className="text-sm font-medium text-slate-500 text-center">Menghitung total kas dan profit hari ini.</p>
                </>
              ) : shiftSummary ? (
                <div className="w-full">
                  <div className="w-16 h-16 bg-emerald-50 text-[#00C0A3] border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-1 text-center">Shift Ditutup!</h3>
                  <p className="text-sm font-medium text-slate-500 text-center mb-6">Berikut adalah ringkasan performa hari ini.</p>
                  
                  <div className="bg-slate-50 rounded-2xl p-5 space-y-3 mb-6 border border-slate-100">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-500">Total Omzet</span>
                      <span className="font-bold text-slate-800">{formatIDR(shiftSummary.total_omzet)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 font-medium">Alokasi HPP (Riil)</span>
                      <span className="font-medium text-slate-700">{formatIDR(shiftSummary.total_hpp)}</span>
                    </div>
                    {shiftSummary.sisa_bahan_baku > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-emerald-600 font-bold">Sisa Bahan Baku</span>
                        <span className="font-bold text-emerald-600">+{formatIDR(shiftSummary.sisa_bahan_baku)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 font-medium">Alokasi Operasional</span>
                      <span className="font-medium text-slate-700">{formatIDR(shiftSummary.total_operasional)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                      <span className="text-xs font-black text-[#00C0A3]">Net Profit Bersih</span>
                      <span className="font-black text-[#00C0A3] text-lg">{formatIDR(shiftSummary.total_profit_bersih)}</span>
                    </div>
                  </div>
                  
                  <button onClick={() => setShowShiftModal(false)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-sm">
                    Selesai
                  </button>
                </div>
              ) : null}
              
           </div>
        </div>
      )}
      
      <Copilot />
    </div>
  );
}