'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  DollarSign, TrendingUp, TrendingDown, RefreshCw, Plus,
  Trash2, Loader2, CreditCard, ArrowUpRight, ArrowDownLeft,
  BarChart3, Wallet, X, Target, Percent, PiggyBank
} from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES_IN = ['SaaS Revenue', 'Cetak & Branding', 'Meta Ads Campaign', 'Shopee Affiliate Komisi', 'Custom Project DP', 'Custom Project Pelunasan', 'Modal Investor', 'Lainnya'];
const CATEGORIES_OUT = ['Infra / Server', 'Gaji / Honor', 'Marketing Cost', 'Operasional', 'Affiliate Payout', 'Lainnya'];

const STREAM_COLORS: Record<string, string> = {
  'SaaS Revenue': 'from-blue-600 to-blue-400',
  'Cetak & Branding': 'from-indigo-600 to-indigo-400',
  'Meta Ads Campaign': 'from-purple-600 to-purple-400',
  'Shopee Affiliate Komisi': 'from-amber-600 to-amber-400',
  'Custom Project DP': 'from-emerald-600 to-emerald-400',
  'Custom Project Pelunasan': 'from-emerald-500 to-teal-400',
};

export default function FinancePage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'transactions' | 'payout'>('overview');

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'OUT' as 'IN' | 'OUT',
    category: 'SaaS Revenue',
    description: '',
    amount: ''
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('cash_transactions')
        .select('*')
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });
      if (data) setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const metrics = useMemo(() => {
    let inflow = 0, outflow = 0;
    const byCategory: Record<string, number> = {};
    const monthlySeries: Record<string, { inflow: number; outflow: number }> = {};

    transactions.forEach(tx => {
      const amt = Number(tx.amount);
      if (tx.type === 'IN') inflow += amt;
      else outflow += amt;
      byCategory[tx.category] = (byCategory[tx.category] || 0) + amt;

      const month = (tx.transaction_date || '').slice(0, 7);
      if (month) {
        if (!monthlySeries[month]) monthlySeries[month] = { inflow: 0, outflow: 0 };
        if (tx.type === 'IN') monthlySeries[month].inflow += amt;
        else monthlySeries[month].outflow += amt;
      }
    });

    const netMargin = inflow > 0 ? Math.round(((inflow - outflow) / inflow) * 100) : 0;
    const affiliatePayouts = transactions.filter(t => t.category === 'Affiliate Payout');
    const affiliateTotal = affiliatePayouts.reduce((s, t) => s + Number(t.amount), 0);

    return { inflow, outflow, balance: inflow - outflow, byCategory, netMargin, affiliateTotal, affiliatePayouts, monthlySeries };
  }, [transactions]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('cash_transactions').insert([{
        transaction_date: form.date,
        type: form.type,
        category: form.category,
        description: form.description,
        amount: parseFloat(form.amount),
      }]);
      if (error) throw error;
      toast.success('Transaksi berhasil dicatat!');
      setIsModalOpen(false);
      setForm({ date: new Date().toISOString().split('T')[0], type: 'OUT', category: 'SaaS Revenue', description: '', amount: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan transaksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus transaksi ini?')) return;
    const { error } = await supabase.from('cash_transactions').delete().eq('id', id);
    if (error) { toast.error('Gagal menghapus.'); return; }
    toast.success('Transaksi dihapus.');
    fetchData();
  };

  const fmt = (n: number) => `Rp ${Math.abs(n).toLocaleString('id-ID')}`;

  const revenueStreams = ['SaaS Revenue', 'Cetak & Branding', 'Meta Ads Campaign', 'Shopee Affiliate Komisi', 'Custom Project DP', 'Custom Project Pelunasan'];

  const tabs = [
    { id: 'overview', label: 'Overview & Net Margin' },
    { id: 'transactions', label: 'Semua Transaksi' },
    { id: 'payout', label: 'Affiliate Payout Log' },
  ];

  const marginColor = metrics.netMargin >= 30 ? 'text-emerald-400' : metrics.netMargin >= 10 ? 'text-amber-400' : 'text-red-400';
  const marginBarColor = metrics.netMargin >= 30 ? 'from-emerald-600 to-emerald-400' : metrics.netMargin >= 10 ? 'from-amber-600 to-amber-400' : 'from-red-600 to-red-400';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Finance & Affiliate Payouts</h2>
          <p className="text-sm text-slate-400 font-medium">Monitoring transaksi, komisi, dan margin bersih Logaritma</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold text-slate-300 transition-colors">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Refresh
          </button>
          <button onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-colors">
            <Plus size={16} /> Catat Transaksi
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Inflow', value: fmt(metrics.inflow), icon: ArrowUpRight, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Total Outflow', value: fmt(metrics.outflow), icon: ArrowDownLeft, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
          { label: 'Net Balance', value: fmt(metrics.balance), icon: Wallet, color: metrics.balance >= 0 ? 'text-blue-400' : 'text-red-400', bg: metrics.balance >= 0 ? 'bg-blue-500/10 border-blue-500/20' : 'bg-red-500/10 border-red-500/20' },
          { label: 'Affiliate Payout', value: fmt(metrics.affiliateTotal), icon: PiggyBank, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
        ].map((s, i) => (
          <div key={i} className={`p-5 rounded-2xl border ${s.bg}`}>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-xs font-black uppercase tracking-wider ${s.color}`}>{s.label}</p>
              <s.icon size={18} className={s.color} />
            </div>
            <p className="text-2xl font-black text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-800">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveSection(t.id as any)}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all ${
              activeSection === t.id ? 'border-blue-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Net Margin Calculator */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <h3 className="font-black text-white mb-5 flex items-center gap-2">
              <Target size={18} className="text-emerald-400" /> Net Margin Calculator
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-slate-300">Net Margin</p>
                  <p className={`text-3xl font-black ${marginColor}`}>{metrics.netMargin}%</p>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-4">
                  <div className={`h-full bg-gradient-to-r ${marginBarColor} rounded-full transition-all duration-700 relative overflow-hidden`}
                    style={{ width: `${Math.min(Math.abs(metrics.netMargin), 100)}%` }}>
                    <div className="absolute inset-0 bg-white/10 animate-pulse rounded-full" />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>0%</span>
                  <span className={`font-bold ${metrics.netMargin >= 30 ? 'text-emerald-400' : metrics.netMargin >= 10 ? 'text-amber-400' : 'text-red-400'}`}>
                    {metrics.netMargin >= 30 ? '✓ Sehat' : metrics.netMargin >= 10 ? '⚠ Perlu Perhatian' : '✗ Merugi'}
                  </span>
                  <span>100%</span>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Gross Revenue', value: fmt(metrics.inflow), color: 'text-emerald-400' },
                  { label: 'Total Costs', value: `- ${fmt(metrics.outflow)}`, color: 'text-red-400' },
                  { label: 'Net Profit', value: fmt(metrics.balance), color: metrics.balance >= 0 ? 'text-blue-400' : 'text-red-400' },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                    <p className="text-sm text-slate-400 font-bold">{row.label}</p>
                    <p className={`font-black text-sm ${row.color}`}>{row.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h3 className="font-black text-white mb-5 flex items-center gap-2">
              <BarChart3 size={18} className="text-blue-400" /> Revenue Breakdown by Stream
            </h3>
            <div className="space-y-4">
              {revenueStreams.map(cat => {
                const amount = Object.entries(metrics.byCategory)
                  .filter(([k]) => k === cat)
                  .reduce((sum, [, v]) => sum + v, 0);
                const pct = metrics.inflow > 0 ? Math.round((amount / metrics.inflow) * 100) : 0;
                const gradient = STREAM_COLORS[cat] || 'from-slate-600 to-slate-400';
                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300 font-bold">{cat}</span>
                      <span className="font-black text-white">{fmt(amount)} <span className="text-slate-500 font-medium">({pct}%)</span></span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2.5">
                      <div className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-700`} style={{ width: `${Math.max(pct, 1)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TRANSACTIONS TAB */}
      {activeSection === 'transactions' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800">
          <div className="p-5 border-b border-slate-800">
            <h3 className="font-black text-white flex items-center gap-2">
              <CreditCard size={18} className="text-amber-400" /> Semua Transaksi ({transactions.length})
            </h3>
          </div>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-slate-600" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-800">
                  {['Tanggal', 'Kategori', 'Deskripsi', 'Jumlah', 'Aksi'].map(h => (
                    <th key={h} className="p-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-800/50">
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-800/30">
                      <td className="p-4 text-slate-400 text-xs font-mono">{tx.transaction_date}</td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
                          tx.type === 'IN' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'
                        }`}>{tx.category}</span>
                      </td>
                      <td className="p-4 text-slate-300 text-xs max-w-[200px] truncate">{tx.description || '-'}</td>
                      <td className={`p-4 font-black text-sm ${tx.type === 'IN' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {tx.type === 'IN' ? '+' : '-'}{fmt(Number(tx.amount))}
                      </td>
                      <td className="p-4">
                        <button onClick={() => handleDelete(tx.id)} className="p-2 text-slate-500 hover:text-red-400 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr><td colSpan={5} className="p-12 text-center text-slate-500">Belum ada transaksi</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PAYOUT TAB */}
      {activeSection === 'payout' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
              <p className="text-xs font-black text-purple-400 uppercase tracking-wider mb-2">Total Affiliate Payout</p>
              <p className="text-2xl font-black text-white">{fmt(metrics.affiliateTotal)}</p>
            </div>
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Jumlah Transaksi Payout</p>
              <p className="text-2xl font-black text-white">{metrics.affiliatePayouts.length}</p>
            </div>
          </div>
          <div className="bg-slate-900 rounded-2xl border border-slate-800">
            <div className="p-5 border-b border-slate-800">
              <h3 className="font-black text-white">Log Affiliate Payout</h3>
            </div>
            <div className="divide-y divide-slate-800/50">
              {metrics.affiliatePayouts.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-bold text-slate-200">{tx.description || 'Affiliate Payout'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{tx.transaction_date}</p>
                  </div>
                  <p className="font-black text-red-400">- {fmt(Number(tx.amount))}</p>
                </div>
              ))}
              {metrics.affiliatePayouts.length === 0 && (
                <div className="p-12 text-center text-slate-500">
                  <PiggyBank size={32} className="mx-auto mb-2 text-slate-700" />
                  <p>Belum ada catatan payout affiliate.</p>
                  <p className="text-xs mt-1">Gunakan kategori "Affiliate Payout" saat mencatat transaksi.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-white text-lg">Catat Transaksi Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Tipe</label>
                  <select value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value as any, category: e.target.value === 'IN' ? 'SaaS Revenue' : 'Infra / Server' }))}
                    className="w-full mt-1 px-3 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm">
                    <option value="IN">IN (Pemasukan)</option>
                    <option value="OUT">OUT (Pengeluaran)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Tanggal</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full mt-1 px-3 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Kategori</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full mt-1 px-3 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm">
                  {(form.type === 'IN' ? CATEGORIES_IN : CATEGORIES_OUT).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Deskripsi</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full mt-1 px-3 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm" placeholder="Detail transaksi..." />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Jumlah (Rp)</label>
                <input type="number" required value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full mt-1 px-3 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm" placeholder="0" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
