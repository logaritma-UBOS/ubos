'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Wallet, ArrowDownToLine, ArrowUpFromLine, RefreshCcw, Landmark, ShieldCheck, History, X, CheckCircle, Package } from 'lucide-react';
import { toast } from 'sonner';
import Copilot from '@/components/Copilot';

export default function FinancePage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<any>(null);
  const [merchantId, setMerchantId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showTarikModal, setShowTarikModal] = useState(false);
  const [tarikAmount, setTarikAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftClosing, setShiftClosing] = useState(false);
  const [shiftSummary, setShiftSummary] = useState<any>(null);
  
  const [showInputShiftModal, setShowInputShiftModal] = useState(false);
  const [sisaBahan, setSisaBahan] = useState('');

  const fetchWallet = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: merchantData } = await supabase.from('merchants').select('id').eq('user_id', user.id).single();
      if (merchantData) {
        setMerchantId(merchantData.id);
        const { data: walletData } = await supabase.from('wallets').select('*').eq('merchant_id', merchantData.id).single();
        setWallet(walletData || { profit_bersih: 0, kas_bahan_baku: 0, kas_operasional: 0 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
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
      // Note: Profit bersih calculations logic could change if realHPP changes, 
      // but according to the plan we mainly adjust the Kas Bahan Baku wallet.
      
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
      await fetchWallet();
      
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
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-primary"></div>
      </div>
    );
  }

  return (
    <>
      <header className="fixed top-0 z-40 h-[80px] bg-primary shadow-md max-w-md md:max-w-none mx-auto md:mx-0 left-0 md:left-64 right-0 px-5 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight drop-shadow-sm">Keuangan</h1>
          <p className="text-white/80 text-xs mt-0.5">Uang otomatis terpisah setiap transaksi.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center space-x-1.5 bg-white/20 text-white px-2.5 py-1 rounded-full text-[10px] font-bold border border-white/30 backdrop-blur-sm">
            <ShieldCheck size={12} className="text-emerald-300" />
            <span>Auto-Split Aktif</span>
          </div>
        </div>
      </header>

      <div className="p-5 pt-24 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-28 md:pb-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main Wallet Card (Profit Owner) */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-900/20 text-white relative overflow-hidden md:col-span-1">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Landmark size={120} />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Profit Bersih (Milik Anda)</h2>
              <p className="text-4xl font-black tracking-tight mb-6">{formatIDR(wallet?.profit_bersih || 0)}</p>
              
              <div className="flex gap-3">
                <button onClick={() => setShowTarikModal(true)} className="flex-1 bg-white text-slate-900 hover:bg-slate-50 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95 text-sm">
                  <ArrowUpFromLine size={16} /> Tarik Profit
                </button>
                <button className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-colors shrink-0">
                  <History size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Operational Wallets */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:col-span-2">
            {/* Kas Bahan Baku */}
          <div className="bg-amber-50 rounded-3xl p-5 border border-amber-100 relative overflow-hidden">
            <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-3">
              <RefreshCcw size={14} />
            </div>
            <h3 className="text-[11px] font-bold text-amber-900/60 uppercase tracking-wider mb-1">Kas Bahan Baku</h3>
            <p className="text-lg font-black text-amber-900">{formatIDR(wallet?.kas_bahan_baku || 0)}</p>
            <p className="text-[10px] text-amber-700/80 mt-2 leading-tight">Uang khusus untuk belanja HPP besok.</p>
          </div>

          {/* Kas Operasional */}
          <div className="bg-blue-50 rounded-3xl p-5 border border-blue-100 relative overflow-hidden">
             <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
              <Wallet size={14} />
            </div>
            <h3 className="text-[11px] font-bold text-blue-900/60 uppercase tracking-wider mb-1">Kas Operasional</h3>
            <p className="text-lg font-black text-blue-900">{formatIDR(wallet?.kas_operasional || 0)}</p>
            <p className="text-[10px] text-blue-700/80 mt-2 leading-tight">Uang untuk bayar sewa, gaji, & listrik.</p>
          </div>
        </div>
      </div>

        {/* Action Button */}
        <div className="pt-4">
          <button onClick={initiateCloseShift} className="w-full py-4 border-2 border-slate-200 border-dashed text-slate-500 rounded-2xl font-bold text-sm hover:bg-slate-50 hover:text-slate-700 transition-all active:scale-95 flex items-center justify-center gap-2">
            <ArrowDownToLine size={18} /> Tutup Shift Hari Ini
          </button>
        </div>
      </div>

      {/* Tarik Profit Modal */}
      {showTarikModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 pb-20">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <ArrowUpFromLine size={24} />
              </div>
              <button onClick={() => setShowTarikModal(false)} className="text-slate-400 p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Tarik Profit Bersih</h2>
            <p className="text-sm text-slate-500 mb-6">Saldo tersedia: <b>{formatIDR(wallet?.profit_bersih || 0)}</b></p>
            
            <form onSubmit={handleTarikProfit} className="space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">Rp</span>
                <input 
                  type="text" 
                  required
                  value={tarikAmount}
                  onChange={(e) => setTarikAmount(formatCurrencyInput(e.target.value))}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="0"
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setTarikAmount(formatCurrencyInput(String(wallet?.profit_bersih || 0)))} className="flex-1 text-xs font-bold text-primary bg-primary/10 py-2 rounded-xl">Tarik Semua</button>
              </div>
              
              <button 
                type="submit"
                disabled={processing || !tarikAmount}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95 disabled:opacity-50 mt-4 flex justify-center items-center h-14"
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
            <div className="flex justify-between items-center mb-4">
              <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center">
                <Package size={24} />
              </div>
              <button onClick={() => setShowInputShiftModal(false)} className="text-slate-400 p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Tutup Shift</h2>
            <p className="text-sm text-slate-500 mb-6">Masukkan estimasi sisa bahan baku hari ini agar AI dapat mengoreksi HPP aktual.</p>
            
            <form onSubmit={handleCloseShift} className="space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">Rp</span>
                <input 
                  type="text" 
                  value={sisaBahan}
                  onChange={(e) => setSisaBahan(formatCurrencyInput(e.target.value))}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="0 (Opsional)"
                />
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">Jika ada, nilai ini akan dikembalikan ke Kas Bahan Baku untuk modal esok hari.</p>
              
              <button 
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95 mt-4 flex justify-center items-center h-14"
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
                    <div className="w-16 h-16 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShieldCheck size={24} className="text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Menutup Shift...</h3>
                  <p className="text-xs text-slate-500 text-center">Menghitung total kas dan profit hari ini.</p>
                </>
              ) : shiftSummary ? (
                <div className="w-full">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-1 text-center">Shift Ditutup!</h3>
                  <p className="text-sm text-slate-500 text-center mb-6">Berikut adalah ringkasan performa hari ini.</p>
                  
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-3 mb-6 border border-slate-100">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-500">Total Omzet</span>
                      <span className="font-bold text-slate-800">{formatIDR(shiftSummary.total_omzet)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Alokasi HPP (Riil)</span>
                      <span className="font-medium text-slate-700">{formatIDR(shiftSummary.total_hpp)}</span>
                    </div>
                    {shiftSummary.sisa_bahan_baku > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-emerald-600 font-bold">Sisa Bahan Baku</span>
                        <span className="font-bold text-emerald-600">+{formatIDR(shiftSummary.sisa_bahan_baku)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Alokasi Operasional</span>
                      <span className="font-medium text-slate-700">{formatIDR(shiftSummary.total_operasional)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                      <span className="text-xs font-bold text-primary">Net Profit Bersih</span>
                      <span className="font-black text-primary text-lg">{formatIDR(shiftSummary.total_profit_bersih)}</span>
                    </div>
                  </div>
                  
                  <button onClick={() => setShowShiftModal(false)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95">
                    Selesai
                  </button>
                </div>
              ) : null}
              
           </div>
        </div>
      )}
      
      <Copilot />
    </>
  );
}
