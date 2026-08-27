'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Plus, Trash2, Edit2, RotateCcw, AlertTriangle, ArrowRight, Info, Save, Search, Image as ImageIcon, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  CalculatedIngredient,
  LargestComponent,
  Ingredient, 
  RecipeData, 
  CalculatedRecipeData,
  UnitType
} from '@/lib/solutions/hppEngine';
import * as hppEngine from '@/lib/solutions/hppEngine';

const UNITS: UnitType[] = ['kg', 'gram', 'liter', 'ml', 'pcs', 'bungkus', 'sdm', 'sdt', 'lembar', 'siung', 'ikat', 'botol'];

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
};

export default function HppAiPage() {
  const searchParams = useSearchParams();
  const from = searchParams?.get('from');

  const [productName, setProductName] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  // Single Source of Truth
  const [recipeState, setRecipeState] = useState<RecipeData | null>(null);
  
  // AI Metadata
  const [aiConfidence, setAiConfidence] = useState<'high'|'medium'|'low'>('high');
  const [aiAssumptions, setAiAssumptions] = useState<string[]>([]);
  const [isAiDraft, setIsAiDraft] = useState(true); // Turns false once user makes a meaningful edit

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Computed Values
  const calculatedResult = useMemo(() => {
    if (!recipeState) return null;
    return hppEngine.calculateRecipeCost(recipeState);
  }, [recipeState]);

  const largestComponent = useMemo(() => {
    if (!calculatedResult) return null;
    return hppEngine.findLargestComponent(calculatedResult);
  }, [calculatedResult]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran foto maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImageBase64(base64);
      setImagePreview(base64);
      setProductName(''); // Clear name if using photo
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!productName.trim() && !imageBase64) return;
    setIsAnalyzing(true);
    setError('');
    
    try {
      const payload = imageBase64 ? { imageBase64 } : { productName };
      
      const res = await fetch('/api/hpp/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menganalisis produk');
      }

      const draft = data.draft;
      setAiConfidence(draft.confidence || 'high');
      setAiAssumptions(draft.assumptions || []);
      setIsAiDraft(true);
      
      const initialIngredients: Ingredient[] = draft.ingredients.map((ing: any) => ({
        id: ing.id || Math.random().toString(36).substring(7),
        name: ing.name,
        purchaseQuantity: ing.purchaseQuantity || 1,
        purchaseUnit: ing.purchaseUnit || 'kg',
        purchasePrice: ing.estimatedMarketPrice || 0, 
        estimatedMarketPrice: ing.estimatedMarketPrice,
        usedQuantity: ing.usedQuantity || 100,
        usedUnit: ing.usedUnit || 'gram',
      }));

      setRecipeState({
        productName: draft.productName || productName || 'Produk dari Foto',
        yieldQuantity: draft.yieldQuantity || 1,
        yieldUnit: draft.yieldUnit || 'pcs',
        ingredients: initialIngredients
      });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Inline Handlers (No API calls)
  const handleUpdateYield = (newYield: number) => {
    if (!recipeState) return;
    setIsAiDraft(false);
    setRecipeState({ ...recipeState, yieldQuantity: newYield });
  };

  const handleIngredientChange = (id: string, field: keyof Ingredient, value: any) => {
    if (!recipeState) return;
    setIsAiDraft(false);
    setRecipeState({
      ...recipeState,
      ingredients: recipeState.ingredients.map(ing => 
        ing.id === id ? { ...ing, [field]: value } : ing
      )
    });
  };

  const handleDeleteIngredient = (id: string) => {
    if (!recipeState) return;
    setIsAiDraft(false);
    setRecipeState({
      ...recipeState,
      ingredients: recipeState.ingredients.filter(ing => ing.id !== id)
    });
  };

  const handleAddIngredient = () => {
    if (!recipeState) return;
    setIsAiDraft(false);
    setRecipeState({
      ...recipeState,
      ingredients: [
        ...recipeState.ingredients,
        {
          id: Math.random().toString(36).substring(7),
          name: 'Bahan Baru',
          purchaseQuantity: 1,
          purchaseUnit: 'kg',
          purchasePrice: 0,
          usedQuantity: 100,
          usedUnit: 'gram'
        }
      ]
    });
  };

  const handleResetToAI = (id: string) => {
    if (!recipeState) return;
    setRecipeState({
      ...recipeState,
      ingredients: recipeState.ingredients.map(ing => {
        if (ing.id === id && ing.estimatedMarketPrice !== undefined) {
          return { ...ing, purchasePrice: ing.estimatedMarketPrice };
        }
        return ing;
      })
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-40">
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Calculator className="text-blue-600" />
          <span className="font-black tracking-tight text-lg">LOGARITMA HPP AI</span>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
        
        {!recipeState && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 text-center">
            <h1 className="text-2xl sm:text-4xl font-black mb-3">Apa produk yang ingin Anda hitung?</h1>
            <p className="text-slate-500 mb-8 font-medium">Masukkan nama makanan atau upload foto.</p>

            <div className="relative max-w-xl mx-auto mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Misal: Pempek Kapal Selam"
                value={productName}
                onChange={e => { setProductName(e.target.value); setImagePreview(null); setImageBase64(null); }}
                onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                disabled={!!imageBase64}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            <div className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest">Atau</div>
            
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageUpload}
            />
            
            {!imagePreview ? (
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 mx-auto px-6 py-4 rounded-2xl border-2 border-dashed border-slate-300 text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-400 transition-colors w-full max-w-xl">
                <ImageIcon size={24} /> Upload Foto Produk
              </button>
            ) : (
              <div className="relative w-40 h-40 mx-auto rounded-2xl overflow-hidden shadow-md">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  onClick={() => { setImagePreview(null); setImageBase64(null); }}
                  className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {error && <div className="text-red-500 font-medium mt-6 bg-red-50 py-3 rounded-xl border border-red-100 max-w-xl mx-auto">{error}</div>}

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!productName && !imageBase64)}
              className="mt-8 w-full max-w-xl mx-auto bg-blue-600 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isAnalyzing ? 'MENGANALISIS...' : 'ANALISIS PRODUK'}
            </button>
          </div>
        )}

        {calculatedResult && (
          <div className="space-y-6">
            
            {/* Draft Warning / Validated */}
            {isAiDraft ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                <span className="text-xl">✨</span>
                <div>
                  <h3 className="font-bold text-amber-900">Draft AI ({aiConfidence === 'high' ? 'Keyakinan Tinggi' : aiConfidence === 'medium' ? 'Keyakinan Sedang' : 'Ambiguitas Tinggi'})</h3>
                  <p className="text-sm text-amber-800 mt-1 font-medium leading-relaxed">
                    Periksa dan sesuaikan bahan, takaran, dan harga dengan kondisi aktual Anda sebelum menghitung HPP.
                  </p>
                  {aiAssumptions.length > 0 && (
                    <ul className="mt-2 text-xs text-amber-700 list-disc pl-4 space-y-1">
                      {aiAssumptions.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                <CheckCircle className="text-emerald-500" />
                <div className="font-bold text-emerald-900">Disesuaikan dengan resep Anda</div>
              </div>
            )}

            {/* PRODUCT TITLE & YIELD */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-2xl font-black text-slate-900 mb-4">{calculatedResult.productName}</h2>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="text-sm font-bold text-slate-500 mb-1">Hasil Resep (Yield)</div>
                  <p className="text-xs text-slate-400">Sesuaikan dengan hasil produksi aktual Anda.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleUpdateYield(Math.max(1, recipeState!.yieldQuantity - 1))} className="w-10 h-10 rounded-full bg-white border border-slate-200 font-bold hover:bg-slate-50">-</button>
                  <input 
                    type="number" 
                    value={recipeState?.yieldQuantity} 
                    onChange={(e) => handleUpdateYield(parseFloat(e.target.value) || 0)}
                    className="w-20 text-center bg-white border border-slate-200 rounded-lg py-2 font-black focus:outline-none focus:border-blue-500"
                  />
                  <span className="font-bold text-slate-600">{calculatedResult.yieldUnit}</span>
                  <button onClick={() => handleUpdateYield(recipeState!.yieldQuantity + 1)} className="w-10 h-10 rounded-full bg-white border border-slate-200 font-bold hover:bg-slate-50">+</button>
                </div>
              </div>
            </div>

            {/* INGREDIENTS LIST - INLINE EDITING */}
            <div className="space-y-4 mt-8">
              {calculatedResult.ingredients.map(ing => (
                <div key={ing.id} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm relative group transition-colors focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50">
                  <div className="flex justify-between items-start mb-4">
                    <input 
                      type="text" 
                      value={ing.name} 
                      onChange={e => handleIngredientChange(ing.id, 'name', e.target.value)}
                      className="font-black text-lg text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none w-2/3 truncate"
                    />
                    <button onClick={() => handleDeleteIngredient(ing.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                  </div>

                  {/* Primary Fields (Inline) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Harga Aktual */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-xs font-bold text-slate-500 uppercase mb-2">Harga Beli Aktual</div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-400">Rp</span>
                        <input 
                          type="number" 
                          value={ing.purchasePrice || ''}
                          onChange={e => handleIngredientChange(ing.id, 'purchasePrice', parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 font-bold focus:outline-none focus:border-blue-500"
                        />
                        <span className="text-slate-400">/</span>
                        <select 
                          value={ing.purchaseUnit} 
                          onChange={e => handleIngredientChange(ing.id, 'purchaseUnit', e.target.value)}
                          className="bg-white border border-slate-200 rounded-md px-1 py-1.5 font-bold focus:outline-none text-sm"
                        >
                          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>
                      
                      {/* Secondary: Estimasi AI */}
                      {ing.estimatedMarketPrice !== undefined && (
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="text-slate-400">Estimasi AI: {formatRupiah(ing.estimatedMarketPrice)}</span>
                          {ing.purchasePrice !== ing.estimatedMarketPrice && (
                            <button onClick={() => handleResetToAI(ing.id)} className="text-blue-600 font-medium hover:underline flex items-center gap-1">
                              <RotateCcw size={10} /> Reset
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Digunakan */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-xs font-bold text-slate-500 uppercase mb-2">Takaran Dipakai</div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          value={ing.usedQuantity || ''}
                          onChange={e => handleIngredientChange(ing.id, 'usedQuantity', parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 font-bold focus:outline-none focus:border-blue-500"
                        />
                        <select 
                          value={ing.usedUnit} 
                          onChange={e => handleIngredientChange(ing.id, 'usedUnit', e.target.value)}
                          className="bg-white border border-slate-200 rounded-md px-1 py-1.5 font-bold focus:outline-none text-sm"
                        >
                          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>
                      
                      {/* Subtotal */}
                      {ing.validationStatus === 'valid' ? (
                        <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-500">BIAYA</span>
                          <span className="font-black text-slate-800">{formatRupiah(ing.calculatedCost)}</span>
                        </div>
                      ) : (
                        <div className="mt-3 pt-2 border-t border-slate-200 text-xs font-bold text-red-500 flex items-center gap-1">
                          <AlertTriangle size={12} /> Satuan tidak cocok
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={handleAddIngredient} className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 font-bold hover:bg-slate-50 hover:border-blue-400 hover:text-blue-600 transition-colors">
              <Plus size={20} /> Tambah Bahan Manual
            </button>
            
            {/* STICKY BOTTOM BAR */}
            <div className="fixed bottom-0 left-0 right-0 bg-slate-900 text-white p-4 sm:px-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40 border-t border-slate-800">
              <div className="max-w-3xl mx-auto flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">HPP / {calculatedResult.yieldUnit}</div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400">{formatRupiah(calculatedResult.costPerUnit)}</div>
                  <div className="text-xs text-slate-400 mt-1">Total {formatRupiah(calculatedResult.totalCost)}</div>
                </div>
                
                <Link 
                  href={from === 'mapping' ? '/backward-mapping' : '/'}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-6 rounded-xl flex items-center gap-2 transition-colors active:scale-95"
                >
                  <span className="hidden sm:inline">{from === 'mapping' ? 'LANJUTKAN ACTION PLAN' : 'LIHAT INSIGHT'}</span>
                  <span className="sm:hidden">LANJUTKAN</span>
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
