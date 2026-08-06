'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  Users, Activity, Flame, Snowflake, MessageCircle,
  Loader2, RefreshCw, Globe, Clock, Crown, Search,
  ChevronRight, BarChart3, ArrowRight, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { sendFonnteWA } from '@/lib/fonnte';

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'funnel' | 'cold' | 'warm' | 'hot' | 'channels'>('funnel');
  const [merchants, setMerchants] = useState<any[]>([]);
  const [visitorLogs, setVisitorLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSendingWA, setIsSendingWA] = useState<Record<string, boolean>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: merchantData }, { data: logs }] = await Promise.all([
        supabase.from('merchants').select('*').order('created_at', { ascending: false }),
        supabase.from('visitor_logs').select('*').order('visited_at', { ascending: false }).limit(200),
      ]);
      if (merchantData) setMerchants(merchantData);
      if (logs) setVisitorLogs(logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const now = Date.now();

  const coldVisitors = visitorLogs.filter(v => v.path === '/');
  const warmMerchants = merchants.filter(m => {
    const expires = m.trial_expires_at ? new Date(m.trial_expires_at).getTime() : 0;
    const isVVIP = expires > now + 3000 * 24 * 60 * 60 * 1000;
    return expires > now && !isVVIP;
  });
  const hotMerchants = merchants.filter(m => {
    const expires = m.trial_expires_at ? new Date(m.trial_expires_at).getTime() : 0;
    return expires > now + 3000 * 24 * 60 * 60 * 1000;
  });
  const expiredMerchants = merchants.filter(m => {
    const expires = m.trial_expires_at ? new Date(m.trial_expires_at).getTime() : 0;
    const isVVIP = expires > now + 3000 * 24 * 60 * 60 * 1000;
    return expires <= now && !isVVIP;
  });

  const channelCounts = visitorLogs.reduce((acc, v) => {
    const src = v.utm_source || 'Direct/Organic';
    acc[src] = (acc[src] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueIPs = new Set(visitorLogs.map(v => v.ip_address)).size;

  const trialDaysLeft = (m: any) => {
    if (!m.trial_expires_at) return 0;
    const diff = Math.ceil((new Date(m.trial_expires_at).getTime() - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const handleFollowUp = async (id: string, wa: string, name: string) => {
    setIsSendingWA(prev => ({ ...prev, [id]: true }));
    const loadingToast = toast.loading('Mengirim WA via Fonnte...');
    try {
      const clean = (wa || '').replace(/\D/g, '').replace(/^0+/, '62');
      const msg = `Halo kak dari ${name}! 👋 Ini dari tim Logaritma.\n\nMasa trial UBOS kamu masih aktif nih, udah dicoba belum fitur Kasir & HPP-nya? Kalau ada yang mau ditanyain, tim kita siap bantu ya!\n\n📲 Akses UBOS: https://ubos.app`;
      const res = await sendFonnteWA(clean, msg);
      if (res && res.status !== false) {
        toast.success('WA Follow-Up berhasil terkirim!', { id: loadingToast });
      } else {
        toast.error('Gagal kirim WA', { id: loadingToast });
      }
    } catch {
      toast.error('Error kirim WA', { id: loadingToast });
    } finally {
      setIsSendingWA(prev => ({ ...prev, [id]: false }));
    }
  };

  const filteredWarm = warmMerchants.filter(m =>
    (m.nama_usaha || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.whatsapp || '').includes(searchQuery)
  );

  const tabs = [
    { id: 'funnel', label: 'Funnel Overview', icon: BarChart3, color: 'blue' },
    { id: 'cold', label: 'Cold Market', icon: Snowflake, color: 'blue', count: uniqueIPs },
    { id: 'warm', label: 'Warm Market', icon: Activity, color: 'amber', count: warmMerchants.length },
    { id: 'hot', label: 'Hot Market', icon: Flame, color: 'red', count: hotMerchants.length },
    { id: 'channels', label: 'Channels', icon: Globe, color: 'purple', count: Object.keys(channelCounts).length },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Extreme Funneling Engine</h2>
          <p className="text-sm text-slate-400 font-medium">Cold → Warm → Hot Market Tracker + WA CRM Fonnte</p>
        </div>
        <button onClick={fetchData} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold text-slate-300 transition-colors">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Unique Visitors (Cold)', value: uniqueIPs, icon: Snowflake, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Active Trial (Warm)', value: warmMerchants.length, icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Premium Member (Hot)', value: hotMerchants.length, icon: Crown, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
          { label: 'Trial Expired', value: expiredMerchants.length, icon: Clock, color: 'text-slate-400', bg: 'bg-slate-800 border-slate-700' },
        ].map((stat, i) => (
          <div key={i} className={`p-5 rounded-2xl border ${stat.bg}`}>
            <stat.icon size={20} className={`${stat.color} mb-3`} />
            <p className="text-2xl font-black text-white">{stat.value}</p>
            <p className="text-xs text-slate-400 font-bold mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-800">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === tab.id ? 'text-white border-blue-500 bg-slate-900' : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/50'
            }`}>
            <tab.icon size={14} />
            {tab.label}
            {'count' in tab && tab.count !== undefined && (
              <span className="text-[9px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded-full font-black">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">

        {/* FUNNEL OVERVIEW */}
        {activeTab === 'funnel' && (
          <div className="p-6">
            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
              <BarChart3 size={20} className="text-blue-400" /> Extreme Funnel Visualization
            </h3>
            {/* Funnel stages */}
            <div className="space-y-3 max-w-xl mx-auto">
              {[
                {
                  stage: 'COLD MARKET', count: uniqueIPs, icon: Snowflake,
                  color: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
                  barColor: 'bg-blue-500', desc: 'Unique visitors ke landing page', width: '100%'
                },
                {
                  stage: 'REGISTERED', count: merchants.length, icon: Users,
                  color: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
                  barColor: 'bg-indigo-500', desc: 'Total merchant yang mendaftar',
                  width: uniqueIPs > 0 ? `${Math.min((merchants.length / uniqueIPs) * 100, 100)}%` : '0%'
                },
                {
                  stage: 'WARM (TRIAL AKTIF)', count: warmMerchants.length, icon: Activity,
                  color: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
                  barColor: 'bg-amber-500', desc: 'Trial aktif, belum konversi',
                  width: merchants.length > 0 ? `${Math.min((warmMerchants.length / merchants.length) * 100, 100)}%` : '0%'
                },
                {
                  stage: 'HOT (PREMIUM)', count: hotMerchants.length, icon: Flame,
                  color: 'bg-red-500/10 border-red-500/30 text-red-400',
                  barColor: 'bg-red-500', desc: 'Sudah berlangganan Premium',
                  width: merchants.length > 0 ? `${Math.min((hotMerchants.length / merchants.length) * 100, 100)}%` : '0%'
                },
              ].map((f, i) => (
                <div key={i} className={`p-4 rounded-2xl border ${f.color.split(' ').slice(0,2).join(' ')}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <f.icon size={16} className={f.color.split(' ')[2]} />
                      <div>
                        <p className={`text-xs font-black uppercase tracking-wider ${f.color.split(' ')[2]}`}>{f.stage}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                    <p className="text-2xl font-black text-white">{f.count}</p>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className={`h-full ${f.barColor} rounded-full transition-all duration-700`} style={{ width: f.width }} />
                  </div>
                  {i < 3 && (
                    <div className="flex justify-center mt-2">
                      <ArrowRight size={14} className="text-slate-600 rotate-90" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Conversion rates */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { label: 'Visit → Register', value: uniqueIPs > 0 ? `${((merchants.length / uniqueIPs) * 100).toFixed(1)}%` : '—', color: 'text-indigo-400' },
                { label: 'Register → Trial', value: merchants.length > 0 ? `${((warmMerchants.length / merchants.length) * 100).toFixed(1)}%` : '—', color: 'text-amber-400' },
                { label: 'Trial → Premium', value: warmMerchants.length + hotMerchants.length > 0 ? `${((hotMerchants.length / (warmMerchants.length + hotMerchants.length)) * 100).toFixed(1)}%` : '—', color: 'text-red-400' },
              ].map((c, i) => (
                <div key={i} className="p-3 bg-slate-800/50 rounded-xl text-center">
                  <p className={`text-xl font-black ${c.color}`}>{c.value}</p>
                  <p className="text-xs text-slate-500 mt-1 font-bold">{c.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COLD MARKET */}
        {activeTab === 'cold' && (
          <div className="p-6">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <Snowflake size={20} className="text-blue-400" /> Cold Market — Visitor Log
            </h3>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-slate-600" /></div>
            ) : coldVisitors.length === 0 ? (
              <div className="text-center py-12">
                <Snowflake size={32} className="text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500">Belum ada data visitor.</p>
                <p className="text-xs text-slate-600 mt-1">Jalankan SQL migration untuk tabel visitor_logs di Supabase.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-800">
                    {['Waktu', 'IP Address', 'UTM Source', 'Referrer', 'User Agent'].map(h => (
                      <th key={h} className="p-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {coldVisitors.slice(0, 50).map((v, i) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="p-3 text-slate-400 text-xs">{v.visited_at ? new Date(v.visited_at).toLocaleString('id-ID') : '-'}</td>
                        <td className="p-3"><span className="font-mono text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{v.ip_address || 'N/A'}</span></td>
                        <td className="p-3"><span className="text-xs text-emerald-400 font-bold">{v.utm_source || 'Direct'}</span></td>
                        <td className="p-3 text-slate-400 text-xs max-w-[160px] truncate">{v.referrer || '-'}</td>
                        <td className="p-3 text-slate-500 text-xs max-w-[200px] truncate">{v.user_agent || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* WARM MARKET */}
        {activeTab === 'warm' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Activity size={20} className="text-amber-400" /> Warm Market — Active Trial
              </h3>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 pr-4 py-2 bg-slate-800 border border-slate-700 text-white text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  placeholder="Cari merchant..."
                />
              </div>
            </div>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-slate-600" /></div>
            ) : filteredWarm.length === 0 ? (
              <div className="text-center py-12">
                <Activity size={32} className="text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500">Tidak ada merchant dalam masa trial aktif.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredWarm.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-amber-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                        <Activity size={18} className="text-amber-400" />
                      </div>
                      <div>
                        <p className="font-bold text-white">{m.nama_usaha || 'Tanpa Nama'}</p>
                        <p className="text-xs text-slate-400">{m.kategori_usaha} · {m.whatsapp || '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`text-sm font-black ${trialDaysLeft(m) <= 2 ? 'text-red-400' : trialDaysLeft(m) <= 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {trialDaysLeft(m)} hari
                        </p>
                        <p className="text-xs text-slate-500">sisa trial</p>
                      </div>
                      <button
                        onClick={() => handleFollowUp(m.id, m.whatsapp, m.nama_usaha)}
                        disabled={isSendingWA[m.id]}
                        className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-bold rounded-xl border border-green-500/20 transition-colors disabled:opacity-50"
                      >
                        {isSendingWA[m.id] ? <Loader2 size={12} className="animate-spin" /> : <MessageCircle size={12} />}
                        Follow Up WA
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HOT MARKET */}
        {activeTab === 'hot' && (
          <div className="p-6">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <Flame size={20} className="text-red-400" /> Hot Market — Premium Members
            </h3>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-slate-600" /></div>
            ) : hotMerchants.length === 0 ? (
              <div className="text-center py-12">
                <Crown size={32} className="text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500">Belum ada Premium Member.</p>
                <p className="text-xs text-slate-600 mt-1">Konversi merchant dari Warm Market ke Premium.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {hotMerchants.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-red-900/30 hover:border-red-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
                        <Crown size={18} className="text-red-400" />
                      </div>
                      <div>
                        <p className="font-bold text-white flex items-center gap-2">
                          {m.nama_usaha || 'Tanpa Nama'}
                          <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-black border border-red-500/30">PREMIUM</span>
                        </p>
                        <p className="text-xs text-slate-400">{m.kategori_usaha} · {m.whatsapp || '-'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-400">Aktif</p>
                      <p className="text-xs text-slate-500">hingga {m.trial_expires_at ? new Date(m.trial_expires_at).toLocaleDateString('id-ID') : '∞'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CHANNELS */}
        {activeTab === 'channels' && (
          <div className="p-6">
            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
              <Globe size={20} className="text-purple-400" /> Acquisition Channel Attribution
            </h3>
            <div className="space-y-4">
              {Object.entries(channelCounts).sort(([,a],[,b]) => (b as number) - (a as number)).map(([src, count]) => {
                const total = visitorLogs.length || 1;
                const pct = Math.round(((count as number) / total) * 100);
                return (
                  <div key={src} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Globe size={13} className="text-purple-400" />
                        <span className="text-sm font-bold text-slate-300">{src}</span>
                      </div>
                      <span className="text-sm font-black text-white">{count as number} <span className="text-slate-500 font-medium">({pct}%)</span></span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2.5">
                      <div className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {Object.keys(channelCounts).length === 0 && (
                <div className="text-center py-12">
                  <Globe size={32} className="text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500">Belum ada data kanal.</p>
                  <p className="text-xs text-slate-600 mt-1">Pasang UTM params pada link iklan: ?utm_source=instagram</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
