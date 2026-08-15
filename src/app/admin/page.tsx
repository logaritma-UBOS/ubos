'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  Users, Clock, Activity, Crown, TrendingUp, BarChart3,
  DollarSign, ShoppingCart, Megaphone, Code2, Printer,
  ArrowRight, Sparkles, Loader2, RefreshCw, Target, ChevronRight,
  CheckCircle2, Zap, MessageCircle, X
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

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
  const [leads, setLeads] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isSendingWA, setIsSendingWA] = useState<Record<string, boolean>>({});
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [isMakingPremium, setIsMakingPremium] = useState<Record<string, boolean>>({});
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
        { data: leadsData },
        { count: totalVisitors },
        { count: registerClicks },
        { count: waClicks },
      ] = await Promise.all([
        supabase.from('merchants').select('*').order('created_at', { ascending: false }),
        supabase.from('cash_transactions').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'page_view'),
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'click_cta_register'),
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'click_wa_consultation'),
      ]);
      if (merchantData) setMerchants(merchantData);
      if (txData) setTransactions(txData);
      if (leadsData) setLeads(leadsData);
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

  const metrics = useMemo(() => {
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    const nowMs = Date.now();
    
    // Total Merchants: All registered users
    const total = leads.length;
    
    // Trial Aktif: Users in trial (registered < 7 days ago)
    const active = leads.filter(l => l.created_at && (nowMs - new Date(l.created_at).getTime()) <= 7 * 24 * 60 * 60 * 1000).length;
    
    // Premium (VVIP): Paid users (from merchants table)
    const vvip = merchants.filter(m => {
      const exp = m.trial_expires_at ? new Date(m.trial_expires_at).getTime() : 0;
      return exp > nowMs + 3000 * 24 * 60 * 60 * 1000 || m.status === 'Active' || m.status === 'Premium';
    }).length;

    // Aktif Hari Ini: New registrations today
    const today = leads.filter(l => l.created_at && new Date(l.created_at).getTime() >= startOfToday.getTime()).length;
    
    return { total, active, vvip, today };
  }, [leads, merchants]);

  const leadsMetrics = useMemo(() => {
    const totalLeads = leads.length;
    const ubosFnb = leads.filter(l => l.funnel_destination === 'UBOS' || l.kategori?.includes('Kuliner')).length;
    const memberArea = leads.filter(l => l.funnel_destination === 'MEMBER_AREA' || (!l.kategori?.includes('Kuliner') && l.funnel_destination)).length;
    
    const catCount = {
      'Kuliner & F&B': 0,
      'Percetakan': 0,
      'Ritel': 0,
      'Jasa / Lainnya': 0
    };
    
    leads.forEach(l => {
      if (catCount[l.kategori as keyof typeof catCount] !== undefined) catCount[l.kategori as keyof typeof catCount]++;
      else if (l.kategori?.includes('Kuliner')) catCount['Kuliner & F&B']++;
      else catCount['Jasa / Lainnya']++;
    });
    
    return { totalLeads, ubosFnb, memberArea, catCount };
  }, [leads]);
  
  const filteredLeads = useMemo(() => {
    if (categoryFilter === 'All') return leads;
    if (categoryFilter === 'Kuliner') return leads.filter(l => l.kategori?.includes('Kuliner'));
    return leads.filter(l => l.kategori === categoryFilter);
  }, [leads, categoryFilter]);

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

  const handleFollowUp = async (id: string, wa: string, name: string) => {
    setIsSendingWA(prev => ({ ...prev, [id]: true }));
    const loadingToast = toast.loading('Mengirim WA via Fonnte...');
    try {
      const clean = (wa || '').replace(/\D/g, '').replace(/^0+/, '62');
      const msg = `Halo kak dari ${name || 'Toko'}! 👋 Ini dari tim Logaritma.\n\nSelamat datang di ekosistem kami! Jika ada yang mau ditanyakan atau ingin konsultasi, tim kami siap bantu!\n\n📲 Akses Dashboard: https://logaritma.id/auth`;
      
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

  const handleReminderWA = async (id: string, wa: string, name: string, status: string, diff: number, isExpired: boolean) => {
    setIsSendingWA(prev => ({ ...prev, [id]: true }));
    const loadingToast = toast.loading('Mengirim Info Masa Aktif via Fonnte...');
    try {
      const clean = (wa || '').replace(/\D/g, '').replace(/^0+/, '62');
      
      let msg = `Halo kak dari *${name || 'Toko'}*! 👋 Ini dari tim Logaritma.\n\n`;
      
      if (isExpired) {
        msg += `Masa aktif akun Logaritma UBOS kakak saat ini sudah *HABIS*.\n\n`;
      } else {
        msg += `Menginformasikan bahwa sisa masa aktif akun Logaritma UBOS kakak tersisa *${diff} HARI* lagi.\n\n`;
      }
      
      if (status === 'Premium') {
        msg += `Yuk perpanjang langganan Premium kakak agar operasional bisnis tetap berjalan lancar dan otomatis!\n\n`;
      } else {
        msg += `Yuk segera *Upgrade ke Premium* agar bisnis kakak tetap berjalan lancar dengan fitur lengkap dan otomatis!\n\n`;
      }
      
      msg += `📲 Klik link berikut untuk cek detail dan upgrade:\nhttps://logaritma.id/member\n\nJika butuh bantuan, silakan balas pesan ini ya kak!`;

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
        toast.success('Info Masa Aktif berhasil terkirim!', { id: loadingToast });
      } else {
        toast.error('Gagal kirim pesan', { id: loadingToast });
      }
    } catch {
      toast.error('Error kirim pesan', { id: loadingToast });
    } finally {
      setIsSendingWA(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDeleteAccount = async (leadId: string, userId?: string) => {
    if (!confirm('Yakin ingin menghapus akun ini secara permanen? Data toko, produk, dan transaksi akan ikut terhapus dan tidak bisa dikembalikan.')) return;
    
    setIsDeleting(prev => ({ ...prev, [leadId]: true }));
    const loadingToast = toast.loading('Menghapus akun...');
    try {
      const { error } = await supabase.rpc('admin_delete_account', {
        p_lead_id: leadId,
        p_user_id: userId || null
      });
      if (error) throw error;
      toast.success('Akun berhasil dihapus permanen!', { id: loadingToast });
      fetchData();
    } catch (err: any) {
      toast.error(`Gagal menghapus: ${err.message}`, { id: loadingToast });
    } finally {
      setIsDeleting(prev => ({ ...prev, [leadId]: false }));
    }
  };

  const handleMakePremium = async (leadId: string, userId?: string) => {
    if (!userId) {
      toast.error('Gagal: Pengguna belum menyelesaikan pendaftaran merchant/toko.');
      return;
    }
    if (!confirm('Jadikan akun ini Premium Selamanya?')) return;
    
    setIsMakingPremium(prev => ({ ...prev, [leadId]: true }));
    const loadingToast = toast.loading('Mengupgrade akun...');
    try {
      const { error } = await supabase.rpc('admin_set_premium', {
        p_user_id: userId
      });
      if (error) throw error;
      toast.success('Akun berhasil diupgrade ke Premium Selamanya!', { id: loadingToast });
      fetchData();
    } catch (err: any) {
      toast.error(`Gagal upgrade: ${err.message}`, { id: loadingToast });
    } finally {
      setIsMakingPremium(prev => ({ ...prev, [leadId]: false }));
    }
  };

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
      {/* Leads Funnel Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        {[
          { label: 'Total Pendaftar Baru', desc: 'Landing Page Leads', value: leadsMetrics.totalLeads, icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Pengguna UBOS F&B', desc: 'Direct ke /ubos', value: leadsMetrics.ubosFnb, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Waitlist Non-F&B', desc: 'Direct ke Member Area', value: leadsMetrics.memberArea, icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        ].map((s, i) => (
          <div key={i} className={`p-5 rounded-2xl border ${s.bg} flex items-start justify-between`}>
            <div>
              <p className="text-3xl font-black text-white">{s.value}</p>
              <p className="text-sm text-slate-300 font-bold mt-1">{s.label}</p>
              <p className="text-xs text-slate-500 font-medium">{s.desc}</p>
            </div>
            <s.icon size={24} className={`${s.color}`} />
          </div>
        ))}
      </div>
      
      {/* Kategori Breakdown */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 md:p-6 mb-8">
        <h3 className="text-sm font-black text-white mb-4 uppercase tracking-widest text-slate-400">Distribusi Kategori Usaha</h3>
        <div className="flex flex-wrap gap-2 md:gap-4">
          {Object.entries(leadsMetrics.catCount).map(([cat, count]) => {
            const pct = leadsMetrics.totalLeads > 0 ? Math.round((count / leadsMetrics.totalLeads) * 100) : 0;
            return (
              <div key={cat} className="flex-1 min-w-[120px] bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <p className="text-xs text-slate-400 font-bold mb-1 truncate">{cat}</p>
                <div className="flex items-end justify-between">
                  <p className="text-xl font-black text-white">{count}</p>
                  <p className="text-xs text-blue-400 font-bold">{pct}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <h2 className="text-xl font-black text-white mt-8 mb-4">Merchants Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Merchants', value: metrics.total, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Trial Aktif (< 7 hr)', value: metrics.active, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
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

      {/* Tabel Recent Leads / Quick Action */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 mt-8 overflow-hidden">
        <div className="p-5 md:p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-black text-white flex items-center gap-2">
            <Users size={18} className="text-purple-400" /> Recent Leads & Quick Action
          </h3>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-xl px-4 py-2 outline-none focus:border-blue-500 font-bold"
          >
            <option value="All">Semua Kategori</option>
            <option value="Kuliner">Kuliner & F&B</option>
            <option value="Percetakan">Percetakan</option>
            <option value="Ritel">Ritel</option>
            <option value="Jasa / Lainnya">Jasa / Lainnya</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-xs uppercase text-slate-500 font-black">
              <tr>
                <th className="px-6 py-4">Waktu Daftar</th>
                <th className="px-6 py-4">Nama Usaha / Toko</th>
                <th className="px-6 py-4">WhatsApp</th>
                <th className="px-6 py-4">Kategori & Destination</th>
                <th className="px-6 py-4 text-right">Akses Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLeads.slice(0, 50).map((lead, i) => {
                const leadWa = lead.no_wa?.replace(/\D/g, '') || '';
                const m = merchants.find(merchant => {
                  const mWa = merchant.whatsapp?.replace(/\D/g, '') || '';
                  return mWa && leadWa && (mWa === leadWa || mWa.endsWith(leadWa.slice(-8)));
                });
                const userId = m?.user_id;

                return (
                <tr key={lead.id || i} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 text-xs text-slate-400 whitespace-nowrap">
                    {lead.created_at ? new Date(lead.created_at).toLocaleString('id-ID') : '-'}
                  </td>
                  <td className="px-6 py-4 font-bold text-white whitespace-nowrap">{lead.nama_usaha || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a href={`https://wa.me/${lead.no_wa}`} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                      +{lead.no_wa}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                        lead.kategori?.includes('Kuliner') ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                        lead.kategori?.includes('Percetakan') ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        lead.kategori?.includes('Ritel') ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-slate-700 text-slate-300 border border-slate-600'
                      }`}>
                        {lead.kategori || 'Unknown'}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center w-fit gap-1 ${
                        lead.funnel_destination === 'UBOS' || lead.kategori?.includes('Kuliner') 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : 'bg-indigo-500/10 text-indigo-400'
                      }`}>
                        {lead.funnel_destination === 'UBOS' || lead.kategori?.includes('Kuliner') ? <CheckCircle2 size={12}/> : <Activity size={12}/>}
                        {lead.funnel_destination || (lead.kategori?.includes('Kuliner') ? 'UBOS' : 'MEMBER_AREA')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleFollowUp(lead.id, lead.no_wa, lead.nama_usaha)}
                        disabled={isSendingWA[lead.id]}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-bold rounded-lg border border-green-500/20 transition-colors disabled:opacity-50"
                      >
                        {isSendingWA[lead.id] ? <Loader2 size={14} className="animate-spin" /> : <MessageCircle size={14} />}
                        WA
                      </button>
                      <button
                        onClick={() => handleMakePremium(lead.id, userId)}
                        disabled={isMakingPremium[lead.id]}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold rounded-lg border border-amber-500/20 transition-colors disabled:opacity-50"
                      >
                        {isMakingPremium[lead.id] ? <Loader2 size={14} className="animate-spin" /> : <Crown size={14} />}
                        Premium
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(lead.id, userId)}
                        disabled={isDeleting[lead.id]}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-lg border border-red-500/20 transition-colors disabled:opacity-50"
                      >
                        {isDeleting[lead.id] ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-medium">
                    Belum ada data pendaftar untuk kategori ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {filteredLeads.length > 50 && (
             <div className="p-4 text-center border-t border-slate-800 text-xs text-slate-500">
               Menampilkan 50 pendaftar terbaru.
             </div>
          )}
        </div>
      </div>

      {/* Tabel Data Member & Masa Aktif */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 mt-8 overflow-hidden">
        <div className="p-5 md:p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-black text-white flex items-center gap-2">
            <Crown size={18} className="text-amber-400" /> Data Member & Masa Aktif
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-xs uppercase text-slate-500 font-black">
              <tr>
                <th className="px-6 py-4">Toko / Member</th>
                <th className="px-6 py-4">WhatsApp</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Masa Aktif</th>
                <th className="px-6 py-4">Sisa Hari</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {leads.map((lead, i) => {
                // Cari data merchant yang sesuai dengan lead ini (berdasarkan nomor WA)
                const leadWa = lead.no_wa?.replace(/\D/g, '') || '';
                const m = merchants.find(merchant => {
                  const mWa = merchant.whatsapp?.replace(/\D/g, '') || '';
                  return mWa && leadWa && (mWa === leadWa || mWa.endsWith(leadWa.slice(-8)));
                });

                let expiresDate = new Date();
                const merchantStatus = m?.status || 'Trial';
                
                if (merchantStatus === 'Premium' && m?.expired_at) {
                  expiresDate = new Date(m.expired_at);
                } else if (m?.trial_expires_at) {
                  expiresDate = new Date(m.trial_expires_at);
                } else if (m?.created_at) {
                  expiresDate = new Date(m.created_at);
                  expiresDate.setDate(expiresDate.getDate() + 7);
                } else if (lead.created_at) {
                  // Jika belum ada di merchants, hitung trial 7 hari dari saat daftar di leads
                  expiresDate = new Date(lead.created_at);
                  expiresDate.setDate(expiresDate.getDate() + 7);
                }
                
                const now = new Date();
                const diff = Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const isExpired = diff <= 0;

                return (
                  <tr key={lead.id || i} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-white whitespace-nowrap">{m?.nama_usaha || lead.nama_usaha || lead.nama_pemilik || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lead.no_wa ? (
                        <div className="flex items-center gap-3">
                          <span className="text-slate-300">+{leadWa || lead.no_wa}</span>
                          <button
                            onClick={() => handleReminderWA(lead.id, leadWa || lead.no_wa, m?.nama_usaha || lead.nama_usaha || lead.nama_pemilik || '', merchantStatus, diff, isExpired)}
                            disabled={isSendingWA[lead.id]}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-[10px] uppercase tracking-wide font-black rounded border border-green-500/20 transition-colors disabled:opacity-50"
                          >
                            {isSendingWA[lead.id] ? <Loader2 size={12} className="animate-spin" /> : <MessageCircle size={12} />}
                            Hubungi
                          </button>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                        merchantStatus === 'Premium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                        'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}>
                        {merchantStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      {expiresDate.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isExpired ? (
                        <span className="text-red-400 font-bold text-xs bg-red-400/10 px-2 py-1 rounded-md">Habis</span>
                      ) : (
                        <span className="text-emerald-400 font-bold text-xs bg-emerald-400/10 px-2 py-1 rounded-md">{diff} Hari</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-medium">
                    Belum ada data member.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5 Revenue Streams Profit Tracker */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 mt-8">
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
