'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { DollarSign, Briefcase, Plus, TrendingUp, AlertCircle, PieChart, Activity, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function FounderTreasuryPage() {
  const [shares, setShares] = useState<any[]>([]);
  const [opex, setOpex] = useState<any[]>([]);
  const [injections, setInjections] = useState<any[]>([]);
  const [modalDisetor, setModalDisetor] = useState(0);
  const [revenueMayar, setRevenueMayar] = useState(0);
  const [loading, setLoading] = useState(true);

  // Suntik Modal State
  const [showInjectModal, setShowInjectModal] = useState(false);
  const [injectData, setInjectData] = useState({ founder_name: 'Baim', amount: 0, notes: '' });

  // OPEX State
  const [showOpexModal, setShowOpexModal] = useState(false);
  const [opexData, setOpexData] = useState({ expense_name: '', amount: 0, due_date: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [sharesRes, opexRes, injectionsRes, txRes] = await Promise.all([
        supabase.from('founder_shares').select('*').order('created_at', { ascending: true }),
        supabase.from('fixed_monthly_opex').select('*').order('due_date', { ascending: true }),
        supabase.from('capital_injections').select('*').order('created_at', { ascending: false }),
        supabase.from('financial_transactions').select('net_profit')
      ]);

      setShares(sharesRes.data || []);
      setOpex(opexRes.data || []);
      setInjections(injectionsRes.data || []);

      let modal = 0;
      sharesRes.data?.forEach(s => modal += Number(s.initial_capital || 0));
      injectionsRes.data?.forEach(i => modal += Number(i.amount || 0));

      let revenue = 0;
      txRes.data?.forEach(t => revenue += Number(t.net_profit || 0));
      
      setModalDisetor(modal);
      setRevenueMayar(revenue);

    } catch (error: any) {
      toast.error('Gagal memuat data treasury');
    } finally {
      setLoading(false);
    }
  };

  const handleInjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (injectData.amount <= 0) return toast.error('Jumlah tidak valid');

    try {
      await supabase.from('capital_injections').insert([injectData]);
      toast.success('Modal berhasil ditambahkan!');
      setShowInjectModal(false);
      setInjectData({ founder_name: 'Baim', amount: 0, notes: '' });
      fetchData();
    } catch (err) {
      toast.error('Gagal menyuntik modal');
    }
  };

  const handleOpexSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (opexData.amount <= 0 || !opexData.expense_name) return toast.error('Data OPEX tidak valid');

    try {
      await supabase.from('fixed_monthly_opex').insert([opexData]);
      toast.success('Tagihan OPEX berhasil ditambahkan!');
      setShowOpexModal(false);
      setOpexData({ expense_name: '', amount: 0, due_date: '' });
      fetchData();
    } catch (err) {
      toast.error('Gagal menambah OPEX');
    }
  };

  const markOpexPaid = async (id: string) => {
    try {
      await supabase.from('fixed_monthly_opex').update({ status: 'PAID' }).eq('id', id);
      toast.success('OPEX ditandai LUNAS');
      fetchData();
    } catch (err) {
      toast.error('Gagal update OPEX');
    }
  };
  
  const updateRoyaltyPercentage = async (id: string, newPercentage: string) => {
    try {
      await supabase.from('founder_shares').update({ royalty_percentage: Number(newPercentage) }).eq('id', id);
      toast.success('Persentase berhasil diupdate');
      fetchData();
    } catch (err) {
      toast.error('Gagal update persentase');
    }
  };

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/30">
              <Briefcase size={20} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Treasury & Royalty Engine</h1>
          </div>
          <p className="text-slate-400 text-sm">Pemantauan kas utama perusahaan, OPEX bulanan, dan distribusi pembagian hasil Mayar.id.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0">
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex flex-col justify-between items-start min-w-[240px]">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">MODAL DISETOR (KAS AWAL)</p>
              <p className="text-3xl font-black text-white">{formatIDR(modalDisetor)}</p>
            </div>
            <p className="text-[10px] text-slate-500 mt-3">Suntikan founder untuk operasional</p>
          </div>
          <div className="bg-gradient-to-br from-blue-900/20 to-slate-950 border border-blue-500/30 p-5 rounded-xl flex flex-col justify-between items-start min-w-[320px] shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <div className="w-full flex justify-between items-start mb-2">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">SALDO REVENUE MAYAR</p>
              <a href="https://wallet.mayar.id" target="_blank" rel="noopener noreferrer" className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded flex items-center gap-1 font-bold transition-all shadow-sm">
                Buka Wallet ↗
              </a>
            </div>
            <p className="text-3xl font-black text-white">{formatIDR(revenueMayar)}</p>
            <div className="flex items-center justify-between gap-2 mt-4 w-full">
              <div className="flex-1 text-[10px] font-bold px-2.5 py-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-center">
                🟢 Siap Tarik: Rp 0
              </div>
              <div className="flex-1 text-[10px] font-bold px-2.5 py-1.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-center">
                🟡 Pending: Rp 0
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Modal & Founder Shares */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <PieChart size={18} className="text-blue-400" /> Porsi Kepemilikan & Royalti
              </h2>
              <button 
                onClick={() => setShowInjectModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus size={14} /> Suntik Modal
              </button>
            </div>
            
            <div className="space-y-4">
              {shares.map(s => {
                const totalInjected = injections.filter(i => i.founder_name === s.name).reduce((sum, i) => sum + Number(i.amount), 0);
                const currentCapital = Number(s.initial_capital) + totalInjected;
                
                return (
                  <div key={s.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white">{s.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1">Modal Masuk</p>
                        <p className="font-mono text-emerald-400 font-bold">{formatIDR(currentCapital)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-800/50">
                      <p className="text-xs text-slate-400">Porsi Royalti (Otomatis Mayar):</p>
                      <input 
                        type="number" 
                        defaultValue={s.royalty_percentage}
                        onBlur={(e) => updateRoyaltyPercentage(s.id, e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-white text-xs text-center w-16 px-2 py-1 rounded"
                      />
                      <span className="text-xs text-slate-400">%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* OPEX Tracking */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Activity size={18} className="text-rose-400" /> Radar OPEX Bulanan
              </h2>
              <button 
                onClick={() => setShowOpexModal(true)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus size={14} /> Tagihan Baru
              </button>
            </div>

            <div className="space-y-3">
              {opex.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-6">Belum ada tanggungan OPEX.</p>
              ) : (
                opex.map(o => (
                  <div key={o.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">{o.expense_name}</p>
                      <p className="text-xs text-rose-400 font-mono mt-1">{formatIDR(o.amount)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {o.status === 'PAID' ? (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded text-[10px] font-black tracking-wider uppercase">
                          LUNAS
                        </span>
                      ) : (
                        <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-1 rounded text-[10px] font-black tracking-wider uppercase">
                          Jatuh Tempo: {o.due_date ? new Date(o.due_date).toLocaleDateString('id-ID') : '-'}
                        </span>
                      )}
                      
                      {o.status === 'UNPAID' && (
                        <button 
                          onClick={() => markOpexPaid(o.id)}
                          className="text-xs text-blue-400 hover:text-blue-300 font-bold"
                        >
                          Tandai Lunas
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showInjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Suntik Modal Baru</h3>
            <form onSubmit={handleInjectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Founder (Penyuntik)</label>
                <select 
                  value={injectData.founder_name}
                  onChange={e => setInjectData({...injectData, founder_name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2"
                >
                  <option value="Baim">Baim</option>
                  <option value="Tony Herman">Tony Herman</option>
                  <option value="Reza">Reza</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nominal (Rp)</label>
                <input 
                  type="number" 
                  required
                  value={injectData.amount || ''}
                  onChange={e => setInjectData({...injectData, amount: Number(e.target.value)})}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Catatan</label>
                <input 
                  type="text" 
                  value={injectData.notes}
                  onChange={e => setInjectData({...injectData, notes: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2"
                  placeholder="Misal: Top up server..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowInjectModal(false)} className="px-4 py-2 text-slate-400 hover:text-white">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showOpexModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Tambah Tagihan OPEX</h3>
            <form onSubmit={handleOpexSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nama Pengeluaran</label>
                <input 
                  type="text" 
                  required
                  value={opexData.expense_name}
                  onChange={e => setOpexData({...opexData, expense_name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2"
                  placeholder="Fonnte / Domain / FB Ads"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Estimasi Biaya (Rp)</label>
                <input 
                  type="number" 
                  required
                  value={opexData.amount || ''}
                  onChange={e => setOpexData({...opexData, amount: Number(e.target.value)})}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Tanggal Jatuh Tempo</label>
                <input 
                  type="date" 
                  value={opexData.due_date}
                  onChange={e => setOpexData({...opexData, due_date: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowOpexModal(false)} className="px-4 py-2 text-slate-400 hover:text-white">Batal</button>
                <button type="submit" className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
