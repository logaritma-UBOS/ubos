'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { ArrowLeft, Plus, Search, Trash2, Edit, Printer, FileText, Package, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import HeaderAiTrigger from '@/components/ubos/HeaderAiTrigger';

export default function InventoryPercetakanListPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: merchantData } = await supabase.from('merchants').select('id').eq('user_id', user.id).single();
      if (!merchantData) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('merchant_id', merchantData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat daftar produk');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId: string) => {
    if (!confirm('Apakah kamu yakin ingin menghapus produk ini? Produk yang pernah ditransaksikan juga akan dibersihkan riwayat itemnya.')) return;

    try {
      // 1. Hapus item transaksi terkait terlebih dahulu untuk menghindari Foreign Key Violation
      await supabase.from('transaction_items').delete().eq('product_id', productId);

      // 2. Hapus resep yang terikat
      await supabase.from('recipes').delete().eq('product_id', productId);

      // 3. Hapus produk dari tabel products
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;

      toast.success('Produk berhasil dihapus!');
      setProducts(products.filter(p => p.id !== productId));
    } catch (err: any) {
      console.error(err);
      toast.error('Gagal menghapus produk: ' + (err.message || 'Kesalahan database'));
    }
  };

  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  const filteredProducts = products.filter(p => p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase()));

  // Kalkulasi Indikator Atas
  const totalProduk = products.length;
  const stokHabis = products.filter(p => p.stok !== undefined && p.stok !== null && p.stok <= 0).length;
  const nilaiAsetHpp = products.reduce((acc, curr) => {
    const qty = curr.stok || 1; // Default ke 1 jika tipe produk cctv/jasa/non-stok
    return acc + ((curr.hpp_dasar || 0) * qty);
  }, 0);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Memuat Inventori...</div>;
  }

  return (
    <div className="pb-24 bg-slate-50 min-h-screen">
      <header className="px-5 py-6 md:py-8 flex justify-between items-center bg-white border-b border-slate-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Inventori Percetakan & ATK
            <HeaderAiTrigger />
          </h1>
          <p className="text-slate-500 text-sm mt-1">Kelola produk cetak dan stok barang ATK</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href={`/ubos/percetakan/${slug}/inventory/new`}
            className="bg-[#00C0A3] hover:bg-[#009b82] text-slate-950 px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-2 text-sm shadow-sm"
          >
            <Plus size={16} /> Tambah Produk
          </Link>
          <Link 
            href={`/ubos/percetakan/${slug}`}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 text-sm shadow-sm"
          >
            <ArrowLeft size={16} /> Dashboard
          </Link>
        </div>
      </header>

      <div className="p-5 max-w-7xl mx-auto space-y-6">
        {/* Ringkasan Indikator Card Atas (Sejajar 3 Kolom di Mobile & Desktop) */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <div className="bg-white p-3 md:p-5 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 md:w-6 md:h-6" />
            </div>
            <div>
              <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Produk</span>
              <h2 className="text-base md:text-2xl font-black text-slate-900 leading-tight">{totalProduk}</h2>
            </div>
          </div>

          <div className="bg-white p-3 md:p-5 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4 md:w-6 md:h-6" />
            </div>
            <div>
              <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider block">Stok Habis</span>
              <h2 className="text-base md:text-2xl font-black text-slate-900 leading-tight">{stokHabis}</h2>
            </div>
          </div>

          <div className="bg-white p-3 md:p-5 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 md:w-6 md:h-6" />
            </div>
            <div>
              <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider block">Nilai Aset HPP</span>
              <h2 className="text-xs md:text-2xl font-black text-slate-900 leading-tight truncate">{formatIDR(nilaiAsetHpp)}</h2>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari produk atau ATK..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#00C0A3] shadow-sm"
          />
        </div>

        {/* Grid Daftar Produk */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
              Belum ada produk atau ATK yang ditambahkan.
            </div>
          ) : (
            filteredProducts.map(product => {
              const isAtk = product.nama_produk.includes('[ATK]');
              const margin = product.harga_jual > 0 ? Math.round(((product.harga_jual - (product.hpp_dasar || 0)) / product.harga_jual) * 100) : 0;

              return (
                <div key={product.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center border border-slate-100">
                      {product.photo_url ? (
                        <img src={product.photo_url} alt={product.nama_produk} className="w-full h-full object-cover" />
                      ) : (
                        isAtk ? <FileText size={24} className="text-amber-500" /> : <Printer size={24} className="text-[#00C0A3]" />
                      )}
                    </div>
                    <div className="space-y-1 flex-1">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${isAtk ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {isAtk ? 'ATK / Retail' : 'Percetakan'}
                      </span>
                      <h3 className="font-black text-slate-900 text-base leading-snug">{product.nama_produk.replace(/\[.*?\]\s/, '')}</h3>
                      <div className="text-xs text-slate-500 font-medium">Jual: <span className="font-bold text-slate-900">{formatIDR(product.harga_jual)}</span></div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">HPP / Modal</span>
                      <span className="font-bold text-slate-800">{formatIDR(product.hpp_dasar || 0)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Margin</span>
                      <span className="font-black text-emerald-600">{margin}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Link 
                      href={`/ubos/percetakan/${slug}/inventory/edit/${product.id}`}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Edit size={14} /> Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Trash2 size={14} /> Hapus
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}