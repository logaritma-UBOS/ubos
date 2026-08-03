'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { 
  Users, Clock, PlusCircle, AlertCircle, LogOut, MessageCircle, Crown, Search, Filter, 
  ArrowRight, Activity, ChevronDown, ChevronUp, ShoppingCart, ExternalLink, Smartphone,
  Menu, X, Sparkles, Bot, Zap, Database, LayoutDashboard, Settings, LayoutPanelLeft,
  ChevronRight, ChevronLeft, CreditCard, DollarSign, TrendingUp, BarChart3, MapPin,
  Eye, EyeOff, Save, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Layout State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(true);
  const [isUpsellMenuExpanded, setIsUpsellMenuExpanded] = useState(false);

  // Dashboard State
  const [activeMenu, setActiveMenu] = useState<'FUNNEL' | 'UPSELL_REQUESTS' | 'UPSELL_CATALOG' | 'UPSELL_SETTINGS' | 'ACCOUNTING' | 'DASHBOARD' | 'SETTINGS'>('FUNNEL');
  const [merchants, setMerchants] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [funnelFilter, setFunnelFilter] = useState('All');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  
  // Modal State
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [visitorModalFilter, setVisitorModalFilter] = useState<'ALL' | 'ACTIVE_TRIAL' | 'VVIP' | 'TRAFFIC_7_DAYS'>('ALL');
  
  // Settings State
  const [promoPrice, setPromoPrice] = useState('49000');
  const [normalPrice, setNormalPrice] = useState('150000');
  const [trialDays, setTrialDays] = useState('7');
  const [mayarApiKey, setMayarApiKey] = useState('');
  const [mayarWebhookSecret, setMayarWebhookSecret] = useState('');
  const [mayarMode, setMayarMode] = useState('sandbox');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  // Accounting State
  const [cashTransactions, setCashTransactions] = useState<any[]>([]);
  const [isAccountingModalOpen, setIsAccountingModalOpen] = useState(false);
  const [accFormDate, setAccFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [accFormType, setAccFormType] = useState<'IN' | 'OUT'>('OUT');
  const [accFormCategory, setAccFormCategory] = useState('Infra / Server');
  const [accFormDesc, setAccFormDesc] = useState('');
  const [accFormAmount, setAccFormAmount] = useState('');
  const [isSubmittingAcc, setIsSubmittingAcc] = useState(false);
  const [isInvestorViewOnly, setIsInvestorViewOnly] = useState(false);
  
  const [metrics, setMetrics] = useState({
    total: 0,
    activeTrial: 0,
    expiredTrial: 0,
    vvip: 0,
    trafficToday: 0,
    traffic7Days: 0,
    categories: {} as Record<string, number>
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('merchants')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const isHardcodedAdmin = user.email === 'logaritma.tim@gmail.com';
      const isProfileAdmin = profile && profile.is_admin;
      const isInvestor = profile && profile.is_investor_view_only;

      if (!isHardcodedAdmin && !isProfileAdmin && !isInvestor) {
        setLoginError('Akses Terbatas: Akun ini tidak memiliki hak akses Admin Logaritma.');
        await supabase.auth.signOut();
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      setIsInvestorViewOnly(isInvestor || false);

      const { data: allMerchants, error } = await supabase
        .from('merchants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (allMerchants) {
        setMerchants(allMerchants);
        
        const now = new Date().getTime();
        const startOfToday = new Date();
        startOfToday.setHours(0,0,0,0);
        const startOf7DaysAgo = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000);

        let active = 0;
        let expired = 0;
        let vvipCount = 0;
        let tToday = 0;
        let t7Days = 0;
        const cats: Record<string, number> = {};

        allMerchants.forEach(m => {
          // Status Trial
          const expiresAt = m.trial_expires_at ? new Date(m.trial_expires_at).getTime() : 0;
          const isVVIP = expiresAt > now + 3000 * 24 * 60 * 60 * 1000;

          if (isVVIP) {
            vvipCount++;
          } else if (expiresAt > now) {
            active++;
          } else {
            expired++;
          }

          // Kategori
          const cat = m.kategori_usaha || 'Lainnya';
          cats[cat] = (cats[cat] || 0) + 1;

          // Traffic
          if (m.last_active_at) {
            const lastActive = new Date(m.last_active_at).getTime();
            if (lastActive >= startOfToday.getTime()) {
              tToday++;
            }
            if (lastActive >= startOf7DaysAgo.getTime()) {
              t7Days++;
            }
          }
        });

        setMetrics({
          total: allMerchants.length,
          activeTrial: active,
          expiredTrial: expired,
          vvip: vvipCount,
          trafficToday: tToday,
          traffic7Days: t7Days,
          categories: cats
        });
      }

      // Fetch Settings
      const { data: settings } = await supabase
        .from('app_settings')
        .select('*')
        .maybeSingle();
        
      if (settings) {
        if (settings.promo_price) setPromoPrice(settings.promo_price.toString());
        if (settings.normal_price) setNormalPrice(settings.normal_price.toString());
        if (settings.trial_days) setTrialDays(settings.trial_days.toString());
        if (settings.mayar_api_key) setMayarApiKey(settings.mayar_api_key);
        if (settings.mayar_webhook_secret) setMayarWebhookSecret(settings.mayar_webhook_secret);
        if (settings.mayar_mode) setMayarMode(settings.mayar_mode);
      }

      // Fetch Cash Transactions
      const { data: txData } = await supabase
        .from('cash_transactions')
        .select('*')
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });
        
      if (txData) {
        setCashTransactions(txData);
      }

    } catch (err: any) {
      console.error(err);
      toast.error('Gagal mengambil data admin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setLoginError('Kredensial tidak valid.');
        setIsLoggingIn(false);
        return;
      }
      await fetchData(); 
    } catch (err: any) {
      setLoginError(err.message || 'Gagal masuk.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setEmail('');
    setPassword('');
    toast.success('Berhasil logout dari Admin Panel');
  };

  const addTrialDays = async (id: string, currentExpiry: string) => {
    try {
      let baseDate = new Date();
      if (currentExpiry && new Date(currentExpiry).getTime() > baseDate.getTime()) {
        baseDate = new Date(currentExpiry);
      }
      const newExpiry = new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const { error } = await supabase
        .from('merchants')
        .update({ trial_expires_at: newExpiry })
        .eq('id', id);

      if (error) throw error;
      toast.success('Trial berhasil diperpanjang 7 hari!');
      fetchData();
    } catch (err) {
      toast.error('Gagal memperpanjang trial.');
    }
  };

  const activateVVIP = async (id: string) => {
    try {
      const vvipExpiry = new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString();
      const { error } = await supabase
        .from('merchants')
        .update({ trial_expires_at: vvipExpiry })
        .eq('id', id);

      if (error) throw error;
      toast.success('Status VVIP berhasil diaktifkan!');
      fetchData();
    } catch (err) {
      toast.error('Gagal mengaktifkan VVIP.');
    }
  };

  const toggleInvestorRole = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('merchants')
        .update({ is_investor_view_only: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Role Investor berhasil di${!currentStatus ? 'aktifkan' : 'nonaktifkan'}`);
      fetchData();
    } catch (err) {
      toast.error('Gagal mengubah role investor.');
    }
  };

  const updateUpsellStatus = async (merchantId: string, requestIndex: number, newStatus: string, currentHistory: any[]) => {
    try {
      const updatedHistory = [...currentHistory];
      updatedHistory[requestIndex].status = newStatus;
      
      const { error } = await supabase
        .from('merchants')
        .update({ upsell_history: updatedHistory })
        .eq('id', merchantId);
        
      if (error) throw error;
      toast.success('Status upsell berhasil diubah!');
      fetchData();
    } catch (err) {
      toast.error('Gagal mengubah status upsell.');
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const { data: existing } = await supabase.from('app_settings').select('id').limit(1);
      const payload = {
        promo_price: parseInt(promoPrice),
        normal_price: parseInt(normalPrice),
        trial_days: parseInt(trialDays),
        mayar_api_key: mayarApiKey,
        mayar_webhook_secret: mayarWebhookSecret,
        mayar_mode: mayarMode,
        updated_at: new Date().toISOString()
      };
      
      let error;
      if (existing && existing.length > 0) {
        const res = await supabase.from('app_settings').update(payload).eq('id', existing[0].id);
        error = res.error;
      } else {
        const res = await supabase.from('app_settings').insert([payload]);
        error = res.error;
      }
      
      if (error) throw error;
      toast.success('Pengaturan harga dan API Mayar berhasil diperbarui!');
    } catch (err: any) {
      console.error(err);
      toast.error('Gagal menyimpan pengaturan.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isInvestorViewOnly) return;
    setIsSubmittingAcc(true);
    try {
      const payload = {
        transaction_date: accFormDate,
        type: accFormType,
        category: accFormCategory,
        description: accFormDesc,
        amount: parseFloat(accFormAmount)
      };
      const { error } = await supabase.from('cash_transactions').insert([payload]);
      if (error) throw error;
      toast.success('Transaksi kas berhasil dicatat!');
      setIsAccountingModalOpen(false);
      setAccFormDesc('');
      setAccFormAmount('');
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error('Gagal mencatat transaksi.');
    } finally {
      setIsSubmittingAcc(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (isInvestorViewOnly) return;
    if (!confirm('Yakin ingin menghapus transaksi kas ini? Aksi ini tidak dapat dibatalkan.')) return;
    
    try {
      const { error } = await supabase.from('cash_transactions').delete().eq('id', id);
      if (error) throw error;
      toast.success('Transaksi kas berhasil dihapus!');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghapus transaksi.');
    }
  };

  const filteredMerchants = useMemo(() => {
    return merchants.filter(m => {
      const matchSearch = 
        (m.nama_usaha || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.owner_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.whatsapp || '').includes(searchQuery);
      
      const matchCategory = categoryFilter === 'All' || m.kategori_usaha === categoryFilter;
      
      const now = Date.now();
      const expiresAt = m.trial_expires_at ? new Date(m.trial_expires_at).getTime() : 0;
      const isVVIP = expiresAt > now + 3000 * 24 * 60 * 60 * 1000;
      const isActive = expiresAt > now && !isVVIP;
      const isExpired = expiresAt <= now && expiresAt > 0;
      
      let matchFunnel = true;
      if (funnelFilter === 'Active Trial') matchFunnel = isActive;
      if (funnelFilter === 'Premium Member') matchFunnel = isVVIP;
      if (funnelFilter === 'Expired') matchFunnel = isExpired;
      
      return matchSearch && matchCategory && matchFunnel;
    });
  }, [merchants, searchQuery, categoryFilter, funnelFilter]);

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000);
    if (diff < 1) return 'Online / Just now';
    if (diff < 60) return `${diff} min ago`;
    if (diff < 1440) return `${Math.floor(diff/60)} hr ago`;
    return `${Math.floor(diff/1440)} days ago`;
  };

  const modalMerchants = useMemo(() => {
    const now = Date.now();
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    const startOf7DaysAgo = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000);

    return merchants.filter(m => {
      const expiresAt = m.trial_expires_at ? new Date(m.trial_expires_at).getTime() : 0;
      const isVVIP = expiresAt > now + 3000 * 24 * 60 * 60 * 1000;
      const isActive = expiresAt > now && !isVVIP;
      
      if (visitorModalFilter === 'ACTIVE_TRIAL') return isActive;
      if (visitorModalFilter === 'VVIP') return isVVIP;
      if (visitorModalFilter === 'TRAFFIC_7_DAYS') {
        const lastActive = m.last_active_at ? new Date(m.last_active_at).getTime() : 0;
        return lastActive >= startOf7DaysAgo.getTime();
      }
      return true;
    });
  }, [merchants, visitorModalFilter]);

  const openVisitorModal = (filter: 'ALL' | 'ACTIVE_TRIAL' | 'VVIP' | 'TRAFFIC_7_DAYS') => {
    setVisitorModalFilter(filter);
    setIsVisitorModalOpen(true);
  };

  const incomingUpsells = useMemo(() => {
    const list: any[] = [];
    merchants.forEach(m => {
      if (m.upsell_history && Array.isArray(m.upsell_history)) {
        m.upsell_history.forEach((req: any, index: number) => {
          list.push({
            merchant: m,
            request: req,
            index: index
          });
        });
      }
    });
    // Sort by requested_at descending
    return list.sort((a, b) => new Date(b.request.requested_at).getTime() - new Date(a.request.requested_at).getTime());
  }, [merchants]);

  const accMetrics = useMemo(() => {
    let totalInflow = 0;
    let totalOutflow = 0;
    
    cashTransactions.forEach(tx => {
      if (tx.type === 'IN') totalInflow += Number(tx.amount);
      if (tx.type === 'OUT') totalOutflow += Number(tx.amount);
    });
    
    // Estimate subscription revenue (mock logic based on active Premium users for transparency)
    const subRevenue = metrics.vvip * parseInt(promoPrice);
    
    return {
      capitalIn: totalInflow,
      expensesOut: totalOutflow,
      balance: totalInflow - totalOutflow + subRevenue,
      subRevenue: subRevenue
    };
  }, [cashTransactions, metrics.vvip, promoPrice]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] bg-slate-950">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-800 border-t-primary"></div>
      </div>
    );
  }

  // --- LOGIN GATE ---
  if (!isAdmin) {
    return (
      <div className="flex flex-col min-h-[100dvh] p-6 justify-center bg-slate-950 selection:bg-primary/20">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto drop-shadow-xl bg-white p-2 rounded-2xl">
              <img src="/assets/images/logo-logaritma.png" alt="Logaritma Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Admin Gateway</h1>
              <p className="text-sm font-medium text-slate-400">Internal Logaritma Ecosystem</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-800">
            {loginError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold rounded-2xl flex items-start gap-2">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p>{loginError}</p>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Admin Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" placeholder="logaritma.tim@gmail.com" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={isLoggingIn} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2">
              {isLoggingIn ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div> : <>Masuk Secure Portal <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- DASHBOARD ADMIN (DARK MODE LAYOUT) ---
  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-200 flex flex-col md:flex-row overflow-hidden selection:bg-blue-500/30">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 z-50 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg p-1">
            <img src="/assets/images/logo-logaritma.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-black text-white">Logaritma Admin</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-white p-2">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay / Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Left) */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:shrink-0`}>
        <div className="p-6 hidden md:flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white rounded-xl p-1.5 shadow-lg shadow-white/5">
            <img src="/assets/images/logo-logaritma.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-black text-white text-lg leading-tight tracking-tight">LOGARITMA</h1>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Admin Control</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-1">
          <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 mt-4">Main Menu</p>
          <button 
            onClick={() => { setActiveMenu('DASHBOARD'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${activeMenu === 'DASHBOARD' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button 
            onClick={() => { setActiveMenu('FUNNEL'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${activeMenu === 'FUNNEL' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <Activity size={18} /> Lead Funnel Tracker
          </button>
          <div>
            <button 
              onClick={() => setIsUpsellMenuExpanded(!isUpsellMenuExpanded)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${['UPSELL_REQUESTS', 'UPSELL_CATALOG', 'UPSELL_SETTINGS'].includes(activeMenu) ? 'text-slate-200' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              <div className="flex items-center gap-3">
                <ShoppingCart size={18} /> Manage Upsell
              </div>
              {isUpsellMenuExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {(isUpsellMenuExpanded || ['UPSELL_REQUESTS', 'UPSELL_CATALOG', 'UPSELL_SETTINGS'].includes(activeMenu)) && (
              <div className="mt-1 ml-4 pl-3 border-l border-slate-700/50 flex flex-col gap-1">
                <button 
                  onClick={() => { setActiveMenu('UPSELL_REQUESTS'); setIsSidebarOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${activeMenu === 'UPSELL_REQUESTS' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                >
                  🛒 Permintaan Upsell
                </button>
                <button 
                  onClick={() => { setActiveMenu('UPSELL_CATALOG'); setIsSidebarOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${activeMenu === 'UPSELL_CATALOG' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                >
                  📦 Katalog Produk
                </button>
                <button 
                  onClick={() => { setActiveMenu('UPSELL_SETTINGS'); setIsSidebarOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${activeMenu === 'UPSELL_SETTINGS' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                >
                  ⚙️ Link & Affiliate
                </button>
              </div>
            )}
          </div>
          
          <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 mt-6">Settings & Finance</p>
          <button 
            onClick={() => { setActiveMenu('ACCOUNTING'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${activeMenu === 'ACCOUNTING' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <DollarSign size={18} /> Accounting & Capital
          </button>
          
          {!isInvestorViewOnly && (
            <button 
              onClick={() => { setActiveMenu('SETTINGS'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${activeMenu === 'SETTINGS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              <Settings size={18} /> Provider & Pricing
            </button>
          )}
        </div>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 text-sm font-bold rounded-xl transition-colors">
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </div>

      {/* Main Content Area (Middle) */}
      <div className={`flex-1 flex flex-col h-[100dvh] overflow-hidden transition-all duration-300 ${isAIPanelOpen ? 'md:mr-80 lg:mr-96' : ''}`}>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">
                {activeMenu === 'FUNNEL' ? 'Lead Funnel & CRM' : 
                 activeMenu === 'UPSELL_REQUESTS' ? 'Permintaan Upsell (Incoming)' : 
                 activeMenu === 'UPSELL_CATALOG' ? 'Katalog Produk Ekosistem' : 
                 activeMenu === 'UPSELL_SETTINGS' ? 'Pengaturan Link & Affiliate' : 
                 activeMenu === 'ACCOUNTING' ? 'Accounting & Finance Hub' : 
                 activeMenu === 'SETTINGS' ? 'Provider & Pricing' : 
                 'Dashboard Overview'}
              </h2>
              <p className="text-sm text-slate-400 font-medium">Internal data management & monitoring.</p>
            </div>
            {/* AI Toggle Button (Desktop) */}
            <button 
              onClick={() => setIsAIPanelOpen(!isAIPanelOpen)}
              className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 transition-colors"
            >
              {isAIPanelOpen ? <><ChevronRight size={16}/> Tutup AI</> : <><Bot size={16} className="text-blue-400"/> Buka Command Center</>}
            </button>
          </div>

          {/* Metric Cards */}
          {(activeMenu === 'FUNNEL' || activeMenu === 'DASHBOARD') && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div onClick={() => openVisitorModal('ALL')} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden cursor-pointer hover:border-blue-500 hover:bg-slate-800/80 transition-all group">
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"><ExternalLink size={14} className="text-blue-400"/></div>
                <div className="absolute right-[-10px] bottom-[-10px] opacity-10"><Users size={80}/></div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Leads</p>
                <p className="text-3xl font-black text-white">{metrics.total}</p>
              </div>
              <div onClick={() => openVisitorModal('ACTIVE_TRIAL')} className="bg-slate-900 p-5 rounded-2xl border border-emerald-900/50 shadow-sm relative overflow-hidden cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all group">
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"><ExternalLink size={14} className="text-emerald-400"/></div>
                <div className="absolute right-[-10px] bottom-[-10px] opacity-10 text-emerald-500"><Clock size={80}/></div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Trial Aktif</p>
                <p className="text-3xl font-black text-emerald-400">{metrics.activeTrial}</p>
              </div>
              <div onClick={() => openVisitorModal('VVIP')} className="bg-gradient-to-br from-blue-900/40 to-slate-900 p-5 rounded-2xl border border-blue-800/50 shadow-sm relative overflow-hidden cursor-pointer hover:border-blue-500 hover:from-blue-900/60 transition-all group">
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"><ExternalLink size={14} className="text-blue-300"/></div>
                <div className="absolute right-[-10px] bottom-[-10px] opacity-20 text-blue-500"><Crown size={80}/></div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Sparkles size={12}/> VVIP / Premium</p>
                <p className="text-3xl font-black text-white">{metrics.vvip}</p>
              </div>
              <div onClick={() => openVisitorModal('TRAFFIC_7_DAYS')} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden cursor-pointer hover:border-amber-500/50 hover:bg-slate-800/80 transition-all group">
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"><ExternalLink size={14} className="text-amber-400"/></div>
                <div className="absolute right-[-10px] bottom-[-10px] opacity-10"><Activity size={80}/></div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Traffic 7 Hari</p>
                <p className="text-3xl font-black text-amber-400">{metrics.traffic7Days} <span className="text-sm text-slate-500 font-medium ml-1">users</span></p>
                <p className="text-[10px] font-bold text-slate-400 mt-1">Hari ini: {metrics.trafficToday} aktif</p>
              </div>
            </div>
          )}

          {activeMenu === 'FUNNEL' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 flex flex-col h-[600px] overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col xl:flex-row gap-4 justify-between items-center bg-slate-900/50">
                <div className="flex gap-2 w-full xl:w-auto overflow-x-auto hide-scrollbar pb-1 xl:pb-0">
                  {['All', 'Active Trial', 'Premium Member', 'Expired'].map(filter => (
                    <button 
                      key={filter}
                      onClick={() => setFunnelFilter(filter)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors border ${funnelFilter === filter ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                
                <div className="flex w-full xl:w-auto items-center gap-3">
                  <div className="relative flex-1 xl:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><Search size={14} /></div>
                    <input type="text" placeholder="Cari merchant / WA..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all" />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><Filter size={14} /></div>
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="pl-9 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium text-slate-300 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all">
                      <option value="All">Kategori</option>
                      <option value="Kuliner & F&B">F&B</option>
                      <option value="Fotokopi & Percetakan">Cetak</option>
                      <option value="Toko / Ritel">Ritel</option>
                      <option value="Laundry & Jasa">Jasa</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead className="sticky top-0 bg-slate-900 shadow-md z-10">
                    <tr className="border-b border-slate-800">
                      <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest w-10"></th>
                      <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Identitas Leads</th>
                      <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Online Status</th>
                      <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Funnel Status</th>
                      <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Aksi Cepat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredMerchants.map((m) => {
                      const isActive = m.trial_expires_at && new Date(m.trial_expires_at).getTime() > Date.now();
                      const isVVIP = m.trial_expires_at && new Date(m.trial_expires_at).getTime() > Date.now() + 3000 * 24 * 60 * 60 * 1000;
                      const isExpanded = expandedRow === m.id;
                      
                      return (
                        <React.Fragment key={m.id}>
                          <tr className={`hover:bg-slate-800/50 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-800/30' : ''}`} onClick={() => toggleRow(m.id)}>
                            <td className="p-4 text-slate-500">
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </td>
                            <td className="p-4">
                              <div className="font-bold text-slate-200 flex items-center gap-2">
                                {m.nama_usaha || 'Tanpa Nama'}
                                {m.upsell_history && Array.isArray(m.upsell_history) && m.upsell_history.some((r:any) => r.status === 'Pending') && (
                                  <span className="bg-amber-500/20 text-amber-400 text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider border border-amber-500/30">
                                    UPSELL REQ
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-400 font-medium">{m.kategori_usaha || 'Kategori Lain'} • {m.whatsapp || '-'}</span>
                                {m.whatsapp && (
                                  <a href={`https://wa.me/62${m.whatsapp.replace(/\D/g, '').replace(/^0+/, '')}`} target="_blank" rel="noreferrer" onClick={(e)=>e.stopPropagation()} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded text-[10px] font-bold border border-green-500/20 hover:bg-green-500/20 transition-colors">
                                    <MessageCircle size={10} /> WA
                                  </a>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${formatTimeAgo(m.last_active_at).includes('min ago') || formatTimeAgo(m.last_active_at).includes('Online') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse' : 'bg-slate-600'}`}></div>
                                <span className="text-xs font-bold text-slate-400">{formatTimeAgo(m.last_active_at)}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              {isVVIP ? (
                                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20"><Crown size={12} /> Premium</div>
                              ) : isActive ? (
                                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Trial Aktif</div>
                              ) : (
                                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-md border border-red-500/20"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Expired</div>
                              )}
                            </td>
                            <td className="p-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                              {!isInvestorViewOnly && (
                                <>
                                  <button onClick={() => addTrialDays(m.id, m.trial_expires_at)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-colors shadow-sm" title="Perpanjang +7 Hari"><PlusCircle size={14} /> +7 Hari</button>
                                  <button onClick={() => activateVVIP(m.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-xs font-bold rounded-lg transition-colors shadow-sm" title="Set Lifetime VVIP"><Crown size={14} /> Set Premium</button>
                                  <button 
                                    onClick={() => toggleInvestorRole(m.id, m.is_investor_view_only || false)} 
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-xs font-bold rounded-lg transition-colors shadow-sm ${m.is_investor_view_only ? 'bg-cyan-600/20 hover:bg-cyan-600/30 border-cyan-500/30 text-cyan-400' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'}`}
                                    title={m.is_investor_view_only ? "Batalkan Role Investor" : "Set sebagai Investor"}
                                  >
                                    <Eye size={14} /> {m.is_investor_view_only ? 'Investor View-Only' : 'Set Investor'}
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-slate-950/50 border-b border-slate-800">
                              <td></td>
                              <td colSpan={4} className="p-4 pt-0">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-sm">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Smartphone size={12} /> Device & Network</p>
                                    <p className="text-xs font-medium text-slate-300 break-all">{m.device_info || 'No data available'}</p>
                                    <p className="text-xs font-bold text-blue-400 mt-2">IP: {m.ip_address || 'Unknown'}</p>
                                  </div>
                                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-sm">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Activity size={12} /> Drop-off Tracker</p>
                                    <p className="text-xs font-medium text-slate-400 mb-1">Current / Last Page Visited:</p>
                                    <code className="text-[10px] font-bold text-slate-300 bg-slate-950 border border-slate-800 px-2 py-1 rounded inline-block w-full overflow-hidden text-ellipsis whitespace-nowrap">{m.current_page || '/'}</code>
                                  </div>
                                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-sm flex flex-col h-full max-h-40">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1"><ShoppingCart size={12} /> Permintaan Upsell Aktif</p>
                                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                      {!m.upsell_history || !Array.isArray(m.upsell_history) || m.upsell_history.length === 0 ? (
                                        <p className="text-xs font-medium text-slate-500 italic">Belum ada upsell yang diminta.</p>
                                      ) : (
                                        m.upsell_history.map((req: any, idx: number) => (
                                          <div key={idx} className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex flex-col gap-2">
                                            <div className="flex justify-between items-start">
                                              <div>
                                                <p className="text-[11px] font-bold text-slate-200 leading-tight">{req.product}</p>
                                                <p className="text-[9px] text-slate-500">{new Date(req.requested_at).toLocaleDateString('id-ID', {day: 'numeric', month:'short'})}</p>
                                              </div>
                                              <select 
                                                value={req.status} 
                                                onChange={(e) => updateUpsellStatus(m.id, idx, e.target.value, m.upsell_history)}
                                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded outline-none cursor-pointer border ${req.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : req.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}
                                              >
                                                <option value="Pending" className="bg-slate-900 text-amber-400">Pending</option>
                                                <option value="Followed Up" className="bg-slate-900 text-blue-400">Followed Up</option>
                                                <option value="Completed" className="bg-slate-900 text-emerald-400">Completed</option>
                                              </select>
                                            </div>
                                            <a href={`https://wa.me/62${m.whatsapp?.replace(/\D/g, '').replace(/^0+/, '')}?text=Halo%20kak%20dari%20${encodeURIComponent(m.nama_usaha || 'Toko')},%20kami%20melihat%20Anda%20tertarik%20dengan%20${encodeURIComponent(req.product)}...`} target="_blank" rel="noreferrer" className="w-full text-center py-1.5 bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold rounded-md flex items-center justify-center gap-1 transition-colors">
                                              <MessageCircle size={10} /> Follow Up via WA
                                            </a>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                    {filteredMerchants.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-12 text-center">
                           <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 border border-slate-800 text-slate-500 rounded-full mb-4 shadow-sm"><Search size={24} /></div>
                           <p className="text-slate-400 font-medium">Tidak ada data leads yang sesuai dengan pencarian.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeMenu === 'UPSELL_CATALOG' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex items-center justify-between border border-blue-800/30">
                <div>
                  <h2 className="text-2xl font-black tracking-tight mb-2">Ecosystem & Upsell Hub</h2>
                  <p className="text-blue-200 font-medium max-w-lg">Kelola katalog produk fisik dan servis pendukung Logaritma untuk meningkatkan LTV merchant.</p>
                </div>
                <div className="w-16 h-16 bg-white/10 rounded-2xl hidden sm:flex items-center justify-center backdrop-blur-md border border-white/10"><ShoppingCart size={32} className="text-white" /></div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm flex flex-col">
                  <div className="w-12 h-12 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-xl flex items-center justify-center mb-4"><ShoppingCart size={24} /></div>
                  <h3 className="font-black text-white text-lg">Mini Printer Thermal</h3>
                  <p className="text-sm text-slate-400 mt-2 flex-1">Solusi hardware kasir fisik via Shopee Affiliate. Komisi cair saat merchant beli printer dari link Anda.</p>
                  <div className="mt-6 pt-4 border-t border-slate-800">
                    <a href="https://shope.ee/contoh_affiliate_link" target="_blank" rel="noreferrer" className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors">
                      Copy Link Affiliate <ExternalLink size={16} />
                    </a>
                  </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm flex flex-col relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-[10px] font-black bg-blue-500/20 border border-blue-500/30 text-blue-400 px-2 py-1 rounded-md">HIGH TICKET</div>
                  <div className="w-12 h-12 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl flex items-center justify-center mb-4"><Activity size={24} /></div>
                  <h3 className="font-black text-white text-lg">Jasa Meta / TikTok Ads</h3>
                  <p className="text-sm text-slate-400 mt-2 flex-1">Tawarkan paket pengelolaan iklan untuk merchant yang ingin omsetnya naik pesat.</p>
                  <div className="mt-6 pt-4 border-t border-slate-800">
                    <button className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors">
                      <MessageCircle size={16} /> Tawarkan via WA
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm flex flex-col">
                  <div className="w-12 h-12 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl flex items-center justify-center mb-4"><Crown size={24} /></div>
                  <h3 className="font-black text-white text-lg">Premium Setup Menu</h3>
                  <p className="text-sm text-slate-400 mt-2 flex-1">Jasa input ratusan menu & gambar secara massal bagi merchant sibuk yang tidak punya waktu.</p>
                  <div className="mt-6 pt-4 border-t border-slate-800">
                    <button className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors">
                      <MessageCircle size={16} /> Tawarkan via WA
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'UPSELL_REQUESTS' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 flex flex-col h-[600px] overflow-hidden">
              <div className="p-5 border-b border-slate-800 bg-slate-900/50">
                <h3 className="text-lg font-black text-white flex items-center gap-2"><ShoppingCart size={20} className="text-amber-500" /> Incoming Upsell Requests</h3>
              </div>
              <div className="overflow-y-auto flex-1 custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead className="sticky top-0 bg-slate-900 shadow-md z-10">
                    <tr className="border-b border-slate-800">
                      <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tanggal</th>
                      <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Merchant</th>
                      <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Produk Diminta</th>
                      <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {incomingUpsells.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 text-xs font-medium text-slate-400">
                          {new Date(item.request.requested_at).toLocaleDateString('id-ID', {day: 'numeric', month:'short', year:'numeric'})}
                        </td>
                        <td className="p-4">
                          <p className="text-sm font-bold text-slate-200">{item.merchant.nama_usaha || 'Tanpa Nama'}</p>
                          <p className="text-xs text-slate-500 font-medium">{item.merchant.whatsapp || '-'}</p>
                        </td>
                        <td className="p-4 text-sm font-bold text-blue-400">
                          {item.request.product}
                        </td>
                        <td className="p-4">
                          <select 
                            value={item.request.status} 
                            onChange={(e) => updateUpsellStatus(item.merchant.id, item.index, e.target.value, item.merchant.upsell_history)}
                            className={`text-xs font-bold px-2 py-1 rounded outline-none cursor-pointer border ${item.request.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : item.request.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}
                          >
                            <option value="Pending" className="bg-slate-900 text-amber-400">Pending</option>
                            <option value="Followed Up" className="bg-slate-900 text-blue-400">Followed Up</option>
                            <option value="Completed" className="bg-slate-900 text-emerald-400">Completed</option>
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <a href={`https://wa.me/62${item.merchant.whatsapp?.replace(/\D/g, '').replace(/^0+/, '')}?text=Halo%20kak%20dari%20${encodeURIComponent(item.merchant.nama_usaha || 'Toko')},%20kami%20melihat%20Anda%20tertarik%20dengan%20${encodeURIComponent(item.request.product)}...`} target="_blank" rel="noreferrer" className="inline-flex py-1.5 px-3 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg items-center gap-1.5 transition-colors">
                            <MessageCircle size={14} /> Hubungi via WA
                          </a>
                        </td>
                      </tr>
                    ))}
                    {incomingUpsells.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-slate-500">Tidak ada data permintaan upsell masuk.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeMenu === 'UPSELL_SETTINGS' && (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-slate-800 rounded-3xl">
              <div className="text-center">
                <Settings size={48} className="mx-auto text-slate-700 mb-4" />
                <p className="text-slate-400 font-medium">Modul Pengaturan Affiliate Link sedang dalam pengembangan.</p>
              </div>
            </div>
          )}

          {activeMenu === 'ACCOUNTING' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex items-center justify-between border border-blue-800/30">
                <div>
                  <h2 className="text-2xl font-black tracking-tight mb-2">Accounting & Finance Hub</h2>
                  <p className="text-blue-200 font-medium max-w-lg">Transparansi arus kas, modal investor, dan pengeluaran operasional.</p>
                </div>
                {!isInvestorViewOnly && (
                  <button onClick={() => setIsAccountingModalOpen(true)} className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-md">
                    <PlusCircle size={18} /> Catat Transaksi
                  </button>
                )}
              </div>

              {/* Accounting Metrics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
                  <div className="absolute right-[-10px] bottom-[-10px] opacity-10"><DollarSign size={80}/></div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Modal (IN)</p>
                  <p className="text-2xl font-black text-white">Rp {accMetrics.capitalIn.toLocaleString('id-ID')}</p>
                </div>
                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
                  <div className="absolute right-[-10px] bottom-[-10px] opacity-10 text-red-500"><TrendingUp size={80} className="transform rotate-180"/></div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Pengeluaran (OUT)</p>
                  <p className="text-2xl font-black text-red-400">Rp {accMetrics.expensesOut.toLocaleString('id-ID')}</p>
                </div>
                <div className="bg-slate-900 p-5 rounded-2xl border border-blue-900/50 shadow-sm relative overflow-hidden group">
                  <div className="absolute right-[-10px] bottom-[-10px] opacity-10 text-blue-500"><CreditCard size={80}/></div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Sisa Kas & Runway</p>
                  <p className="text-2xl font-black text-blue-400">Rp {accMetrics.balance.toLocaleString('id-ID')}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900 p-5 rounded-2xl border border-emerald-800/50 shadow-sm relative overflow-hidden group">
                  <div className="absolute right-[-10px] bottom-[-10px] opacity-10 text-emerald-500"><Sparkles size={80}/></div>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-1">Est. Pendapatan (MRR)</p>
                  <p className="text-2xl font-black text-white">Rp {accMetrics.subRevenue.toLocaleString('id-ID')}</p>
                </div>
              </div>

              {!isInvestorViewOnly && (
                <button onClick={() => setIsAccountingModalOpen(true)} className="sm:hidden w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md">
                  <PlusCircle size={18} /> Catat Transaksi Baru
                </button>
              )}

              <div className="bg-slate-900 rounded-2xl border border-slate-800 flex flex-col h-[500px] overflow-hidden">
                <div className="p-5 border-b border-slate-800 bg-slate-900/50">
                  <h3 className="text-lg font-black text-white flex items-center gap-2"><Activity size={20} className="text-blue-500" /> Riwayat Transaksi Kas</h3>
                </div>
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead className="sticky top-0 bg-slate-900 shadow-md z-10">
                      <tr className="border-b border-slate-800">
                        <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tanggal</th>
                        <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Kategori</th>
                        <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Deskripsi</th>
                        <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipe</th>
                        <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Nominal (Rp)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {cashTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-4 text-xs font-medium text-slate-400">
                            {new Date(tx.transaction_date).toLocaleDateString('id-ID', {day: 'numeric', month:'short', year:'numeric'})}
                          </td>
                          <td className="p-4 text-xs font-bold text-slate-300">
                            {tx.category}
                          </td>
                          <td className="p-4 text-xs text-slate-400">
                            {tx.description || '-'}
                          </td>
                          <td className="p-4">
                            {tx.type === 'IN' ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-500/20">INFLOW</span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 text-[10px] font-black px-2 py-0.5 rounded border border-red-500/20">OUTFLOW</span>
                            )}
                          </td>
                          <td className={`p-4 text-right text-sm font-black ${tx.type === 'IN' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {tx.type === 'IN' ? '+' : '-'} {Number(tx.amount).toLocaleString('id-ID')}
                            {!isInvestorViewOnly && (
                              <button onClick={() => handleDeleteTransaction(tx.id)} className="ml-3 p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors inline-flex align-middle" title="Hapus Transaksi">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {cashTransactions.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-12 text-center text-slate-500">Belum ada data transaksi kas.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'SETTINGS' && !isInvestorViewOnly && (
            <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-gradient-to-r from-slate-900 to-slate-950 rounded-3xl p-8 border border-slate-800 shadow-xl">
                <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2"><Settings size={24} className="text-blue-500" /> Provider & Pricing</h2>
                <p className="text-sm text-slate-400 font-medium">Atur paket langganan dan integrasi gateway pembayaran Mayar.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Pricing & Trial */}
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-5">
                  <h3 className="font-black text-white text-lg flex items-center gap-2"><DollarSign size={20} className="text-emerald-500" /> Atur Paket & Harga Langganan</h3>
                  
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Harga Promo Bulanan (Rp)</label>
                    <input type="number" value={promoPrice} onChange={(e) => setPromoPrice(e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Harga Coret / Normal (Rp)</label>
                    <input type="number" value={normalPrice} onChange={(e) => setNormalPrice(e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Durasi Trial Gratis (Hari)</label>
                    <input type="number" value={trialDays} onChange={(e) => setTrialDays(e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all" />
                  </div>
                </div>

                {/* Mayar Gateway */}
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-5">
                  <h3 className="font-black text-white text-lg flex items-center gap-2"><CreditCard size={20} className="text-blue-500" /> Integrasi Payment Gateway Mayar</h3>
                  
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Mode Transaksi</label>
                    <select value={mayarMode} onChange={(e) => setMayarMode(e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer">
                      <option value="sandbox">Sandbox (Testing)</option>
                      <option value="production">Production (Live)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Mayar API Key</label>
                    <div className="relative">
                      <input type={showApiKey ? "text" : "password"} value={mayarApiKey} onChange={(e) => setMayarApiKey(e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all pr-12" placeholder="sk_..." />
                      <button onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Mayar Webhook Secret</label>
                    <div className="relative">
                      <input type={showWebhookSecret ? "text" : "password"} value={mayarWebhookSecret} onChange={(e) => setMayarWebhookSecret(e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all pr-12" placeholder="wh_..." />
                      <button onClick={() => setShowWebhookSecret(!showWebhookSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        {showWebhookSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button onClick={handleSaveSettings} disabled={isSavingSettings} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50 flex items-center gap-2">
                  {isSavingSettings ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div> : <Save size={18} />}
                  Simpan Pengaturan
                </button>
              </div>
            </div>
          )}

          {activeMenu === 'DASHBOARD' && (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-slate-800 rounded-3xl">
              <div className="text-center">
                <LayoutPanelLeft size={48} className="mx-auto text-slate-700 mb-4" />
                <p className="text-slate-400 font-medium">Modul DASHBOARD sedang dalam pengembangan.</p>
              </div>
            </div>
          )}
          
        </div>
      </div>

      {/* Mobile Overlay for AI Panel */}
      {isAIPanelOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsAIPanelOpen(false)}></div>
      )}

      {/* Right AI Command Center (Collapsible) */}
      <div className={`fixed inset-y-0 right-0 z-50 w-[85%] max-w-sm lg:w-96 bg-slate-900 border-l border-slate-800 flex flex-col transition-transform duration-300 ease-in-out transform shadow-2xl ${isAIPanelOpen ? 'translate-x-0' : 'translate-x-full'} md:z-30`}>
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Bot size={16} className="text-white" />
            </div>
            <h2 className="font-black text-white tracking-tight">AI Command Center</h2>
          </div>
          <button onClick={() => setIsAIPanelOpen(false)} className="text-slate-500 hover:text-white transition-colors p-1 md:hidden">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
          
          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1"><TrendingUp size={12}/> Revenue Intelligence</p>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-400">Total Potential MRR</p>
                <div className="flex items-end gap-2 mt-1">
                  <p className="text-2xl font-black text-emerald-400">Rp {(metrics.total * 49000).toLocaleString('id-ID')}</p>
                  <span className="text-[10px] text-emerald-500/70 font-bold mb-1">/mo</span>
                </div>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-1/4"></div>
              </div>
              <p className="text-[10px] font-medium text-slate-500">Dihitung dari {metrics.total} total leads (asumsi konversi 100% pada harga promo Rp49rb).</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1"><Zap size={12}/> AI Insights & Action Items</p>
            
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex gap-3 hover:bg-slate-800 transition-colors cursor-pointer">
              <div className="w-8 h-8 bg-amber-500/10 text-amber-400 rounded-lg flex items-center justify-center shrink-0 border border-amber-500/20"><AlertCircle size={14}/></div>
              <div>
                <p className="text-xs font-bold text-slate-200 leading-tight mb-1">Follow up {metrics.expiredTrial} Trial Expired</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">Terdapat merchant yang masa trialnya habis. Tawarkan harga spesial atau perpanjang trial +7 hari.</p>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex gap-3 hover:bg-slate-800 transition-colors cursor-pointer">
              <div className="w-8 h-8 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center shrink-0 border border-blue-500/20"><Database size={14}/></div>
              <div>
                <p className="text-xs font-bold text-slate-200 leading-tight mb-1">Top Kategori: Kuliner & F&B</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">Mayoritas leads saat ini fokus pada F&B. Prioritaskan peluncuran fitur manajemen resep & HPP.</p>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex gap-3 hover:bg-slate-800 transition-colors cursor-pointer">
              <div className="w-8 h-8 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center shrink-0 border border-emerald-500/20"><Activity size={14}/></div>
              <div>
                <p className="text-xs font-bold text-slate-200 leading-tight mb-1">{metrics.trafficToday} Active User Hari Ini</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">Engagement rate stabil. Pertahankan performa server dan uptime aplikasi.</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      
      {/* Mobile Overlay for Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-950/80 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Visitor Log Modal */}
      {isVisitorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsVisitorModalOpen(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2"><BarChart3 size={24} className="text-blue-500"/> Riwayat Pengunjung & Activity Log</h2>
                <p className="text-sm text-slate-400 font-medium mt-1">Log aktivitas real-time pengunjung halaman utama logaritma.id & aplikasi.</p>
              </div>
              <button onClick={() => setIsVisitorModalOpen(false)} className="text-slate-500 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 p-2 rounded-xl">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex gap-2 overflow-x-auto hide-scrollbar">
              <button onClick={() => setVisitorModalFilter('ALL')} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors border ${visitorModalFilter === 'ALL' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}>All Leads Registered</button>
              <button onClick={() => setVisitorModalFilter('ACTIVE_TRIAL')} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors border ${visitorModalFilter === 'ACTIVE_TRIAL' ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}>Active Trial Only</button>
              <button onClick={() => setVisitorModalFilter('VVIP')} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors border ${visitorModalFilter === 'VVIP' ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}>Premium VVIP Only</button>
              <button onClick={() => setVisitorModalFilter('TRAFFIC_7_DAYS')} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors border ${visitorModalFilter === 'TRAFFIC_7_DAYS' ? 'bg-amber-600/20 text-amber-400 border-amber-500/30' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}>Traffic (7 Days)</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="sticky top-0 bg-slate-900 z-10 shadow-sm">
                  <tr className="border-b border-slate-800">
                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Waktu</th>
                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Merchant / Kontak</th>
                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">IP & Lokasi</th>
                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Device Info</th>
                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Aktivitas Terakhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {modalMerchants.map((m) => {
                    const timeDate = m.last_active_at ? new Date(m.last_active_at) : new Date(m.created_at);
                    const formattedDate = timeDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                    const formattedTime = timeDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                    // Mock location if not available since it's just an IP usually
                    const locationMock = m.ip_address ? 'Indonesia (Estimated)' : 'Unknown';
                    
                    return (
                      <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4">
                          <p className="text-sm font-bold text-slate-200">{formattedDate}</p>
                          <p className="text-xs text-slate-500 font-medium">{formattedTime}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm font-bold text-blue-400">{m.nama_usaha || 'Guest'}</p>
                          <p className="text-xs text-slate-500 font-medium">{m.whatsapp || '-'}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm font-bold text-slate-300 font-mono bg-slate-950 inline-block px-2 py-0.5 rounded border border-slate-800 mb-1">{m.ip_address || 'N/A'}</p>
                          <p className="text-xs text-slate-500 font-medium flex items-center gap-1"><MapPin size={10}/> {locationMock}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-start gap-2">
                            <Smartphone size={14} className="text-slate-400 mt-0.5 shrink-0" />
                            <p className="text-[11px] text-slate-400 leading-tight line-clamp-2 max-w-[200px]" title={m.device_info}>{m.device_info || 'Unknown Device'}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-800 border border-slate-700 rounded-md text-[11px] font-bold text-slate-300 max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap" title={m.current_page || 'Unknown Page'}>
                            <Activity size={12} className="text-blue-500" /> {m.current_page || 'Landing Page'}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {modalMerchants.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-slate-500">Tidak ada riwayat aktivitas untuk filter ini.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Accounting Transaction Modal */}
      {isAccountingModalOpen && !isInvestorViewOnly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsAccountingModalOpen(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <h2 className="text-lg font-black text-white flex items-center gap-2"><DollarSign size={20} className="text-blue-500"/> Catat Transaksi Kas</h2>
              <button onClick={() => setIsAccountingModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddTransaction} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tipe Transaksi</label>
                  <select required value={accFormType} onChange={(e) => setAccFormType(e.target.value as 'IN'|'OUT')} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="OUT">Pengeluaran (OUT)</option>
                    <option value="IN">Pemasukan / Modal (IN)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tanggal</label>
                  <input type="date" required value={accFormDate} onChange={(e) => setAccFormDate(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kategori</label>
                <select required value={accFormCategory} onChange={(e) => setAccFormCategory(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="Infra / Server">Infra / Server (Vercel, Supabase)</option>
                  <option value="Marketing / Ads">Marketing / Ads</option>
                  <option value="WA Gateway">WA Gateway API</option>
                  <option value="Inject Modal Investor">Inject Modal Investor</option>
                  <option value="Pendapatan Langganan">Pendapatan Langganan</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nominal (Rp)</label>
                <input type="number" required min="0" value={accFormAmount} onChange={(e) => setAccFormAmount(e.target.value)} placeholder="Contoh: 150000" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              
              {accFormCategory === 'Inject Modal Investor' ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Item (Deskripsi)</label>
                  <select required value={accFormDesc} onChange={(e) => setAccFormDesc(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="" disabled>-- Pilih Item Pendanaan --</option>
                    <option value="Hosting & Database (Vercel, Supabase)">Hosting & Database (Rp 350rb)</option>
                    <option value="WhatsApp Gateway API">WhatsApp Gateway API (Rp 100rb)</option>
                    <option value="OpenAI / Gemini API Tokens">OpenAI / Gemini API Tokens (Rp 200rb)</option>
                    <option value="Pemasaran Awal (GTM / Meta Ads)">Pemasaran Awal / GTM (Rp 1jt)</option>
                    <option value="Cadangan Kas Operasional">Cadangan Kas Operasional (Rp 300rb)</option>
                    <option value="Pendanaan Umum / Bebas">Pendanaan Umum / Bebas</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Keterangan / Deskripsi</label>
                  <input type="text" required value={accFormDesc} onChange={(e) => setAccFormDesc(e.target.value)} placeholder="Misal: Bayar tagihan Vercel bulan Agustus" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              )}
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAccountingModalOpen(false)} className="px-4 py-2.5 text-sm font-bold text-slate-400 hover:text-white transition-colors">Batal</button>
                <button type="submit" disabled={isSubmittingAcc} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50 flex items-center gap-2">
                  {isSubmittingAcc ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div> : <Save size={16} />}
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #475569;
        }
      `}</style>
    </div>
  );
}
