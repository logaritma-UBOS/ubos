'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingCart, Package, Wallet, Settings, Store, Lock } from 'lucide-react';
import clsx from 'clsx';

export default function BottomNav({ merchant }: { merchant?: any }) {
  const pathname = usePathname();
  
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
    { name: 'Home', href: `${basePath}`, icon: Home, locked: false },
    { name: 'POS', href: `${basePath}/pos`, icon: ShoppingCart, locked: isExpired },
    { name: 'Stok', href: `${basePath}/inventory`, icon: Package, locked: isExpired },
    { name: 'Toko', href: `${basePath}/online-store`, icon: Store, locked: isExpired },
    { name: 'Settings', href: '/settings', icon: Settings, locked: false },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-emerald-500 shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.1)] mx-auto max-w-md w-full pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-[72px] px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          if (item.locked) {
            return (
              <div 
                key={item.href} 
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative text-slate-300 opacity-60 cursor-not-allowed`}
              >
                <div className={`p-2 rounded-2xl transition-all duration-300 bg-slate-50`}>
                  <Lock size={22} strokeWidth={2} />
                </div>
                <span className={`text-[10px] font-bold opacity-100 translate-y-0 absolute bottom-1.5`}>
                  Terkunci
                </span>
              </div>
            );
          }

          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all active:scale-90 relative ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-slate-600 active:bg-slate-50/50 rounded-xl'
              }`}
            >
              <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'btn-gradient-primary shadow-md shadow-emerald-500/30 scale-110 -translate-y-2' : ''}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : ''} />
              </div>
              <span className={`text-[10px] font-bold ${isActive ? 'opacity-100 translate-y-0 text-emerald-600' : 'opacity-0 translate-y-2'} transition-all duration-300 absolute bottom-1.5`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
