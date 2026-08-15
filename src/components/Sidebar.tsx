'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, ShoppingBag, Package, Wallet, Users, LogOut, Settings, Store, Handshake, Sparkles, ShieldCheck, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function Sidebar({ merchant }: { merchant?: any }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const categoryRaw = merchant?.kategori_usaha || merchant?.kategori || 'kuliner';
  const categorySafe = categoryRaw === 'undefined' ? 'kuliner' : categoryRaw;
  const category = encodeURIComponent(categorySafe.toLowerCase().split(' ')[0] || 'kuliner');
  const slug = merchant?.nama_usaha ? (merchant.nama_usaha.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')) : '';
  
  let basePath = '';
  let isJasa = false;
  const basePathMatch = pathname.match(/^\/ubos\/([^\/]+)\/([^\/]+)/);
  if (basePathMatch) {
    const currentCategory = basePathMatch[1] === 'undefined' ? category : basePathMatch[1];
    const currentSlug = basePathMatch[2];
    basePath = `/ubos/${currentCategory}/${currentSlug}`;
    if (currentCategory === 'jasa') isJasa = true;
  } else if (slug) {
    basePath = `/ubos/${category}/${slug}`;
    if (category === 'jasa' || categoryRaw.toLowerCase().includes('laundry') || categoryRaw.toLowerCase().includes('jasa')) isJasa = true;
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

  const navItems = [
    { name: 'Dashboard', href: `${basePath}`, icon: Home, locked: false },
    { name: isJasa ? 'POS Jasa' : 'POS', href: `${basePath}/pos`, icon: ShoppingBag, locked: isExpired },
    { name: isJasa ? 'Layanan & Paket' : 'Stok', href: `${basePath}/inventory`, icon: Package, locked: isExpired },
    { name: 'Toko Online', href: `${basePath}/online-store`, icon: Store, locked: isExpired },
    { name: 'Finance', href: `${basePath}/finance`, icon: Wallet, locked: isExpired },
    { name: 'CRM', href: `${basePath}/crm`, icon: Users, locked: isExpired },
  ];

  const bottomItems = [
    { name: 'Affiliate', href: `${basePath}/affiliate`, icon: Handshake },
    { name: 'Services', href: `${basePath}/services`, icon: Sparkles },
    { name: 'Billing', href: `${basePath}/billing`, icon: ShieldCheck },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-slate-200 z-50 shadow-sm">
      <div className="p-6 pb-4 border-b border-slate-100 flex items-center gap-3">
        {merchant?.logo_url ? (
          <img src={merchant.logo_url} alt="Logo" className="w-10 h-10 shrink-0 rounded-full object-cover border border-slate-200" />
        ) : (
          <div className="w-10 h-10 shrink-0 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg border border-emerald-100">
            {merchant?.nama_usaha?.charAt(0) || 'U'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-black text-slate-900 leading-tight truncate">
            {merchant?.nama_usaha || 'Halo, Owner'}
          </h1>
          <p className="text-xs text-slate-500 font-medium truncate">{merchant?.kategori_usaha || 'F&B'}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2">Menu Utama</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          if (item.locked) {
            return (
              <div 
                key={item.name}
                title="Terkunci - Silakan perpanjang lisensi Anda"
                className="flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 text-slate-400 bg-slate-50 cursor-not-allowed opacity-75"
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} strokeWidth={2} />
                  <span className="font-medium">{item.name}</span>
                </div>
                <Lock size={14} className="text-slate-400" />
              </div>
            );
          }

          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'btn-gradient-primary text-white font-bold shadow-md shadow-emerald-500/20 border-none' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}

        <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-6">Akun & Layanan</p>
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'btn-gradient-primary text-white font-bold shadow-md shadow-emerald-500/20 border-none' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'text-slate-400'} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-1">
        <Link 
          href="/settings"
          className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
            pathname === '/settings' 
              ? 'bg-slate-100 text-slate-900 font-bold' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
          }`}
        >
          <Settings size={20} strokeWidth={pathname === '/settings' ? 2.5 : 2} className="text-slate-400" />
          <span>Pengaturan</span>
        </Link>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 mt-4 rounded-xl text-rose-600 hover:bg-rose-50 font-bold transition-all border border-transparent hover:border-rose-100"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
