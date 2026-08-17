'use client';

import { useEffect, useState, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ArrowLeft, Save, Printer, ImagePlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import CurrencyInput from '@/components/CurrencyInput';

export default function EditPercetakanProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  
  // Product state
  const [namaProduk, setNamaProduk] = useState('');
  const [hargaJual, setHargaJual] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [oldPhotoUrl, setOldPhotoUrl] = useState<string | null>(null);

  // Percetakan Cost state
  const [bahanBakuCost, setBahanBakuCost] = useState('');
  const [tintaCost, setTintaCost] = useState('');
  const [finishingCost, setFinishingCost] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data: product, error: prodErr } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();
          
        if (prodErr) throw prodErr;
        
        if (product) {
          setNamaProduk(product.nama_produk || '');
          setHargaJual(product.harga_jual?.toString() || '');
          setIsAvailable(product.is_available ?? true);
          if (product.photo_url) {
            setImagePreview(product.photo_url);
            setOldPhotoUrl(product.photo_url);
          }
        }
        
        const { data: recipeData } = await supabase
          .from('recipes')
          .select('*')
          .eq('product_id', productId);
          
        if (recipeData && recipeData.length > 0) {
          const bahan = recipeData.find((r: any) => r.nama_bahan === 'Bahan Baku');
          const tinta = recipeData.find((r: any) => r.nama_bahan === 'Tinta');
          const finishing = recipeData.find((r: any) => r.nama_bahan === 'Finishing');

          if (bahan) setBahanBakuCost(bahan.harga_per_satuan?.toString() || '');
          if (tinta) setTintaCost(tinta.harga_per_satuan?.toString() || '');
          if (finishing) setFinishingCost(finishing.harga_per_satuan?.toString() || '');
        }
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat produk.');
        router.push(`/ubos/percetakan/${resolvedParams.slug}/inventory`);
      } finally {
        setLoading(false);
      }
    };
    
    if (productId) fetchProduct();
  }, [productId, router]);

  const totalHPP = useMemo(() => {
    const bahan = parseFloat(bahanBakuCost.replace(/\D/g, '')) || 0;
    const tinta = parseFloat(tintaCost.replace(/\D/g, '')) || 0;
    const finishing = parseFloat(finishingCost.replace(/\D/g, '')) || 0;
    return bahan + tinta + finishing;
  }, [bahanBakuCost, tintaCost, finishingCost]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaProduk || !hargaJual) return;
    
    setSaving(true);
    try {
      let photo_url = oldPhotoUrl;
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

      const hpp = totalHPP;
      const harga = parseFloat(hargaJual.replace(/\D/g, '')) || 0;
      
      const { error: productError } = await supabase
        .from('products')
        .update({
          nama_produk: namaProduk,
          hpp_dasar: hpp,
          harga_jual: harga,
          photo_url: photo_url || null,
          is_available: isAvailable
        })
        .eq('id', productId);
        
      if (productError) throw productError;

      // Delete old recipes and insert new ones
      await supabase.from('recipes').delete().eq('product_id', productId);

      const recipeInserts = [
        { product_id: productId, nama_bahan: 'Bahan Baku', gramatur_dibutuhkan: 1, satuan: 'pcs', harga_per_satuan: parseFloat(bahanBakuCost.replace(/\D/g, '')) || 0 },
        { product_id: productId, nama_bahan: 'Tinta', gramatur_dibutuhkan: 1, satuan: 'pcs', harga_per_satuan: parseFloat(tintaCost.replace(/\D/g, '')) || 0 },
        { product_id: productId, nama_bahan: 'Finishing', gramatur_dibutuhkan: 1, satuan: 'pcs', harga_per_satuan: parseFloat(finishingCost.replace(/\D/g, '')) || 0 },
      ];
      
      const { error: recipeError } = await supabase.from('recipes').insert(recipeInserts);
      if (recipeError) throw recipeError;
      
      toast.success('Produk percetakan berhasil diperbarui!');
      router.push(`/ubos/percetakan/${resolvedParams.slug}/inventory`);
      
    } catch (err) {
      console.error(err);
      toast.error('Gagal memperbarui produk.');
    } finally {
      setSaving(false);
    }
  };

  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-[100dvh] bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-50 relative z-50 animate-in slide-in-from-right-full duration-300">
      <header className="fixed top-0 z-40 h-[80px] bg-primary shadow-md max-w-md md:max-w-none mx-auto md:mx-0 left-0 md:left-64 right-0 px-5 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-lg text-white">Edit Produk Percetakan</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-28 pt-24">
        <form id="productForm" onSubmit={handleSubmit} className="space-y-6">
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Printer size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800">Edit Kalkulator HPP Percetakan</h2>
                <p className="text-xs text-slate-500">Ubah biaya produksi dan harga jual.</p>
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
                        className="absolute top-2 right-2 bg-slate-900/50 hover:bg-rose-500 text-white p-2 rounded-full backdrop-blur-sm transition-colors shadow-sm"
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
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Nama Produk</label>
                    <input type="text" value={namaProduk} onChange={e => setNamaProduk(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" placeholder="Contoh: Spanduk Flexi 280gr" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Harga Jual</label>
                      <CurrencyInput value={hargaJual} onChange={setHargaJual} className="w-full pl-10 pr-3 py-3 bg-primary/5 border border-primary/20 text-primary rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all shadow-sm" placeholder="0" icon="Rp" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Total HPP</label>
                      <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 shadow-sm flex items-center h-[46px]">
                        {formatIDR(totalHPP)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-6 mt-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Harga Bahan (per m² / lbr)</label>
                  <CurrencyInput value={bahanBakuCost} onChange={setBahanBakuCost} className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" placeholder="15000" icon="Rp" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Biaya Tinta (per m²)</label>
                  <CurrencyInput value={tintaCost} onChange={setTintaCost} className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" placeholder="5000" icon="Rp" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Biaya Finishing</label>
                  <CurrencyInput value={finishingCost} onChange={setFinishingCost} className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" placeholder="2000" icon="Rp" />
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="w-full md:w-auto">
              </div>
              </div>
            </div>
          </section>
        </form>
      </div>

      <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-white border-t border-slate-100 z-40 max-w-md md:max-w-none mx-auto md:mx-0 flex justify-end gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">
          Batal
        </button>
        <button type="submit" form="productForm" disabled={saving || !namaProduk || !hargaJual} className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 min-w-[140px]">
          {saving ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Save size={18} /> Simpan</>}
        </button>
      </div>
    </div>
  );
}
