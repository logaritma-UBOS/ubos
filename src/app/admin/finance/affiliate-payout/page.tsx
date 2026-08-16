'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { 
  DollarSign, CheckCircle2, Clock, UploadCloud, FileCheck, Phone, X, AlertCircle
} from 'lucide-react';
import WhatsappDispatcherModal from '@/components/admin/WhatsappDispatcherModal';
import { toast } from 'sonner';
import { createPortal } from 'react-dom';

export const dynamic = 'force-dynamic';

export default function AffiliatePayoutPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Metrics
  const [metrics, setMetrics] = useState({
    totalPendingAmount: 0,
    totalProcessedAmount: 0,
    activeAffiliatesLiability: 0,
  });

  // Modal states
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [proofUrl, setProofUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const [waMessage, setWaMessage] = useState('');
  const [waTarget, setWaTarget] = useState({ name: '', phone: '' });

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('payout_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      if (data) {
        setPayouts(data);
        
        let pending = 0;
        let processed = 0;
        data.forEach(item => {
          if (item.status === 'PENDING' || item.status === 'pending') {
            pending += Number(item.amount);
          } else if (item.status === 'PROCESSED' || item.status === 'completed') {
            processed += Number(item.amount);
          }
        });

        // Calculate real liability: (Total Premium Referred * 19600) - Processed
        const { count: referredCount } = await supabase
          .from('merchants')
          .select('*', { count: 'exact', head: true })
          .not('referred_by', 'is', null)
          .eq('is_premium', true);
          
        const totalHistoricalCommissions = (referredCount || 0) * 19600;
        const liability = totalHistoricalCommissions - processed;

        setMetrics({
          totalPendingAmount: pending,
          totalProcessedAmount: processed,
          activeAffiliatesLiability: liability
        });
      }
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengambil data payout');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Real-time subscription
    const channel = supabase
      .channel('public:payout_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payout_requests' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const handleOpenConfirm = (payout: any) => {
    setSelectedPayout(payout);
    setProofUrl('');
    setIsConfirmModalOpen(true);
  };

  const submitConfirmation = async () => {
    if (!selectedPayout) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('payout_requests')
        .update({ 
          status: 'PROCESSED', 
          proof_image_url: proofUrl, 
          processed_at: new Date().toISOString() 
        })
        .eq('id', selectedPayout.id);

      if (error) throw error;
      toast.success('Pencairan komisi berhasil dikonfirmasi');
      setIsConfirmModalOpen(false);
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error('Gagal konfirmasi transfer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openWaDispatcher = (payout: any) => {
    const msg = `Halo ${payout.account_name || payout.merchant_name},\n\nPenarikan komisi afiliasi UBOS sebesar ${formatIDR(payout.amount)} telah sukses ditransfer ke rekening ${payout.bank_name} (${payout.account_number}) Anda.\n\nTerima kasih atas kemitraannya! Bukti transfer: ${payout.proof_image_url || 'Terlampir'}`;
    setWaTarget({ name: payout.account_name || payout.merchant_name || 'Mitra', phone: payout.whatsapp || '' });
    setWaMessage(msg);
    setIsWaModalOpen(true);
  };

  const ConfirmModal = () => {
    if (!isConfirmModalOpen || !mounted) return null;
    return createPortal(
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsConfirmModalOpen(false)}></div>
        <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
          <div className="p-5 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-white flex items-center gap-2">
              <UploadCloud size={18} className="text-emerald-400" />
              Konfirmasi Transfer
            </h3>
            <button onClick={() => setIsConfirmModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Transfer ke:</p>
              <p className="text-white font-bold">{selectedPayout?.bank_name} - {selectedPayout?.account_number}</p>
              <p className="text-white">{selectedPayout?.account_name}</p>
              <p className="text-emerald-400 font-bold text-lg mt-2">{formatIDR(selectedPayout?.amount || 0)}</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Link Bukti Transfer (URL)</label>
              <input 
                type="text" 
                value={proofUrl}
                onChange={e => setProofUrl(e.target.value)}
                placeholder="https://... (Opsional)"
                className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <button 
              onClick={submitConfirmation}
              disabled={isSubmitting}
              className="mt-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Memproses...' : 'Konfirmasi Selesai'}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 px-4 md:px-6">
      
      <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-[2rem]">
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Affiliate Payouts</h1>
        <p className="text-slate-400">Manajemen antrean withdrawal komisi afiliasi 40% secara real-time.</p>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Clock size={16} className="text-amber-400" />
            </div>
            <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Antrean Payout</span>
          </div>
          <span className="text-3xl font-black text-white">{formatIDR(metrics.totalPendingAmount)}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 size={16} className="text-emerald-400" />
            </div>
            <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Telah Dicairkan</span>
          </div>
          <span className="text-3xl font-black text-white">{formatIDR(metrics.totalProcessedAmount)}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <DollarSign size={100} />
          </div>
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <AlertCircle size={16} className="text-blue-400" />
            </div>
            <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Liabilitas Aktif</span>
          </div>
          <span className="text-3xl font-black text-white relative z-10">{formatIDR(metrics.activeAffiliatesLiability)}</span>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileCheck size={18} className="text-blue-400" />
            Antrean Penarikan Komisi
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-xs uppercase font-bold text-slate-400">
              <tr>
                <th className="px-6 py-4">Waktu Request</th>
                <th className="px-6 py-4">Mitra / Toko</th>
                <th className="px-6 py-4">Rekening Tujuan</th>
                <th className="px-6 py-4">Jumlah (Rp)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Memuat data...</td>
                </tr>
              ) : payouts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Tidak ada pengajuan pencairan saat ini.</td>
                </tr>
              ) : (
                payouts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(p.created_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-white">{p.account_name || p.merchant_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-blue-400">{p.bank_name}</span><br/>
                      <span className="text-xs">{p.account_number}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-black text-white">{formatIDR(p.amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        (p.status === 'PENDING' || p.status === 'pending') ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                        (p.status === 'PROCESSED' || p.status === 'completed') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      {(p.status === 'PENDING' || p.status === 'pending') && (
                        <button 
                          onClick={() => handleOpenConfirm(p)}
                          className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <CheckCircle2 size={14} /> Konfirmasi Transfer
                        </button>
                      )}
                      {(p.status === 'PROCESSED' || p.status === 'completed') && (
                        <button 
                          onClick={() => openWaDispatcher(p)}
                          className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <Phone size={14} /> Kirim WA
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal />

      <WhatsappDispatcherModal 
        isOpen={isWaModalOpen}
        onClose={() => setIsWaModalOpen(false)}
        targetName={waTarget.name}
        targetPhone={waTarget.phone}
        merchantStatus="Afiliasi"
        customMessageTemplate={waMessage}
      />
    </div>
  );
}
