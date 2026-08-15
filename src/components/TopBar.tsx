'use client';

import { useState, useEffect, useRef } from 'react';
import { Menu, Bell, ChevronDown, HelpCircle, Lightbulb, BarChart2, Megaphone, Clock, X, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

function formatIDR(num: number) {
  if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(1).replace('.0', '')}M`;
  if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(1).replace('.0', '')}jt`;
  if (num >= 1_000) return `Rp ${(num / 1_000).toFixed(0)}rb`;
  return `Rp ${num.toLocaleString('id-ID')}`;
}

export default function TopBar({ merchant, onOpenSidebar }: { merchant: any, onOpenSidebar: () => void }) {
  const pathname = usePathname();
  const [showLainnya, setShowLainnya] = useState(false);
  const [profitBersih, setProfitBersih] = useState<number | null>(null);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftData, setShiftData] = useState<any>(null);
  const lainnyaRef = useRef<HTMLDivElement>(null);

  // Derive basePath from pathname (reliable, no dependency on merchant fields)
  let basePath = '';
  const basePathMatch = pathname.match(/^(\/ubos\/[^\/]+\/[^\/]+)/);
  if (basePathMatch) {
    basePath = basePathMatch[1];
  }

  const merchantName = merchant?.nama_usaha || 'Outlet';
  const ownerName = merchant?.nama_pemilik || merchant?.owner_name || merchant?.nama_owner || 'Owner';
  const initials = merchantName.substring(0, 2).toUpperCase();

  // Fetch profit bersih & pending orders
  useEffect(() => {
    if (!merchant?.id) return;

    const fetchData = async () => {
      // Fetch wallet profit
      try {
        const { data: wallet } = await supabase
          .from('wallets')
          .select('profit_bersih')
          .eq('merchant_id', merchant.id)
          .maybeSingle();
        setProfitBersih(wallet?.profit_bersih ?? 0);
      } catch {
        setProfitBersih(0);
      }

      // Fetch today's transactions count (as "pesanan masuk")
      try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const { count } = await supabase
          .from('transactions')
          .select('id', { count: 'exact', head: true })
          .eq('merchant_id', merchant.id)
          .gte('created_at', todayStart.toISOString());
        setPendingOrders(count ?? 0);
      } catch {
        setPendingOrders(0);
      }

      // Fetch today's shift data
      try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const { data: txs } = await supabase
          .from('transactions')
          .select('total_harga, created_at')
          .eq('merchant_id', merchant.id)
          .gte('created_at', todayStart.toISOString());

        if (txs) {
          const totalPenjualan = txs.reduce((sum: number, t: any) => sum + (t.total_harga || 0), 0);
          setShiftData({ totalTransaksi: txs.length, totalPenjualan });
        }
      } catch {
        setShiftData(null);
      }
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

  // TopBar: menu unik, TIDAK ada di Sidebar
  const topNavItems = [
    { name: 'Laporan', href: `${basePath}/finance`, icon: BarChart2, description: 'Laporan penjualan & profit hari ini' },
    { name: 'Promosi', href: `${basePath}/promotions`, icon: Megaphone, description: 'Kelola kupon & diskon' },
    { name: 'Riwayat Transaksi', href: `${basePath}/crm`, icon: ClipboardList, description: 'Semua transaksi & pelanggan', badge: pendingOrders > 0 ? pendingOrders : undefined },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-[60] flex items-center justify-between px-4 md:px-6 shadow-sm">

        {/* LEFT: Hamburger + Logo */}
        <div className="flex items-center gap-4 shrink-0">
          <button onClick={onOpenSidebar} className="p-2 -ml-2 text-slate-600 md:hidden hover:bg-slate-100 rounded-lg" aria-label="Buka menu">
            <Menu size={24} />
          </button>
          <Link href={basePath || '/'}>
            <img src="/logo-ubos-wide.png" alt="UBOS Logo" className="h-8 md:h-9 w-auto object-contain" />
          </Link>
        </div>

        {/* CENTER: Quick Access Nav */}
        <nav className="hidden xl:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
          {topNavItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href} title={item.description}
                className={`relative px-3.5 py-1.5 rounded-full font-semibold text-sm transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  active ? 'bg-[#4F75FF] text-white shadow-md shadow-blue-500/20' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon size={14} />
                {item.name}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Shift Hari Ini — opens modal, no navigation */}
          <button
            onClick={() => setShowShiftModal(true)}
            title="Ringkasan shift kasir hari ini"
            className="px-3.5 py-1.5 rounded-full font-semibold text-sm transition-all flex items-center gap-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          >
            <Clock size={14} />
            Shift Hari Ini
          </button>

          {/* Lainnya Dropdown */}
          <div className="relative" ref={lainnyaRef}>
            <button onClick={() => setShowLainnya(!showLainnya)}
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
                <a href="https://api.whatsapp.com/send?phone=6281234567890&text=Halo%20UBOS%2C%20saya%20butuh%20bantuan"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  onClick={() => setShowLainnya(false)}
                >
                  <HelpCircle size={16} className="text-slate-400 shrink-0" />
                  Pusat Bantuan (WA)
                </a>
                <a href="https://logaritma.id"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  onClick={() => setShowLainnya(false)}
                >
                  <Lightbulb size={16} className="text-slate-400 shrink-0" />
                  Tentang Logaritma
                </a>
              </div>
            )}
          </div>
        </nav>

        {/* RIGHT: Profit + Bell + Avatar */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Profit Bersih live */}
          <Link href={`${basePath}/finance`} title="Profit bersih Anda — klik untuk ke Keuangan"
            className="hidden md:flex items-center gap-2 bg-slate-50 hover:bg-blue-50 transition-colors px-3 py-1.5 rounded-full font-bold text-sm border border-slate-200 hover:border-blue-200 group cursor-pointer"
          >
            <span className="w-5 h-5 bg-[#4F75FF] rounded-full flex items-center justify-center text-[9px] text-white font-black shrink-0">Rp</span>
            <span className="text-slate-700 group-hover:text-[#4F75FF] transition-colors min-w-[40px]">
              {profitBersih === null
                ? <span className="w-14 h-3.5 bg-slate-200 rounded-md animate-pulse inline-block align-middle" />
                : formatIDR(profitBersih)
              }
            </span>
          </Link>

          {/* Bell */}
          <button className="relative p-2 hover:bg-slate-100 rounded-full transition-colors" aria-label="Notifikasi">
            <Bell size={20} className="text-slate-500" />
            {pendingOrders > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            )}
          </button>

          {/* Avatar + Nama Usaha + Nama Pemilik */}
          <Link href={`${basePath}/settings`}
            className="flex items-center gap-2 hover:bg-slate-50 p-1 pr-3 rounded-full transition-all border border-transparent hover:border-slate-200"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4F75FF] to-emerald-500 flex items-center justify-center text-xs font-black text-white uppercase shrink-0">
              {initials}
            </div>
            <div className="hidden md:block text-left text-xs leading-tight">
              <p className="font-bold text-slate-900 truncate max-w-[100px]">{merchantName}</p>
              <p className="text-slate-400 truncate max-w-[100px] text-[11px]">{ownerName}</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Shift Hari Ini Modal */}
      {showShiftModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setShowShiftModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Clock size={18} className="text-[#4F75FF]" />
                </div>
                <h2 className="font-black text-slate-900 text-lg">Shift Hari Ini</h2>
              </div>
              <button onClick={() => setShowShiftModal(false)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center">
                <span className="text-slate-600 text-sm font-medium">Total Transaksi</span>
                <span className="font-black text-slate-900 text-lg">{shiftData?.totalTransaksi ?? 0}</span>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 flex justify-between items-center">
                <span className="text-blue-700 text-sm font-medium">Total Penjualan</span>
                <span className="font-black text-[#4F75FF] text-lg">{formatIDR(shiftData?.totalPenjualan ?? 0)}</span>
              </div>
            </div>

            <Link href={`${basePath}/finance`} onClick={() => setShowShiftModal(false)}
              className="w-full bg-[#4F75FF] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shadow-md shadow-blue-500/20"
            >
              Tutup Shift & Detail Keuangan
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
