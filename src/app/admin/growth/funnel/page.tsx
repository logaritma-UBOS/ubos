'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Activity, Funnel, TrendingUp, Users, ArrowRight, MessageCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import WhatsappDispatcherModal from '@/components/admin/WhatsappDispatcherModal';

interface Prospect {
  id: string;
  name: string;
  whatsapp: string;
  category: string;
  source: string;
  status: string; 
  created_at: string;
  is_merchant: boolean;
}

export default function FunnelPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStage, setFilterStage] = useState<string>('ALL');
  
  // Whatsapp Modal State
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [selectedWaTarget, setSelectedWaTarget] = useState({ name: '', phone: '', status: '', id: '', category: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Real Visitor Logs dari Supabase
      const { data: visitorsData, error: visitorsError } = await supabase.from('page_traffic_logs').select('*');
      if (visitorsError) throw visitorsError;

      // 2. Fetch Real Merchants dari Supabase
      const { data: merchantsData, error: merchantsError } = await supabase.from('merchants').select('*');
      if (merchantsError) throw merchantsError;

      const unifiedData: Prospect[] = [];

      // Map Visitor Logs (Stage: LEAD / Visitor Traffic)
      visitorsData?.forEach(visitor => {
        
        let deviceInfoStr = 'Perangkat Tidak Diketahui';
        if (visitor.device_info && visitor.device_info !== 'undefined') {
          deviceInfoStr = visitor.device_info;
        }
        if (visitor.browser && visitor.browser !== 'undefined') {
          deviceInfoStr += ` (${visitor.browser})`;
        }

        let trafficSrc = visitor.traffic_source || 'Direct';
        if (trafficSrc === 'undefined') trafficSrc = 'Direct';

        unifiedData.push({
          id: visitor.id,
          name: 'Visitor Anonim',
          whatsapp: '-', // Visitor anonim tidak punya WA
          category: deviceInfoStr,
          source: trafficSrc,
          status: 'LEAD',
          created_at: visitor.created_at || new Date().toISOString(),
          is_merchant: false
        });
      });

      // Map Merchants Asli (Stage: TRIAL_ACTIVE, PREMIUM_PAID, EXPIRED_CHURN, LEAD)
      merchantsData?.forEach(m => {
        let mappedStatus = 'EXPIRED_CHURN'; // Default
        
        // Logika sesuai Merchants Center (sinkronisasi status):
        const isPremium = m.status === 'Premium' || m.subscription_status === 'active' || m.status === 'PREMIUM_PAID' || m.is_premium === true;
        
        if (isPremium) {
          mappedStatus = 'PREMIUM_PAID';
        } else {
          const expiryDate = m.trial_expires_at 
            ? new Date(m.trial_expires_at) 
            : new Date(new Date(m.created_at || Date.now()).getTime() + 7 * 24 * 60 * 60 * 1000);
          
          const now = new Date();
          const timeDiff = expiryDate.getTime() - now.getTime();
          const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
          const isExpired = daysRemaining < 0;

          if (isExpired) {
            mappedStatus = 'EXPIRED_CHURN';
          } else {
            // Check if < 24 hours old for LEAD status
            const createdAtTime = new Date(m.created_at || Date.now()).getTime();
            if (now.getTime() - createdAtTime < 24 * 60 * 60 * 1000) {
              mappedStatus = 'LEAD';
            } else {
              mappedStatus = 'TRIAL_ACTIVE';
            }
          }
        }

        unifiedData.push({
          id: m.id,
          name: m.nama_usaha || 'Unknown Store',
          whatsapp: m.whatsapp || '-',
          category: m.kategori_usaha || 'General',
          source: 'Direct', 
          status: mappedStatus,
          created_at: m.created_at || new Date().toISOString(),
          is_merchant: true
        });
      });

      // Sort newest first
      unifiedData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setProspects(unifiedData);
    } catch (error: any) {
      toast.error('Gagal memuat pipeline live data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStage = async (id: string, is_merchant: boolean, currentStatus: string) => {
    if (is_merchant) {
      toast.info('Untuk mengubah status Merchant, gunakan menu Ops atau trigger dari payment otomatis.');
      return;
    }
    toast.success('Fitur update manual stage Lead (ke Contacted/Converted) segera hadir');
  };

  // Metrics calculation
  const totalLeads = prospects.filter(p => p.status === 'LEAD').length;
  const trialActive = prospects.filter(p => p.status === 'TRIAL_ACTIVE').length;
  const premiumPaid = prospects.filter(p => p.status === 'PREMIUM_PAID').length;
  const expired = prospects.filter(p => p.status === 'EXPIRED_CHURN').length;
  const totalToko = prospects.length;
  const conversionRate = totalToko > 0 
    ? ((premiumPaid / totalToko) * 100).toFixed(1) 
    : '0.0';

  const stages = [
    { id: 'ALL', label: 'Semua Prospek & Toko', count: prospects.length, color: 'bg-slate-800' },
    { id: 'LEAD', label: 'Leads Masuk', count: totalLeads, color: 'bg-blue-500' },
    { id: 'TRIAL_ACTIVE', label: 'Trial Aktif', count: trialActive, color: 'bg-amber-500' },
    { id: 'PREMIUM_PAID', label: 'Paid Premium', count: premiumPaid, color: 'bg-emerald-500' },
    { id: 'EXPIRED_CHURN', label: 'Churn / Expired', count: expired, color: 'bg-red-500' }
  ];

  const filteredProspects = filterStage === 'ALL' ? prospects : prospects.filter(p => p.status === filterStage);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'LEAD': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'TRIAL_ACTIVE': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'PREMIUM_PAID': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'EXPIRED_CHURN': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center border border-purple-500/30">
              <TrendingUp size={20} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Live Funnel Pipeline</h1>
          </div>
          <p className="text-slate-400 text-sm">Visualisasi konversi Leads ke Trial hingga Paid Premium (Real-time DB).</p>
        </div>
      </div>

      {/* HEADER METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total Leads</p>
          <p className="text-2xl font-black text-blue-400">{loading ? '...' : totalLeads}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <p className="text-xs text-slate-500 font-bold uppercase mb-1">Trial Aktif</p>
          <p className="text-2xl font-black text-amber-400">{loading ? '...' : trialActive}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <p className="text-xs text-slate-500 font-bold uppercase mb-1">Paid Conversion</p>
          <p className="text-2xl font-black text-emerald-400">{loading ? '...' : `${conversionRate}%`}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <p className="text-xs text-slate-500 font-bold uppercase mb-1">Churn / Expired</p>
          <p className="text-2xl font-black text-red-400">{loading ? '...' : expired}</p>
        </div>
      </div>

      {/* PIPELINE FILTER */}
      <div className="flex flex-wrap gap-2">
        {stages.map(stage => (
          <button
            key={stage.id}
            onClick={() => setFilterStage(stage.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2
              ${filterStage === stage.id 
                ? 'bg-slate-800 text-white border-slate-600 shadow-lg' 
                : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:bg-slate-800'}`}
          >
            <div className={`w-2 h-2 rounded-full ${stage.color}`}></div>
            {stage.label} ({stage.count})
          </button>
        ))}
      </div>

      {/* KANBAN TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950/50 text-slate-300 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4 text-left font-bold tracking-wider">NAMA TOKO/OWNER</th>
                {filterStage !== 'LEAD' && (
                  <th className="px-6 py-4 text-left font-bold tracking-wider">WHATSAPP</th>
                )}
                <th className="px-6 py-4 text-left font-bold tracking-wider">KATEGORI USAHA</th>
                <th className="px-6 py-4 text-left font-bold tracking-wider">SUMBER TRAFFIC</th>
                <th className="px-6 py-4 text-left font-bold tracking-wider">STATUS</th>
                <th className="px-6 py-4 text-right font-bold tracking-wider rounded-tr-xl">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500 animate-pulse">Memuat live data dari Supabase...</td></tr>
              ) : filteredProspects.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Tidak ada prospek/toko di stage ini.</td></tr>
              ) : (
                filteredProspects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-200">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        {p.name}
                      </div>
                    </td>
                    {filterStage !== 'LEAD' && (
                      <td className="px-6 py-4 font-mono text-xs text-blue-400">
                        {p.whatsapp}
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <span className="bg-slate-950 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border border-slate-800">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">{p.source}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase ${getStatusBadge(p.status)}`}>
                        {p.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      {p.whatsapp !== '-' && (
                        <button 
                          onClick={() => {
                            setSelectedWaTarget({
                              name: p.name,
                              phone: p.whatsapp,
                              status: p.status,
                              id: p.id,
                              category: p.category
                            });
                            setWaModalOpen(true);
                          }}
                          className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors border border-emerald-500/20 tooltip"
                          title="Chat via Fonnte"
                        >
                          <MessageCircle size={14} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleUpdateStage(p.id, p.is_merchant, p.status)}
                        className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors tooltip"
                        title="Update Stage Manual"
                      >
                        <RefreshCw size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <WhatsappDispatcherModal 
        isOpen={waModalOpen}
        onClose={() => setWaModalOpen(false)}
        targetName={selectedWaTarget.name}
        targetPhone={selectedWaTarget.phone}
        merchantStatus={selectedWaTarget.status}
        merchantId={selectedWaTarget.id}
        kategoriUsaha={selectedWaTarget.category}
      />
    </div>
  );
}
