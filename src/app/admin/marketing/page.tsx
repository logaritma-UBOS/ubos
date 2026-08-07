'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  Users, Activity, Flame, Snowflake, MessageCircle,
  Loader2, RefreshCw, Globe, Clock, Crown, Search,
  BarChart3, ArrowRight, Zap, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'funnel' | 'cold' | 'warm' | 'hot' | 'channels'>('funnel');
  const [leads, setLeads] = useState<any[]>([]);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [visitorLogs, setVisitorLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSendingWA, setIsSendingWA] = useState<Record<string, boolean>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: leadsData }, { data: merchantData }, { data: logs }] = await Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('merchants').select('*').order('created_at', { ascending: false }),
        supabase.from('visitor_logs').select('*').order('visited_at', { ascending: false }).limit(500),
      ]);
      if (leadsData) setLeads(leadsData);
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

  const coldVisitors = visitorLogs;
  // Fallback if visitor logs empty: assumption is 1 lead = 10 visitors
  const uniqueIPs = visitorLogs.length > 0 
    ? new Set(visitorLogs.map(v => v.ip_address)).size 
    : (leads.length > 0 ? leads.length * 10 : 0);

  const warmLeads = leads;
  const fbLeads = leads.filter(l => l.kategori === 'Kuliner & F&B' || l.funnel_destination === 'UBOS');
  const nonFbLeads = leads.filter(l => l.kategori !== 'Kuliner & F&B' && l.funnel_destination !== 'UBOS');

  const hotMerchants = merchants.filter(m => {
    const expires = m.trial_expires_at ? new Date(m.trial_expires_at).getTime() : 0;
    return expires > now + 3000 * 24 * 60 * 60 * 1000 || m.status === 'Active' || m.status === 'Premium';
  });

  const channelCounts = visitorLogs.reduce((acc, v) => {
    const src = v.utm_source || 'Direct/Organic';
    acc[src] = (acc[src] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  if (visitorLogs.length === 0 && leads.length > 0) {
    channelCounts['Direct/Organic'] = uniqueIPs;
  }

  const handleFollowUp = async (id: string, wa: string, name: string) => {
    setIsSendingWA(prev => ({ ...prev, [id]: true }));
    const loadingToast = toast.loading('Mengirim WA via Fonnte...');
    try {
      const clean = (wa || '').replace(/\D/g, '').replace(/^0+/, '62');
      const msg = `Halo kak dari ${name || 'Toko'}! 👋 Ini dari tim Logaritma.\n\nBagaimana pengalaman mencoba Ekosistem UBOS? Jika ada yang mau ditanyakan, tim kami siap bantu!\n\n📲 Akses UBOS: https://logaritma.id/auth`;
      
      const res = await fetch('/api/wa/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: clean,
          message: msg,
          nama_usaha: name,
        })
      });

      if (res.ok) {
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

  const filteredWarm = warmLeads.filter(l =>
    (l.nama_usaha || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.no_wa || '').includes(searchQuery)
  );
  
  const filteredHot = hotMerchants.filter(m =>
    (m.nama_usaha || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.whatsapp || '').includes(searchQuery)
  );

  const tabs = [
    { id: 'funnel', label: 'Funnel Overview', icon: BarChart3 },
    { id: 'cold', label: 'Cold Market', icon: Snowflake, count: uniqueIPs },
    { id: 'warm', label: 'Warm Market', icon: Activity, count: warmLeads.length },
    { id: 'hot', label: 'Hot Market', icon: Flame, count: hotMerchants.length },
    { id: 'channels', label: 'Channels', icon: Globe, count: Object.keys(channelCounts).length },
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
          { label: 'Total Leads (Warm)', value: warmLeads.length, icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Premium Member (Hot)', value: hotMerchants.length, icon: Crown, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
          { label: 'Conversion Rate', value: uniqueIPs > 0 ? `${((hotMerchants.length / uniqueIPs) * 100).toFixed(1)}%` : '0%', icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
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

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden min-h-[400px]">

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
                  stage: 'WARM MARKET (LEADS)', count: warmLeads.length, icon: Activity,
                  color: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
                  barColor: 'bg-amber-500', desc: 'Total pendaftar masuk (F&B / Non F&B)',
                  width: uniqueIPs > 0 ? `${Math.min((warmLeads.length / uniqueIPs) * 100, 100)}%` : '0%'
                },
                {
                  stage: 'HOT MARKET (PREMIUM)', count: hotMerchants.length, icon: Flame,
                  color: 'bg-red-500/10 border-red-500/30 text-red-400',
                  barColor: 'bg-red-500', desc: 'Active Premium Merchants',
                  width: warmLeads.length > 0 ? `${Math.min((hotMerchants.length / warmLeads.length) * 100, 100)}%` : '0%'
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
                  {i < 2 && (
                    <div className="flex justify-center mt-2">
                      <ArrowRight size={14} className="text-slate-600 rotate-90" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Conversion rates */}
            <div className="mt-6 max-w-xl mx-auto grid grid-cols-2 gap-3">
              {[
                { label: 'Visit → Lead', value: uniqueIPs > 0 ? `${((warmLeads.length / uniqueIPs) * 100).toFixed(1)}%` : '—', color: 'text-amber-400' },
                { label: 'Lead → Premium', value: warmLeads.length > 0 ? `${((hotMerchants.length / warmLeads.length) * 100).toFixed(1)}%` : '—', color: 'text-red-400' },
              ].map((c, i) => (
                <div key={i} className="p-4 bg-slate-800/50 rounded-xl text-center border border-slate-700/50">
                  <p className={`text-2xl font-black ${c.color}`}>{c.value}</p>
                  <p className="text-sm text-slate-400 mt-1 font-bold">{c.label}</p>
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
                <p className="text-slate-500">Belum ada data visitor riil dari Supabase.</p>
                <p className="text-xs text-slate-600 mt-1">Menggunakan estimasi dari Total Leads x 10 = {uniqueIPs} visitors.</p>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Activity size={20} className="text-amber-400" /> Warm Market — Leads Data
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Total: {fbLeads.length} F&B (UBOS) | {nonFbLeads.length} Non-F&B (Waitlist)
                </p>
              </div>
              <div className="relative w-full sm:w-auto">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pl-8 pr-4 py-2 bg-slate-800 border border-slate-700 text-white text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  placeholder="Cari lead..."
                />
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-slate-600" /></div>
            ) : filteredWarm.length === 0 ? (
              <div className="text-center py-12">
                <Activity size={32} className="text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500">Tidak ada pendaftar baru yang ditemukan.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="p-3 text-xs font-black text-slate-500 uppercase tracking-wider">Nama Usaha / Kontak</th>
                      <th className="p-3 text-xs font-black text-slate-500 uppercase tracking-wider">Kategori</th>
                      <th className="p-3 text-xs font-black text-slate-500 uppercase tracking-wider">Status / Waktu</th>
                      <th className="p-3 text-right text-xs font-black text-slate-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredWarm.map(l => (
                      <tr key={l.id} className="hover:bg-slate-800/30 group">
                        <td className="p-3">
                          <p className="font-bold text-white text-base">{l.nama_usaha || 'Tanpa Nama'}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{l.no_wa || '-'}</p>
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-wider ${l.kategori === 'Kuliner & F&B' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                            {l.kategori || '-'}
                          </span>
                        </td>
                        <td className="p-3">
                          <p className="text-sm font-bold text-slate-300">{l.status || 'New Lead'}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{l.created_at ? new Date(l.created_at).toLocaleString('id-ID') : '-'}</p>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleFollowUp(l.id, l.no_wa, l.nama_usaha)}
                            disabled={isSendingWA[l.id]}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-bold rounded-lg border border-green-500/20 transition-colors disabled:opacity-50"
                          >
                            {isSendingWA[l.id] ? <Loader2 size={14} className="animate-spin" /> : <MessageCircle size={14} />}
                            CRM WA
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* HOT MARKET */}
        {activeTab === 'hot' && (
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Flame size={20} className="text-red-400" /> Hot Market — Premium / Active Merchants
                </h3>
              </div>
              <div className="relative w-full sm:w-auto">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pl-8 pr-4 py-2 bg-slate-800 border border-slate-700 text-white text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30"
                  placeholder="Cari premium merchant..."
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-slate-600" /></div>
            ) : filteredHot.length === 0 ? (
              <div className="text-center py-12">
                <Crown size={32} className="text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500">Belum ada Premium Member saat ini.</p>
                <p className="text-xs text-slate-600 mt-1">Silakan konversi Warm Market leads menjadi Premium.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="p-3 text-xs font-black text-slate-500 uppercase tracking-wider">Nama Usaha / Kontak</th>
                      <th className="p-3 text-xs font-black text-slate-500 uppercase tracking-wider">Kategori</th>
                      <th className="p-3 text-xs font-black text-slate-500 uppercase tracking-wider">Status / Bergabung</th>
                      <th className="p-3 text-right text-xs font-black text-slate-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredHot.map(m => (
                      <tr key={m.id} className="hover:bg-slate-800/30 group">
                        <td className="p-3">
                          <p className="font-bold text-white text-base">{m.nama_usaha || 'Tanpa Nama'}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{m.whatsapp || '-'}</p>
                        </td>
                        <td className="p-3">
                          <span className="text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                            {m.kategori_usaha || 'Umum'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <Crown size={14} className="text-red-400" />
                            <p className="text-sm font-bold text-red-400">{m.status || 'Premium'}</p>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{m.created_at ? new Date(m.created_at).toLocaleDateString('id-ID') : '-'}</p>
                        </td>
                        <td className="p-3 text-right">
                           <button
                            onClick={() => handleFollowUp(m.id, m.whatsapp, m.nama_usaha)}
                            disabled={isSendingWA[m.id]}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-bold rounded-lg border border-green-500/20 transition-colors disabled:opacity-50"
                          >
                            {isSendingWA[m.id] ? <Loader2 size={14} className="animate-spin" /> : <MessageCircle size={14} />}
                            CRM WA
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
            <div className="space-y-4 max-w-2xl">
              {Object.entries(channelCounts).sort(([,a],[,b]) => (b as number) - (a as number)).map(([src, count]) => {
                const total = uniqueIPs || 1;
                const pct = Math.round(((count as number) / total) * 100);
                return (
                  <div key={src} className="space-y-2 p-4 bg-slate-800/30 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                          <Globe size={16} className="text-purple-400" />
                        </div>
                        <span className="text-base font-bold text-slate-200">{src}</span>
                      </div>
                      <span className="text-lg font-black text-white">{count as number} <span className="text-slate-500 font-medium text-sm">({pct}%)</span></span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
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
