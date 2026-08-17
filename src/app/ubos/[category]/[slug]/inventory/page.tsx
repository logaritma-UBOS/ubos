'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Plus, Package, Edit, Trash2, Search, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import DummyDataInjector from '@/components/DummyDataInjector';
import { toast } from 'sonner';
import AIBanner from '@/components/AIBanner';

const themeColorMap: Record<string, { bg: string, text: string, border: string, light: string, hover: string }> = {
  kuliner: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50', hover: 'hover:bg-emerald-600' },
  percetakan: { bg: 'bg-indigo-500', text: 'text-indigo-600', border: 'border-indigo-200', light: 'bg-indigo-50', hover: 'hover:bg-indigo-600' },
  ritel: { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-200', light: 'bg-amber-50', hover: 'hover:bg-amber-600' },
  jasa: { bg: 'bg-sky-500', text: 'text-sky-600', border: 'border-sky-200', light: 'bg-sky-50', hover: 'hover:bg-sky-600' },
  default: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50', hover: 'hover:bg-blue-600' },
};

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const isOnboarding = searchParams.get('onboarding') === 'true';

  const theme = themeColorMap[(params.category as string)?.toLowerCase()] || themeColorMap.default;

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [itemToDelete, setItemToDelete] = useState<{id: string, name: string} | null>(null);
  const [showOnboardingSuccess, setShowOnboardingSuccess] = useState(false);

  useEffect(() => {
    const step = localStorage.getItem('onboarding_step');
    if (step === 'step2_inventory' && products.length > 0) {
      setShowOnboardingSuccess(true);
    }
  }, [products]);

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

  const totalAset = products.reduce((sum, p) => sum + (p.hpp_dasar || 0), 0);
  const habisCount = products.filter(p => p.is_available === false).length;

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-full min-h-[50vh]">
        <div className={`animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-${theme.bg.split('-')[1]}-500`}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-28 md:pb-10">
      <header className="px-5 py-6 md:py-8 flex justify-between items-center z-10 relative bg-slate-50 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Kalkulator HPP & Stok</h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Manajemen produk & biaya produksi</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href={`/ubos/${params.category}/${params.slug}`}
            className="hidden md:flex p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 shadow-sm items-center gap-2 font-bold text-sm"
          >
             Kembali
          </Link>
          <Link 
            href={`/ubos/${params.category}/${params.slug}/inventory/new`}
            className={`h-11 px-5 ${theme.bg} ${theme.hover} text-white rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95`}
          >
            <Plus size={20} />
            <span className="font-bold text-sm hidden md:inline">Tambah Produk</span>
          </Link>
        </div>
      </header>

      <div className="px-5 pt-2 max-w-6xl mx-auto w-full">
        <AIBanner />
      </div>

      <div className="p-5 pt-0 max-w-6xl mx-auto space-y-6 relative z-30 animate-in fade-in duration-500">
        {/* ONBOARDING BANNER STEP 2 */}
        {isOnboarding && products.length === 0 && (
          <div className="bg-white border-2 border-indigo-200 text-indigo-900 p-5 rounded-2xl flex items-start gap-4 mb-6 shadow-sm">
            <div className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0 font-bold">2</div>
            <div>
              <h3 className="font-bold text-lg mb-1">Langkah 2 dari 3: Tambahkan Produk Pertama</h3>
              <p className="text-sm font-medium text-slate-600">Tambahkan minimal 1 produk beserta HPP (Harga Pokok Penjualan) bahan baku Anda agar AI Copilot dapat bekerja menghitung profit secara otomatis.</p>
            </div>
          </div>
        )}

        {/* ONBOARDING SUCCESS STEP */}
        {isOnboarding && products.length > 0 && (
          <div className="bg-white border-2 border-emerald-200 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 mb-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-full">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-lg">Produk Berhasil Disimpan!</h3>
                <p className="text-slate-500 font-medium text-sm">Bagus sekali. Smart POS Anda sudah siap digunakan.</p>
              </div>
            </div>
            <button 
              onClick={() => router.push(`/ubos/${params.category}/${params.slug}/pos`)}
              className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
            >
              Siap Buka Kasir <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* 3 Bento Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center gap-4">
            <div className={`${theme.light} ${theme.text} p-3.5 rounded-xl border ${theme.border}`}>
              <Package size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Produk</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{products.length}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center gap-4">
            <div className={`p-3.5 rounded-xl border ${habisCount > 0 ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Stok Habis</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{habisCount}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center gap-4">
            <div className="bg-amber-50 text-amber-600 p-3.5 rounded-xl border border-amber-200">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nilai Aset HPP</p>
              <p className="text-xl md:text-2xl font-black text-slate-900 mt-0.5">{formatIDR(totalAset)}</p>
            </div>
          </div>
        </div>

        {/* Product List */}
        <div className="mt-6">
          <h2 className="text-lg font-black text-slate-900 mb-4">Daftar Produk</h2>
          
          <div className="relative mb-5 shadow-sm">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari menu atau bahan baku..."
              className={`w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200/80 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-${theme.bg.split('-')[1]}-200 focus:border-${theme.bg.split('-')[1]}-500 transition-all`}
            />
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-200/80 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300 shadow-inner border border-slate-100">
                <Package size={32} />
              </div>
              {products.length === 0 ? (
                <>
                  <p className="text-slate-900 font-black text-lg mb-2">Katalog Anda Masih Kosong</p>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-[250px] mb-6">Mulai tambahkan produk Anda untuk memantau HPP & Margin otomatis.</p>
                  <DummyDataInjector onComplete={fetchProducts} />
                </>
              ) : (
                <>
                  <p className="text-slate-900 font-black text-lg mb-2">Produk tidak ditemukan</p>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-[250px] mb-6">Coba sesuaikan kata kunci pencarian Anda.</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const isAvailable = product.is_available ?? true;
                const hpp = product.hpp_dasar || 0;
                const harga = product.harga_jual || 0;
                const margin = harga > 0 ? ((harga - hpp) / harga) * 100 : 0;
                const marginColor = margin >= 40 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : (margin > 0 ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-rose-600 bg-rose-50 border-rose-200');

                return (
                <div key={product.id} className={`bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col h-full relative overflow-hidden group w-full transition-all hover:shadow-md hover:border-slate-300 ${!isAvailable ? 'grayscale opacity-75' : ''}`}>
                  <div className="absolute top-3 left-3 z-10 flex gap-2">
                    <button 
                      type="button"
                      onClick={() => toggleAvailability(product.id, isAvailable)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shadow-sm border ${isAvailable ? `bg-${theme.bg.split('-')[1]}-500 border-${theme.bg.split('-')[1]}-600` : 'bg-slate-300 border-slate-400'}`}
                      title={isAvailable ? 'Tersedia' : 'Habis'}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  {!isAvailable && (
                    <div className="absolute top-3 right-3 bg-slate-800/90 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10">
                      HABIS
                    </div>
                  )}
                  <div className="aspect-square w-full bg-slate-50 rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-slate-100 relative mt-2">
                    {product.photo_url ? (
                      <img src={product.photo_url} alt={product.nama_produk} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <Package size={32} className="text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col px-1">
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-tight mb-3">{product.nama_produk}</h3>
                    
                    <div className="space-y-2 mt-auto">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium">HPP</span>
                        <span className="text-xs font-bold text-slate-700">{formatIDR(hpp)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium">Jual</span>
                        <span className={`text-xs font-bold ${theme.text}`}>{formatIDR(harga)}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Margin</span>
                        <span className={`text-[11px] font-black px-2 py-0.5 rounded border ${marginColor}`}>
                          {margin.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2 pt-3 border-t border-slate-100">
                    <Link href={`/ubos/${params.category as string}/${params.slug as string}/inventory/edit/${product.id}`} className={`flex-1 text-center font-bold text-xs text-slate-600 hover:${theme.text} transition-colors py-2.5 bg-slate-50 ${theme.light.replace('bg-', 'hover:bg-')} rounded-xl flex items-center justify-center gap-1.5`}><Edit size={14} /> Edit</Link>
                    <button onClick={() => handleDeleteClick(product.id, product.nama_produk)} className="flex-1 font-bold text-xs text-slate-600 hover:text-rose-600 transition-colors py-2.5 bg-slate-50 hover:bg-rose-50 rounded-xl flex items-center justify-center gap-1.5"><Trash2 size={14} /> Hapus</button>
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
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4 border border-rose-100">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 text-center">Hapus Produk?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">Produk <strong className="text-slate-800">{itemToDelete.name}</strong> akan dihapus permanen beserta data resepnya.</p>
            <div className="w-full space-y-3">
              <button onClick={confirmDelete} className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-all active:scale-95 shadow-sm">
                Ya, Hapus
              </button>
              <button onClick={() => setItemToDelete(null)} className="w-full py-4 border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all active:scale-95">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Onboarding Success Modal */}
      {showOnboardingSuccess && (
        <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <CheckCircle2 size={120} />
            </div>
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 relative z-10">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 relative z-10">Mantap! 🎉</h3>
            <p className="text-slate-500 mb-8 relative z-10 font-medium">
              Produk pertama Anda berhasil ditambahkan. Selanjutnya, mari atur profil toko Anda agar terlihat profesional.
            </p>
            <button 
              onClick={() => {
                localStorage.setItem('onboarding_step', 'step3_settings');
                router.push('/settings');
              }} 
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 relative z-10 active:scale-95"
            >
              Lanjut ke Pengaturan <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
