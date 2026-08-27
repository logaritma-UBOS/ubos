'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingCart, Package, Wallet, Settings, Store, Lock, Users, Sparkles, Activity, Menu, X, ClipboardList, LogOut } from 'lucide-react';
import { useAILogaritmaEngine } from '@/hooks/useAILogaritmaEngine';
import { determineLogaritmaAction, buildLogaritmaState } from '@/core/logaritma';
import { supabase } from '@/lib/supabase/client';

export default function BottomNav({ merchant }: { merchant?: any }) {
  const pathname = usePathname();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  const categoryRaw = merchant?.kategori_usaha || merchant?.kategori || 'kuliner';
  const categorySafe = categoryRaw === 'undefined' ? 'kuliner' : categoryRaw;
  const category = encodeURIComponent(categorySafe.toLowerCase().split(' ')[0] || 'kuliner');
  const slug = merchant?.nama_usaha ? (merchant.nama_usaha.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')) : '';
  
  let basePath = '';
  const basePathMatch = pathname.match(/^\/ubos\/([^\/]+)\/([^\/]+)/);
  if (basePathMatch) {
    const currentCategory = basePathMatch[1] === 'undefined' ? category : basePathMatch[1];
    const currentSlug = basePathMatch[2];
    basePath = `/ubos/${currentCategory}/${currentSlug}`;
  } else if (slug) {
    basePath = `/ubos/${category}/${slug}`;
  } else {
    basePath = '/member';
  }

  let isExpired = false;
  if (merchant) {
    let expiresDate = new Date();
    const merchantStatus = merchant?.status || 'Trial';
    if (merchantStatus === 'Premium' && merchant.expired_at) {
      expiresDate = new Date(merchant.expired_at);
    } else if (merchant.trial_expires_at) {
      expiresDate = new Date(merchant.trial_expires_at);
    } else if (merchant.created_at) {
      expiresDate = new Date(merchant.created_at);
      expiresDate.setDate(expiresDate.getDate() + 7);
    }
    const now = new Date();
    const diff = Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    isExpired = diff <= 0;
  }

  const { aiState } = useAILogaritmaEngine(merchant?.id);

  // LOGARITMA DECISION ENGINE — delegated to src/core (platform-agnostic)
  const coreAction = useMemo(() => {
    if (!aiState || aiState.isLoading) return null;
    const coreState = buildLogaritmaState(
      { targetProfitMonthly: aiState.targetProfitMonthly, budgetBelanjaDaily: aiState.budgetBelanjaDaily },
      [],  // raw tx already computed inside aiState
      aiState.lowStockItems || []
    );
    // Inject precomputed metrics so engine can decide without re-fetching
    const patchedState = {
      ...coreState,
      daily: { dailyOmzet: aiState.dailyOmzet, dailyProfit: aiState.dailyProfit, totalTransactions: aiState.totalTransactions },
      isOverBudget: aiState.isOverBudget,
      stock: { totalTerpakai: aiState.totalTerpakai, lowStockItems: aiState.lowStockItems || [] },
    };
    return determineLogaritmaAction(patchedState, basePath);
  }, [aiState, basePath]);

  // Map core action color → Tailwind gradient (UI layer responsibility)
  const actionColorMap: Record<string, { bg: string; icon: React.ElementType; label: string; href: string }> = {
    red: { bg: 'bg-gradient-to-r from-red-500 to-rose-600 shadow-red-500/30', icon: Wallet, label: coreAction?.label || 'Cek Keuangan', href: coreAction?.href || basePath },
    orange: { bg: 'bg-gradient-to-r from-orange-500 to-amber-600 shadow-orange-500/30', icon: Package, label: coreAction?.label || 'Amankan Stok', href: coreAction?.href || basePath },
    blue: { bg: 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-500/30', icon: ShoppingCart, label: coreAction?.label || 'Kejar Jualan', href: coreAction?.href || basePath },
    emerald: { bg: 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/30', icon: Sparkles, label: coreAction?.label || 'Aksi Logaritma', href: coreAction?.href || basePath },
  };
  
  const resolvedColor = coreAction?.color || 'emerald';
  const actionMeta = actionColorMap[resolvedColor] || actionColorMap.emerald;
  const ActionIcon = coreAction ? actionMeta.icon : Activity;
  const actionLabel = coreAction ? actionMeta.label : 'Performa';
  const actionHref = coreAction ? actionMeta.href : basePath;
  const actionBg = coreAction ? actionMeta.bg : 'btn-gradient-primary shadow-emerald-500/30';

  const mainNavItems = [
    { name: 'Beranda', href: `${basePath}`, icon: Home, locked: false },
    { name: 'Jualan', href: `${basePath}/pos`, icon: ShoppingCart, locked: isExpired },
    { name: 'Tindakan', href: actionHref, icon: ActionIcon, locked: isExpired, isAction: true },
    { name: 'Pelanggan', href: `${basePath}/crm`, icon: Users, locked: isExpired }
  ];

  const moreMenu = [
    { name: 'Keuangan', href: `${basePath}/finance`, icon: Wallet },
    { name: 'Stok', href: `${basePath}/inventory`, icon: Package },
    { name: 'Toko Online', href: `${basePath}/online-store`, icon: Store },
    { name: 'Transaksi', href: `${basePath}/transactions`, icon: ClipboardList },
    { name: 'Pengaturan', href: '/settings', icon: Settings }
  ];

  return (
    <>
      {/* Secondary Navigation Bottom Sheet */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowMoreMenu(false)}>
          <div className="bg-white rounded-t-3xl p-5 shadow-2xl animate-in slide-in-from-bottom-full duration-300 w-full max-w-md mx-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 text-lg">Menu Lainnya</h3>
              <button onClick={() => setShowMoreMenu(false)} className="p-2 bg-slate-100 rounded-full active:scale-90 transition-transform">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
              {moreMenu.map(item => (
                <Link 
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onClick={() => setShowMoreMenu(false)}
                  className="flex flex-col items-center gap-2 active:scale-95 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100 shadow-sm">
                    <item.icon size={22} />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 text-center">{item.name}</span>
                </Link>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = '/';
                }}
                className="flex items-center gap-3 w-full p-3 rounded-xl text-red-600 bg-red-50 active:bg-red-100 transition-colors font-medium text-sm"
              >
                <LogOut size={18} />
                Keluar Akun
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.1)] mx-auto max-w-md w-full pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-[72px] px-2">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href && !item.isAction;
            const Icon = item.icon;
            
            if (item.locked) {
              return (
                <div key={item.name} className="flex flex-col items-center justify-center w-full h-full space-y-1 relative text-slate-300 opacity-60 cursor-not-allowed">
                  <div className="p-2 rounded-2xl bg-slate-50">
                    <Lock size={22} strokeWidth={2} />
                  </div>
                  <span className="text-[10px] font-bold absolute bottom-1.5">Terkunci</span>
                </div>
              );
            }

            if (item.isAction) {
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  prefetch={true}
                  className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-all active:scale-90 relative z-10"
                >
                  <div className={`p-3 rounded-2xl transition-all duration-300 ${actionBg} shadow-lg scale-110 -translate-y-4 border-2 border-white`}>
                    <Icon size={24} strokeWidth={2.5} className="text-white" />
                  </div>
                  <span className={`text-[10px] font-bold text-slate-600 transition-all duration-300 absolute bottom-1.5 whitespace-nowrap`}>
                    {item.name}
                  </span>
                </Link>
              );
            }

            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all active:scale-90 relative ${
                  isActive ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600 active:bg-slate-50/50 rounded-xl'
                }`}
              >
                <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-emerald-50 scale-110 -translate-y-1' : ''}`}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-bold ${isActive ? 'opacity-100 translate-y-0 text-emerald-600' : 'opacity-0 translate-y-2'} transition-all duration-300 absolute bottom-1.5`}>
                  {item.name}
                </span>
              </Link>
            );
          })}

          {/* Menu Lainnya Toggle */}
          <button 
            onClick={() => setShowMoreMenu(true)}
            className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-all active:scale-90 relative text-slate-400 hover:text-slate-600 active:bg-slate-50/50 rounded-xl"
          >
            <div className="p-2 rounded-2xl transition-all duration-300">
              <Menu size={22} strokeWidth={2} />
            </div>
            <span className="text-[10px] font-bold opacity-0 translate-y-2 transition-all duration-300 absolute bottom-1.5">
              Lainnya
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
