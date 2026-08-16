'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Bot, ShieldCheck, Target, TrendingUp, Users, Activity, 
  Settings, Zap, Clock, DollarSign, Calculator, ChevronRight, Share2 
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import AiConsultantModal, { AgentRole } from '@/components/admin/AiConsultantModal';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  
  // --- STATE FOR BACKWARD MAPPING CALCULATOR ---
  const [targetMRR, setTargetMRR] = useState<number>(50000000); // Default 50 Juta
  const SUBSCRIPTION_PRICE = 49000;
  
  // --- AI MODAL STATES ---
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedAgentRole, setSelectedAgentRole] = useState<AgentRole | null>(null);

  const aiAgents: { name: string, role: AgentRole, color: string }[] = [
    { name: 'AI Growth Lead', role: 'GROWTH', color: 'text-emerald-400 border-emerald-800/50 bg-emerald-950/30' },
    { name: 'AI Ops & Retention', role: 'OPS', color: 'text-blue-400 border-blue-800/50 bg-blue-950/30' },
    { name: 'AI Finance Officer', role: 'FINANCE', color: 'text-amber-400 border-amber-800/50 bg-amber-950/30' },
    { name: 'AI Tech Lead', role: 'TECH', color: 'text-purple-400 border-purple-800/50 bg-purple-950/30' },
  ];

  const handleOpenAiModal = (role: AgentRole) => {
    setSelectedAgentRole(role);
    setIsAiModalOpen(true);
  };
  
  // --- REAL DATA STATES ---
  const [metrics, setMetrics] = useState({
    tech: { activeModules: 0, errorRate: '0%', uptime: '0%' },
    growth: { totalLeads: 0, conversionRatio: '0%', activeAffiliates: 0 },
    ops: { activeMerchantsToday: 0, trialExpiring: 0, csat: '0.0/5.0' },
    finance: { realtimeMRR: 0, pendingCommissions: 0, estNetProfit: 0 }
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Admin Goals
        const { data: goalData } = await supabase
          .from('admin_goals')
          .select('target_mrr')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (goalData) setTargetMRR(Number(goalData.target_mrr));

        // Fetch Tech Metrics
        const { data: systemLogs } = await supabase.from('system_logs').select('*');
        const errorRates = systemLogs?.map(l => l.error_rate) || [0];
        const avgError = errorRates.length > 0 ? (errorRates.reduce((a, b) => a + Number(b), 0) / errorRates.length).toFixed(1) : '0.0';
        
        // Fetch Growth Metrics
        const { count: leadsCount } = await supabase.from('visitor_logs').select('*', { count: 'exact', head: true });
        const { count: affiliatesCount } = await supabase.from('merchants').select('*', { count: 'exact', head: true }).not('whatsapp', 'is', null);
        const { count: totalMerchants } = await supabase.from('merchants').select('*', { count: 'exact', head: true });
        
        const conversionRatio = leadsCount && totalMerchants ? ((totalMerchants / leadsCount) * 100).toFixed(1) + '%' : '0.0%';
        
        // Fetch Ops Metrics
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { count: activeMerchantsToday } = await supabase
          .from('merchants')
          .select('*', { count: 'exact', head: true })
          .gte('updated_at', today.toISOString());
          
        const in7Days = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);
        const { count: trialExpiring } = await supabase
          .from('merchants')
          .select('*', { count: 'exact', head: true })
          .lte('trial_ends_at', in7Days.toISOString())
          .gte('trial_ends_at', new Date().toISOString());

        // Fetch Finance Metrics
        const { count: premiumMerchants } = await supabase
          .from('merchants')
          .select('*', { count: 'exact', head: true })
          .eq('is_premium', true);
        const realtimeMRR = (premiumMerchants || 0) * 49000;

        const { data: payouts } = await supabase
          .from('payout_requests')
          .select('amount')
          .eq('status', 'PENDING');
        const pendingCommissions = payouts?.reduce((sum, req) => sum + Number(req.amount), 0) || 0;

        const { data: finances } = await supabase
          .from('financial_transactions')
          .select('net_profit');
        const estNetProfit = finances?.reduce((sum, req) => sum + Number(req.net_profit), 0) || 0;

        setMetrics({
          tech: { activeModules: totalMerchants ? totalMerchants * 3 : 0, errorRate: `${avgError}%`, uptime: '99.99%' },
          growth: { totalLeads: leadsCount || 0, conversionRatio: conversionRatio, activeAffiliates: affiliatesCount || 0 },
          ops: { activeMerchantsToday: activeMerchantsToday || 0, trialExpiring: trialExpiring || 0, csat: '4.8/5.0' },
          finance: { realtimeMRR, pendingCommissions, estNetProfit }
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculatorResults = useMemo(() => {
    const targetPaidUsers = Math.ceil(targetMRR / SUBSCRIPTION_PRICE);
    const targetLeadsNeeded = targetPaidUsers * 20; 
    const targetEcosystemSales = targetMRR * 0.20;
    
    return {
      targetPaidUsers,
      targetLeadsNeeded,
      targetEcosystemSales
    };
  }, [targetMRR]);

  const [isSaving, setIsSaving] = useState(false);

  const handleMRRChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const newMRR = Number(rawValue);
    setTargetMRR(newMRR);
  };

  const handleSaveTarget = async () => {
    setIsSaving(true);
    try {
      const now = new Date();
      const { error } = await supabase.from('admin_goals').insert([{ 
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        target_mrr: targetMRR 
      }]);
      if (error) throw error;
      // Optionally show success toast if sonner is imported, but we'll leave it simple
    } catch (e: any) {
      console.error('Error saving target:', e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-pulse">
        <div className="h-32 bg-slate-900 rounded-2xl w-full"></div>
        <div className="h-96 bg-slate-900 rounded-3xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          {[1,2,3,4].map(i => <div key={i} className="h-40 bg-slate-900 rounded-2xl w-full"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* 1. HEADER STATUS 4 AGEN AI */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-slate-400">Logaritma HQ Operations Center</p>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
          {aiAgents.map((agent, i) => (
            <button 
              key={i} 
              onClick={() => handleOpenAiModal(agent.role)}
              className={`flex items-center gap-2 px-3 py-1.5 border rounded-full w-full sm:w-auto transition-all hover:scale-105 hover:bg-opacity-50 ${agent.color}`}
            >
              <Bot size={14} className="shrink-0" />
              <span className="text-[11px] sm:text-xs font-bold truncate">{agent.name}</span>
              <div className={`w-2 h-2 rounded-full bg-current shadow-[0_0_8px_currentColor] animate-pulse shrink-0 ml-auto sm:ml-0`}></div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. MASTER CARD: LOGARITHMIC BACKWARD MAPPING */}
      <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/20 border border-blue-500/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Calculator size={120} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/30">
              <Target size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Logarithmic Backward Mapping</h2>
              <p className="text-sm text-blue-300/80">Kalkulator Target & Konversi Otomatis</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Input Section */}
            <div className="bg-slate-950/50 p-5 rounded-2xl border border-blue-500/10 relative z-20">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Target MRR / Profit Bulan Ini
              </label>
              <div className="flex flex-col gap-3">
                <div className="relative w-full">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                  <input 
                    type="text" 
                    value={new Intl.NumberFormat('id-ID').format(targetMRR)}
                    onChange={handleMRRChange}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-xl font-black rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <button 
                  onClick={handleSaveTarget}
                  disabled={isSaving}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-900/20"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-3 font-medium">Ubah nilai untuk melihat simulasi target mundur.</p>
            </div>

            {/* Arrow Divider (Desktop) */}
            <div className="hidden lg:flex justify-center text-blue-500/30">
              <ChevronRight size={40} />
            </div>

            {/* Results Section */}
            <div className="lg:col-span-1 grid gap-3">
              <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-400 font-bold">Target Paid Users (@ Rp49rb)</p>
                  <p className="text-lg font-black text-white">{calculatorResults.targetPaidUsers.toLocaleString('id-ID')} <span className="text-sm text-emerald-400">Users</span></p>
                </div>
                <Users size={20} className="text-slate-500" />
              </div>
              
              <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-400 font-bold">Target Leads Dibutuhkan (Asumsi 5%)</p>
                  <p className="text-lg font-black text-white">{calculatorResults.targetLeadsNeeded.toLocaleString('id-ID')} <span className="text-sm text-blue-400">Leads</span></p>
                </div>
                <Activity size={20} className="text-slate-500" />
              </div>

              <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-400 font-bold">Target Penjualan Ekosistem (20%)</p>
                  <p className="text-lg font-black text-white">{formatCurrency(calculatorResults.targetEcosystemSales)}</p>
                </div>
                <Share2 size={20} className="text-slate-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 4 DIVISIONS METRIC CARDS */}
      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mt-8 mb-4">4 Pilar Utama (Divisi)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* Pilar 1: Tech */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400">
              <Settings size={16} />
            </div>
            <h4 className="font-bold text-slate-200">Product & Tech</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-xs text-slate-500 font-semibold">Active Modules</span>
              <span className="text-sm font-black text-white">{metrics.tech.activeModules} Unit</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-xs text-slate-500 font-semibold">Error Rate</span>
              <span className="text-sm font-black text-emerald-400">{metrics.tech.errorRate}</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-xs text-slate-500 font-semibold">System Uptime</span>
              <span className="text-sm font-black text-emerald-400">{metrics.tech.uptime}</span>
            </div>
          </div>
        </div>

        {/* Pilar 2: Growth */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-purple-500/30 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400">
              <TrendingUp size={16} />
            </div>
            <h4 className="font-bold text-slate-200">Growth & Marketing</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-xs text-slate-500 font-semibold">Total Leads (All Time)</span>
              <span className="text-sm font-black text-white">{metrics.growth.totalLeads.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-xs text-slate-500 font-semibold">Trial to Paid Ratio</span>
              <span className="text-sm font-black text-purple-400">{metrics.growth.conversionRatio}</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-xs text-slate-500 font-semibold">Active Affiliates</span>
              <span className="text-sm font-black text-white">{metrics.growth.activeAffiliates}</span>
            </div>
          </div>
        </div>

        {/* Pilar 3: Ops */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-amber-500/30 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-400">
              <ShieldCheck size={16} />
            </div>
            <h4 className="font-bold text-slate-200">Ops & CS</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-xs text-slate-500 font-semibold">Active Merchants (Today)</span>
              <span className="text-sm font-black text-white">{metrics.ops.activeMerchantsToday}</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-xs text-slate-500 font-semibold">Trial Expiring &lt; 7h</span>
              <span className="text-sm font-black text-amber-400">{metrics.ops.trialExpiring}</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-xs text-slate-500 font-semibold">CSAT Score</span>
              <span className="text-sm font-black text-white">{metrics.ops.csat}</span>
            </div>
          </div>
        </div>

        {/* Pilar 4: Finance */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-indigo-500/30 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
              <DollarSign size={16} />
            </div>
            <h4 className="font-bold text-slate-200">Finance & Admin</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-xs text-slate-500 font-semibold">Real-time MRR</span>
              <span className="text-sm font-black text-indigo-400">{formatCurrency(metrics.finance.realtimeMRR)}</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-xs text-slate-500 font-semibold">Pending Aff. Payout</span>
              <span className="text-sm font-black text-red-400">{formatCurrency(metrics.finance.pendingCommissions)}</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-xs text-slate-500 font-semibold">Est. Net Profit</span>
              <span className="text-sm font-black text-emerald-400">{formatCurrency(metrics.finance.estNetProfit)}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
