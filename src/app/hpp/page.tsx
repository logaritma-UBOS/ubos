'use client';
import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  RecipeData, 
  CalculatedRecipeData, 
  calculateRecipeCost, 
  calculateContributors,
  Ingredient,
  ProductionCost,
  CalculatedIngredient
} from '@/lib/solutions/hppEngine';

function normalizeDraftToRecipeState(data: any, productNameInput: string): RecipeData {
  return {
    productName: data.productName || productNameInput || "Produk",
    yieldQuantity: data.yield?.quantity || 1,
    yieldUnit: data.yield?.unit || "pcs",
    isYieldEstimated: !!data.yield?.isEstimated,
    ingredients: (data.ingredients || []).map((i: any, idx: number) => ({
      id: i.id || `ing_${Date.now()}_${idx}`,
      name: i.name,
      category: i.category || 'Bahan Utama',
      purchaseQuantity: i.purchaseQuantity || 1,
      purchaseUnit: i.purchaseUnit || 'kg',
      actualPurchasePrice: i.estimatedMarketPrice || 0,
      estimatedMarketPrice: i.estimatedMarketPrice || 0,
      usedQuantity: i.usedQuantity || 1,
      usedUnit: i.usedUnit || 'gram',
      isUserOverridden: false
    })),
    packaging: (data.packaging || []).map((p: any, idx: number) => ({
      id: p.id || `pack_${Date.now()}_${idx}`,
      name: p.name,
      purchaseQuantity: p.purchaseQuantity || 1,
      purchaseUnit: p.purchaseUnit || 'pcs',
      actualPurchasePrice: p.estimatedMarketPrice || 0,
      estimatedMarketPrice: p.estimatedMarketPrice || 0,
      usedQuantity: p.usedQuantity || 1,
      usedUnit: p.usedUnit || 'pcs',
      isUserOverridden: false
    })),
    productionCosts: (data.productionCosts || []).map((c: any, idx: number) => ({
      id: c.id || `prod_${Date.now()}_${idx}`,
      name: c.name,
      estimatedCostPerBatch: c.estimatedCostPerBatch || c.estimatedCostPerPortion || 0,
      actualCostPerBatch: c.estimatedCostPerBatch || c.estimatedCostPerPortion || 0,
      isUserOverridden: false
    }))
  };
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50"></div>}>
      <HPPContent />
    </Suspense>
  );
}

function HPPContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const prof = searchParams.get('prof');
  const gapParam = searchParams.get('gap');

  const [step, setStep] = useState<number>(1);
  const [productInput, setProductInput] = useState('');
  const [isFromPhoto, setIsFromPhoto] = useState(false);
  
  const [clarifications, setClarifications] = useState({
    nasi: true,
    ayam: true,
    sambal: true,
    lalapan: true,
    minuman: false,
    kerupuk: false
  });

  const [recipeState, setRecipeState] = useState<RecipeData | null>(null);

  const [hargaJual, setHargaJual] = useState<number>(15000);
  const [targetMargin, setTargetMargin] = useState<number>(50);
  const [targetOmzet, setTargetOmzet] = useState<number>(30000000);
  const [simulations, setSimulations] = useState<Record<string, number>>({});

  const [addingToCat, setAddingToCat] = useState<'ingredients' | 'packaging' | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('gram');

  const handleStartClarification = () => {
    if (!productInput) return;
    setIsFromPhoto(false);
    handleAnalyzeProduct();
  };

  const handleAnalyzeProduct = async (imageB64?: string) => {
    setStep(3); 
    try {
      const res = await fetch('/api/hpp/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: productInput, imageBase64: imageB64, clarifications })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error?.code === 'VALIDATION_ERROR') {
          console.error("AI Validation Error:", data.error.message);
          throw new Error(`Draft AI memiliki data atau satuan yang tidak valid: ${data.error.message}. Mohon perjelas deskripsi produk Anda.`);
        }
        throw new Error(data.error?.message || "Gagal memproses AI");
      }
      
      const normalizedState = normalizeDraftToRecipeState(data, productInput);
      setRecipeState(normalizedState);
      
      if (imageB64) {
        setStep(3.5);
      } else {
        setStep(4);
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Draft resep belum berhasil dibuat. Data Anda tetap aman. Silakan coba lagi.");
      if (isFromPhoto) setStep(1); else setStep(2);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsFromPhoto(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      handleAnalyzeProduct(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleItemToggleDelete = (type: 'ingredients' | 'packaging', itemId: string) => {
    if (!recipeState) return;
    const newItems = recipeState[type].filter(item => item.id !== itemId);
    setRecipeState({ ...recipeState, [type]: newItems });
  };

  const handleItemChange = (type: 'ingredients' | 'packaging', itemId: string, field: 'usedQuantity' | 'actualPurchasePrice', value: number) => {
    if (!recipeState) return;
    const newItems = recipeState[type].map(item => {
      if (item.id !== itemId) return item;
      return { ...item, [field]: value, isUserOverridden: field === 'actualPurchasePrice' ? true : item.isUserOverridden };
    });
    setRecipeState({ ...recipeState, [type]: newItems });
    if (simulations[itemId]) {
      const newSims = {...simulations};
      delete newSims[itemId];
      setSimulations(newSims);
    }
  };

  const handleYieldChange = (value: number) => {
    if (!recipeState) return;
    setRecipeState({ ...recipeState, yieldQuantity: value, isYieldEstimated: false });
  };

  const handleProductionCostChange = (itemId: string, value: number) => {
    if (!recipeState) return;
    const newCosts = recipeState.productionCosts.map(cost => {
      if (cost.id !== itemId) return cost;
      return { ...cost, actualCostPerBatch: value, isUserOverridden: true };
    });
    setRecipeState({ ...recipeState, productionCosts: newCosts });
  };

  const handleAddItem = (type: 'ingredients' | 'packaging') => {
    if (!recipeState || !newItemName || !newItemQty) return;
    const newItem: Ingredient = {
      id: `custom_${Date.now()}`,
      name: newItemName,
      category: type === 'packaging' ? undefined : 'Bahan Utama',
      purchaseQuantity: 1,
      purchaseUnit: newItemUnit,
      actualPurchasePrice: 0,
      usedQuantity: Number(newItemQty),
      usedUnit: newItemUnit,
      isUserOverridden: true
    };
    setRecipeState({ ...recipeState, [type]: [...recipeState[type], newItem] });
    setNewItemName('');
    setNewItemQty('');
    setAddingToCat(null);
  };

  const handleSimulate = (itemId: string, newCost: number) => {
    setSimulations(prev => ({ ...prev, [itemId]: newCost }));
  };

  // --- HPP CALCULATIONS DELEGATED TO ENGINE ---
  const calculatedData = useMemo(() => {
    if (!recipeState) return null;
    return calculateRecipeCost(recipeState);
  }, [recipeState]);

  const contributors = useMemo(() => {
    if (!calculatedData) return [];
    return calculateContributors(calculatedData);
  }, [calculatedData]);

  const largestComponent = contributors.length > 0 ? contributors[0] : null;

  const hppMaksimal = hargaJual * (1 - targetMargin / 100);
  const gap = (calculatedData?.costPerUnit || 0) - hppMaksimal;
  const targetPenjualan = targetOmzet / hargaJual;
  const targetHarian = Math.ceil(targetPenjualan / 30);
  // ---------------------------------------------

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black italic text-lg shadow-inner">
              L
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-800">logaritma</span>
          </div>
          <div className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
            HPP AI v2.0
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-8">
        
        {/* STEP 1: Input Product */}
        {step === 1 && (
          <div className="space-y-6 max-w-xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                Ketahui HPP Anda <br/> <span className="text-blue-600">Dalam 5 Detik.</span>
              </h1>
              <p className="text-lg text-gray-600">AI Logaritma akan membongkar resep dan memprediksi biaya produksi untuk Anda.</p>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100">
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Nama Produk F&B Anda</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Contoh: Pempek Kapal Selam"
                  className="w-full text-lg border-2 border-gray-200 rounded-xl p-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-gray-300"
                  value={productInput}
                  onChange={e => setProductInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleStartClarification()}
                />
              </div>

              <div className="flex items-center justify-between my-6">
                <hr className="w-full border-gray-200" />
                <span className="px-4 text-sm font-semibold text-gray-400 bg-white">ATAU</span>
                <hr className="w-full border-gray-200" />
              </div>

              <label className="block w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group">
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📷</div>
                <div className="font-bold text-gray-700">Gunakan Kamera / Foto</div>
                <div className="text-sm text-gray-500 mt-1">Otomatis deteksi komposisi dari foto masakan</div>
              </label>

              {productInput && (
                <button 
                  onClick={handleStartClarification}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-blue-200 transition-all text-lg tracking-wide"
                >
                  MULAI PEMETAAN 🚀
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Clarification */}
        {step === 2 && (
          <div className="mt-12 space-y-6 animate-in fade-in duration-500 max-w-md mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Klarifikasi Produk</h3>
              <p className="text-gray-600 mb-6 text-sm">Apa saja yang biasanya termasuk dalam 1 porsi <strong>{productInput}</strong> Anda?</p>
              
              <div className="space-y-3 mb-8">
                {Object.entries(clarifications).map(([key, val]) => (
                  <label key={key} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={val} 
                      onChange={() => setClarifications({...clarifications, [key]: !val})}
                      className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="font-medium capitalize text-gray-800">{key}</span>
                  </label>
                ))}
              </div>

              <button
                  onClick={() => handleAnalyzeProduct()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-blue-200 transition-all"
                >
                  BUAT DRAFT RESEP
              </button>
            </div>
          </div>
        )}

         {/* STEP 3: Loading AI */}
        {step === 3 && (
          <div className="mt-20 text-center space-y-6 animate-in fade-in duration-500">
             <div className="inline-block p-6 rounded-full bg-blue-50">
                <span className="text-4xl animate-pulse inline-block">🤖</span>
             </div>
             <h3 className="text-2xl font-bold text-gray-900">Logaritma sedang menyusun draft komposisi...</h3>
             <p className="text-gray-500 max-w-sm mx-auto">
               Memetakan bahan baku, pelengkap, dan packaging berdasarkan informasi Anda.
             </p>
             <div className="flex justify-center gap-2 mt-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
             </div>
          </div>
        )}

        {/* STEP 3.5: Photo Verification */}
        {step === 3.5 && recipeState && (
          <div className="mt-12 space-y-6 animate-in fade-in zoom-in-95 duration-500 max-w-md md:max-w-xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-100 text-center">
              <div className="inline-block p-4 rounded-full bg-blue-50 text-3xl mb-4">👀</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Verifikasi Gambar</h3>
              <p className="text-gray-600 mb-6 text-sm">Berdasarkan foto, Logaritma mendeteksi produk ini sebagai:</p>
              
              <input
                type="text"
                className="w-full border-2 border-blue-200 rounded-xl p-4 text-xl font-bold text-center text-blue-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all mb-6"
                value={recipeState.productName}
                onChange={e => setRecipeState({...recipeState, productName: e.target.value})}
              />

              <button
                onClick={() => setStep(4)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-blue-200 transition-all"
              >
                YA, BUAT DRAFT RESEP
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: DRAFT RECIPE REVIEW */}
        {step === 4 && calculatedData && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-yellow-50 border border-yellow-300 p-5 rounded-2xl flex gap-4 items-start shadow-sm">
              <div className="text-2xl mt-1">⚠️</div>
              <div>
                <h4 className="font-bold text-yellow-900 mb-1 text-lg">Draft Komposisi Logaritma</h4>
                <p className="text-sm text-yellow-800 leading-relaxed mb-2">
                  Ini adalah <strong>draft awal</strong>, bukan resep pasti Anda. Silakan hapus bahan yang tidak Anda gunakan dan tambahkan bahan yang kurang.
                </p>
                <div className="text-xs font-semibold text-yellow-700 bg-yellow-200/50 inline-block px-2 py-1 rounded">
                  LEVEL 1 — LOGARITMA ESTIMATE
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 p-5 border-b border-gray-200 flex justify-between items-center">
                 <h2 className="font-bold text-lg text-gray-800">Komposisi 1 Porsi</h2>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 p-5 flex items-center justify-between border-t border-b border-blue-100">
                 <div>
                    <h4 className="font-bold text-blue-900">Yield (Hasil Resep)</h4>
                    {calculatedData.isYieldEstimated && <p className="text-xs text-blue-700 mt-1">AI mengestimasi hasil batch ini.</p>}
                 </div>
                 <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={calculatedData.yieldQuantity}
                      onChange={e => handleYieldChange(Number(e.target.value))}
                      className="w-16 p-2 rounded border border-blue-200 text-center font-bold text-blue-900 outline-none"
                    />
                    <span className="font-semibold text-blue-800">{calculatedData.yieldUnit}</span>
                 </div>
              </div>

              <div className="p-0">
                  <div className="bg-slate-50 px-5 py-3 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-sm text-gray-700 uppercase tracking-wider flex items-center gap-2">
                      🥩 Bahan Baku
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {calculatedData.ingredients.map(item => (
                      <div key={item.id} className={`p-4 transition-colors ${item.validationStatus !== 'valid' ? 'bg-red-50/50' : 'hover:bg-gray-50'}`}>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            {item.validationStatus === 'valid' ? (
                              <span className="text-green-500 font-bold text-lg">✓</span>
                            ) : (
                              <span className="text-red-400 font-bold text-lg">⚠️</span>
                            )}
                            <div>
                              <span className="font-semibold text-gray-900">{item.name}</span>
                              <div className="flex items-center gap-1 mt-1">
                                <input 
                                  type="number" 
                                  value={item.usedQuantity}
                                  onChange={e => handleItemChange('ingredients', item.id, 'usedQuantity', Number(e.target.value))}
                                  className="w-12 border-b border-gray-300 focus:border-blue-500 outline-none text-sm font-medium text-gray-700 bg-transparent text-center"
                                />
                                <span className="text-xs text-gray-500">{item.usedUnit}</span>
                                {item.validationStatus !== 'valid' && <span className="text-xs text-red-500 ml-2">Unit tidak valid</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1 text-sm bg-gray-50 px-2 py-1 rounded border border-gray-200">
                               <span className="text-gray-500 font-medium">Rp</span>
                               <input
                                  type="number"
                                  value={item.actualPurchasePrice}
                                  onChange={e => handleItemChange('ingredients', item.id, 'actualPurchasePrice', Number(e.target.value))}
                                  className="w-20 outline-none bg-transparent font-bold text-gray-900 text-right"
                               />
                               <span className="text-xs text-gray-500">/ {item.purchaseQuantity} {item.purchaseUnit}</span>
                            </div>
                            <button 
                              onClick={() => handleItemToggleDelete('ingredients', item.id)}
                              className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-white border-t border-gray-50">
                    {addingToCat === 'ingredients' ? (
                      <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                        <input type="text" placeholder="Nama" className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-sm outline-none" value={newItemName} onChange={e => setNewItemName(e.target.value)} autoFocus />
                        <input type="number" placeholder="Qty" className="w-16 bg-white border border-gray-200 rounded px-2 py-1 text-sm outline-none" value={newItemQty} onChange={e => setNewItemQty(e.target.value)} />
                        <select className="bg-white border border-gray-200 rounded px-1 py-1 text-sm outline-none" value={newItemUnit} onChange={e => setNewItemUnit(e.target.value)}>
                          <option value="gram">gram</option>
                          <option value="ml">ml</option>
                          <option value="pcs">pcs</option>
                        </select>
                        <button onClick={() => handleAddItem('ingredients')} className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded">Simpan</button>
                        <button onClick={() => setAddingToCat(null)} className="text-gray-400 px-1 text-xl">×</button>
                      </div>
                    ) : (
                      <button onClick={() => setAddingToCat('ingredients')} className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">+ Tambah Bahan</button>
                    )}
                  </div>

                  <div className="bg-slate-50 px-5 py-3 border-b border-gray-100 border-t border-gray-100 mt-4 flex justify-between items-center">
                    <h3 className="font-bold text-sm text-gray-700 uppercase tracking-wider flex items-center gap-2">
                      📦 Packaging
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {calculatedData.packaging.map(item => (
                      <div key={item.id} className={`p-4 transition-colors ${item.validationStatus !== 'valid' ? 'bg-red-50/50' : 'hover:bg-gray-50'}`}>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            {item.validationStatus === 'valid' ? (
                              <span className="text-green-500 font-bold text-lg">✓</span>
                            ) : (
                              <span className="text-red-400 font-bold text-lg">⚠️</span>
                            )}
                            <div>
                              <span className="font-semibold text-gray-900">{item.name}</span>
                              <div className="flex items-center gap-1 mt-1">
                                <input 
                                  type="number" 
                                  value={item.usedQuantity}
                                  onChange={e => handleItemChange('packaging', item.id, 'usedQuantity', Number(e.target.value))}
                                  className="w-12 border-b border-gray-300 focus:border-blue-500 outline-none text-sm font-medium text-gray-700 bg-transparent text-center"
                                />
                                <span className="text-xs text-gray-500">{item.usedUnit}</span>
                                {item.validationStatus !== 'valid' && <span className="text-xs text-red-500 ml-2">Unit tidak valid</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1 text-sm bg-gray-50 px-2 py-1 rounded border border-gray-200">
                               <span className="text-gray-500 font-medium">Rp</span>
                               <input
                                  type="number"
                                  value={item.actualPurchasePrice}
                                  onChange={e => handleItemChange('packaging', item.id, 'actualPurchasePrice', Number(e.target.value))}
                                  className="w-20 outline-none bg-transparent font-bold text-gray-900 text-right"
                               />
                               <span className="text-xs text-gray-500">/ {item.purchaseQuantity} {item.purchaseUnit}</span>
                            </div>
                            <button onClick={() => handleItemToggleDelete('packaging', item.id)} className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">Hapus</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-white border-t border-gray-50">
                    {addingToCat === 'packaging' ? (
                      <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                        <input type="text" placeholder="Nama" className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-sm outline-none" value={newItemName} onChange={e => setNewItemName(e.target.value)} autoFocus />
                        <input type="number" placeholder="Qty" className="w-16 bg-white border border-gray-200 rounded px-2 py-1 text-sm outline-none" value={newItemQty} onChange={e => setNewItemQty(e.target.value)} />
                        <select className="bg-white border border-gray-200 rounded px-1 py-1 text-sm outline-none" value={newItemUnit} onChange={e => setNewItemUnit(e.target.value)}><option value="pcs">pcs</option></select>
                        <button onClick={() => handleAddItem('packaging')} className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded">Simpan</button>
                        <button onClick={() => setAddingToCat(null)} className="text-gray-400 px-1 text-xl">×</button>
                      </div>
                    ) : (
                      <button onClick={() => setAddingToCat('packaging')} className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">+ Tambah Packaging</button>
                    )}
                  </div>

                  <div className="bg-slate-50 px-5 py-3 border-b border-gray-100 border-t border-gray-100 mt-4 flex justify-between items-center">
                    <h3 className="font-bold text-sm text-gray-700 uppercase tracking-wider flex items-center gap-2">
                      🏭 Produksi & Operasional
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {calculatedData.productionCosts.map(cost => (
                      <div key={cost.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                        <div>
                           <span className="font-semibold text-gray-900">{cost.name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm bg-gray-50 px-2 py-1 rounded border border-gray-200">
                           <span className="text-gray-500 font-medium">Rp</span>
                           <input
                              type="number"
                              value={cost.isUserOverridden && cost.actualCostPerBatch !== undefined ? cost.actualCostPerBatch : cost.estimatedCostPerBatch}
                              onChange={e => handleProductionCostChange(cost.id, Number(e.target.value))}
                              className="w-20 outline-none bg-transparent font-bold text-gray-900 text-right"
                           />
                           <span className="text-xs text-gray-500">/ batch</span>
                        </div>
                      </div>
                    ))}
                  </div>

              </div>

              <div className="bg-slate-50 px-5 py-4 border-t border-gray-200 flex justify-between items-center">
                <span className="font-semibold text-gray-700">Total HPP per Porsi</span>
                <span className="font-black text-2xl text-blue-700">Rp{calculatedData.costPerUnit.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Target Bisnis Anda</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Target Harga Jual</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">Rp</span>
                    <input 
                      type="number" 
                      value={hargaJual}
                      onChange={e => setHargaJual(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 font-bold text-gray-900 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Target Margin</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={targetMargin}
                        onChange={e => setTargetMargin(Number(e.target.value))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold text-gray-900 outline-none focus:border-blue-500 text-right pr-10"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Target Omzet/Bulan</label>
                    <div className="relative">
                      <select
                        value={targetOmzet}
                        onChange={e => setTargetOmzet(Number(e.target.value))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold text-gray-900 outline-none focus:border-blue-500"
                      >
                        <option value={10000000}>10 Juta</option>
                        <option value={30000000}>30 Juta</option>
                        <option value={50000000}>50 Juta</option>
                        <option value={100000000}>100 Juta</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Flow steps */}
                {[
                  { label: "TARGET OMZET", val: `Rp${(targetOmzet/1000000).toFixed(1)} Juta/bln` },
                  { label: "HARGA JUAL", val: `Rp${hargaJual.toLocaleString('id-ID')}/porsi` },
                  { label: "TARGET PENJUALAN", val: `${targetPenjualan.toLocaleString('id-ID')} porsi/bln` },
                  { label: "TARGET HARIAN", val: `±${targetHarian} porsi/hari` },
                  { label: `TARGET HPP (Margin ${targetMargin}%)`, val: `Rp${hppMaksimal.toLocaleString('id-ID')}`, isBold: true },
                ].map((item, idx) => (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group py-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-sm font-bold">
                      {idx + 1}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-3 rounded-lg border border-slate-100 shadow-sm flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-500">{item.label}</span>
                      <span className={`text-sm ${item.isBold ? 'font-bold text-slate-800' : 'font-medium text-slate-700'}`}>{item.val}</span>
                    </div>
                  </div>
                ))}
                
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group py-3 mt-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-red-100 text-red-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-xl">
                      🚨
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-red-50 p-4 rounded-xl border border-red-200 shadow-sm">
                      <span className="text-xs font-bold text-red-500 block mb-1">HPP AKTUAL</span>
                      <span className="text-xl font-black text-red-700 block mb-2">Rp{calculatedData.costPerUnit.toLocaleString('id-ID')}</span>
                      
                      {gap > 0 ? (
                        <div className="pt-2 border-t border-red-200">
                          <span className="text-sm font-bold text-red-800">GAP Rp{gap.toLocaleString('id-ID')}/porsi</span>
                          <p className="text-xs text-red-700 mt-1 leading-relaxed">HPP saat ini terlalu tinggi untuk mencapai margin {targetMargin}%. Omzet {(targetOmzet/1000000).toFixed(0)}Jt bisa tercapai, tapi labanya akan jauh di bawah target.</p>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-green-200 bg-green-50 rounded p-2 mt-2">
                           <span className="text-sm font-bold text-green-800">✅ HPP AMAN</span>
                        </div>
                      )}
                    </div>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-200 mt-8 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                   
                   <div className="mb-8">
                      <h3 className="font-black text-gray-900 text-2xl mb-1 tracking-tight">Logaritma Insight</h3>
                      <p className="text-sm text-gray-500">Pahami anatomi biaya Anda untuk mengambil keputusan.</p>
                   </div>

                   {/* LAYER 1 - ANGKA */}
                   <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl mb-4 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-500 tracking-wider block mb-1">LAYER 1 — ANGKA</span>
                        <span className="text-slate-800 font-medium">HPP Anda saat ini:</span>
                      </div>
                      <div className="text-right">
                         <span className="text-2xl font-black text-blue-700 block">Rp{calculatedData.costPerUnit.toLocaleString('id-ID')} <span className="text-sm font-normal text-slate-500">/ pcs</span></span>
                      </div>
                   </div>

                   {largestComponent ? (
                     <>
                       {/* LAYER 2 - PENYEBAB */}
                       <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-2xl mb-4">
                          <span className="text-xs font-bold text-yellow-700 tracking-wider block mb-2">LAYER 2 — PENYEBAB</span>
                          <div className="flex gap-4 items-start">
                             <div className="text-2xl mt-1">💡</div>
                             <div>
                                <p className="text-yellow-900 font-medium text-lg leading-tight">
                                  <span className="font-black text-yellow-700">{largestComponent.percentage.toFixed(0)}%</span> HPP berasal dari <span className="font-black">{largestComponent.ingredientName}</span>.
                                </p>
                             </div>
                          </div>
                       </div>

                       {/* LAYER 3 - KEPUTUSAN */}
                       <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-200 mt-6 text-center">
                          <span className="text-xs font-bold text-blue-200 tracking-wider block mb-2">LAYER 3 — KEPUTUSAN</span>
                          <h4 className="font-bold text-xl mb-6">Mulai dari sini: audit harga & pemakaian {largestComponent.ingredientName.toLowerCase()}.</h4>
                          
                          <a 
                            href="/backward-mapping"
                            className="inline-block w-full bg-white hover:bg-gray-50 text-blue-700 font-black py-4 px-4 rounded-xl shadow transition-all tracking-wide"
                          >
                            {from === 'mapping' ? 'LANJUTKAN ACTION PLAN →' : 'BUAT ACTION PLAN BISNIS →'}
                          </a>
                       </div>
                     </>
                   ) : (
                     <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl mt-4 text-center">
                        <p className="text-gray-500 font-medium">Belum cukup data untuk menentukan komponen yang paling berpengaruh.</p>
                     </div>
                   )}
                </div>

              </div>
            </div>

            <div className="pt-8 border-t border-gray-200 text-center">
               <p className="text-sm text-gray-600 mb-4 leading-relaxed max-w-md mx-auto">
                 Ingin tahu bagaimana HPP dan margin ini memengaruhi <strong>laba bersih</strong> dan <strong>arus kas</strong> bisnis Anda secara keseluruhan selama sebulan penuh?
               </p>
               <a 
                 href="https://ubos.logaritma.id" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="block w-full bg-black hover:bg-gray-800 text-white font-bold py-4 px-4 rounded-xl shadow-lg transition-all text-lg tracking-wide text-center"
               >
                 LANJUT KE UBOS
               </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
