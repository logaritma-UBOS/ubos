'use client';

import { useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ArrowLeft, UploadCloud, Plus, Trash2, ImagePlus, Save } from 'lucide-react';
import { toast } from 'sonner';
import CurrencyInput from '@/components/CurrencyInput';

export default function NewProductPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  
  // Product state
  const [namaProduk, setNamaProduk] = useState('');
  const [kategori, setKategori] = useState('Makanan');
  const [hargaJual, setHargaJual] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);

  // Recipe state
  const [hppMode, setHppMode] = useState<'cepat' | 'detail'>('cepat');
  const [totalBiayaBelanja, setTotalBiayaBelanja] = useState('');
  const [estimasiPorsi, setEstimasiPorsi] = useState('');
  const [biayaKemasan, setBiayaKemasan] = useState('');

  const [recipes, setRecipes] = useState<any[]>([
    { nama_bahan: '', gramatur_dibutuhkan: '', satuan: 'gram', harga_per_satuan: '' }
  ]);

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
      const qty = parseFloat(r.gramatur_dibutuhkan.replace(/\D/g, '')) || 0;
      const price = parseFloat(r.harga_per_satuan.replace(/\D/g, '')) || 0;
      return sum + (qty * price);
    }, 0);
  }, [hppMode, totalBiayaBelanja, estimasiPorsi, biayaKemasan, recipes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaProduk || !hargaJual) {
      toast.error('Nama produk dan harga jual wajib diisi!');
      return;
    }
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');
      
      const { data: merchantData } = await supabase.from('merchants').select('id').eq('user_id', user.id).single();
      if (!merchantData) throw new Error('Merchant not found');

      // 1. Upload image to Cloudinary (Aman jika gagal/tidak dikonfigurasi)
      let photo_url = '';
      if (imageFile) {
        try {
          const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
          const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
          
          if (cloudName && uploadPreset) {
            const formData = new FormData();
            formData.append('file', imageFile);
            formData.append('upload_preset', uploadPreset);
            
            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
              method: 'POST',
              body: formData,
            });
            const data = await res.json();
            if (data.secure_url) {
              photo_url = data.secure_url;
            }
          }
        } catch (imgErr) {
          console.warn('Gagal upload gambar, melanjutkan simpan tanpa foto:', imgErr);
        }
      }

      // 2. Insert Product ke Supabase (Kategori wajib dikirim)
      const hpp = totalHPP;
      const harga = parseFloat(hargaJual.replace(/\D/g, '')) || 0;
      
      const productPayload = {
        merchant_id: merchantData.id,
        nama_produk: namaProduk,
        kategori: kategori,
        hpp_dasar: hpp,
        harga_jual: harga,
        photo_url: photo_url || null,
        is_available: isAvailable
      };

      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert([productPayload])
        .select()
        .single();

      if (productError) throw productError;

      // 3. Insert Recipes
      let recipeInserts: any[] = [];
      if (hppMode === 'cepat') {
        recipeInserts = [{
          product_id: productData.id,
          nama_bahan: 'Bahan & Kemasan (Estimasi)',
          gramatur_dibutuhkan: 1,
          satuan: 'porsi',
          harga_per_satuan: totalHPP
        }];
      } else {
        const validRecipes = recipes.filter(r => r.nama_bahan && r.gramatur_dibutuhkan && r.harga_per_satuan);
        if (validRecipes.length > 0) {
          recipeInserts = validRecipes.map(r => ({
            product_id: productData.id,
            nama_bahan: r.nama_bahan,
            gramatur_dibutuhkan: parseFloat(r.gramatur_dibutuhkan.replace(/\D/g, '')),
            satuan: r.satuan,
            harga_per_satuan: parseFloat(r.harga_per_satuan.replace(/\D/g, ''))
          }));
        }
      }
      
      if (recipeInserts.length > 0 && productData) {
        await supabase.from('recipes').insert(recipeInserts);
      }
      
      toast.success('Produk berhasil ditambahkan!');
      router.push(`/ubos/${params.category}/${params.slug}/inventory`);
      
    } catch (err: any) {
      console.error('Error simpan produk:', err);
      toast.error(`Gagal menyimpan produk: ${err.message || ''}`);
    } finally {
      setLoading(false);
    }
  };

  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  return (
    <>
      <header className="mb-6 flex items-center justify-between px-5 pt-5 md:pt-8 max-w-7xl mx-auto">
        <div>
          <button onClick={() => router.back()} className="flex items-center text-slate-500 hover:text-primary transition-colors text-sm font-bold mb-2">
            <ArrowLeft size={16} className="mr-1" />
            Kembali
          </button>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Tambah Produk Baru
          </h1>
          <p className="text-sm text-slate-500 mt-1">Isi detail produk dan formula kalkulasi HPP otomatis</p>
        </div>
      </header>

      <div className="p-5 max-w-7xl mx-auto space-y-6 pb-32 relative z-30 animate-in fade-in duration-500">
        <form id="productForm" onSubmit={handleSubmit}>
          
          <div className="space-y-4">
            
            {/* Info Dasar */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">1</span>
                Info Dasar
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Foto */}
                <div className="md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Foto Produk</label>
                  <div className="relative h-full min-h-[160px]">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className={`w-full h-full min-h-[160px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-colors ${imagePreview ? 'border-primary/50 bg-primary/5' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
                      {imagePreview ? (
                        <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-slate-300">
                            <ImagePlus size={24} />
                          </div>
                          <span className="text-[13px] font-bold text-slate-600 mb-1 leading-tight">Unggah Foto</span>
                          <span className="text-[10px] text-slate-400">PNG, JPG (Maks 5MB)</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Nama, Kategori & Harga */}
                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Nama Produk</label>
                      <input type="text" required value={namaProduk} onChange={e => setNamaProduk(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" placeholder="Misal: Es Kopi Susu Aren" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Kategori</label>
                      <select value={kategori} onChange={e => setKategori(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm">
                        <option value="Makanan">Makanan</option>
                        <option value="Minuman">Minuman</option>
                        <option value="Snack">Snack</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Harga Jual (Standard)</label>
                      <CurrencyInput value={hargaJual} onChange={setHargaJual} className="w-full pl-10 pr-3 py-3 bg-primary/5 border border-primary/20 text-primary rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all shadow-sm" placeholder="18000" icon="Rp" />
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
            </div>

            {/* Resep */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
              <div className="flex justify-between items-start">
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">2</span>
                  Resep / HPP
                </h2>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ketersediaan</p>
                    <p className="text-[10px] text-slate-400">{isAvailable ? 'Aktif' : 'Habis'}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsAvailable(!isAvailable)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${isAvailable ? 'bg-primary' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${isAvailable ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              <div className="flex p-1 bg-slate-100 rounded-xl max-w-[400px] mb-4">
                <button type="button" onClick={() => setHppMode('cepat')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${hppMode === 'cepat' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Mode Cepat</button>
                <button type="button" onClick={() => setHppMode('detail')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${hppMode === 'detail' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Mode Detail</button>
              </div>

              {hppMode === 'cepat' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-300">
                  <div className="md:col-span-3 bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                    <p className="text-sm text-emerald-800 leading-relaxed">
                      <strong>Estimasi Belanja:</strong> Masukkan total uang belanja bahan, bagi dengan perkiraan porsi yang didapat, lalu tambah harga kemasan.
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Total Belanja Bahan</label>
                    <CurrencyInput value={totalBiayaBelanja} onChange={setTotalBiayaBelanja} className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="0" icon="Rp" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Estimasi Porsi</label>
                    <CurrencyInput value={estimasiPorsi} onChange={setEstimasiPorsi} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="0" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Kemasan/Porsi</label>
                    <CurrencyInput value={biayaKemasan} onChange={setBiayaKemasan} className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="0" icon="Rp" />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recipes.map((recipe, index) => (
                      <div key={index} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 relative group animate-in fade-in zoom-in-95 duration-200">
                        {recipes.length > 1 && (
                          <button type="button" onClick={() => handleRemoveRecipe(index)} className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-danger hover:border-danger flex items-center justify-center shadow-sm transition-all z-10">
                            <Trash2 size={14} />
                          </button>
                        )}
                        
                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Nama Bahan</label>
                            <input type="text" placeholder="misal: Kopi Espresso" value={recipe.nama_bahan} onChange={e => handleRecipeChange(index, 'nama_bahan', e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Kebutuhan</label>
                              <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:border-primary transition-colors">
                                <CurrencyInput placeholder="Qty" value={recipe.gramatur_dibutuhkan} onChange={(val) => handleRecipeChange(index, 'gramatur_dibutuhkan', val)} className="w-full px-3 py-3 text-sm focus:outline-none bg-transparent" />
                                <select value={recipe.satuan} onChange={e => handleRecipeChange(index, 'satuan', e.target.value)} className="bg-slate-50 border-l border-slate-200 text-xs font-bold px-2 focus:outline-none text-slate-600">
                                  <option value="gram">gr</option>
                                  <option value="ml">ml</option>
                                  <option value="pcs">pcs</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Harga/Satuan</label>
                              <CurrencyInput placeholder="Modal" value={recipe.harga_per_satuan} onChange={(val) => handleRecipeChange(index, 'harga_per_satuan', val)} icon="Rp" className="w-full pl-10 pr-3 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors" />
                            </div>
                          </div>
                          
                          {(recipe.nama_bahan || recipe.gramatur_dibutuhkan || recipe.harga_per_satuan) ? (
                            <div className="bg-slate-100 p-3 rounded-xl text-xs flex justify-between items-center text-slate-600 border border-slate-200/60 mt-2">
                              <span className="truncate pr-2">{recipe.nama_bahan || 'Bahan'} ({(recipe.gramatur_dibutuhkan || 0)} {recipe.satuan} &times; Rp {recipe.harga_per_satuan || 0})</span>
                              <span className="font-bold text-slate-800 whitespace-nowrap">Rp {new Intl.NumberFormat('id-ID').format((Number(recipe.gramatur_dibutuhkan) || 0) * (Number(recipe.harga_per_satuan) || 0))}</span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button type="button" onClick={handleAddRecipe} className="w-full py-4 border-2 border-dashed border-primary/30 text-primary rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors active:scale-95">
                    <Plus size={18} strokeWidth={3} /> Tambah Bahan Baku
                  </button>
                </div>
              )}
            </div>

          </div>
        </form>
      </div>

      <div className="fixed bottom-0 z-50 left-0 md:left-64 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] flex justify-center md:justify-end">
        <button 
          type="submit" form="productForm" disabled={loading}
          className="w-full md:w-auto md:min-w-[200px] bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-6 rounded-2xl transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm shadow-primary/20"
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <Save size={18} />
              <span>Simpan Produk</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}