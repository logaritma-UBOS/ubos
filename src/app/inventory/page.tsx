'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Plus, Package, Edit, Trash2, Search, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import DummyDataInjector from '@/components/DummyDataInjector';
import toast from 'react-hot-toast';
import FloatingAIPilot from '@/components/FloatingAIPilot';

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const isOnboarding = searchParams.get('onboarding') === 'true';

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [itemToDelete, setItemToDelete] = useState<{id: string, name: string} | null>(null);

  const fetchProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: merchantData } = await supabase
        .from('merchants')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (merchantData) {
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('merchant_id', merchantData.id)
          .order('nama_produk', { ascending: true });
        
        setProducts(productsData || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  const filteredProducts = products.filter(p => 
    p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setLoading(true);
    try {
      await supabase.from('products').delete().eq('id', itemToDelete.id);
      await fetchProducts();
      setItemToDelete(null);
      toast.success(`Menu ${itemToDelete.name} berhasil dihapus.`);
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghapus produk');
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_available: newStatus } : p));
      
      const { error } = await supabase
        .from('products')
        .update({ is_available: newStatus })
        .eq('id', id);
        
      if (error) throw error;
      toast.success(newStatus ? 'Menu Tersedia' : 'Menu Habis');
    } catch (e) {
      console.error(e);
      fetchProducts();
      toast.error('Gagal mengubah status ketersediaan');
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setItemToDelete({ id, name });
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-primary"></div>
      </div>
    );
  }

  return (
    <>
      <header className="fixed top-0 z-40 h-[80px] bg-primary shadow-md max-w-md md:max-w-none mx-auto md:mx-0 left-0 md:left-64 right-0 px-5 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight drop-shadow-sm">Stok & HPP</h1>
          <p className="text-white/80 text-xs mt-0.5">Master Produk & Resep</p>
        </div>
        <div className="flex items-center gap-2">
          <FloatingAIPilot />
          <Link href="/inventory/new" className="bg-white text-primary hover:bg-slate-50 px-3 py-2 rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5 font-bold text-sm">
            <Plus size={16} strokeWidth={3} />
            <span className="hidden sm:inline">Tambah</span>
          </Link>
        </div>
      </header>

      <div className="p-5 pt-24 max-w-6xl mx-auto space-y-6 pb-28 md:pb-10 animate-in fade-in duration-500">
        {/* ONBOARDING BANNER STEP 2 */}
        {isOnboarding && products.length === 0 && (
          <div className="bg-indigo-50 border-2 border-indigo-500 text-indigo-900 p-4 rounded-2xl flex items-start gap-4 mb-6 shadow-md shadow-indigo-200/50">
            <div className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0 font-bold">2</div>
            <div>
              <h3 className="font-bold text-lg mb-1">Langkah 2 dari 3: Tambahkan Produk Pertama</h3>
              <p className="text-sm font-medium opacity-90">Tambahkan minimal 1 produk beserta HPP (Harga Pokok Penjualan) bahan baku Anda agar Margin Guard dapat bekerja menghitung profit secara otomatis.</p>
            </div>
          </div>
        )}

        {/* ONBOARDING SUCCESS STEP */}
        {isOnboarding && products.length > 0 && (
          <div className="bg-emerald-50 border-2 border-emerald-500 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 mb-6 shadow-md shadow-emerald-200/50">
            <div className="flex items-center gap-4">
              <CheckCircle2 size={32} className="text-emerald-600" />
              <div>
                <h3 className="font-black text-emerald-900 text-lg">Produk Berhasil Disimpan!</h3>
                <p className="text-emerald-700 font-medium">Bagus sekali. Smart POS Anda sudah siap digunakan.</p>
              </div>
            </div>
            <button 
              onClick={() => router.push('/pos')}
              className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95"
            >
              Siap Buka Kasir <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="bg-surface rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl">
              <Package size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Produk</p>
              <p className="text-xl font-black text-slate-800">{products.length}</p>
            </div>
          </div>
          
          <div className="bg-surface rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="bg-orange-50 text-orange-600 p-2.5 rounded-xl">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Produk Habis</p>
              <p className="text-xl font-black text-slate-800">
                {products.filter(p => p.is_available === false).length}
              </p>
            </div>
          </div>
        </div>

        {/* Product List */}
        <div>
          <h2 className="text-sm font-bold text-slate-800 mb-3">Daftar Produk</h2>
          
          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari menu atau minuman..."
              className="w-full pl-11 pr-4 py-3 bg-surface border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            />
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="bg-surface rounded-3xl p-8 shadow-sm border border-slate-100 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300 shadow-inner border border-slate-100">
                <Package size={32} />
              </div>
              {products.length === 0 ? (
                <>
                  <p className="text-slate-800 font-bold text-base mb-1">Katalog Anda Masih Kosong</p>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-[200px] mb-6">Mulai tambahkan menu F&B Anda untuk berjualan di Smart POS.</p>
                  <DummyDataInjector onComplete={fetchProducts} />
                </>
              ) : (
                <>
                  <p className="text-slate-800 font-bold text-base mb-1">Produk tidak ditemukan</p>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-[200px] mb-6">Coba sesuaikan kata kunci pencarian Anda.</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filteredProducts.map((product) => {
                const isAvailable = product.is_available ?? true;
                return (
                <div key={product.id} className={`bg-surface rounded-2xl p-3 shadow-sm border border-slate-100 flex flex-col h-full relative overflow-hidden group max-w-xs mx-auto w-full ${!isAvailable ? 'grayscale opacity-75' : ''}`}>
                  <div className="absolute top-2 left-2 z-10">
                    <button 
                      type="button"
                      onClick={() => toggleAvailability(product.id, isAvailable)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shadow-sm ${isAvailable ? 'bg-primary' : 'bg-slate-300'}`}
                      title={isAvailable ? 'Tersedia' : 'Habis'}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  {!isAvailable && (
                    <div className="absolute top-2 right-2 bg-slate-800 text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-10">
                      HABIS
                    </div>
                  )}
                  <div className="aspect-square w-full bg-slate-50 rounded-xl mb-3 flex items-center justify-center overflow-hidden border border-slate-100 relative">
                    {product.photo_url ? (
                      <img src={product.photo_url} alt={product.nama_produk} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={32} className="text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-800 text-[13px] line-clamp-2 leading-tight">{product.nama_produk}</h3>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-xs text-slate-500">HPP: {formatIDR(product.hpp_dasar)}</p>
                      <span className="font-bold text-primary text-xs bg-primary/5 px-2 py-1 rounded-md">{formatIDR(product.harga_jual)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2 pt-3 border-t border-slate-100">
                    <Link href={`/inventory/edit/${product.id}`} className="flex-1 text-center font-bold text-[11px] text-slate-500 hover:text-primary transition-colors py-2 bg-slate-50 hover:bg-primary/10 rounded-lg flex items-center justify-center gap-1.5"><Edit size={14} /> Edit</Link>
                    <button onClick={() => handleDeleteClick(product.id, product.nama_produk)} className="flex-1 font-bold text-[11px] text-slate-500 hover:text-danger transition-colors py-2 bg-slate-50 hover:bg-danger/10 rounded-lg flex items-center justify-center gap-1.5"><Trash2 size={14} /> Hapus</button>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Custom Delete Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[60] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 text-center">Hapus Menu?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">Menu <strong className="text-slate-800">{itemToDelete.name}</strong> akan dihapus permanen beserta data resepnya.</p>
            <div className="w-full space-y-3">
              <button onClick={confirmDelete} className="w-full py-3.5 bg-danger hover:bg-danger-dark text-white font-bold rounded-xl transition-all active:scale-95">
                Ya, Hapus
              </button>
              <button onClick={() => setItemToDelete(null)} className="w-full py-3.5 border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all active:scale-95">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
