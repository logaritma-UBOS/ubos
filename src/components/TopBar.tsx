'use client';

import { useState, useEffect, useRef } from 'react';
import { Menu, Bell, ChevronDown, Settings, CreditCard, Handshake, HelpCircle, Lightbulb, X, LayoutDashboard, ShoppingBag, Package, Store, Users, Wallet } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

function formatIDR(num: number) {
  if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(1).replace('.0', '')}jt`;
  if (num >= 1_000) return `Rp ${(num / 1_000).toFixed(0)}rb`;
  return `Rp ${num.toLocaleString('id-ID')}`;
}

export default function TopBar({ merchant, onOpenSidebar }: { merchant: any, onOpenSidebar: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLainnya, setShowLainnya] = useState(false);
  const [profitBersih, setProfitBersih] = useState<number | null>(null);
  const lainnyaRef = useRef<HTMLDivElement>(null);

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

  // Fetch profit bersih from wallets table
  useEffect(() => {
    const fetchProfit = async () => {
      if (!merchant?.id) return;
      const { data } = await supabase
        .from('wallets')
        .select('profit_bersih')
        .eq('merchant_id', merchant.id)
        .single();
      if (data) setProfitBersih(data.profit_bersih ?? 0);
    };
    fetchProfit();
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

  const mainNavItems = [
    { name: 'Dashboard', href: basePath, icon: LayoutDashboard },
    { name: isJasa ? 'POS Jasa' : 'POS Kasir', href: `${basePath}/pos`, icon: ShoppingBag },
    { name: isJasa ? 'Layanan & Paket' : 'Inventori', href: `${basePath}/inventory`, icon: Package },
    { name: 'Toko Online', href: `${basePath}/online-store`, icon: Store },
    { name: 'Pelanggan', href: `${basePath}/crm`, icon: Users },
    { name: 'Keuangan', href: `${basePath}/finance`, icon: Wallet },
  ];

  const lainnyaItems = [
    { name: 'Pengaturan', href: `${basePath}/settings`, icon: Settings },
    { name: 'Affiliate', href: `${basePath}/affiliate`, icon: Handshake },
    { name: 'Billing', href: `${basePath}/billing`, icon: CreditCard },
    { name: 'Bantuan / FAQ', href: 'https://logaritma.id/bantuan', icon: HelpCircle, external: true },
    { name: 'Inspirasi Bisnis', href: 'https://logaritma.id/blog', icon: Lightbulb, external: true },
  ];

  const isNavActive = (href: string) => {
    if (href === basePath) return pathname === basePath;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const initials = merchant?.nama_usaha?.substring(0, 2)?.toUpperCase() || 'US';

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-[60] flex items-center justify-between px-4 md:px-6 shadow-sm">

      {/* LEFT: Hamburger (Mobile) + Logo */}
      <div className="flex items-center gap-4 shrink-0">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 text-slate-600 md:hidden hover:bg-slate-100 rounded-lg"
        >
          <Menu size={24} />
        </button>

        <Link href={basePath || '/'} className="flex items-center gap-2">
          <img src="/logo-ubos-wide.png" alt="UBOS Logo" className="h-8 md:h-9 w-auto object-contain" />
        </Link>
      </div>

      {/* CENTER: Main Nav Tabs (Desktop, xl+) */}
      <nav className="hidden xl:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
        {mainNavItems.map((item) => {
          const active = isNavActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`px-3 py-1.5 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${
                active
                  ? 'bg-[#4F75FF] text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {item.name}
            </Link>
          );
        })}

        {/* Lainnya Dropdown */}
        <div className="relative" ref={lainnyaRef}>
          <button
            onClick={() => setShowLainnya(!showLainnya)}
            className={`px-3 py-1.5 rounded-full font-semibold text-sm transition-all flex items-center gap-1 ${
              showLainnya ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Lainnya
            <ChevronDown size={14} className={`transition-transform duration-200 ${showLainnya ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showLainnya && (
            <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in-0 zoom-in-95 duration-150">
              {lainnyaItems.map((item) => {
                const Icon = item.icon;
                const active = !item.external && isNavActive(item.href);
                if (item.external) {
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
                }
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                      active ? 'bg-blue-50 text-[#4F75FF] font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    onClick={() => setShowLainnya(false)}
                  >
                    <Icon size={16} className={active ? 'text-[#4F75FF]' : 'text-slate-400 shrink-0'} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* RIGHT: Profit Pill + Bell + Avatar */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Dana Siap Pakai = Profit Bersih */}
        <Link
          href={`${basePath}/finance`}
          className="hidden md:flex items-center gap-2 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors px-3 py-1.5 rounded-full text-slate-700 font-bold text-sm border border-slate-200 group"
        >
          <span className="w-5 h-5 bg-[#4F75FF] rounded-full flex items-center justify-center text-[9px] text-white font-black shrink-0">Rp</span>
          <span className="group-hover:text-[#4F75FF] transition-colors">
            {profitBersih === null
              ? <span className="w-14 h-3 bg-slate-200 rounded animate-pulse inline-block align-middle" />
              : formatIDR(profitBersih)
            }
          </span>
        </Link>

        {/* Notification Bell */}
        <button className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
          <Bell size={20} className="text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Avatar + Store Name */}
        <Link href={`${basePath}/settings`} className="flex items-center gap-2 hover:bg-slate-50 p-1 pr-2 rounded-full transition-colors border border-transparent hover:border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4F75FF] to-emerald-500 flex items-center justify-center text-xs font-black text-white uppercase shrink-0">
            {initials}
          </div>
          <div className="hidden md:block text-left text-xs">
            <p className="font-bold text-slate-900 truncate max-w-[100px] leading-tight">{merchant?.nama_usaha || 'Outlet'}</p>
            <p className="text-slate-400 truncate max-w-[100px] leading-tight">{merchant?.owner_name || 'Owner'}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
