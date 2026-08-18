'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { ArrowLeft,  Plus, Package, Edit, Trash2, Search, AlertCircle, CheckCircle2, ArrowRight, Store, Save, ImagePlus, ScanBarcode, Camera  } from 'lucide-react';
import CameraScanner from '@/components/CameraScanner';
import { toast } from 'sonner';
import HeaderAiTrigger from '@/components/ubos/HeaderAiTrigger';
import CurrencyInput from '@/components/CurrencyInput';

export default function InventoryRitelPage() {
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();

  // Search State
  

  // Modal State
  
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

  useEffect(() => {
    router.push(`/ubos/${params.category || 'ritel'}/${params.slug}/inventory`);
  }, []);

  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

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
      router.push(`/ubos/${params.category || 'ritel'}/${params.slug}/inventory`);
      
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
      
          {/* Header Inventory - Modern Clean */}
          
          {/* Header Inventory - Modern Clean */}
          <header className="px-5 py-6 md:py-8 flex justify-between items-center z-10 relative bg-slate-50">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center flex-wrap gap-3">
                Tambah Produk Baru
                <HeaderAiTrigger />
              </h1>
              <p className="text-slate-500 text-sm mt-1.5 flex items-center gap-1.5 font-medium">
                Tambah item kalkulator HPP baru
              </p>
            </div>
            <Link 
              href={`/ubos/${params.category || 'ritel'}/${params.slug}/inventory`}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
            >
              <ArrowLeft size={16} />
              Kembali
            </Link>
          </header>

      <div className="p-5 max-w-7xl mx-auto space-y-6 pb-28 md:pb-10 relative z-30 animate-in fade-in duration-500">
        
        {/* Kalkulator / Form Tambah Produk Ritel Card */}
        <div className="glass-card rounded-3xl p-6">
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

              </div>
    </>
  );
}
