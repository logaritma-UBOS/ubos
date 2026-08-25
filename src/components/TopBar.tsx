'use client';

import { useState, useEffect, useRef } from 'react';
import { Menu, Bell, CheckCircle, MoreVertical, AlertTriangle, Sparkles, Store } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

function formatIDR(num: number) {
  if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(1).replace('.0', '')}M`;
  if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(1).replace('.0', '')}jt`;
  if (num >= 1_000) return `Rp ${(num / 1_000).toFixed(0)}rb`;
  return `Rp ${num.toLocaleString('id-ID')}`;
}

export default function TopBar({ merchant, onOpenSidebar }: { merchant: any, onOpenSidebar: () => void }) {
  const pathname = usePathname();
  const params = useParams();
  const [profitBersih, setProfitBersih] = useState<number | null>(null);
  const [lowStockCount, setLowStockCount] = useState(0);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  let basePath = '';
  const basePathMatch = pathname.match(/^(\/ubos\/[^\/]+\/[^\/]+)/);
  if (basePathMatch) {
    basePath = basePathMatch[1];
  }

  const merchantName = merchant?.nama_usaha || 'Outlet';
  const ownerName = merchant?.nama_pemilik || merchant?.owner_name || merchant?.nama_owner || 'Owner';
  const initials = merchantName.substring(0, 2).toUpperCase();
  const categoryLabel = params.category ? String(params.category).charAt(0).toUpperCase() + String(params.category).slice(1) : 'Bisnis';

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

  const accountFields = [ownerName !== 'Owner', Boolean(merchant?.whatsapp)];
  const accountProgress = Math.round(((accountFields.filter(Boolean).length + 1) / 3) * 100);
  
  const businessFields = [
    Boolean(merchant?.nama_usaha),
    Boolean(merchant?.alamat || merchant?.address),
    Boolean(merchant?.kategori),
    Boolean(merchant?.deskripsi_toko),
    Boolean(merchant?.slogan)
  ];
  const businessProgress = Math.round((businessFields.filter(Boolean).length / 5) * 100);

  useEffect(() => {
    if (!merchant?.id) return;

    const fetchData = async () => {
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

      try {
        const { data: products } = await supabase
          .from('products')
          .select('*')
          .eq('merchant_id', merchant.id);
        
        if (products) {
          const lowStock = products.filter((p: any) => (p.stok ?? 5) <= 3);
          setLowStockCount(lowStock.length);
        }
      } catch {
        setLowStockCount(0);
      }
    };

    fetchData();
  }, [merchant?.id]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
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

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#0bcdb0] border-b border-[#009b82]/95 z-[60] flex items-center justify-between px-4 md:px-6 shadow-2xs">

        {/* LEFT: Hamburger + Logo */}
        <div className="flex items-center gap-4 shrink-0">
          <button onClick={onOpenSidebar} className="p-2 -ml-2 text-slate-600 md:hidden hover:bg-slate-100 rounded-lg transition-colors" aria-label="Buka menu">
            <Menu size={24} />
          </button>
          <Link href={basePath || '/'}>
            <img src="/logo-ubos-wide.png" alt="UBOS Logo" className="h-8 md:h-9 w-auto object-contain" />
          </Link>
        </div>

        {/* CENTER: Informasi Status Toko (Clean badge di Desktop) */}
        <div className="hidden lg:flex items-center gap-2 absolute left-1/2 -translate-x-1/2 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-200/80 shadow-2xs">
          <Store size={14} className="text-[#4F75FF]" />
          <span className="text-xs font-bold text-slate-800">{merchantName}</span>
          <span className="text-slate-300">|</span>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{categoryLabel}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" title="Sistem Aktif"></span>
        </div>

        {/* RIGHT: Profit + Bell + Avatar */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <Link href={`${basePath}/finance`} title="Profit bersih Anda — klik untuk ke Keuangan"
            className="hidden md:flex items-center gap-2 bg-slate-50 hover:bg-slate-100 transition-colors px-3 py-1.5 rounded-full font-bold text-sm border border-slate-200/80 hover:border-slate-300 group cursor-pointer shadow-2xs"
          >
            <span className="w-5 h-5 bg-[#4F75FF] rounded-full flex items-center justify-center text-[9px] text-white font-black shrink-0">Rp</span>
            <span className="text-slate-700 group-hover:text-[#4F75FF] transition-colors min-w-[40px]">
              {profitBersih === null
                ? <span className="w-14 h-3.5 bg-slate-200 rounded-md animate-pulse inline-block align-middle" />
                : formatIDR(profitBersih)
              }
            </span>
          </Link>

          {/* Bell / Notifikasi Pintar */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className={`relative p-2 rounded-full transition-colors ${showNotifMenu ? 'bg-slate-100' : 'hover:bg-slate-100'}`}
              aria-label="Notifikasi"
            >
              <Bell size={20} className={showNotifMenu ? 'text-blue-600' : 'text-slate-600'} />
              {lowStockCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </button>
            {showNotifMenu && (
              <div className="fixed left-1/2 -translate-x-1/2 top-20 w-[90%] max-w-[320px] sm:absolute sm:left-auto sm:translate-x-0 sm:right-0 sm:top-full sm:mt-2 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[200] animate-in fade-in-0 zoom-in-95 duration-150">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Pusat Peringatan & Aktivitas</span>
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Sistem Aktif</span>
                </div>
                
                <div className="p-4 space-y-3 bg-white max-h-[260px] overflow-y-auto">
                  {lowStockCount > 0 ? (
                    <Link href={`${basePath}/inventory`} onClick={() => setShowNotifMenu(false)} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200/60 rounded-xl hover:bg-amber-100/50 transition-colors">
                      <div className="p-2 bg-amber-500 text-white rounded-lg shrink-0 mt-0.5">
                        <AlertTriangle size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-amber-900">Perhatian Stok Kritis</p>
                        <p className="text-[11px] text-amber-700 mt-0.5">Ada {lowStockCount} produk dengan stok menipis yang perlu segera di-restock.</p>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200/60 rounded-xl">
                      <div className="p-2 bg-emerald-500 text-white rounded-lg shrink-0 mt-0.5">
                        <CheckCircle size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-900">Stok Produk Aman</p>
                        <p className="text-[11px] text-emerald-700 mt-0.5">Semua inventori dan bahan baku dalam kondisi mencukupi.</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200/60 rounded-xl">
                    <div className="p-2 bg-blue-500 text-white rounded-lg shrink-0 mt-0.5">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-900">AI Logaritma Optimal</p>
                      <p className="text-[11px] text-blue-700 mt-0.5">Analisis margin profit dan rekomendasi penjualan siap membantu.</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 border-t border-slate-100 text-center bg-slate-50">
                  <p className="text-[10px] text-slate-400 font-medium">Semua sistem operasional berjalan normal</p>
                </div>
              </div>
            )}
          </div>

          {/* Avatar + Nama Usaha + Nama Pemilik + 3-Dot Menu */}
          <div className="relative flex items-center" ref={profileRef}>
            <div className="flex items-center gap-2 p-1 pr-1.5 md:pr-3 rounded-full transition-all border border-transparent">
              {merchant?.logo_url ? (
                <img src={merchant.logo_url} alt="Logo" className="w-8 h-8 rounded-full object-cover bg-slate-200 shrink-0 border border-slate-200" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black text-slate-700 uppercase shrink-0 overflow-hidden">
                  {initials}
                </div>
              )}
              <div className="hidden md:block text-left text-xs leading-tight">
                <p className="font-bold text-slate-900 truncate max-w-[100px]">{merchantName}</p>
                <p className="text-slate-900 truncate max-w-[100px] text-[11px]">{ownerName}</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`p-1.5 rounded-full transition-colors ${showProfileMenu ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <MoreVertical size={18} />
            </button>
            
            {showProfileMenu && (
              <div className="fixed left-1/2 -translate-x-1/2 top-20 w-[90%] max-w-[300px] sm:absolute sm:left-auto sm:translate-x-0 sm:right-0 sm:top-full sm:mt-2 sm:w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[200] animate-in fade-in-0 zoom-in-95 duration-150">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-slate-900 uppercase flex items-center gap-1">
                      {trialDaysLeft > 0 ? 'TRIAL Account' : 'Account Expired'} <CheckCircle size={12} className={trialDaysLeft > 0 ? "text-emerald-500" : "text-rose-500"} />
                    </span>
                    <Link href={`${basePath}/billing`} onClick={() => setShowProfileMenu(false)} className="text-[11px] font-bold text-emerald-500 hover:text-emerald-600">Perpanjang</Link>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {trialDaysLeft > 0 ? `Akan Kedaluwarsa ${trialDaysLeft} Hari Lagi` : 'Masa aktif trial telah habis'}
                  </p>
                </div>
                
                <div className="py-2">
                  <Link href="/settings" onClick={() => setShowProfileMenu(false)} className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    Pengaturan Profil
                  </Link>
                </div>
                
                <div className="px-4 py-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-slate-600">Informasi Akun</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">{accountProgress}%</span>
                      <Link href="/settings" onClick={() => setShowProfileMenu(false)} className="text-xs font-bold text-emerald-500 hover:text-emerald-600">Update</Link>
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
                      <Link href="/settings" onClick={() => setShowProfileMenu(false)} className="text-xs font-bold text-emerald-500 hover:text-emerald-600">Update</Link>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${businessProgress}%` }}></div>
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
    </>
  );
}
