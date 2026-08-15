'use client';

import { useState, useEffect, useRef } from 'react';
import { Menu, Bell, ChevronDown, HelpCircle, Lightbulb, BarChart2, Megaphone, ShoppingCart, Clock, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

function formatIDR(num: number) {
  if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(1).replace('.0', '')}jt`;
  if (num >= 1_000) return `Rp ${(num / 1_000).toFixed(0)}rb`;
  return `Rp ${num.toLocaleString('id-ID')}`;
}

export default function TopBar({ merchant, onOpenSidebar }: { merchant: any, onOpenSidebar: () => void }) {
  const pathname = usePathname();
  const [showLainnya, setShowLainnya] = useState(false);
  const [profitBersih, setProfitBersih] = useState<number | null>(null);
  const [notifCount, setNotifCount] = useState(0);
  const lainnyaRef = useRef<HTMLDivElement>(null);

  const categoryRaw = merchant?.kategori_usaha || merchant?.kategori || 'kuliner';
  const categorySafe = categoryRaw === 'undefined' ? 'kuliner' : categoryRaw;
  const category = encodeURIComponent(categorySafe.toLowerCase().split(' ')[0] || 'kuliner');
  const slug = merchant?.nama_usaha
    ? merchant.nama_usaha.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    : '';

  let basePath = '';
  const basePathMatch = pathname.match(/^\/ubos\/([^\/]+)\/([^\/]+)/);
  if (basePathMatch) {
    basePath = `/ubos/${basePathMatch[1]}/${basePathMatch[2]}`;
  } else if (slug) {
    basePath = `/ubos/${category}/${slug}`;
  } else {
    basePath = '/member';
  }

  // Fetch profit bersih from wallets
  useEffect(() => {
    const fetchData = async () => {
      if (!merchant?.id) return;
      const { data: walletData } = await supabase
        .from('wallets')
        .select('profit_bersih')
        .eq('merchant_id', merchant.id)
        .single();
      if (walletData) setProfitBersih(walletData.profit_bersih ?? 0);

      // Pesanan online yang belum diproses
      const { count } = await supabase
        .from('online_orders')
        .select('id', { count: 'exact', head: true })
        .eq('merchant_id', merchant.id)
        .eq('status', 'pending');
      setNotifCount(count ?? 0);
    };
    fetchData();
  }, [merchant?.id]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (lainnyaRef.current && !lainnyaRef.current.contains(e.target as Node)) {
        setShowLainnya(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // TopBar nav: BUKAN duplikat sidebar — fitur baru/view cepat
  const topNavItems = [
    {
      name: 'Laporan',
      href: `${basePath}/finance`,
      icon: BarChart2,
      description: 'Ringkasan penjualan & profit',
    },
    {
      name: 'Promosi',
      href: `${basePath}/promotions`,
      icon: Megaphone,
      description: 'Kelola kupon & diskon',
    },
    {
      name: 'Pesanan Masuk',
      href: `${basePath}/online-store`,
      icon: ShoppingCart,
      description: 'Order dari toko online',
      badge: notifCount > 0 ? notifCount : undefined,
    },
    {
      name: 'Shift Hari Ini',
      href: `${basePath}/finance`,
      icon: Clock,
      description: 'Tutup & ringkasan shift',
    },
  ];

  const lainnyaItems = [
    { name: 'Pusat Bantuan', href: 'https://logaritma.id/bantuan', icon: HelpCircle, external: true },
    { name: 'Inspirasi Bisnis', href: 'https://logaritma.id/blog', icon: Lightbulb, external: true },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const initials = merchant?.nama_usaha?.substring(0, 2)?.toUpperCase() || 'US';

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-[60] flex items-center justify-between px-4 md:px-6 shadow-sm">

      {/* LEFT: Hamburger (Mobile) + Logo */}
      <div className="flex items-center gap-4 shrink-0">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 text-slate-600 md:hidden hover:bg-slate-100 rounded-lg"
          aria-label="Buka menu"
        >
          <Menu size={24} />
        </button>
        <Link href={basePath || '/'} className="flex items-center">
          <img src="/logo-ubos-wide.png" alt="UBOS Logo" className="h-8 md:h-9 w-auto object-contain" />
        </Link>
      </div>

      {/* CENTER: Quick-Access Tabs — fitur baru, tidak ada di sidebar */}
      <nav className="hidden xl:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
        {topNavItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              title={item.description}
              className={`relative px-3.5 py-1.5 rounded-full font-semibold text-sm transition-all flex items-center gap-1.5 whitespace-nowrap ${
                active
                  ? 'bg-[#4F75FF] text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon size={14} />
              {item.name}
              {item.badge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Lainnya Dropdown */}
        <div className="relative" ref={lainnyaRef}>
          <button
            onClick={() => setShowLainnya(!showLainnya)}
            className={`px-3.5 py-1.5 rounded-full font-semibold text-sm transition-all flex items-center gap-1 ${
              showLainnya ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Lainnya
            <ChevronDown size={14} className={`transition-transform duration-200 ${showLainnya ? 'rotate-180' : ''}`} />
          </button>

          {showLainnya && (
            <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in-0 zoom-in-95 duration-150 origin-top-right">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Sumber Daya</p>
              </div>
              {lainnyaItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    onClick={() => setShowLainnya(false)}
                  >
                    <Icon size={16} className="text-slate-400 shrink-0" />
                    {item.name}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* RIGHT: Profit Pill + Bell + Avatar */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">

        {/* Dana Siap Pakai = Profit Bersih live */}
        <Link
          href={`${basePath}/finance`}
          title="Profit Bersih — klik untuk ke halaman Keuangan"
          className="hidden md:flex items-center gap-2 bg-slate-50 hover:bg-blue-50 cursor-pointer transition-colors px-3 py-1.5 rounded-full text-slate-700 font-bold text-sm border border-slate-200 hover:border-blue-200 group"
        >
          <span className="w-5 h-5 bg-[#4F75FF] rounded-full flex items-center justify-center text-[9px] text-white font-black shrink-0">Rp</span>
          <span className="group-hover:text-[#4F75FF] transition-colors">
            {profitBersih === null
              ? <span className="w-16 h-3 bg-slate-200 rounded animate-pulse inline-block align-middle" />
              : formatIDR(profitBersih)
            }
          </span>
        </Link>

        {/* Notification Bell */}
        <button className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors" aria-label="Notifikasi">
          <Bell size={20} className="text-slate-500" />
          {notifCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          )}
        </button>

        {/* Avatar */}
        <Link
          href={`${basePath}/settings`}
          className="flex items-center gap-2 hover:bg-slate-50 p-1 pr-2 rounded-full transition-all border border-transparent hover:border-slate-200"
          title="Pengaturan akun"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4F75FF] to-emerald-500 flex items-center justify-center text-xs font-black text-white uppercase shrink-0">
            {initials}
          </div>
          <div className="hidden md:block text-left text-xs">
            <p className="font-bold text-slate-900 truncate max-w-[90px] leading-tight">{merchant?.nama_usaha || 'Outlet'}</p>
            <p className="text-slate-400 truncate max-w-[90px] leading-tight text-[11px]">{merchant?.owner_name || 'Owner'}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
