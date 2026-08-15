'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, ShoppingBag, Package, Wallet, Users, LogOut, Settings, Store, Handshake, Sparkles, ShieldCheck, Lock, ChevronDown, MessageSquare, Star, FileText, BarChart2, Gift, Percent } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function Sidebar({ merchant, onClose }: { merchant?: any, onClose?: () => void }) {
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
    { name: isJasa ? 'Layanan & Paket' : 'Inventori', href: `${basePath}/inventory`, icon: Package, locked: isExpired },
    { name: 'Pelanggan', href: `${basePath}/crm`, icon: Users, locked: isExpired },
    { name: 'Toko Online', href: `${basePath}/online-store`, icon: Store, locked: isExpired },
    { name: 'Keuangan', href: `${basePath}/finance`, icon: Wallet, locked: isExpired },
  ];

  const bottomItems = [
    { name: 'Affiliate', href: `${basePath}/affiliate`, icon: Handshake },
    { name: 'Billing', href: `${basePath}/billing`, icon: ShieldCheck },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <aside className="w-64 h-full flex flex-col bg-gradient-to-b from-[#3B5BDB] via-[#4F75FF] to-emerald-500 shadow-xl z-50 text-white relative pt-16">
      <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col h-full">
      {/* Store Selector (Mimicking Majoo) */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3 bg-white/10 hover:bg-white/20 p-3 rounded-lg cursor-pointer transition-colors">
          <Store size={20} className="text-white" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-blue-100 font-medium uppercase tracking-wider">Outlet</p>
            <p className="text-sm font-bold text-white truncate">Semua Outlet</p>
          </div>
          <ChevronDown size={16} className="text-blue-100" />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {/* Menu Favorit Example */}
        <div className="mb-2">
          <div className="flex items-center justify-between px-5 py-2 text-blue-100/80 hover:text-white cursor-pointer group">
            <div className="flex items-center gap-3">
              <Star size={20} />
              <span className="font-medium text-sm">Menu Favorit</span>
            </div>
            <ChevronDown size={16} className="opacity-50 group-hover:opacity-100" />
          </div>
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          if (item.locked) {
            return (
              <div 
                key={item.name}
                title="Terkunci - Silakan perpanjang lisensi Anda"
                className="flex items-center justify-between px-5 py-3 text-white/50 cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} strokeWidth={2} />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                <Lock size={14} className="text-white/50" />
              </div>
            );
          }

          return (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={onClose}
              className={`flex items-center justify-between px-5 py-3 transition-colors duration-200 ${
                isActive 
                  ? 'bg-white/10 border-l-4 border-white text-white font-bold' 
                  : 'text-white/80 hover:bg-white/20/30 font-medium border-l-4 border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-sm">{item.name}</span>
              </div>
            </Link>
          );
        })}

        <div className="my-2 border-t border-white/10"></div>
        
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={onClose}
              className={`flex items-center justify-between px-5 py-3 transition-colors duration-200 ${
                isActive 
                  ? 'bg-white/10 border-l-4 border-white text-white font-bold' 
                  : 'text-white/80 hover:bg-white/20/30 font-medium border-l-4 border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-sm">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer Support & Settings */}
      <div className="p-4 bg-black/10 border-t border-white/10">
        <Link 
          href="/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:bg-[#4F75FF]/50 hover:text-white transition-colors mb-2"
        >
          <Settings size={20} />
          <span className="font-medium text-sm">Pengaturan</span>
        </Link>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-blue-100 hover:bg-[#4F75FF]/50 hover:text-white transition-colors mb-4"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Logout</span>
        </button>

        {/* Mimicking Majoo mCare Button */}
        <button className="w-full bg-white text-[#4F75FF] font-bold py-2 rounded-full flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors shadow-lg">
          <MessageSquare size={18} />
          <span className="text-sm">Chat 24 Jam</span>
        </button>
      </div>
      </div>
    </aside>
  );
}
