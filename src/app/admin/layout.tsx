'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import {
  LayoutDashboard, Menu, X, ArrowRight, TrendingUp, ChevronRight, AlertCircle, LogOut,
  Settings, Bot, Activity, Filter, Share2, Store, Users, MessageCircle, Ticket,
  DollarSign, CreditCard, PieChart
} from 'lucide-react';
import { toast } from 'sonner';
import GlobalPageGuide from '@/components/admin/GlobalPageGuide';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');

  const checkAuth = async () => {
    setLoading(true);
    try {
      // Check local bypass first
      if (typeof window !== 'undefined' && sessionStorage.getItem('logaritma_admin_auth') === 'true') {
        setIsAdmin(true);
        setAdminEmail('logaritma.tim@gmail.com');
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsAdmin(false); setLoading(false); return; }
      const { data: profile } = await supabase
        .from('merchants')
        .select('is_admin, is_investor_view_only')
        .eq('user_id', user.id)
        .maybeSingle();
      const isHardcodedAdmin = user.email === 'logaritma.tim@gmail.com';
      const isProfileAdmin = profile?.is_admin;
      const isInvestor = profile?.is_investor_view_only;
      if (!isHardcodedAdmin && !isProfileAdmin && !isInvestor) {
        setLoginError('Akses Terbatas: Akun ini tidak memiliki hak akses Admin.');
        await supabase.auth.signOut();
        setIsAdmin(false);
      } else {
        setIsAdmin(true);
        setAdminEmail(user.email || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { checkAuth(); }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      // Hardcode bypass since Supabase might not have this credential
      if (email === 'logaritma.tim@gmail.com' && password === 'adminlog2026') {
        sessionStorage.setItem('logaritma_admin_auth', 'true');
        setIsAdmin(true);
        setAdminEmail(email);
        setIsLoggingIn(false);
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setLoginError('Kredensial tidak valid.'); return; }
      await checkAuth();
    } catch (err: any) {
      setLoginError(err.message || 'Gagal masuk.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('logaritma_admin_auth');
    await supabase.auth.signOut();
    setIsAdmin(false);
    setEmail('');
    setPassword('');
    toast.success('Berhasil logout');
  };

  const pillars = [
    {
      title: 'RUANG FOUNDER',
      items: [
        { href: '/admin', label: 'Ringkasan Bisnis', icon: LayoutDashboard, color: 'blue' },
        { href: '/admin/founder/logaritma', label: 'Monitor Logaritma AI', icon: Activity, color: 'blue' },
        { href: '/admin/founder/workspace', label: 'Ruang Kerja Founder', icon: Users, color: 'blue' },
        { href: '/admin/founder/treasury', label: 'Kas & Bagi Hasil', icon: DollarSign, color: 'blue' }
      ]
    },
    {
      title: 'SISTEM & TEKNOLOGI',
      items: [
        { href: 'https://coway.logaritma.id/admin', label: 'Coway Admin', icon: LayoutDashboard, color: 'blue' },
        { href: '/admin/tech/ubos', label: 'Fitur Kasir & Toko', icon: Settings, color: 'emerald' },
        { href: '/admin/tech/ai-copilot', label: 'Atur Otak AI', icon: Bot, color: 'emerald' },
        { href: '/admin/tech/health', label: 'Kesehatan Server', icon: Activity, color: 'emerald' },
      ]
    },
    {
      title: 'PEMASARAN & PENJUALAN',
      items: [
        { href: '/admin/growth/funnel', label: 'Arus Calon Pelanggan', icon: Filter, color: 'purple' },
        { href: '/admin/growth/affiliate', label: 'Bagi Hasil Mitra', icon: Share2, color: 'purple' },
        { href: '/admin/growth/store', label: 'Toko Alat & Layanan', icon: Store, color: 'purple' },
      ]
    },
    {
      title: 'LAYANAN PELANGGAN',
      items: [
        { href: '/admin/ops/merchants', label: 'Daftar Toko & Kasir', icon: Users, color: 'amber' },
        { href: '/admin/ops/wa-crm', label: 'Riwayat Pesan WA', icon: MessageCircle, color: 'amber' },
        { href: '/admin/ops/tickets', label: 'Pusat Bantuan Toko', icon: Ticket, color: 'amber' },
      ]
    },
    {
      title: 'KEUANGAN & KAS',
      items: [
        { href: '/admin/finance/mrr', label: 'Pendapatan Langganan', icon: DollarSign, color: 'indigo' },
        { href: '/admin/finance/affiliate-payout', label: 'Pencairan Komisi', icon: CreditCard, color: 'indigo' },
        { href: '/admin/finance/streams', label: '5 Sumber Uang Masuk', icon: PieChart, color: 'indigo' },
      ]
    }
  ];

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const activeColorMap: Record<string, string> = {
    blue: 'bg-blue-600 text-white shadow-lg shadow-blue-900/30',
    indigo: 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30',
    purple: 'bg-purple-600 text-white shadow-lg shadow-purple-900/30',
    emerald: 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30',
    amber: 'bg-amber-600 text-white shadow-lg shadow-amber-900/30',
  };

  const inactiveHoverMap: Record<string, string> = {
    blue: 'hover:bg-blue-500/10 hover:text-blue-300',
    indigo: 'hover:bg-indigo-500/10 hover:text-indigo-300',
    purple: 'hover:bg-purple-500/10 hover:text-purple-300',
    emerald: 'hover:bg-emerald-500/10 hover:text-emerald-300',
    amber: 'hover:bg-amber-500/10 hover:text-amber-300',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl p-2 shadow-xl">
            <img src="/assets/images/logo-logaritma.png" alt="Logaritma" className="w-full h-full object-contain" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-800 border-t-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col min-h-[100dvh] p-6 justify-center bg-slate-950">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto drop-shadow-xl bg-white p-2 rounded-2xl">
              <img src="/assets/images/logo-logaritma.png" alt="Logaritma" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Admin Gateway</h1>
              <p className="text-sm font-medium text-slate-400">Logaritma Internal Control Panel</p>
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
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="logaritma.tim@gmail.com" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={isLoggingIn}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2">
              {isLoggingIn
                ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                : <><span>Masuk Secure Portal</span> <ArrowRight size={18} /></>
              }
            </button>
          </form>
          <p className="text-center text-xs text-slate-600">Logaritma AI Business Copilot v2.0 · Internal Only</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-slate-950 text-slate-200 flex flex-col overflow-hidden font-sans">
      {/* Mobile Header */}
      <div className="md:hidden flex-none flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg p-1 shadow-md">
            <img src="/assets/images/logo-logaritma.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-black text-white text-sm block leading-tight">LOGARITMA</span>
            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">HQ Admin</span>
          </div>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors">
          {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`
          absolute inset-y-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-800 flex flex-col
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:shrink-0
        `}>
          {/* Logo */}
          <div className="p-5 hidden md:flex items-center gap-3 mb-2 border-b border-slate-800">
            <div className="w-10 h-10 bg-white rounded-xl p-1.5 shadow-lg shadow-white/5 shrink-0">
              <img src="/assets/images/logo-logaritma.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-black text-white text-base leading-tight tracking-tight">LOGARITMA</h1>
              <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Kantor Pusat</p>
            </div>
          </div>

          {/* Nav */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
            {pillars.map((pillar, index) => (
              <div key={index}>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 pl-1">
                  {pillar.title}
                </p>
                <div className="space-y-1">
                  {pillar.items.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setIsSidebarOpen(false)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all
                        ${isActive(item.href)
                          ? activeColorMap[item.color]
                          : `text-slate-400 ${inactiveHoverMap[item.color]}`
                        }
                      `}>
                      <item.icon size={17} className="shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {isActive(item.href) && <ChevronRight size={13} className="shrink-0 opacity-70" />}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* User Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <div className="p-3 bg-slate-800 rounded-xl mb-3 border border-slate-700/50">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Admin Akun</p>
              <p className="text-xs text-white font-bold truncate">{adminEmail}</p>
            </div>
            <button onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 text-sm font-bold rounded-xl transition-colors">
              <LogOut size={16} /> Keluar
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <GlobalPageGuide />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
