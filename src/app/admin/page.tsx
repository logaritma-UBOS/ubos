'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ShieldCheck, Users, Clock, PlusCircle, CheckCircle2, AlertCircle, LogOut, MessageCircle, Crown, Search, Filter, ArrowRight } from 'lucide-react';
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

  // Dashboard State
  const [merchants, setMerchants] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const [metrics, setMetrics] = useState({
    total: 0,
    activeTrial: 0,
    expiredTrial: 0,
    vvip: 0,
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

      // Check admin status
      const { data: profile } = await supabase
        .from('merchants')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const isHardcodedAdmin = user.email === 'logaritma.tim@gmail.com';
      const isProfileAdmin = profile && profile.is_admin;

      if (!isHardcodedAdmin && !isProfileAdmin) {
        setLoginError('Akses Terbatas: Akun ini tidak memiliki hak akses Admin Logaritma.');
        await supabase.auth.signOut();
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      // Fetch all merchants
      const { data: allMerchants, error } = await supabase
        .from('merchants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (allMerchants) {
        setMerchants(allMerchants);
        
        const now = new Date().getTime();
        let active = 0;
        let expired = 0;
        let vvipCount = 0;
        const cats: Record<string, number> = {};

        allMerchants.forEach(m => {
          const expiresAt = m.trial_expires_at ? new Date(m.trial_expires_at).getTime() : 0;
          const isVVIP = expiresAt > now + 3000 * 24 * 60 * 60 * 1000;

          if (isVVIP) {
            vvipCount++;
          } else if (expiresAt > now) {
            active++;
          } else {
            expired++;
          }

          const cat = m.kategori_usaha || 'Lainnya';
          cats[cat] = (cats[cat] || 0) + 1;
        });

        setMetrics({
          total: allMerchants.length,
          activeTrial: active,
          expiredTrial: expired,
          vvip: vvipCount,
          categories: cats
        });
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
      await fetchData(); // Will handle auth validation and redirection naturally
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
      // Simulate VVIP activation by setting trial far in the future
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

  const filteredMerchants = useMemo(() => {
    return merchants.filter(m => {
      const matchSearch = 
        (m.nama_usaha || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.owner_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.whatsapp || '').includes(searchQuery);
      
      const matchCategory = categoryFilter === 'All' || m.kategori_usaha === categoryFilter;
      
      return matchSearch && matchCategory;
    });
  }, [merchants, searchQuery, categoryFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-primary"></div>
      </div>
    );
  }

  // --- LOGIN GATE ---
  if (!isAdmin) {
    return (
      <div className="flex flex-col min-h-screen p-6 justify-center bg-slate-50 selection:bg-primary/20">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto drop-shadow-xl">
              <img src="/assets/images/logo-logaritma.png" alt="Logaritma Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Gateway</h1>
              <p className="text-sm font-medium text-slate-500">Internal Logaritma Ecosystem</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            {loginError && (
              <div className="p-4 bg-danger/10 border border-danger/20 text-danger text-sm font-semibold rounded-2xl flex items-start gap-2">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p>{loginError}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all"
                placeholder="logaritma.tim@gmail.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoggingIn}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center gap-2"
            >
              {isLoggingIn ? (
                 <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-500 border-t-white"></div>
              ) : (
                 <>Masuk Secure Portal <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- DASHBOARD ADMIN ---
  return (
    <div className="min-h-screen bg-slate-50 p-6 selection:bg-slate-900/20">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center drop-shadow-md">
              <img src="/assets/images/logo-logaritma.png" alt="Logaritma Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Logaritma Admin Panel</h1>
                <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-600 text-[10px] font-black uppercase tracking-wider rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  Authenticated
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium">Pengelolaan Hak Akses & Leads Ecosystem</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="text-sm font-bold text-slate-600 hover:text-danger bg-slate-100 hover:bg-red-50 px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 w-fit"
          >
            <LogOut size={18} /> Keluar / Logout
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Leads</p>
              <p className="text-3xl font-black text-slate-900">{metrics.total}</p>
            </div>
            <div className="w-14 h-14 bg-slate-50 text-slate-500 rounded-2xl flex items-center justify-center border border-slate-100"><Users size={28}/></div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Trial Aktif</p>
              <p className="text-3xl font-black text-emerald-600">{metrics.activeTrial}</p>
            </div>
            <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-100"><Clock size={28}/></div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Trial Expired</p>
              <p className="text-3xl font-black text-danger">{metrics.expiredTrial}</p>
            </div>
            <div className="w-14 h-14 bg-red-50 text-danger rounded-2xl flex items-center justify-center border border-red-100"><AlertCircle size={28}/></div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between overflow-hidden relative">
            <div className="absolute right-[-20px] bottom-[-20px] opacity-5">
              <Crown size={120} />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">VVIP Member</p>
              <p className="text-3xl font-black text-blue-600">{metrics.vvip}</p>
            </div>
            <div className="relative z-10 w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100"><Crown size={28}/></div>
          </div>
        </div>

        {/* Merchant Table Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
          
          {/* Table Tools */}
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
            <h2 className="text-lg font-black text-slate-900 hidden md:block">Database Merchants</h2>
            
            <div className="flex w-full md:w-auto items-center gap-3">
              <div className="relative flex-1 md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Cari nama toko / WA..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Filter size={16} />
                </div>
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="All">Semua Kategori</option>
                  <option value="Kuliner & F&B">Kuliner & F&B</option>
                  <option value="Fotokopi & Percetakan">Percetakan</option>
                  <option value="Toko / Ritel">Ritel</option>
                  <option value="Laundry & Jasa">Laundry</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="sticky top-0 bg-white shadow-sm z-10">
                <tr className="border-b border-slate-100">
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Usaha / Profil</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Akses</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white">
                {filteredMerchants.map((m) => {
                  const isActive = m.trial_expires_at && new Date(m.trial_expires_at).getTime() > Date.now();
                  const isVVIP = m.trial_expires_at && new Date(m.trial_expires_at).getTime() > Date.now() + 3000 * 24 * 60 * 60 * 1000;
                  
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{m.nama_usaha || 'Tanpa Nama'}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500 font-medium">{m.whatsapp || '-'}</span>
                          {m.whatsapp && (
                            <a 
                              href={`https://wa.me/62${m.whatsapp.replace(/\D/g, '').replace(/^0+/, '')}`}
                              target="_blank" rel="noreferrer"
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-50 text-green-600 rounded text-[10px] font-bold border border-green-200 hover:bg-green-100 transition-colors"
                            >
                              <MessageCircle size={10} /> Chat
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold">
                          {m.kategori_usaha || 'Lainnya'}
                        </span>
                      </td>
                      <td className="p-4">
                        {isVVIP ? (
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                            <Crown size={12} />
                            VVIP Member
                          </div>
                        ) : isActive ? (
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Trial Aktif
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-danger bg-red-50 px-2 py-1 rounded-md border border-red-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-danger"></span>
                            Expired
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2 opacity-100 md:opacity-50 md:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => addTrialDays(m.id, m.trial_expires_at)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors shadow-sm"
                          title="Perpanjang +7 Hari"
                        >
                          <PlusCircle size={14} /> +7 Hari
                        </button>
                        <button 
                          onClick={() => activateVVIP(m.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold rounded-lg transition-colors shadow-sm"
                          title="Set Lifetime VVIP"
                        >
                          <Crown size={14} /> Set VVIP
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredMerchants.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center">
                       <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 text-slate-400 rounded-full mb-4">
                         <Search size={32} />
                       </div>
                       <p className="text-slate-500 font-medium">Tidak ada data merchant yang sesuai dengan pencarian.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
