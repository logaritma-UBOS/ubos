'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Plus, Trash2, Edit2, RotateCcw, AlertTriangle, ArrowRight, TrendingDown, Info, Save, X, Search, Image as ImageIcon } from 'lucide-react';
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
  const contextProf = searchParams?.get('prof');
  const contextGap = searchParams?.get('gap');

  const [productName, setProductName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  // Source of truth
  const [recipeState, setRecipeState] = useState<RecipeData | null>(null);
  const [aiConfidence, setAiConfidence] = useState<'high'|'medium'|'low'>('high');

  // Computed
  const calculatedResult = useMemo(() => {
    if (!recipeState) return null;
    return hppEngine.calculateRecipeCost(recipeState);
  }, [recipeState]);

  const largestComponent = useMemo(() => {
    if (!calculatedResult) return null;
    return hppEngine.findLargestComponent(calculatedResult);
  }, [calculatedResult]);

  // Edit State
  const [editingIngredientId, setEditingIngredientId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Ingredient | null>(null);

  const handleAnalyze = async () => {
    if (!productName.trim()) return;
    setIsAnalyzing(true);
    setError('');
    
    try {
      const res = await fetch('/api/hpp/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName })
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menganalisis produk');
      }

      // Initialize state from draft
      const draft = data.draft;
      setAiConfidence(draft.confidence || 'high');
      
      const initialIngredients: Ingredient[] = draft.ingredients.map((ing: any) => ({
        id: ing.id || Math.random().toString(36).substring(7),
        name: ing.name,
        purchaseQuantity: ing.purchaseQuantity,
        purchaseUnit: ing.purchaseUnit,
        purchasePrice: ing.estimatedMarketPrice, // Default actual price to AI estimate
        estimatedMarketPrice: ing.estimatedMarketPrice,
        usedQuantity: ing.usedQuantity,
        usedUnit: ing.usedUnit,
      }));

      setRecipeState({
        productName: draft.productName || productName,
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

  const handleUpdateYield = (newYield: number) => {
    if (!recipeState) return;
    setRecipeState({ ...recipeState, yieldQuantity: newYield });
  };

  const handleSaveIngredient = () => {
    if (!recipeState || !editForm) return;
    
    let updatedIngredients;
    if (editingIngredientId === 'new') {
      updatedIngredients = [...recipeState.ingredients, { ...editForm, id: Math.random().toString(36).substring(7) }];
    } else {
      updatedIngredients = recipeState.ingredients.map(ing => 
        ing.id === editingIngredientId ? editForm : ing
      );
    }
    
    setRecipeState({ ...recipeState, ingredients: updatedIngredients });
    setEditingIngredientId(null);
    setEditForm(null);
  };

  const handleDeleteIngredient = (id: string) => {
    if (!recipeState) return;
    setRecipeState({
      ...recipeState,
      ingredients: recipeState.ingredients.filter(ing => ing.id !== id)
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

  const startEdit = (ing: Ingredient) => {
    setEditingIngredientId(ing.id);
    setEditForm({ ...ing });
  };

  const startAdd = () => {
    setEditingIngredientId('new');
    setEditForm({
      id: 'new',
      name: '',
      purchaseQuantity: 1,
      purchaseUnit: 'kg',
      purchasePrice: 0,
      usedQuantity: 100,
      usedUnit: 'gram'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Calculator className="text-blue-600" />
          <span className="font-black tracking-tight text-lg">LOGARITMA HPP AI</span>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
        
        {/* Context Banner */}
        {from === 'mapping' && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-8 flex gap-3 items-start">
            <Info className="text-blue-600 shrink-0 mt-0.5" size={20} />
            <div>
              <div className="text-sm font-bold text-blue-900">Melanjutkan Action Plan</div>
              <div className="text-sm text-blue-800 mt-1">
                Anda datang dari Logaritma Mapping. Hitung HPP aktual untuk memvalidasi rencana perbaikan bisnis Anda.
              </div>
            </div>
          </div>
        )}

        {/* INPUT SECTION */}
        {!recipeState && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 text-center">
            <h1 className="text-2xl sm:text-4xl font-black mb-3">Apa produk yang ingin Anda hitung?</h1>
            <p className="text-slate-500 mb-8 font-medium">Masukkan nama makanan atau minuman.</p>

            <div className="relative max-w-xl mx-auto mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Misal: Pempek Kapal Selam"
                value={productName}
                onChange={e => setProductName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* <div className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest">Atau</div>
            <button className="flex items-center gap-2 mx-auto px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors">
              <ImageIcon size={20} /> Upload Foto
            </button> */}

            {error && <div className="text-red-500 font-medium mt-4 bg-red-50 py-3 rounded-xl border border-red-100">{error}</div>}

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !productName}
              className="mt-8 w-full max-w-md mx-auto bg-blue-600 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isAnalyzing ? 'MEMPROSES AI...' : 'ANALISIS PRODUK'}
            </button>
          </div>
        )}

        {/* RESULTS SECTION */}
        {calculatedResult && (
          <div className="space-y-6">
            
            {/* Draft Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3 shadow-sm">
              <span className="text-xl">✨</span>
              <div>
                <h3 className="font-bold text-amber-900">Draft Resep AI</h3>
                <p className="text-sm text-amber-800 mt-1 font-medium leading-relaxed">
                  Kami membuat perkiraan komponen berdasarkan produk yang Anda masukkan. 
                  <strong> Periksa dan sesuaikan bahan, takaran, dan harga dengan kondisi usaha Anda.</strong>
                </p>
              </div>
            </div>

            {/* SUMMARY PANEL */}
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl"></div>
              
              <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Biaya Resep</div>
                  <div className="text-xl sm:text-2xl font-black text-white">{formatRupiah(calculatedResult.totalCost)}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Untuk Menghasilkan</div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={recipeState?.yieldQuantity} 
                      onChange={(e) => handleUpdateYield(parseFloat(e.target.value) || 0)}
                      className="w-16 bg-slate-800 border border-slate-700 text-white font-black rounded-lg px-2 py-1 text-center focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-lg font-medium text-slate-300">{calculatedResult.yieldUnit}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-700/50">
                <div className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-2">HPP PER {calculatedResult.yieldUnit.toUpperCase()}</div>
                <div className="text-4xl sm:text-5xl font-black text-emerald-400">
                  {formatRupiah(calculatedResult.costPerUnit)}
                </div>
              </div>
            </div>

            {/* INGREDIENTS LIST */}
            <div className="flex items-center justify-between mt-8 mb-4">
              <h2 className="text-xl font-black text-slate-900">Komponen Bahan</h2>
              <button onClick={startAdd} className="flex items-center gap-1 text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">
                <Plus size={16} /> Tambah
              </button>
            </div>

            <div className="space-y-3">
              {calculatedResult.ingredients.map(ing => {
                const isEditing = editingIngredientId === ing.id;
                
                if (isEditing && editForm) {
                  return (
                    <div key={ing.id} className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-blue-500 shadow-lg">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nama Bahan</label>
                          <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold focus:outline-none focus:border-blue-500" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Beli (Qty & Unit)</label>
                            <div className="flex gap-2">
                              <input type="number" value={editForm.purchaseQuantity} onChange={e => setEditForm({...editForm, purchaseQuantity: parseFloat(e.target.value)||0})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold focus:outline-none focus:border-blue-500" />
                              <select value={editForm.purchaseUnit} onChange={e => setEditForm({...editForm, purchaseUnit: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 font-bold focus:outline-none">
                                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Harga Aktual</label>
                            <input type="number" value={editForm.purchasePrice} onChange={e => setEditForm({...editForm, purchasePrice: parseFloat(e.target.value)||0})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold focus:outline-none focus:border-blue-500" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Digunakan (Qty & Unit)</label>
                          <div className="flex gap-2">
                            <input type="number" value={editForm.usedQuantity} onChange={e => setEditForm({...editForm, usedQuantity: parseFloat(e.target.value)||0})} className="w-1/2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold focus:outline-none focus:border-blue-500" />
                            <select value={editForm.usedUnit} onChange={e => setEditForm({...editForm, usedUnit: e.target.value})} className="w-1/2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 font-bold focus:outline-none">
                              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                          <button onClick={() => setEditingIngredientId(null)} className="px-4 py-2 text-sm font-bold text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200">Batal</button>
                          <button onClick={handleSaveIngredient} className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-1">
                            <Save size={16} /> Simpan
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Display Card
                return (
                  <div key={ing.id} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-black text-lg text-slate-800 pr-16">{ing.name}</h3>
                      <div className="absolute top-4 right-4 flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(ing)} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteIngredient(ing.id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"><Trash2 size={16} /></button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-4">
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase">Harga Beli</div>
                        <div className="font-medium text-slate-700">{formatRupiah(ing.purchasePrice)} <span className="text-slate-400 text-sm">/ {ing.purchaseQuantity}{ing.purchaseUnit}</span></div>
                        {ing.estimatedMarketPrice !== undefined && ing.estimatedMarketPrice !== ing.purchasePrice && (
                          <div className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                            Estimasi AI: {formatRupiah(ing.estimatedMarketPrice)}
                            <button onClick={() => handleResetToAI(ing.id)} className="text-blue-600 ml-1 hover:underline flex items-center" title="Kembalikan estimasi AI"><RotateCcw size={10} className="mr-0.5"/> Reset</button>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase">Digunakan</div>
                        <div className="font-medium text-slate-700">{ing.usedQuantity} {ing.usedUnit}</div>
                      </div>
                    </div>

                    {ing.validationStatus !== 'valid' ? (
                      <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-100 flex items-start gap-2">
                        <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                        <div className="text-sm font-medium">
                          <strong>Perlu diperiksa:</strong> Harga beli dan satuan penggunaan tidak cocok atau data tidak lengkap.
                          <button onClick={() => startEdit(ing)} className="ml-2 text-red-800 underline font-bold">Perbaiki</button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-500 uppercase">Biaya Bahan</span>
                        <span className="font-black text-slate-800 text-lg">{formatRupiah(ing.calculatedCost)}</span>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* New Ingredient Form Inline */}
              {editingIngredientId === 'new' && editForm && (
                <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-emerald-500 shadow-lg">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nama Bahan Baru</label>
                      <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold focus:outline-none focus:border-blue-500" placeholder="Misal: Kaldu Bubuk" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Beli (Qty & Unit)</label>
                        <div className="flex gap-2">
                          <input type="number" value={editForm.purchaseQuantity} onChange={e => setEditForm({...editForm, purchaseQuantity: parseFloat(e.target.value)||0})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold focus:outline-none focus:border-blue-500" />
                          <select value={editForm.purchaseUnit} onChange={e => setEditForm({...editForm, purchaseUnit: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 font-bold focus:outline-none">
                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Harga Aktual</label>
                        <input type="number" value={editForm.purchasePrice} onChange={e => setEditForm({...editForm, purchasePrice: parseFloat(e.target.value)||0})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold focus:outline-none focus:border-blue-500" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Digunakan (Qty & Unit)</label>
                      <div className="flex gap-2">
                        <input type="number" value={editForm.usedQuantity} onChange={e => setEditForm({...editForm, usedQuantity: parseFloat(e.target.value)||0})} className="w-1/2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold focus:outline-none focus:border-blue-500" />
                        <select value={editForm.usedUnit} onChange={e => setEditForm({...editForm, usedUnit: e.target.value})} className="w-1/2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 font-bold focus:outline-none">
                          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <button onClick={() => setEditingIngredientId(null)} className="px-4 py-2 text-sm font-bold text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200">Batal</button>
                      <button onClick={handleSaveIngredient} className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 flex items-center gap-1">
                        <Plus size={16} /> Tambah
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* INSIGHT PANEL */}
            {largestComponent && (
              <div className="mt-12 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="flex items-center gap-2 font-black text-lg text-slate-900 mb-4">
                  <Search className="text-blue-600" /> Temuan Logaritma
                </h3>
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <div className="text-lg font-medium text-slate-700 leading-relaxed">
                    <strong className="font-black text-slate-900 bg-yellow-200 px-1">{largestComponent.ingredientName}</strong> menyumbang <strong className="font-black text-red-600">{largestComponent.percentage}%</strong> biaya produk ini.
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Apa artinya?</div>
                    <div className="text-slate-600 font-medium">
                      Perubahan kecil pada harga atau penggunaan <strong>{largestComponent.ingredientName.toLowerCase()}</strong> akan memberi pengaruh paling drastis terhadap HPP Anda. Fokuskan negosiasi supplier atau efisiensi bahan pada komponen ini.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="mt-12">
              <Link 
                href={from === 'mapping' ? '/backward-mapping' : '/'} 
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-slate-800 transition-colors shadow-xl"
              >
                {from === 'mapping' ? 'LANJUTKAN KE ACTION PLAN' : 'LIHAT INSIGHT PRODUK'} <ArrowRight />
              </Link>
            </div>
            
          </div>
        )}
      </main>
    </div>
  );
}
