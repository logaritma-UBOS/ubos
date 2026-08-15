'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, ShoppingBag, Package, Wallet, Users, LogOut, Settings, Store, Handshake, ShieldCheck, Lock, ChevronDown, MessageSquare, Star, Search, X, ClipboardList, Megaphone, Smartphone, HelpCircle, Briefcase, Lightbulb } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function Sidebar({ merchant, onClose }: { merchant?: any, onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [showOutletModal, setShowOutletModal] = useState(false);
  const [outletTab, setOutletTab] = useState<'Semua' | 'Laporan' | 'Produk'>('Semua');
  const [outletSearch, setOutletSearch] = useState('');
  const [selectedOutlet, setSelectedOutlet] = useState<string>('merchant'); // 'all' or 'merchant'
  
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current && 
        !modalRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setShowOutletModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categoryRaw = merchant?.kategori_usaha || merchant?.kategori || 'kuliner';
  const categorySafe = categoryRaw === 'undefined' ? 'kuliner' : categoryRaw;
  const category = encodeURIComponent(categorySafe.toLowerCase().split(' ')[0] || 'kuliner');
  const slug = merchant?.nama_usaha ? (merchant.nama_usaha.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')) : '';
  const merchantName = merchant?.nama_usaha || 'Outlet Baru';
  
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

  // Menu Grid untuk Mobile
  const mobileGridItems = [
    { name: 'Penjualan', href: `${basePath}/pos`, active: pathname.includes('/pos') },
    { name: 'Order Online', href: `${basePath}/online-orders`, active: pathname.includes('/online-orders') },
    { name: 'Inventori', href: `${basePath}/inventory`, active: pathname.includes('/inventory') },
    { name: 'Pelanggan', href: `${basePath}/crm`, active: pathname.includes('/crm') },
    { name: 'Keuangan', href: `${basePath}/finance`, active: pathname.includes('/finance') },
    { name: 'Promosi', href: `${basePath}/promotions`, active: pathname.includes('/promotions') },
    { name: 'Pengaturan', href: `/settings`, active: pathname.includes('/settings') },
    { name: 'Bantuan', href: `/member/services`, active: false },
    { name: 'Layanan', href: `/member/services`, active: false },
    { name: 'Inspirasi', href: `${basePath}/blog`, active: pathname.includes('/blog') },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <aside className="w-full md:w-64 h-full flex flex-col bg-gradient-to-b from-[#3B5BDB] via-[#4F75FF] to-emerald-500 shadow-xl z-50 text-white relative md:pt-16 max-w-sm mx-auto md:max-w-none md:mx-0">
      <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
      
      {/* Mobile close button mimicking Majoo top right inside sidebar */}
      <div className="absolute top-4 right-4 z-[60] md:hidden">
         <button onClick={onClose} className="w-8 h-8 rounded-full border border-white flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all">
           <X size={18} />
         </button>
      </div>
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Store Selector (Mimicking Majoo) */}
        <div className="p-4 border-b border-white/10 relative">
          <div 
            ref={triggerRef}
            onClick={() => setShowOutletModal(!showOutletModal)}
            className="flex items-center gap-3 bg-white/10 hover:bg-white/20 p-3 rounded-lg cursor-pointer transition-colors w-10/12 md:w-full"
          >
            <Store size={22} className="text-white shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-blue-100 font-bold tracking-wider uppercase">Outlet</p>
              <p className="text-sm font-bold text-white truncate">{selectedOutlet === 'all' ? 'Semua Outlet' : merchantName}</p>
            </div>
            <ChevronDown size={16} className={`text-white transition-transform ${showOutletModal ? 'rotate-180' : ''} shrink-0`} />
          </div>

          {/* Popup Daftar Outlet */}
          {showOutletModal && (
            <div ref={modalRef} className="absolute top-full left-4 mt-2 w-[calc(100%-2rem)] md:w-72 bg-white rounded-xl shadow-2xl z-[100] animate-in slide-in-from-top-2 border border-slate-100 text-slate-800 p-4">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="font-bold text-sm text-slate-900">Daftar Outlet</h3>
                 <button className="text-emerald-500 font-bold text-[11px] hover:text-emerald-600">Atur Grup &gt;</button>
               </div>
               
               <div className="relative mb-4">
                 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Cari Outlet ..." 
                   value={outletSearch}
                   onChange={e => setOutletSearch(e.target.value)}
                   className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50 placeholder-slate-400"
                 />
               </div>

               <div className="flex border-b border-slate-200 mb-3">
                 {['Semua', 'Laporan', 'Produk'].map(tab => (
                   <button 
                     key={tab}
                     onClick={() => setOutletTab(tab as any)}
                     className={`flex-1 pb-2 text-[11px] font-bold text-center border-b-2 transition-colors ${outletTab === tab ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                   >
                     {tab}
                   </button>
                 ))}
               </div>

               <div className="space-y-1">
                 <label className="flex items-center justify-between p-2 rounded hover:bg-slate-50 cursor-pointer group">
                   <div className="flex items-center gap-3">
                     <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${selectedOutlet === 'all' ? 'border-emerald-500' : 'border-slate-300 group-hover:border-slate-400'}`}>
                       {selectedOutlet === 'all' && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                     </div>
                     <span className={`text-xs font-bold ${selectedOutlet === 'all' ? 'text-slate-900' : 'text-slate-600'}`}>Semua Outlet</span>
                   </div>
                   <span className="text-[10px] text-slate-400">1 Outlet</span>
                 </label>
                 
                 <label className="flex items-center justify-between p-2 rounded hover:bg-slate-50 cursor-pointer group">
                   <div className="flex items-center gap-3">
                     <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${selectedOutlet === 'merchant' ? 'border-emerald-500' : 'border-slate-300 group-hover:border-slate-400'}`}>
                       {selectedOutlet === 'merchant' && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                     </div>
                     <span className={`text-xs font-bold ${selectedOutlet === 'merchant' ? 'text-emerald-600' : 'text-slate-600'}`}>{merchantName}</span>
                   </div>
                 </label>
               </div>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar py-2">
          
          {/* Mobile Only: PILIH MENU Grid */}
          <div className="md:hidden px-4 mb-4 mt-2">
            <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mb-3">PILIH MENU</p>
            <div className="grid grid-cols-3 gap-2">
               {mobileGridItems.map(item => (
                 <Link 
                   key={item.name} 
                   href={item.href}
                   onClick={onClose}
                   className={`flex flex-col items-center justify-center text-center py-2.5 px-1 rounded-xl transition-all ${
                     item.active ? 'bg-white/20 shadow-sm border border-white/30 text-white' : 'bg-white/5 border border-white/5 text-blue-50 hover:bg-white/10'
                   }`}
                 >
                   <span className={`text-[10px] leading-tight font-bold ${item.active ? '' : 'opacity-90'}`}>
                     {item.name}
                   </span>
                 </Link>
               ))}
            </div>
          </div>

          <div className="md:hidden border-t border-white/10 my-4 mx-4"></div>

          {/* Menu Favorit Example */}
          <div className="mb-2">
            <div className="flex items-center justify-between px-5 py-2 text-blue-100/80 hover:text-white cursor-pointer group transition-colors">
              <div className="flex items-center gap-3">
                <Star size={20} />
                <span className="font-medium text-sm">Menu Favorit</span>
              </div>
              <ChevronDown size={16} className="opacity-50 group-hover:opacity-100" />
            </div>
          </div>

          <div className="hidden md:block">
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
                      : 'text-white/80 hover:bg-white/20 font-medium border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-sm">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="hidden md:block my-2 border-t border-white/10"></div>
          
          <div className="hidden md:block">
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
                      : 'text-white/80 hover:bg-white/20 font-medium border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-sm">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
          
          {/* Akun Profile Collapse Example mimicking Majoo */}
          <div className="md:hidden mt-2">
             <div className="flex items-center justify-between px-5 py-3 text-white cursor-pointer bg-white/5 border-t border-white/10 mt-2">
                <div className="flex items-center gap-3">
                  <Users size={20} />
                  <span className="font-bold text-sm">Akun Profile</span>
                </div>
                <ChevronDown size={16} className="rotate-180" />
             </div>
             <div className="bg-white/5 pb-3">
                <Link href="/settings" onClick={onClose} className="block px-12 py-2 text-sm text-blue-100 hover:text-white hover:font-bold">Informasi Akun</Link>
                <Link href="/settings" onClick={onClose} className="block px-12 py-2 text-sm text-blue-100 hover:text-white hover:font-bold">Informasi Bisnis</Link>
             </div>
          </div>
        </nav>

        {/* Footer Support & Settings */}
        <div className="p-4 bg-black/10 border-t border-white/10 hidden md:block">
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
        
        {/* Mobile footer for logout only since settings is in grid */}
        <div className="p-4 bg-black/10 border-t border-white/10 md:hidden">
          <button className="w-full bg-white text-[#4F75FF] font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors shadow-lg mb-3">
            <MessageSquare size={18} />
            <span className="text-sm">Chat 24 Jam</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 transition-colors"
          >
            <LogOut size={16} />
            <span className="font-medium text-sm">Keluar dari Sistem</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
