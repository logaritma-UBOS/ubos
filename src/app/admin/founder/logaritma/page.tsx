'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { buildLogaritmaState, RawTransaction, RawProduct } from '@/core/logaritma';
import { Activity, AlertTriangle, ArrowRight, Package, Users, Zap, Briefcase, Bot } from 'lucide-react';

interface MerchantData {
  id: string;
  nama_usaha: string;
  kategori_usaha: string;
  created_at: string;
}

interface MerchantMonitoring {
  merchant: MerchantData;
  state: any; // LogaritmaState
}

export default function OwnerMonitoringLayer() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MerchantMonitoring[]>([]);

  useEffect(() => {
    async function loadMonitoring() {
      setLoading(true);
      try {
        // 1. Fetch Merchants
        const { data: merchants } = await supabase.from('merchants').select('id, nama_usaha, kategori_usaha, created_at').order('created_at', { ascending: false });
        if (!merchants) return;

        // 2. Fetch all transactions today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const { data: transactions } = await supabase
          .from('transactions')
          .select('*')
          .gte('created_at', today.toISOString())
          .lt('created_at', tomorrow.toISOString());

        // 3. Fetch all products
        const { data: products } = await supabase.from('products').select('*');

        const txs = transactions || [];
        const prods = products || [];

        const monitoringData: MerchantMonitoring[] = merchants.map(m => {
          const mTx = txs.filter(t => t.merchant_id === m.id);
          const mProd = prods.filter(p => p.merchant_id === m.id);

          const umurAkunHari = Math.max(1, Math.floor((new Date().getTime() - new Date(m.created_at).getTime()) / (1000 * 3600 * 24)));
          
          // Fixed config for baseline owner monitoring
          const config = { targetProfitMonthly: 5000000, budgetBelanjaDaily: 300000 };

          const state = buildLogaritmaState(
            config,
            mTx,
            mProd,
            { kategoriUsaha: m.kategori_usaha, umurAkunHari }
          );

          return { merchant: m, state };
        });

        setData(monitoringData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMonitoring();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400 gap-3">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-600 border-t-blue-500"></div>
        <span>Memuat Logaritma Monitoring Engine...</span>
      </div>
    );
  }

  // Aggregation
  const activeCount = data.filter(d => d.state.daily.totalTransactions > 0).length;
  const criticalCount = data.filter(d => d.state.primaryAction?.priority === 'CRITICAL').length;
  const decliningCount = data.filter(d => d.state.primaryAction?.id === 'low_margin' || d.state.primaryAction?.id === 'sales_gap_high').length;
  const inactiveCount = data.filter(d => d.state.daily.totalTransactions === 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Logaritma AI Monitoring</h1>
          <p className="text-slate-400 text-sm">Owner Level Aggregation - Business Status & AI Actions</p>
        </div>
        <div className="bg-blue-500/10 text-blue-400 px-4 py-2 rounded-xl border border-blue-500/20 font-bold flex items-center gap-2">
          <Bot size={18} /> Engine Active
        </div>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Total Bisnis</p>
          <p className="text-2xl font-black text-white">{data.length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Aktif Hari Ini</p>
          <p className="text-2xl font-black text-emerald-400">{activeCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Kritis (CRITICAL GAP)</p>
          <p className="text-2xl font-black text-red-400">{criticalCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Tidak Aktif</p>
          <p className="text-2xl font-black text-slate-500">{inactiveCount}</p>
        </div>
      </div>

      {/* List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 font-bold text-slate-300">
          Status & AI Recommendation per Merchant
        </div>
        <div className="divide-y divide-slate-800/50">
          {data.map((row, i) => {
            const { merchant, state } = row;
            const action = state.primaryAction;

            return (
              <div key={i} className="p-4 hover:bg-slate-800/50 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-lg">{merchant.nama_usaha}</h3>
                  <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                    <span className="bg-slate-800 px-2 py-1 rounded text-slate-300">{merchant.kategori_usaha}</span>
                    <span>{state.daily.totalTransactions} Transaksi Hari Ini</span>
                    <span>Omzet: Rp {state.daily.dailyOmzet.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 min-w-[300px]">
                  {action ? (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[10px] font-black tracking-wider px-2 py-0.5 rounded uppercase ${
                          action.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                          action.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          GAP: {action.priority}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">ACT: {action.tindakan}</span>
                      </div>
                      <p className="text-white text-sm font-bold mt-2">{action.judul}</p>
                      <p className="text-slate-400 text-xs mt-1 mb-3">{action.deskripsi}</p>
                      
                      <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                         <span className="text-[10px] text-slate-500 uppercase tracking-wider">Hasil Eksekusi</span>
                         <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                           {state.evaluationResult ? state.evaluationResult.kesimpulan : 'Data riwayat lokal (Tidak termonitor)'}
                         </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-emerald-400 text-sm font-bold flex items-center gap-2">
                      <Zap size={14} /> Bisnis Berjalan Optimal
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          {data.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              Belum ada data merchant.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
