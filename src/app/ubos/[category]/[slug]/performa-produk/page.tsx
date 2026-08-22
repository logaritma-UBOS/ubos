'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { Flame, DollarSign, ArrowLeft } from 'lucide-react';

export default function PerformaProdukPage() {
  const params = useParams();
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState('7H');
  const [productsSummary, setProductsSummary] = useState<any[]>([]);
  const [topLaku, setTopLaku] = useState<string>('Memuat data...');
  const [topUntung, setTopUntung] = useState<string>('Memuat data...');
  const [loading, setLoading] = useState(true);

  const category = (params.category as string) || 'kuliner';
  const slug = (params.slug as string) || '';
  const basePath = `/ubos/${category}/${slug}`;

  useEffect(() => {
    const fetchPerforma = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: m } = await supabase.from('merchants').select('id').eq('user_id', user.id).single();
        if (!m) return;

        // 1. Ambil data master produk
        const { data: prods } = await supabase
          .from('products')
          .select('*')
          .eq('merchant_id', m.id);

        // 2. Ambil data transaksi milik merchant ini
        const { data: txs } = await supabase
          .from('transactions')
          .select('id, created_at')
          .eq('merchant_id', m.id);

        if (!prods || prods.length === 0) {
          setLoading(false);
          return;
        }

        const txIds = (txs || []).map(t => t.id);
        let allItems: any[] = [];

        // 3. Ambil data dari transaction_items berdasarkan ID transaksi
        if (txIds.length > 0) {
          const { data: items } = await supabase
            .from('transaction_items')
            .select('*')
            .in('transaction_id', txIds);
          
          if (items) allItems = items;
        }

        // 4. Petakan total qty terjual dan omzet per product_id
        const salesMap: Record<string, { qty: number, revenue: number }> = {};

        allItems.forEach(item => {
          const prodId = item.product_id;
          const qty = Number(item.qty) || 0;
          const hargaSatuan = Number(item.harga_satuan) || 0;

          if (prodId) {
            if (!salesMap[prodId]) {
              salesMap[prodId] = { qty: 0, revenue: 0 };
            }
            salesMap[prodId].qty += qty;
            salesMap[prodId].revenue += qty * hargaSatuan;
          }
        });

        // 5. Gabungkan dengan master produk untuk membuat ringkasan performa
        let summary = prods.map(p => {
          const sold = salesMap[p.id] || { qty: 0, revenue: 0 };
          const hargaJual = Number(p.harga_jual || 0);
          const hpp = Number(p.hpp_dasar || 0);
          const marginSatuan = hargaJual - hpp;

          return {
            name: p.nama_produk || 'Produk',
            stok: Number(p.stok || 0),
            hargaJual,
            totalTerjual: sold.qty,
            totalOmzet: sold.revenue,
            totalProfitKotor: sold.qty * marginSatuan
          };
        });

        // Urutkan untuk mencari Paling Laku & Paling Untung
        const sortedByLaku = [...summary].sort((a, b) => b.totalTerjual - a.totalTerjual);
        const sortedByUntung = [...summary].sort((a, b) => b.totalProfitKotor - a.totalProfitKotor);

        if (sortedByLaku.length > 0 && sortedByLaku[0].totalTerjual > 0) {
          setTopLaku(`${sortedByLaku[0].name} paling banyak terjual (${sortedByLaku[0].totalTerjual} unit).`);
        } else {
          setTopLaku('Belum ada data penjualan tercatat.');
        }

        if (sortedByUntung.length > 0 && sortedByUntung[0].totalProfitKotor > 0) {
          setTopUntung(`${sortedByUntung[0].name} memberikan untung kotor terbesar (${formatIDR(sortedByUntung[0].totalProfitKotor)}).`);
        } else {
          setTopUntung('Belum ada margin profit kotor tercatat.');
        }

        setProductsSummary(summary);
      } catch (err) {
        console.error('Error fetching performance:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerforma();
  }, [timeFilter]);

  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);

  return (
    <div className="pb-24 md:pb-10 bg-[#F8FAFC] min-h-screen font-sans">
      
      {/* Header Biru */}
      <div className="bg-[#4F75FF] text-white p-6 md:p-8 rounded-b-3xl shadow-sm space-y-4">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => router.push(basePath)}
            className="flex items-center gap-2 text-white/80 hover:text-white text-xs font-bold mb-3 transition-colors"
          >
            <ArrowLeft size={16} /> Beranda
          </button>
          <h1 className="text-2xl md:text-3xl font-black">Performa Produk</h1>
          <p className="text-white/80 text-xs md:text-sm mt-1">Analisis penjualan real-time berdasarkan item transaksi kasir.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 -mt-4">
        
        {/* Filter Waktu */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex gap-2 justify-center max-w-sm mx-auto">
          {[
            { label: 'Hari Ini', val: '1H' },
            { label: '7 Hari', val: '7H' },
            { label: '30 Hari', val: '30H' }
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => setTimeFilter(item.val)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${timeFilter === item.val ? 'bg-[#4F75FF] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Highlight Card: Paling Laku */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0 mt-0.5">
            <Flame size={24} />
          </div>
          <div>
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider block mb-0.5">Paling Laku</span>
            <h3 className="text-sm md:text-base font-bold text-slate-900">{topLaku}</h3>
            <p className="text-xs text-slate-500 mt-1">Berdasarkan volume item yang terjual di POS.</p>
          </div>
        </div>

        {/* Highlight Card: Paling Untung */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0 mt-0.5">
            <DollarSign size={24} />
          </div>
          <div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block mb-0.5">Paling Untung</span>
            <h3 className="text-sm md:text-base font-bold text-slate-900">{topUntung}</h3>
            <p className="text-xs text-slate-500 mt-1">Margin keuntungan kotor terbesar dari total penjualan.</p>
          </div>
        </div>

        {/* Rincian Produk */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-900">Rincian Performa Produk</h3>
            <span className="text-xs text-slate-400 font-medium">{productsSummary.length} Produk</span>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="bg-white p-8 rounded-2xl text-center text-slate-400 text-xs">Menganalisis data transaksi...</div>
            ) : productsSummary.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl text-center text-slate-400 text-xs">Belum ada produk terdaftar.</div>
            ) : (
              productsSummary.map((p, index) => (
                <div key={index} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Terjual: <strong className="text-slate-800">{p.totalTerjual} unit</strong> • Stok: {p.stok}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-slate-900 text-sm">{formatIDR(p.totalOmzet)}</div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Omzet Produk</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}