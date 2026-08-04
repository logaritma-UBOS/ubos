'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingCart, Package, Wallet, Settings } from 'lucide-react';
import clsx from 'clsx';

export default function BottomNav({ merchant }: { merchant?: any }) {
  const pathname = usePathname();
  
  const category = encodeURIComponent((merchant?.kategori_usaha || 'kuliner').toLowerCase().split(' ')[0] || 'kuliner');
  const slug = merchant?.nama_usaha ? (merchant.nama_usaha.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')) : '';
  
  let basePath = '';
  const basePathMatch = pathname.match(/^\/ubos\/[^\/]+\/[^\/]+/);
  if (basePathMatch) {
    basePath = basePathMatch[0];
  } else if (slug) {
    basePath = `/ubos/${category}/${slug}`;
  } else {
    basePath = '/member';
  }

  const navItems = [
    { name: 'Dashboard', href: `${basePath}`, icon: Home },
    { name: 'POS', href: `${basePath}/pos`, icon: ShoppingCart },
    { name: 'Stok', href: `${basePath}/inventory`, icon: Package },
    { name: 'Finance', href: `${basePath}/finance`, icon: Wallet },
    { name: 'Pengaturan', href: '/settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-primary shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.1)] mx-auto max-w-md w-full pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-[72px] px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-primary text-white shadow-md shadow-primary/30 scale-110' : ''}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-0 translate-y-1'} transition-all duration-300 absolute bottom-1.5`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
