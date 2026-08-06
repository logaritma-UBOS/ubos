'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  Users, Clock, Activity, Crown, TrendingUp, BarChart3,
  DollarSign, ShoppingCart, Megaphone, Code2, Printer,
  ArrowRight, Sparkles, Loader2, RefreshCw, Target, ChevronRight,
  CheckCircle2, Zap
} from 'lucide-react';
import Link from 'next/link';

const REVENUE_STREAMS = [
  { id: 'saas', label: 'SaaS Subscription', icon: Crown, color: 'blue', target: 5000000, unit: '/bln' },
  { id: 'cetak', label: 'Cetak & Branding', icon: Printer, color: 'indigo', target: 2000000, unit: '/bln' },
  { id: 'ads', label: 'Meta Ads Management', icon: Megaphone, color: 'purple', target: 3000000, unit: '/bln' },
  { id: 'shopee', label: 'Shopee Affiliate', icon: ShoppingCart, color: 'amber', target: 1000000, unit: '/bln' },
  { id: 'custom', label: 'Custom System Project', icon: Code2, color: 'emerald', target: 10000000, unit: '/project' },
];

const colorClasses: Record<string, { bg: string; text: string; bar: string; border: string }> = {
  blue:    { bg: 'bg-blue-500/10',    text: 'text-blue-400',    bar: 'from-blue-600 to-blue-400',    border: 'border-blue-500/20' },
  indigo:  { bg: 'bg-indigo-500/10',  text: 'text-indigo-400',  bar: 'from-indigo-600 to-indigo-400', border: 'border-indigo-500/20' },
  purple:  { bg: 'bg-purple-500/10',  text: 'text-purple-400',  bar: 'from-purple-600 to-purple-400', border: 'border-purple-500/20' },
  amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-400',   bar: 'from-amber-600 to-amber-400',   border: 'border-amber-500/20' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', bar: 'from-emerald-600 to-emerald-400', border: 'border-emerald-500/20' },
};

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState({
    totalVisitors: 0,
    registerClicks: 0,
    whatsappClicks: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        { data: merchantData },
        { data: txData },
        { count: totalVisitors },
        { count: registerClicks },
        { count: waClicks },
      ] = await Promise.all([
        supabase.from('merchants').select('*').order('created_at', { ascending: false }),
        supabase.from('cash_transactions').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'page_view'),
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'click_cta_register'),
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'click_wa_consultation'),
      ]);
      if (merchantData) setMerchants(merchantData);
      if (txData) setTransactions(txData);
      setAnalyticsData({
        totalVisitors: totalVisitors ?? 0,
        registerClicks: registerClicks ?? 0,
        whatsappClicks: waClicks ?? 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const now = Date.now();

  const metrics = useMemo(() => {
    let active = 0, vvip = 0, expired = 0, today = 0;
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    merchants.forEach(m => {
      const exp = m.trial_expires_at ? new Date(m.trial_expires_at).getTime() : 0;
      const isVVIP = exp > now + 3000 * 24 * 60 * 60 * 1000;
      if (isVVIP) vvip++;
      else if (exp > now) active++;
      else expired++;
      if (m.last_active_at && new Date(m.last_active_at).getTime() >= startOfToday.getTime()) today++;
    });
    return { total: merchants.length, active, vvip, expired, today };
  }, [merchants, now]);

  const finMetrics = useMemo(() => {
    let inflow = 0, outflow = 0;
    transactions.forEach(tx => {
      if (tx.type === 'IN') inflow += Number(tx.amount);
      else outflow += Number(tx.amount);
    });
    return { inflow, outflow, balance: inflow - outflow };
  }, [transactions]);

  const saasRevenue = metrics.vvip * 49000;
  const totalNetRevenue = saasRevenue + finMetrics.inflow;

  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;
  const fmtK = (n: number) => n >= 1000000 ? `Rp ${(n/1000000).toFixed(1)}jt` : `Rp ${n.toLocaleString('id-ID')}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-slate-600" />
      </div>
    );
  }

  const conversionRate = analyticsData.totalVisitors > 0
    ? ((analyticsData.registerClicks / analyticsData.totalVisitors) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Dashboard Overview</h2>
          <p className="text-sm text-slate-400 font-medium">Profit Target & 5 Revenue Stream Tracker</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold text-slate-300 transition-colors"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Merchants', value: metrics.total, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Trial Aktif', value: metrics.active, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Premium (VVIP)', value: metrics.vvip, icon: Crown, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
          { label: 'Aktif Hari Ini', value: metrics.today, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        ].map((s, i) => (
          <div key={i} className={`p-5 rounded-2xl border ${s.bg}`}>
            <s.icon size={20} className={`${s.color} mb-3`} />
            <p className="text-3xl font-black text-white">{s.value}</p>
            <p className="text-xs text-slate-400 font-bold mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* 5 Revenue Streams Profit Tracker */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Target size={20} className="text-emerald-400" /> 5 Keran Pendapatan Logaritma
            </h3>
            <p className="text-sm text-slate-500 mt-1">Net Profit target tracker per revenue stream</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 font-bold uppercase">Est. Net Revenue</p>
            <p className="text-2xl font-black text-emerald-400">{fmtK(totalNetRevenue)}</p>
          </div>
        </div>

        <div className="space-y-4">
          {REVENUE_STREAMS.map(stream => {
            const colors = colorClasses[stream.color];
            let current = 0;
            if (stream.id === 'saas') current = saasRevenue;
            const pct = Math.min(Math.round((current / stream.target) * 100), 100);
            return (
              <div key={stream.id} className={`p-4 rounded-2xl border ${colors.bg} ${colors.border}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${colors.bg} flex items-center justify-center border ${colors.border}`}>
                      <stream.icon size={18} className={colors.text} />
                    </div>
                    <div>
                      <p className="font-black text-white text-sm">{stream.label}</p>
                      <p className="text-xs text-slate-500">Target: {fmtK(stream.target)}{stream.unit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-black ${colors.text}`}>{pct}%</p>
                    <p className="text-xs text-slate-500">{fmtK(current)} tercapai</p>
                  </div>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className={`h-full bg-gradient-to-r ${colors.bar} rounded-full transition-all duration-700`}
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analytics + Quick Links */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Analytics */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <h3 className="font-black text-white mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-400" /> Landing Page Funnel
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Total Page Views', value: analyticsData.totalVisitors, icon: Activity, color: 'text-slate-300' },
              { label: 'Register CTA Clicks', value: analyticsData.registerClicks, icon: CheckCircle2, color: 'text-blue-400' },
              { label: 'WA Consultation Clicks', value: analyticsData.whatsappClicks, icon: TrendingUp, color: 'text-emerald-400' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <stat.icon size={16} className={stat.color} />
                  <span className="text-sm text-slate-300 font-bold">{stat.label}</span>
                </div>
                <span className="font-black text-white">{stat.value.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <Zap size={16} className="text-purple-400" />
                <span className="text-sm text-purple-300 font-bold">Conversion Rate</span>
              </div>
              <span className="font-black text-purple-400">{conversionRate}%</span>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <h3 className="font-black text-white mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-purple-400" /> Quick Navigation
          </h3>
          <div className="space-y-3">
            {[
              { href: '/admin/marketing', label: 'Extreme Funneling Dashboard', desc: 'Cold, Warm & Hot Market Tracker + Fonnte WA', color: 'text-purple-400', bg: 'hover:bg-purple-500/5 hover:border-purple-500/30' },
              { href: '/admin/services', label: 'Ecosystem Services Hub', desc: 'Cetak, Meta Ads, Shopee Affiliate, Custom Project', color: 'text-emerald-400', bg: 'hover:bg-emerald-500/5 hover:border-emerald-500/30' },
              { href: '/admin/finance', label: 'Finance & Payouts', desc: 'Transaksi, komisi affiliate, net margin', color: 'text-amber-400', bg: 'hover:bg-amber-500/5 hover:border-amber-500/30' },
            ].map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className={`flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 transition-all group ${link.bg}`}
              >
                <div>
                  <p className={`font-black text-sm ${link.color}`}>{link.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{link.desc}</p>
                </div>
                <ChevronRight size={16} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-black text-white flex items-center gap-2">
              <DollarSign size={18} className="text-amber-400" /> Transaksi Terbaru
            </h3>
            <Link href="/admin/finance" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
              Lihat Semua <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-800/50">
            {transactions.slice(0, 5).map(tx => (
              <div key={tx.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-bold text-slate-200">{tx.category}</p>
                  <p className="text-xs text-slate-500">{tx.description || '-'} · {tx.transaction_date}</p>
                </div>
                <p className={`font-black text-sm ${tx.type === 'IN' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {tx.type === 'IN' ? '+' : '-'}{fmt(Number(tx.amount))}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
