'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, ShoppingBag, Package, Wallet, Users, LogOut, Settings, Store, Handshake, ShieldCheck, Lock, ChevronDown, MessageSquare, Search, X, Megaphone, Brush, Printer, Lightbulb } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import MerchantTicketModal from '@/components/merchant/MerchantTicketModal';

export default function Sidebar({ merchant, onClose }: { merchant?: any, onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [showOutletModal, setShowOutletModal] = useState(false);
  const [outletTab, setOutletTab] = useState<'Semua' | 'Laporan' | 'Produk'>('Semua');
  const [outletSearch, setOutletSearch] = useState('');
  const [selectedOutlet, setSelectedOutlet] = useState<string>('merchant');
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

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

  // --- PERBAIKAN LOGIKA KATEGORI & BASEPATH SINKRON ---
  const pathParts = pathname.split('/');
  // pathParts = ['', 'ubos', 'percetakan', 'baim-printing', 'inventory']
  const urlCategory = (pathParts[2] && pathParts[2] !== 'undefined') ? pathParts[2].toLowerCase() : '';
  const urlSlug = pathParts[3] || '';

  const merchantDbCat = (merchant?.kategori_usaha || merchant?.kategori || '').toLowerCase().trim();
  const rawSlug = merchant?.nama_usaha 
    ? merchant.nama_usaha.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') 
    : '';

  // Prioritaskan kategori dari URL, jika kosong baru pakai database merchant
  const category = urlCategory || merchantDbCat || 'percetakan';
  const slug = urlSlug || rawSlug;

  const merchantName = merchant?.nama_usaha || 'Outlet Baru';
  
  let basePath = '';
  let isJasa = false;

  if (category && slug) {
    basePath = `/ubos/${category}/${slug}`;
    if (category === 'jasa' || category.includes('laundry')) {
      isJasa = true;
    }
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

  const serviceItems = [
    { name: 'Jasa Meta Ads', href: `${basePath}/services?type=meta-ads`, icon: Megaphone },
    { name: 'Branding & Desain', href: `${basePath}/services?type=branding`, icon: Brush },
    { name: 'Produk Pendukung Kasir', href: `${basePath}/services?type=hardware`, icon: Printer },
    { name: 'Inspirasi Bisnis', href: `${basePath}/blog`, icon: Lightbulb },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <>
    <aside className="w-full md:w-64 h-full flex flex-col bg-[#05b99e] shadow-xl z-50 text-white relative md:pt-16 max-w-sm mx-auto md:max-w-none md:mx-0">
      <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
      
      <div className="absolute top-4 right-4 z-[60] md:hidden">
         <button onClick={onClose} className="w-8 h-8 rounded-full border border-white flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all">
           <X size={18} />
         </button>
      </div>
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Store Selector */}
        <div className="p-4 border-b border-white/10 relative">
          <div 
            ref={triggerRef}
            onClick={() => setShowOutletModal(!showOutletModal)}
            className="flex items-center gap-3 bg-white/10 hover:bg-white/20 p-3 rounded-lg cursor-pointer transition-colors w-10/12 md:w-full"
          >
            {merchant?.logo_url ? (
              <img src={merchant.logo_url} alt="Logo" className="w-6 h-6 rounded-full object-cover shrink-0 bg-white border border-white/20" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 border border-white/20 text-[10px] font-black uppercase text-white">
                {merchantName.substring(0, 2)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-blue-100 font-bold tracking-wider uppercase">Outlet</p>
              <p className="text-sm font-bold text-white truncate">{selectedOutlet === 'all' ? 'Semua Outlet' : merchantName}</p>
            </div>
            <ChevronDown size={16} className={`text-white transition-transform ${showOutletModal ? 'rotate-180' : ''} shrink-0`} />
          </div>

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
          <div>
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
                  className={`flex items-center justify-between px-5 py-3 transition-all duration-200 active:scale-95 active:bg-white/30 ${
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

          <div className="my-2 border-t border-white/10"></div>
          
          <div>
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

          {/* Servis & Menu Lainnya */}
          <div className="my-2 border-t border-white/10"></div>
          <div className="px-5 py-1">
            <p className="text-[10px] uppercase font-bold text-blue-100 tracking-wider mb-1">Servis & Lainnya</p>
          </div>
          <div>
            {serviceItems.map((item) => {
              const isActive = pathname.includes(item.href.split('?')[0]);
              const Icon = item.icon;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-5 py-2.5 transition-colors duration-200 ${
                    isActive 
                      ? 'bg-white/10 border-l-4 border-white text-white font-bold' 
                      : 'text-white/70 hover:bg-white/20 hover:text-white font-medium border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-xs">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
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

          <button 
            onClick={() => setIsTicketModalOpen(true)}
            className="w-full bg-white text-[#4F75FF] font-bold py-2 rounded-full flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors shadow-lg"
          >
            <MessageSquare size={18} />
            <span className="text-sm">Chat 24 Jam</span>
          </button>
        </div>
      </div>
    </aside>

    <MerchantTicketModal 
      isOpen={isTicketModalOpen}
      onClose={() => setIsTicketModalOpen(false)}
      merchantName={merchantName}
      whatsapp={merchant?.whatsapp || ''}
    />
    </>
  );
}
