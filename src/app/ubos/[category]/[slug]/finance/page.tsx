'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Wallet, ArrowDownToLine, ArrowUpFromLine, RefreshCcw, Landmark, ShieldCheck, History, X, CheckCircle, Package } from 'lucide-react';
import { toast } from 'sonner';
import Copilot from '@/components/Copilot';
import AIBanner from '@/components/AIBanner';

const themeColorMap: Record<string, { bg: string, text: string, border: string, light: string, hover: string }> = {
  kuliner: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50', hover: 'hover:bg-emerald-600' },
  percetakan: { bg: 'bg-indigo-500', text: 'text-indigo-600', border: 'border-indigo-200', light: 'bg-indigo-50', hover: 'hover:bg-indigo-600' },
  ritel: { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-200', light: 'bg-amber-50', hover: 'hover:bg-amber-600' },
  jasa: { bg: 'bg-sky-500', text: 'text-sky-600', border: 'border-sky-200', light: 'bg-sky-50', hover: 'hover:bg-sky-600' },
  default: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50', hover: 'hover:bg-blue-600' },
};

export default function FinancePage({ params }: { params: Promise<{ slug: string; category: string }> }) {
  const resolvedParams = use(params);
  const { slug, category } = resolvedParams;
  const router = useRouter();
  
  const theme = themeColorMap[category?.toLowerCase()] || themeColorMap.default;

  const [wallet, setWallet] = useState<any>(null);
  const [merchantId, setMerchantId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<number[]>([]);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: merchantData } = await supabase.from('merchants').select('id').eq('user_id', user.id).single();
      if (merchantData) {
        setMerchantId(merchantData.id);
        const { data: walletData } = await supabase.from('wallets').select('*').eq('merchant_id', merchantData.id).single();
        setWallet(walletData || { profit_bersih: 0, kas_bahan_baku: 0, kas_operasional: 0 });

        // Fetch recent transactions
        const { data: txs } = await supabase.from('transactions').select('*').eq('merchant_id', merchantData.id).order('created_at', { ascending: false }).limit(5);
        setRecentTransactions(txs || []);

        // Calculate weekly data (dummy simple calc for this example)
        // In real app, group by day
        const week = [0,0,0,0,0,0,0];
        let pendapatan = 0;
        let pengeluaran = 0;
        
        const { data: allTxs } = await supabase.from('transactions').select('*').eq('merchant_id', merchantData.id).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
        allTxs?.forEach(tx => {
           const d = new Date(tx.created_at).getDay();
           week[d] += tx.total_net || 0;
           pendapatan += tx.total_net || 0;
           pengeluaran += (tx.total_gross - tx.total_net) || 0; // rough estimation for dummy
        });
        
        setWeeklyData(week);
        setTotalPendapatan(pendapatan);
        setTotalPengeluaran(pengeluaran);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      
      // Implementasi Sisa Bahan Baku (Plan Option 1)
      const realHPP = totalHPP - estimasiSisa;
      
      const logData = {
        merchant_id: merchantId,
        total_omzet: totalOmzet,
        total_hpp: realHPP, // save the real hpp
        total_operasional: totalOperasional,
        total_profit_bersih: profitBersih,
        sisa_bahan_baku: estimasiSisa
      };
      
      await supabase.from('shift_logs').insert([logData]);
      
      // Update wallet to return sisa bahan to Kas Bahan Baku
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
      <div className="p-4 flex items-center justify-center h-full min-h-[50vh]">
        <div className={`animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-${theme.bg.split('-')[1]}-500`}></div>
      </div>
    );
  }

  const maxWeekly = Math.max(...weeklyData, 1);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-28 md:pb-10">
      <header className="px-5 py-6 md:py-8 flex justify-between items-center z-10 relative bg-slate-50 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Laporan Keuangan</h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Auto-split profit & ringkasan bisnis</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={initiateCloseShift} 
            className={`h-11 px-5 ${theme.bg} ${theme.hover} text-white rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95`}
          >
            <ArrowDownToLine size={18} />
            <span className="font-bold text-sm hidden md:inline">Tutup Shift</span>
          </button>
        </div>
      </header>

      <div className="px-5 pt-2 max-w-6xl mx-auto w-full relative z-20">
        <AIBanner />
      </div>

      <div className="p-5 pt-0 max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-28 md:pb-8 relative z-30">
        
        {/* Top: 4 Bento Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
            <div className={`w-10 h-10 ${theme.light} ${theme.text} rounded-xl flex items-center justify-center mb-4 border ${theme.border}`}>
              <ArrowUpFromLine size={20} />
            </div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pendapatan</p>
            <p className="text-xl md:text-2xl font-black text-slate-900 mt-1">{formatIDR(totalPendapatan)}</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 shadow-sm border border-slate-800 text-white relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <Landmark size={80} />
            </div>
            <div className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
              <Landmark size={20} />
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider relative z-10">Laba Bersih</p>
            <p className="text-xl md:text-2xl font-black text-white mt-1 relative z-10">{formatIDR(wallet?.profit_bersih || 0)}</p>
          </div>
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
             <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4 border border-rose-200">
              <ArrowDownToLine size={20} />
            </div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pengeluaran</p>
            <p className="text-xl md:text-2xl font-black text-slate-900 mt-1">{formatIDR(totalPengeluaran)}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
             <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 border border-blue-200">
              <Wallet size={20} />
            </div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kas Operasional</p>
            <p className="text-xl md:text-2xl font-black text-slate-900 mt-1">{formatIDR(wallet?.kas_operasional || 0)}</p>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bottom Left: Weekly Chart */}
          <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col">
            <h3 className="text-lg font-black text-slate-900 mb-6">Grafik 7 Hari</h3>
            
            <div className="flex-1 flex items-end gap-2 sm:gap-3 mt-auto h-48">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day, i) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full bg-slate-100 rounded-t-lg relative flex-1 flex items-end overflow-hidden">
                     <div 
                        className={`w-full ${theme.bg} rounded-t-lg transition-all duration-1000 ease-out group-hover:opacity-80`}
                        style={{ height: `${(weeklyData[i] / maxWeekly) * 100}%`, minHeight: weeklyData[i] > 0 ? '4px' : '0' }}
                     />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Right: Recent Transactions */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900">Transaksi Terakhir</h3>
              <button className={`text-xs font-bold ${theme.text} hover:underline`}>Lihat Semua</button>
            </div>
            
            <div className="flex-1 p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipe</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentTransactions.length > 0 ? recentTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs text-slate-500">{tx.id.substring(0,8).toUpperCase()}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase">
                          Penjualan
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-black text-slate-800 text-sm">{formatIDR(tx.total_gross)}</span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="px-5 py-8 text-center text-sm font-medium text-slate-500">
                        Belum ada transaksi
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Tarik Profit Modal */}
      {showTarikModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 pb-20">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <div className={`w-12 h-12 ${theme.light} ${theme.text} rounded-full flex items-center justify-center border ${theme.border}`}>
                <ArrowUpFromLine size={24} />
              </div>
              <button onClick={() => setShowTarikModal(false)} className="text-slate-400 p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Tarik Profit Bersih</h2>
            <p className="text-sm text-slate-500 mb-6 font-medium">Saldo tersedia: <b>{formatIDR(wallet?.profit_bersih || 0)}</b></p>
            
            <form onSubmit={handleTarikProfit} className="space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">Rp</span>
                <input 
                  type="text" 
                  required
                  value={tarikAmount}
                  onChange={(e) => setTarikAmount(formatCurrencyInput(e.target.value))}
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-${theme.bg.split('-')[1]}-200 focus:border-${theme.bg.split('-')[1]}-500 transition-all`}
                  placeholder="0"
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setTarikAmount(formatCurrencyInput(String(wallet?.profit_bersih || 0)))} className={`flex-1 text-xs font-bold ${theme.text} ${theme.light} py-2.5 rounded-xl border ${theme.border}`}>Tarik Semua</button>
              </div>
              
              <button 
                type="submit"
                disabled={processing || !tarikAmount}
                className={`w-full ${theme.bg} ${theme.hover} text-white font-bold py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 mt-4 flex justify-center items-center shadow-sm`}
              >
                {processing ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Konfirmasi Penarikan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Input Sisa Bahan Modal */}
      {showInputShiftModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 pb-20">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="flex justify-between items-center mb-5">
              <div className={`w-12 h-12 ${theme.light} ${theme.text} rounded-full flex items-center justify-center border ${theme.border}`}>
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
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-${theme.bg.split('-')[1]}-200 focus:border-${theme.bg.split('-')[1]}-500 transition-all`}
                  placeholder="0 (Opsional)"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-tight font-medium bg-slate-50 p-3 rounded-lg border border-slate-100">Jika ada, nilai ini akan dikembalikan ke Kas Bahan Baku untuk modal esok hari.</p>
              
              <button 
                type="submit"
                className={`w-full ${theme.bg} ${theme.hover} text-white font-bold py-4 rounded-xl transition-all active:scale-95 mt-4 flex justify-center items-center shadow-sm`}
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
                    <div className={`w-16 h-16 border-4 border-slate-100 border-t-${theme.bg.split('-')[1]}-500 rounded-full animate-spin`}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShieldCheck size={24} className={theme.text} />
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-1">Menutup Shift...</h3>
                  <p className="text-sm font-medium text-slate-500 text-center">Menghitung total kas dan profit hari ini.</p>
                </>
              ) : shiftSummary ? (
                <div className="w-full">
                  <div className={`w-16 h-16 ${theme.light} ${theme.text} border ${theme.border} rounded-full flex items-center justify-center mx-auto mb-5`}>
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
                      <span className={`text-xs font-black ${theme.text}`}>Net Profit Bersih</span>
                      <span className={`font-black ${theme.text} text-lg`}>{formatIDR(shiftSummary.total_profit_bersih)}</span>
                    </div>
                  </div>
                  
                  <button onClick={() => setShowShiftModal(false)} className={`w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-sm`}>
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
