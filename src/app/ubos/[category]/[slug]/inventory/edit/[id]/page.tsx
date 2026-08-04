'use client';

import { useEffect, useState, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ArrowLeft, Save, UploadCloud, Plus, Trash2, HelpCircle, ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import CurrencyInput from '@/components/CurrencyInput';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  
  // Product state
  const [namaProduk, setNamaProduk] = useState('');
  const [hargaJual, setHargaJual] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [oldPhotoUrl, setOldPhotoUrl] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);

  // Recipe state
  const [hppMode, setHppMode] = useState<'cepat' | 'detail'>('detail');
  const [totalBiayaBelanja, setTotalBiayaBelanja] = useState('');
  const [estimasiPorsi, setEstimasiPorsi] = useState('');
  const [biayaKemasan, setBiayaKemasan] = useState('');
  const [recipes, setRecipes] = useState<any[]>([]);

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
          if (recipeData.length === 1 && recipeData[0].nama_bahan === 'Bahan & Kemasan (Estimasi)') {
            setHppMode('cepat');
            setTotalBiayaBelanja(new Intl.NumberFormat('id-ID').format(recipeData[0].harga_per_satuan));
            setEstimasiPorsi('1');
            setBiayaKemasan('0');
            setRecipes([{ nama_bahan: '', gramatur_dibutuhkan: '', satuan: 'gram', harga_per_satuan: '' }]);
          } else {
            setHppMode('detail');
            setRecipes(recipeData.map((r: any) => ({
              ...r,
              gramatur_dibutuhkan: r.gramatur_dibutuhkan?.toString() || '',
              harga_per_satuan: r.harga_per_satuan?.toString() || ''
            })));
          }
        } else {
          setHppMode('detail');
          setRecipes([{ nama_bahan: '', gramatur_dibutuhkan: '', satuan: 'gram', harga_per_satuan: '' }]);
        }
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat produk.');
        router.push(`/ubos/${params.category}/${params.slug}/inventory`);
      } finally {
        setLoading(false);
      }
    };
    
    if (productId) fetchProduct();
  }, [productId, router]);

  const handleAddRecipe = () => {
    setRecipes([...recipes, { nama_bahan: '', gramatur_dibutuhkan: '', satuan: 'gram', harga_per_satuan: '' }]);
  };

  const handleRemoveRecipe = (index: number) => {
    setRecipes(recipes.filter((_, i) => i !== index));
  };

  const handleRecipeChange = (index: number, field: string, value: string) => {
    const newRecipes = [...recipes];
    newRecipes[index][field] = value;
    setRecipes(newRecipes);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const totalHPP = useMemo(() => {
    if (hppMode === 'cepat') {
      const belanja = parseFloat(totalBiayaBelanja.replace(/\D/g, '')) || 0;
      const porsi = parseFloat(estimasiPorsi.replace(/\D/g, '')) || 1;
      const kemasan = parseFloat(biayaKemasan.replace(/\D/g, '')) || 0;
      return (belanja / (porsi || 1)) + kemasan;
    }
    
    return recipes.reduce((sum, r) => {
      const qty = parseFloat(String(r.gramatur_dibutuhkan || '').replace(/\D/g, '')) || 0;
      const price = parseFloat(String(r.harga_per_satuan || '').replace(/\D/g, '')) || 0;
      return sum + (qty * price);
    }, 0);
  }, [hppMode, totalBiayaBelanja, estimasiPorsi, biayaKemasan, recipes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaProduk || !hargaJual) return;
    
    setSaving(true);
    try {
      // 1. Upload image to Cloudinary if a new file is selected
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

      // 2. Update Product
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

      // 3. Delete old recipes and insert new ones
      await supabase.from('recipes').delete().eq('product_id', productId);

      let recipeInserts: any[] = [];
      if (hppMode === 'cepat') {
        recipeInserts = [{
          product_id: productId,
          nama_bahan: 'Bahan & Kemasan (Estimasi)',
          gramatur_dibutuhkan: 1,
          satuan: 'porsi',
          harga_per_satuan: totalHPP
        }];
      } else {
        const validRecipes = recipes.filter(r => r.nama_bahan && r.gramatur_dibutuhkan && r.harga_per_satuan);
        if (validRecipes.length > 0) {
          recipeInserts = validRecipes.map(r => ({
            product_id: productId,
            nama_bahan: r.nama_bahan,
            gramatur_dibutuhkan: parseFloat(String(r.gramatur_dibutuhkan || '').replace(/\D/g, '')),
            satuan: r.satuan,
            harga_per_satuan: parseFloat(String(r.harga_per_satuan || '').replace(/\D/g, ''))
          }));
        }
      }
      
      if (recipeInserts.length > 0) {
        const { error: recipeError } = await supabase.from('recipes').insert(recipeInserts);
        if (recipeError) throw recipeError;
      }
      
      
      toast.success('Produk berhasil diperbarui!');
      router.push(`/ubos/${params.category}/${params.slug}/inventory`);
      
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
      {/* Header */}
      <header className="fixed top-0 z-40 h-[80px] bg-primary shadow-md max-w-md md:max-w-none mx-auto md:mx-0 left-0 md:left-64 right-0 px-5 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-lg text-white">Edit Produk & Resep</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-28 pt-24">
        <form id="productForm" onSubmit={handleSubmit} className="space-y-6">
          
          {/* Info Produk */}
          <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">1</span>
              Info Dasar
            </h2>
            
            {/* Foto Upload */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Foto Produk</label>
              <div className="relative">
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className={`w-full h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-colors ${imagePreview ? 'border-primary/50 bg-primary/5' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="text-slate-400 mb-2">
                        <ImagePlus size={32} strokeWidth={1.5} />
                      </div>
                      <span className="text-sm font-bold text-slate-600">Ketuk untuk unggah foto produk</span>
                      <span className="text-xs text-slate-400 mt-1">PNG, JPG maks 5MB</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Nama Produk</label>
              <input type="text" required value={namaProduk} onChange={e => setNamaProduk(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Misal: Es Kopi Susu Aren" />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Harga Jual (Standard)</label>
              <CurrencyInput value={hargaJual} onChange={setHargaJual} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="18000" icon="Rp" />
            </div>
          </section>

          {/* Resep */}
          <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">2</span>
                Resep / HPP
              </h2>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total HPP</p>
                <p className="text-lg font-black text-primary">{formatIDR(totalHPP)}</p>
                {/* Availability Toggle */}
                <div className="mt-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Ketersediaan Menu</label>
                  <button 
                    type="button"
                    onClick={() => setIsAvailable(!isAvailable)}
                    className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${isAvailable ? 'bg-primary' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isAvailable ? 'translate-x-9' : 'translate-x-1'}`} />
                  </button>
                  <p className="text-xs text-slate-500 mt-2">
                    {isAvailable ? 'Menu aktif dan dapat dipesan di POS.' : 'Menu habis, tidak dapat dipesan di POS.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex p-1 bg-slate-100 rounded-xl">
              <button type="button" onClick={() => setHppMode('cepat')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${hppMode === 'cepat' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Mode Cepat</button>
              <button type="button" onClick={() => setHppMode('detail')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${hppMode === 'detail' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Mode Detail</button>
            </div>

            {hppMode === 'cepat' ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    <strong>Estimasi Belanja:</strong> Masukkan total uang belanja bahan, bagi dengan perkiraan porsi yang didapat, lalu tambah harga kemasan.
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Total Belanja Bahan</label>
                  <CurrencyInput value={totalBiayaBelanja} onChange={setTotalBiayaBelanja} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="0" icon="Rp" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                      Estimasi Porsi / Resep <span className="text-danger">*</span>
                    </label>
                    <CurrencyInput value={estimasiPorsi} onChange={setEstimasiPorsi} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="0" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Kemasan/Porsi</label>
                    <CurrencyInput value={biayaKemasan} onChange={setBiayaKemasan} className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="0" icon="Rp" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-300">
              {recipes.map((recipe, index) => (
                <div key={index} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 relative group animate-in fade-in zoom-in-95 duration-200">
                  {recipes.length > 1 && (
                    <button type="button" onClick={() => handleRemoveRecipe(index)} className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-danger hover:border-danger flex items-center justify-center shadow-sm transition-all z-10">
                      <Trash2 size={14} />
                    </button>
                  )}
                  
                    <div className="space-y-3">
                      <div>
                        <input type="text" placeholder="Nama Bahan (misal: Kopi Espresso)" value={recipe.nama_bahan} onChange={e => handleRecipeChange(index, 'nama_bahan', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:border-primary transition-colors">
                          <CurrencyInput placeholder="Qty" value={recipe.gramatur_dibutuhkan} onChange={(val) => handleRecipeChange(index, 'gramatur_dibutuhkan', val)} className="w-full px-3 py-2.5 text-sm focus:outline-none bg-transparent" />
                          <select value={recipe.satuan} onChange={e => handleRecipeChange(index, 'satuan', e.target.value)} className="bg-slate-50 border-l border-slate-200 text-xs font-bold px-2 focus:outline-none text-slate-600">
                            <option value="gram">gr</option>
                            <option value="ml">ml</option>
                            <option value="pcs">pcs</option>
                          </select>
                        </div>
                        <div className="relative">
                          <CurrencyInput placeholder="Modal/Satuan" value={recipe.harga_per_satuan} onChange={(val) => handleRecipeChange(index, 'harga_per_satuan', val)} icon="Rp" className="w-full pl-8 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors" />
                        </div>
                      </div>
                      
                      {/* Helper Text & Subtotal */}
                      {index === 0 && (
                        <p className="text-[10px] text-slate-500 leading-tight">
                          <span className="font-bold text-slate-700">Contoh:</span> Jika beli beras 1kg (1.000gr) Rp 15.000, isi Qty: 1000, Satuan: gr, Modal/Satuan: 15.
                        </p>
                      )}
                      {(recipe.nama_bahan || recipe.gramatur_dibutuhkan || recipe.harga_per_satuan) ? (
                        <div className="bg-slate-100 p-2 rounded-lg text-xs flex justify-between items-center text-slate-600 border border-slate-200/60 mt-1">
                          <span className="truncate pr-2">{recipe.nama_bahan || 'Bahan'} ({(recipe.gramatur_dibutuhkan || 0)} {recipe.satuan} &times; Rp {recipe.harga_per_satuan || 0})</span>
                          <span className="font-bold text-slate-800 whitespace-nowrap">Rp {new Intl.NumberFormat('id-ID').format((Number(recipe.gramatur_dibutuhkan) || 0) * (Number(recipe.harga_per_satuan) || 0))}</span>
                        </div>
                      ) : null}
                    </div>
                </div>
              ))}
              
              <button type="button" onClick={handleAddRecipe} className="w-full py-3.5 border-2 border-dashed border-primary/30 text-primary rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors active:scale-95">
                <Plus size={16} strokeWidth={3} /> Tambah Bahan Baku
              </button>
            </div>
            )}
          </section>

        </form>
      </div>

      {/* Footer Action */}
      <div className="fixed bottom-0 z-50 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] max-w-md mx-auto">
        <button type="submit" form="productForm" disabled={saving} className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm shadow-primary/20">
          {saving ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <><Save size={18} /> Simpan Perubahan</>
          )}
        </button>
      </div>
    </div>
  );
}
