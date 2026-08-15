'use client';

import { Menu, Bell, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TopBar({ merchant, onOpenSidebar }: { merchant: any, onOpenSidebar: () => void }) {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-[60] flex items-center justify-between px-4 md:px-6 shadow-sm">
      
      {/* Left Section: Hamburger (Mobile) + Logo */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onOpenSidebar}
          className="p-2 -ml-2 text-slate-600 md:hidden hover:bg-slate-100 rounded-lg"
        >
          <Menu size={24} />
        </button>
        
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo-ubos-wide.png" alt="UBOS Logo" className="h-8 md:h-10 w-auto object-contain" />
        </Link>
      </div>

      {/* Center Section: Tabs (Desktop Only) - Mimicking Majoo */}
      <div className="hidden lg:flex items-center gap-1 xl:gap-4 absolute left-1/2 -translate-x-1/2">
        <div className="bg-[#4F75FF] text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-md shadow-blue-500/20 cursor-pointer">
          Penjualan
        </div>
        <div className="text-slate-500 hover:text-slate-900 px-3 py-1.5 font-medium text-sm transition-colors cursor-pointer">
          Order Online
        </div>
        <div className="text-slate-500 hover:text-slate-900 px-3 py-1.5 font-medium text-sm transition-colors cursor-pointer">
          Appointment
        </div>
        <div className="text-slate-500 hover:text-slate-900 px-3 py-1.5 font-medium text-sm transition-colors cursor-pointer">
          Karyawan
        </div>
      </div>

      {/* Right Section: Store Pill + Notification + Avatar */}
      <div className="flex items-center gap-3 md:gap-5">
        <div className="hidden md:flex items-center gap-2 bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors px-4 py-1.5 rounded-full text-slate-700 font-bold text-sm border border-slate-200">
          <span className="w-5 h-5 bg-slate-300 rounded-full flex items-center justify-center text-[10px] text-slate-700">Rp</span>
          Dana Siap Pakai
        </div>
        
        <button className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
          <Bell size={20} className="text-slate-600" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
        </button>
        
        <Link href="/settings" className="flex items-center gap-2 hover:bg-slate-50 p-1 rounded-full transition-colors">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 uppercase">
            {merchant?.nama_usaha?.substring(0, 2) || 'WA'}
          </div>
          <div className="hidden md:block text-left text-xs mr-2">
            <p className="font-bold text-slate-900 truncate max-w-[100px]">{merchant?.nama_usaha || 'Outlet'}</p>
            <p className="text-slate-500 truncate max-w-[100px]">{merchant?.owner_name || 'Owner'}</p>
          </div>
        </Link>
      </div>

    </header>
  );
}
