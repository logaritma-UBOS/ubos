'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ShoppingCart, CheckCircle, Clock, Search, XCircle, Store } from 'lucide-react';
import Link from 'next/link';

export default function OnlineOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: m } = await supabase.from('merchants').select('id').eq('user_id', user.id).single();
        if (!m) return;

        // Fallback to empty array if table doesn't exist yet
        const { data: onlineOrders, error } = await supabase
          .from('online_orders')
          .select('*')
          .eq('merchant_id', m.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setOrders(onlineOrders || []);
      } catch (err) {
        // Table probably doesn't exist, ignore for now
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShoppingCart size={24} className="text-[#4F75FF]" />
            Pesanan Online
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Kelola pesanan yang masuk dari toko online konsumen</p>
        </div>
        <Link href="../online-store" className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">
          <Store size={16} />
          Pengaturan Toko
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
           <div className="p-12 text-center text-slate-400">
             <div className="w-8 h-8 border-2 border-[#4F75FF]/30 border-t-[#4F75FF] rounded-full animate-spin mx-auto mb-3"></div>
             Memuat pesanan...
           </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart size={32} className="text-[#4F75FF]" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Belum ada pesanan online</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">Konsumen dapat memesan melalui link toko online Anda. Sebarkan link Anda ke pelanggan!</p>
            <Link href="../online-store" className="inline-flex items-center gap-2 bg-[#4F75FF] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors shadow-md shadow-blue-500/20">
              Lihat Link Toko
            </Link>
          </div>
        ) : (
          <div className="p-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {orders.map(order => (
              <div key={order.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                 {/* Order card content */}
                 <div className="flex justify-between items-start mb-3">
                   <div>
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">#{order.id.substring(0,6)}</span>
                     <h4 className="font-bold text-slate-900 mt-1">{order.customer_name || 'Pelanggan'}</h4>
                   </div>
                   {order.status === 'pending' && <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase">Menunggu</span>}
                   {order.status === 'proses' && <span className="bg-blue-100 text-[#4F75FF] text-[10px] font-bold px-2 py-1 rounded-md uppercase">Diproses</span>}
                   {order.status === 'selesai' && <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase">Selesai</span>}
                 </div>
                 <div className="text-sm text-slate-600 mb-4 pb-4 border-b border-slate-100">
                    <p>{order.items_count || 1} item</p>
                    <p className="font-bold text-slate-900 mt-1">{formatIDR(order.total_amount)}</p>
                 </div>
                 <button className="w-full py-2 bg-slate-50 text-[#4F75FF] font-bold text-sm rounded-lg hover:bg-blue-50 transition-colors">
                   Proses Pesanan
                 </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
