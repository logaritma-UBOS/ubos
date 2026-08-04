'use client';

import Link from 'next/link';
import { ArrowLeft, Store } from 'lucide-react';

export default function RitelDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-6">
        <Store size={48} className="text-purple-600" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Modul Ritel & Toko</h1>
      <p className="text-slate-600 mb-8 max-w-md">
        Modul UBOS untuk bisnis Ritel, Minimarket, dan Olshop sedang dalam tahap pengembangan. Kami akan segera merilisnya!
      </p>
      <Link 
        href="/member" 
        className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
      >
        <ArrowLeft size={18} /> Kembali ke Member Area
      </Link>
    </div>
  );
}
