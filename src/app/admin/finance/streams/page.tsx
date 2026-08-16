'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { 
  LineChart, Activity, Cpu, Briefcase, FileCode2, Share2, 
  Plus, History, DollarSign, X, CheckCircle2 
} from 'lucide-react';
import { toast } from 'sonner';
import { createPortal } from 'react-dom';

export const dynamic = 'force-dynamic';

const STREAMS = [
  { id: 'UBOS Core', label: 'Langganan UBOS Core', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/20' },
  { id: 'Hardware', label: 'Komisi Hardware (Shopee)', icon: Cpu, color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/20' },
  { id: 'Jasa Digital', label: 'Layanan Jasa & Ads', icon: Briefcase, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/20' },
  { id: 'Template', label: 'Template Bisnis', icon: FileCode2, color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/20' },
  { id: 'Transaction Fee', label: 'Ekosistem Transaction Fee', icon: Share2, color: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/20' }
];

export default function RevenueStreamsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [streamStats, setStreamStats] = useState<Record<string, { gross: number, cut: number, net: number }>>({});
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    stream_category: 'Hardware',
    source_name: '',
    gross_amount: '',
    affiliate_cut: ''
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (error) throw error;

      if (data) {
        setTransactions(data);
        
        const stats: Record<string, { gross: number, cut: number, net: number }> = {};
        STREAMS.forEach(s => {
          stats[s.id] = { gross: 0, cut: 0, net: 0 };
        });

        data.forEach(tx => {
          const cat = tx.stream_category;
          if (stats[cat]) {
            stats[cat].gross += Number(tx.gross_amount || 0);
            stats[cat].cut += Number(tx.affiliate_cut || 0);
            stats[cat].net += Number(tx.net_profit || 0);
          }
        });

        setStreamStats(stats);
      }
    } catch (e) {
      console.error(e);
      toast.error('Gagal memuat data transaksi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel('public:financial_transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'financial_transactions' }, () => {
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

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const gross = Number(formData.gross_amount);
      const cut = Number(formData.affiliate_cut || 0);
      const net = gross - cut;

      const { error } = await supabase
        .from('financial_transactions')
        .insert([{
          stream_category: formData.stream_category,
          source_name: formData.source_name,
          gross_amount: gross,
          affiliate_cut: cut,
          net_profit: net,
          status: 'SETTLED'
        }]);
      
      if (error) throw error;
      toast.success('Transaksi berhasil dicatat');
      setIsModalOpen(false);
      setFormData({ stream_category: 'Hardware', source_name: '', gross_amount: '', affiliate_cut: '' });
      fetchData();
    } catch (e: any) {
      console.error(e);
      toast.error('Gagal mencatat transaksi: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ManualTransactionModal = () => {
    if (!isModalOpen || !mounted) return null;
    return createPortal(
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
        <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
          <div className="p-5 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Plus size={18} className="text-emerald-400" />
              Catat Transaksi Manual
            </h3>
            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleManualSubmit} className="p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Kategori Stream</label>
              <select 
                required
                value={formData.stream_category}
                onChange={e => setFormData({...formData, stream_category: e.target.value})}
                className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              >
                {STREAMS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Sumber Dana / Keterangan</label>
              <input 
                required
                type="text"
                placeholder="Contoh: Shopee Aff - Printer Bluetooth"
                value={formData.source_name}
                onChange={e => setFormData({...formData, source_name: e.target.value})}
                className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Gross Amount (Rp)</label>
                <input 
                  required
                  type="number"
                  min="0"
                  value={formData.gross_amount}
                  onChange={e => setFormData({...formData, gross_amount: e.target.value})}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Beban Komisi (Rp)</label>
                <input 
                  type="number"
                  min="0"
                  value={formData.affiliate_cut}
                  onChange={e => setFormData({...formData, affiliate_cut: e.target.value})}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl mt-2 flex justify-between items-center">
              <span className="text-emerald-400 font-bold text-sm">Net Profit (Estimasi)</span>
              <span className="text-emerald-400 font-black text-xl">
                {formatIDR((Number(formData.gross_amount) || 0) - (Number(formData.affiliate_cut) || 0))}
              </span>
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
            </button>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 px-4 md:px-6">
      <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-[2rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
            <LineChart className="text-emerald-400" size={32} />
            Revenue Streams
          </h1>
          <p className="text-slate-400">Visualisasi & Log 5 Aliran Pendapatan Utama Logaritma secara Real-Time.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shrink-0"
        >
          <Plus size={18} /> Catat Transaksi
        </button>
      </div>

      {/* 5 STREAM CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {STREAMS.map(stream => {
          const stat = streamStats[stream.id] || { gross: 0, cut: 0, net: 0 };
          return (
            <div key={stream.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col relative overflow-hidden group hover:border-slate-700 transition-colors">
              <div className={`absolute top-0 right-0 w-24 h-24 ${stream.bg} blur-2xl rounded-bl-full -mr-10 -mt-10 transition-opacity opacity-50 group-hover:opacity-100`}></div>
              
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <div className={`w-8 h-8 rounded-full ${stream.bg} flex items-center justify-center`}>
                  <stream.icon size={16} className={stream.color} />
                </div>
                <span className="text-slate-300 text-sm font-bold tracking-tight">{stream.label}</span>
              </div>
              
              <div className="relative z-10 flex flex-col gap-1 mt-auto">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Net Profit</span>
                  <span className="text-lg font-black text-white">{formatIDR(stat.net)}</span>
                </div>
                <div className="w-full h-[1px] bg-slate-800 my-1"></div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Gross</span>
                  <span className="text-slate-400 font-medium">{formatIDR(stat.gross)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Cut</span>
                  <span className="text-rose-400 font-medium">{formatIDR(stat.cut)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <History size={18} className="text-blue-400" />
            Log Mutasi Kas Masuk Terakhir
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-xs uppercase font-bold text-slate-400">
              <tr>
                <th className="px-6 py-4">Waktu Transaksi</th>
                <th className="px-6 py-4">Kategori Stream</th>
                <th className="px-6 py-4">Sumber / Keterangan</th>
                <th className="px-6 py-4 text-right">Gross (Rp)</th>
                <th className="px-6 py-4 text-right">Beban Bagi Hasil</th>
                <th className="px-6 py-4 text-right">Net Masuk (Rp)</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Memuat data transaksi...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Belum ada transaksi tercatat.</td>
                </tr>
              ) : (
                transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(tx.transaction_date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-white bg-slate-800 px-2.5 py-1 rounded-md text-xs">{tx.stream_category}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-300">{tx.source_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-slate-400">{formatIDR(tx.gross_amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-rose-400">-{formatIDR(tx.affiliate_cut)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-black text-emerald-400">{formatIDR(tx.net_profit)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold tracking-wider">
                        <CheckCircle2 size={10} className="inline mr-1" />{tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ManualTransactionModal />
    </div>
  );
}
