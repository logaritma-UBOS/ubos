'use client';

import { useState, useEffect, useRef } from 'react';
import { Menu, Bell, ChevronDown, HelpCircle, Lightbulb, BarChart2, Megaphone, Clock, X, ClipboardList, ShoppingCart, Brush, Printer, MoreVertical, CheckCircle } from 'lucide-react';
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
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifTab, setNotifTab] = useState<'notif' | 'pesan'>('notif');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Derive basePath from pathname (reliable, no dependency on merchant fields)
  let basePath = '';
  const basePathMatch = pathname.match(/^(\/ubos\/[^\/]+\/[^\/]+)/);
  if (basePathMatch) {
    basePath = basePathMatch[1];
  }

  const merchantName = merchant?.nama_usaha || 'Outlet';
  const ownerName = merchant?.nama_pemilik || merchant?.owner_name || merchant?.nama_owner || 'Owner';
  const initials = merchantName.substring(0, 2).toUpperCase();

  // Calculate dynamic trial status
  let trialDaysLeft = 14;
  if (merchant) {
    let expiresDate = new Date();
    if (merchant.trial_expires_at) {
      expiresDate = new Date(merchant.trial_expires_at);
    } else if (merchant.created_at) {
      expiresDate = new Date(merchant.created_at);
      expiresDate.setDate(expiresDate.getDate() + 7);
    }
    trialDaysLeft = Math.ceil((expiresDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  }

  // Calculate profile completeness
  const accountFields = [ownerName !== 'Owner', Boolean(merchant?.whatsapp)];
  const accountProgress = Math.round(((accountFields.filter(Boolean).length + 1) / 3) * 100); // +1 for email (assumed via auth)
  
  const businessFields = [
    Boolean(merchant?.nama_usaha),
    Boolean(merchant?.alamat || merchant?.address),
    Boolean(merchant?.kategori),
    Boolean(merchant?.deskripsi_toko),
    Boolean(merchant?.slogan)
  ];
  const businessProgress = Math.round((businessFields.filter(Boolean).length / 5) * 100);

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
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // TopBar: menu unik, TIDAK ada di Sidebar
  const topNavItems = [
    { name: 'Pesanan Online', href: `${basePath}/online-orders`, icon: ShoppingCart, description: 'Order dari toko online konsumen', badge: pendingOrders > 0 ? pendingOrders : undefined },
    { name: 'Promosi', href: `${basePath}/promotions`, icon: Megaphone, description: 'Kelola kupon & diskon' },
    { name: 'Riwayat Transaksi', href: `${basePath}/transactions`, icon: ClipboardList, description: 'Semua transaksi' },
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
            className="px-3.5 py-1.5 rounded-full font-semibold text-sm transition-all flex items-center gap-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 whitespace-nowrap"
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
              <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in-0 zoom-in-95 duration-150 origin-top-right">
                <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Servis Logaritma</p>
                </div>
                <Link href={`${basePath}/services?type=meta-ads`}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 hover:text-[#4F75FF] transition-colors"
                  onClick={() => setShowLainnya(false)}
                >
                  <Megaphone size={16} className="text-[#4F75FF] shrink-0" />
                  Jasa Meta Ads
                </Link>
                <Link href={`${basePath}/services?type=branding`}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 hover:text-[#4F75FF] transition-colors"
                  onClick={() => setShowLainnya(false)}
                >
                  <Brush size={16} className="text-[#4F75FF] shrink-0" />
                  Branding & Desain
                </Link>
                <Link href={`${basePath}/services?type=hardware`}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 hover:text-[#4F75FF] transition-colors"
                  onClick={() => setShowLainnya(false)}
                >
                  <Printer size={16} className="text-[#4F75FF] shrink-0" />
                  Produk Pendukung Kasir
                </Link>
                <div className="border-t border-slate-100"></div>
                <Link href={`${basePath}/blog`}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 hover:text-[#4F75FF] transition-colors font-medium"
                  onClick={() => setShowLainnya(false)}
                >
                  <Lightbulb size={16} className="text-[#4F75FF] shrink-0" />
                  Inspirasi Bisnis
                </Link>
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
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className={`relative p-2 rounded-full transition-colors ${showNotifMenu ? 'bg-slate-100' : 'hover:bg-slate-100'}`}
              aria-label="Notifikasi"
            >
              <Bell size={20} className={showNotifMenu ? 'text-emerald-500' : 'text-slate-500'} />
              {pendingOrders > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
              )}
            </button>
            {/* Dropdown Notif */}
            {showNotifMenu && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-[100] animate-in fade-in-0 zoom-in-95 duration-150 origin-top-right">
                <div className="flex items-center border-b border-slate-100">
                  <button 
                    onClick={() => setNotifTab('notif')}
                    className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${notifTab === 'notif' ? 'text-emerald-500 border-emerald-500' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
                  >
                    Notifikasi
                  </button>
                  <button 
                    onClick={() => setNotifTab('pesan')}
                    className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${notifTab === 'pesan' ? 'text-emerald-500 border-emerald-500' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
                  >
                    Pesan Masuk {pendingOrders > 0 && <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingOrders}</span>}
                  </button>
                </div>
                <div className="p-8 text-center bg-slate-50 min-h-[160px] flex flex-col justify-center">
                  <p className="text-slate-400 text-sm font-medium">Tidak ada {notifTab === 'notif' ? 'notifikasi' : 'pesan masuk'}</p>
                </div>
                <div className="p-3 border-t border-slate-100 text-right bg-white">
                  <button className="text-emerald-500 text-sm font-bold hover:text-emerald-600 transition-colors">
                    Lihat Semua
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Avatar + Nama Usaha + Nama Pemilik + 3-Dot Menu */}
          <div className="relative flex items-center" ref={profileRef}>
            <div className="flex items-center gap-2 p-1 pr-1.5 md:pr-3 rounded-full transition-all border border-transparent">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black text-slate-700 uppercase shrink-0 overflow-hidden">
                {initials}
              </div>
              <div className="hidden md:block text-left text-xs leading-tight">
                <p className="font-bold text-slate-900 truncate max-w-[100px]">{merchantName}</p>
                <p className="text-slate-400 truncate max-w-[100px] text-[11px]">{ownerName}</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`p-1.5 rounded-full transition-colors ${showProfileMenu ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-100 text-slate-500'}`}
            >
              <MoreVertical size={18} />
            </button>
            
            {showProfileMenu && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-[100] animate-in fade-in-0 zoom-in-95 duration-150 origin-top-right">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-slate-900 uppercase flex items-center gap-1">
                      {trialDaysLeft > 0 ? 'TRIAL Account' : 'Account Expired'} <CheckCircle size={12} className={trialDaysLeft > 0 ? "text-emerald-500" : "text-rose-500"} />
                    </span>
                    <a href="https://logaritma.id/admin" target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-emerald-500 hover:text-emerald-600">Perpanjang</a>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {trialDaysLeft > 0 ? `Akan Kedaluwarsa ${trialDaysLeft} Hari Lagi` : 'Masa aktif trial telah habis'}
                  </p>
                </div>
                
                <div className="py-2">
                  <a href="https://logaritma.id/admin" target="_blank" rel="noopener noreferrer" className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    Pengaturan Profil
                  </a>
                  <a href="https://logaritma.id/admin" target="_blank" rel="noopener noreferrer" className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    Pengaturan Sistem
                  </a>
                </div>
                
                <div className="px-4 py-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-slate-600">Informasi Akun</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">{accountProgress}%</span>
                      <a href="https://logaritma.id/admin" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-emerald-500 hover:text-emerald-600">Update</a>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${accountProgress}%` }}></div>
                  </div>
                </div>

                <div className="px-4 py-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-slate-600">Informasi Bisnis</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">{businessProgress}%</span>
                      <a href="https://logaritma.id/admin" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-emerald-500 hover:text-emerald-600">Update</a>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${businessProgress}%` }}></div>
                  </div>
                </div>
                
                <div className="py-2 border-t border-slate-100">
                  <div className="px-4 py-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Bahasa</span>
                    <button className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 px-2 py-1 rounded-md text-slate-700 hover:bg-slate-200 transition-colors">
                      IDN <ChevronDown size={12} />
                    </button>
                  </div>
                </div>

                <div className="py-2 border-t border-slate-100">
                  <button className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-rose-600 transition-colors"
                          onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login'; }}>
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </div>
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
