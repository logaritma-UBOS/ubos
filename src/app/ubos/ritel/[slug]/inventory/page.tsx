'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Plus, Package, Edit, Trash2, Search, AlertCircle, CheckCircle2, ArrowRight, Store, Save, ImagePlus, ScanBarcode, Camera } from 'lucide-react';
import CameraScanner from '@/components/CameraScanner';
import { toast } from 'sonner';
import CurrencyInput from '@/components/CurrencyInput';

export default function InventoryRitelPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [itemToDelete, setItemToDelete] = useState<{id: string, name: string} | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  // Form State (Tambah Produk Ritel)
  const [sku, setSku] = useState('');
  const [namaProduk, setNamaProduk] = useState('');
  const [hargaBeli, setHargaBeli] = useState('');
  const [hargaJual, setHargaJual] = useState('');
  const [stock, setStock] = useState('10');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

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
    p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setLoading(true);
    try {
      await supabase.from('products').delete().eq('id', itemToDelete.id);
      await fetchProducts();
      setItemToDelete(null);
      toast.success(`Produk ${itemToDelete.name} berhasil dihapus.`);
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
      toast.success(newStatus ? 'Produk Tersedia' : 'Produk Habis');
    } catch (e) {
      console.error(e);
      fetchProducts();
      toast.error('Gagal mengubah status ketersediaan');
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setItemToDelete({ id, name });
  };

  const handleSaveProduct = async () => {
    if (!namaProduk) {
      toast.error('Nama produk wajib diisi');
      return;
    }
    
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');
      
      const { data: merchantData } = await supabase.from('merchants').select('id').eq('user_id', user.id).single();
      if (!merchantData) throw new Error('Merchant not found');

      const beli = parseFloat(hargaBeli.replace(/\D/g, '')) || 0;
      const jual = parseFloat(hargaJual.replace(/\D/g, '')) || 0;
      const stokInt = parseInt(stock) || 0;

      // Upload image to Cloudinary if a new file is selected
      let photo_url = null;
      if (imageFile) {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
        
        const formData = new FormData();
        formData.append('file', imageFile);
        if (uploadPreset) formData.append('upload_preset', uploadPreset);
        
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.secure_url) {
          photo_url = data.secure_url;
        }
      }

      // Add to products
      const payload: any = {
        merchant_id: merchantData.id,
        nama_produk: namaProduk,
        sku: sku || null,
        hpp_dasar: beli,
        harga_jual: jual,
        photo_url: photo_url || null,
        is_available: true
      };

      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert([payload])
        .select()
        .single();
        
      if (productError) throw productError;

      // Insert initial stock if any
      if (stokInt > 0 && productData) {
        await supabase.from('inventory_logs').insert([{
          merchant_id: merchantData.id,
          product_id: productData.id,
          stok_tersisa: stokInt,
          catatan: 'Stok Awal (Input Manual)'
        }]);
      }

      toast.success('Produk ritel berhasil ditambahkan!');
      
      // Reset Form
      setSku('');
      setNamaProduk('');
      setHargaBeli('');
      setHargaJual('');
      setStock('10');
      setImageFile(null);
      setImagePreview(null);
      
      // Refresh Data
      fetchProducts();
      
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan produk.');
    } finally {
      setSaving(false);
    }
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
          <h1 className="text-xl font-bold text-white tracking-tight drop-shadow-sm">Stock & SKU Tracker</h1>
          <p className="text-white/80 text-xs mt-0.5">Manajemen Inventori Ritel</p>
        </div>
      </header>

      <div className="p-5 pt-24 max-w-6xl mx-auto space-y-6 pb-28 md:pb-10 animate-in fade-in duration-500">
        
        {/* Kalkulator / Form Tambah Produk Ritel Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Package size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Tambah Produk & Stok Baru</h2>
              <p className="text-xs text-slate-500">Input SKU, Harga Kulakan vs Harga Jual.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-center min-h-[160px] relative">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => { setImagePreview(null); setImageFile(null); }}
                      className="absolute top-2 right-2 bg-slate-900/50 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-sm transition-colors shadow-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-full p-4 cursor-pointer text-slate-400 hover:text-primary transition-colors text-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-slate-300">
                      <ImagePlus size={24} />
                    </div>
                    <span className="text-[13px] font-bold text-slate-600 mb-1 leading-tight">Unggah Foto Produk</span>
                    <span className="text-[10px] text-slate-400">PNG, JPG (Maks 5MB)</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">SKU / Barcode</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowScanner(true)}
                        className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-center shrink-0 border border-slate-200"
                        title="Scan dengan Kamera HP"
                      >
                        <Camera size={20} />
                      </button>
                      <div className="relative flex-1">
                        <input type="text" value={sku} onChange={e => setSku(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm font-mono min-w-0" placeholder="Scan / Ketik SKU..." />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <ScanBarcode size={18} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Nama Produk</label>
                    <input type="text" value={namaProduk} onChange={e => setNamaProduk(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" placeholder="Contoh: Indomie Goreng" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Harga Beli / Kulakan</label>
                    <CurrencyInput value={hargaBeli} onChange={setHargaBeli} className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" placeholder="2500" icon="Rp" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Harga Jual Eceran</label>
                    <CurrencyInput value={hargaJual} onChange={setHargaJual} className="w-full pl-10 pr-3 py-3 bg-primary/5 border border-primary/20 text-primary rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all shadow-sm" placeholder="3000" icon="Rp" />
                  </div>
                  <div>
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Stok Awal (Qty)</label>
                     <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm font-bold text-slate-800" placeholder="10" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-4">
              <button 
                onClick={handleSaveProduct} 
                disabled={saving || !namaProduk}
                className="w-full md:w-auto bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-primary/20"
              >
                {saving ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Simpan ke Inventori</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Product List Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800">Daftar Barang & Stok</h2>
            <div className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2">
              <Package size={14} />
              {products.length} SKU
            </div>
          </div>
          
          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama atau SKU barcode..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            />
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300 shadow-inner border border-slate-100">
                <Store size={32} />
              </div>
              <p className="text-slate-800 font-bold text-base mb-1">Belum ada barang</p>
              <p className="text-slate-500 text-sm leading-relaxed max-w-[250px]">Gunakan form di atas untuk menambahkan barang jualan ritel Anda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filteredProducts.map((product) => {
                const isAvailable = product.is_available ?? true;
                // Asumsi dummy alert "Stok Tipis" untuk mockup jika data stok kurang dari batas
                // Jika tidak ada stok, kita mockup acak atau rely on is_available
                const isLowStock = !isAvailable; // simplified low stock UI
                return (
                <div key={product.id} className={`bg-white rounded-2xl p-3 shadow-sm border ${isLowStock ? 'border-red-200' : 'border-slate-100'} flex flex-col h-full relative overflow-hidden group max-w-xs mx-auto w-full ${!isAvailable ? 'grayscale opacity-75' : ''}`}>
                  <div className="absolute top-2 left-2 z-10 flex gap-1 flex-col">
                    <button 
                      type="button"
                      onClick={() => toggleAvailability(product.id, isAvailable)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shadow-sm ${isAvailable ? 'bg-primary' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    {!isAvailable && (
                      <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded animate-pulse w-fit">STOK HABIS</span>
                    )}
                  </div>
                  
                  <div className="aspect-[4/3] w-full bg-slate-50 rounded-xl mb-3 flex items-center justify-center overflow-hidden border border-slate-100 relative">
                    {product.photo_url ? (
                      <img src={product.photo_url} alt={product.nama_produk} className="w-full h-full object-cover" />
                    ) : (
                      <Store size={32} className="text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-800 text-[13px] line-clamp-2 leading-tight">{product.nama_produk}</h3>
                    {product.sku && <p className="text-[10px] text-slate-400 font-mono mt-0.5 tracking-wider">{product.sku}</p>}
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Kulakan</span>
                        <span className="font-bold text-slate-700">{formatIDR(product.hpp_dasar)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Jual</span>
                        <span className="font-bold text-primary">{formatIDR(product.harga_jual)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2 pt-3 border-t border-slate-100">
                    <Link href={`/ubos/ritel/${params.slug as string}/inventory/edit/${product.id}`} className="flex-1 text-center font-bold text-[11px] text-slate-500 hover:text-primary transition-colors py-2 bg-slate-50 hover:bg-primary/10 rounded-lg flex items-center justify-center gap-1.5"><Edit size={14} /> Edit</Link>
                    <button onClick={() => handleDeleteClick(product.id, product.nama_produk)} className="flex-1 font-bold text-[11px] text-slate-500 hover:text-red-500 transition-colors py-2 bg-slate-50 hover:bg-red-50 rounded-lg flex items-center justify-center gap-1.5"><Trash2 size={14} /> Hapus</button>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {showScanner && (
        <CameraScanner
          onClose={() => setShowScanner(false)}
          onScan={(decodedText) => {
            setSku(decodedText.trim());
            setShowScanner(false);
            toast.success('Barcode berhasil di-scan');
          }}
        />
      )}

      {/* Custom Delete Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[60] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 text-center">Hapus Produk?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">Produk <strong className="text-slate-800">{itemToDelete.name}</strong> akan dihapus permanen.</p>
            <div className="w-full space-y-3">
              <button onClick={confirmDelete} className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all active:scale-95">
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
