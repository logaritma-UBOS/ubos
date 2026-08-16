'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Subscription {
  id: string;
  merchant: { nama_usaha: string };
  plan_name: string;
  amount: number;
  status: string;
  start_date: string;
}

export default function FinanceMRRPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, merchant:merchant_id(nama_usaha)')
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error: any) {
      toast.error('Gagal memuat MRR data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  const activeMRR = subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + Number(s.amount), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/30">
              <DollarSign size={20} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Real-time MRR</h1>
          </div>
          <p className="text-slate-400 text-sm">Monitor Monthly Recurring Revenue dan Subscription UMKM.</p>
        </div>
        <div className="bg-slate-950 border border-indigo-500/20 p-4 rounded-xl flex flex-col items-end">
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Total Active MRR</p>
          <p className="text-2xl font-black text-white">{formatCurrency(activeMRR)}</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950/50 text-slate-300 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Merchant</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Start Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 animate-pulse">Memuat data transaksi...</td></tr>
              ) : subscriptions.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Belum ada subscription aktif.</td></tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">
                      {sub.merchant?.nama_usaha || 'Unknown Merchant'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded text-[10px] font-black uppercase">
                        {sub.plan_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-400">{formatCurrency(sub.amount)}</td>
                    <td className="px-6 py-4">
                      {sub.status === 'active' ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                          <CheckCircle2 size={14} /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-slate-500 text-xs font-bold">
                          <Clock size={14} /> {sub.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-xs text-slate-500">
                      {new Date(sub.start_date).toLocaleDateString('id-ID')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
