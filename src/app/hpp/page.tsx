'use client';
import { useState, useMemo } from 'react';

type RecipeItem = {
  id: string;
  name: string;
  qty: number;
  unit: string;
  refPrice: number;
  buyUnit: string;
  convRatio: number;
  myPrice: number;
  deleted?: boolean;
  isCustom?: boolean;
};

type RecipeCategory = {
  id: string;
  name: string;
  items: RecipeItem[];
};

type ProductionCost = {
  id: string;
  name: string;
  costPerPortion: number;
  myCost: number;
};

type AIResponse = {
  productName: string;
  categories: RecipeCategory[];
  productionCosts: ProductionCost[];
};

export default function Home() {
  const [step, setStep] = useState<number>(1);
  const [productInput, setProductInput] = useState('');
  const [isFromPhoto, setIsFromPhoto] = useState(false);
  
  // Clarification Step State
  const [clarifications, setClarifications] = useState({
    nasi: true,
    ayam: true,
    sambal: true,
    lalapan: true,
    minuman: false,
    kerupuk: false
  });

  const [recipeData, setRecipeData] = useState<AIResponse | null>(null);

  // Business Targets
  const [hargaJual, setHargaJual] = useState<number>(15000);
  const [targetMargin, setTargetMargin] = useState<number>(50);
  const [targetOmzet, setTargetOmzet] = useState<number>(30000000);
  const [simulations, setSimulations] = useState<Record<string, number>>({});

  // Add Item Form State
  const [addingToCat, setAddingToCat] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('gr');

  const handleStartClarification = () => {
    if (!productInput) return;
    setIsFromPhoto(false);
    handleAnalyzeProduct();
  };

  const handleAnalyzeProduct = async (imageB64?: string) => {
    setStep(3); // Loading State
    try {
      const res = await fetch('/api/ai-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: productInput, image: imageB64 })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses AI");
      }
      setRecipeData(data);
      
      // Jika dari foto, beri layar konfirmasi nama produk hasil tebakan AI
      if (imageB64) {
        setStep(3.5);
      } else {
        setStep(4);
      }
    } catch (e) {
      console.error(e);
      setStep(1);
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

  // Modify Ingredient
  const handleItemToggleDelete = (catId: string, itemId: string) => {
    if (!recipeData) return;
    const newCategories = recipeData.categories.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        items: cat.items.map(item => item.id === itemId ? { ...item, deleted: !item.deleted } : item)
      };
    });
    setRecipeData({ ...recipeData, categories: newCategories });
  };

  const handleItemChange = (catId: string, itemId: string, field: 'qty' | 'myPrice', value: number) => {
    if (!recipeData) return;
    const newCategories = recipeData.categories.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        items: cat.items.map(item => item.id === itemId ? { ...item, [field]: value } : item)
      };
    });
    setRecipeData({ ...recipeData, categories: newCategories });
    if (simulations[itemId]) {
      const newSims = {...simulations};
      delete newSims[itemId];
      setSimulations(newSims);
    }
  };

  const handleAddItem = (catId: string) => {
    if (!recipeData || !newItemName || !newItemQty) return;
    const newCategories = recipeData.categories.map(cat => {
      if (cat.id !== catId) return cat;
      const newItem: RecipeItem = {
        id: `custom_${Date.now()}`,
        name: newItemName,
        qty: Number(newItemQty),
        unit: newItemUnit,
        refPrice: 0,
        buyUnit: newItemUnit,
        convRatio: 1,
        myPrice: 0,
        isCustom: true
      };
      return { ...cat, items: [...cat.items, newItem] };
    });
    setRecipeData({ ...recipeData, categories: newCategories });
    setAddingToCat(null);
    setNewItemName('');
    setNewItemQty('');
  };

  const handleProdCostChange = (costId: string, value: number) => {
    if (!recipeData) return;
    const newCosts = recipeData.productionCosts.map(cost => {
      if (cost.id !== costId) return cost;
      return { ...cost, myCost: value };
    });
    setRecipeData({ ...recipeData, productionCosts: newCosts });
  };

  const handleSimulate = (id: string, newCost: number) => {
    setSimulations(prev => ({...prev, [id]: newCost}));
  };

  // Calculations
  const calcItemCost = (item: RecipeItem, simulatedCost?: number) => {
    if (item.deleted) return 0;
    if (simulatedCost !== undefined) return simulatedCost;
    return (item.qty / item.convRatio) * item.myPrice;
  };

  const totals = useMemo(() => {
    if (!recipeData) return { bahan: 0, packaging: 0, produksi: 0, total: 0 };
    
    let bahan = 0;
    let packaging = 0;
    
    recipeData.categories.forEach(cat => {
      cat.items.forEach(item => {
        if (item.deleted) return;
        const cost = calcItemCost(item, simulations[item.id]);
        if (cat.name.toLowerCase().includes('packaging')) {
          packaging += cost;
        } else {
          bahan += cost;
        }
      });
    });

    const produksi = recipeData.productionCosts.reduce((acc, curr) => acc + curr.myCost, 0);

    return {
      bahan,
      packaging,
      produksi,
      total: bahan + packaging + produksi
    };
  }, [recipeData, simulations]);

  const targetPenjualan = targetOmzet / hargaJual;
  const targetHarian = Math.ceil(targetPenjualan / 30);
  const hppMaksimal = hargaJual * (1 - targetMargin / 100);
  const gap = totals.total - hppMaksimal;

  const contributors = useMemo(() => {
    if (!recipeData) return [];
    let all: {id: string, name: string, cost: number, pct: number}[] = [];
    
    recipeData.categories.forEach(cat => {
      cat.items.forEach(item => {
         if (item.deleted) return;
         const cost = calcItemCost(item);
         if (cost > 0) all.push({ id: item.id, name: item.name, cost, pct: 0 });
      });
    });
    
    recipeData.productionCosts.forEach(cost => {
       if (cost.myCost > 0) all.push({ id: cost.id, name: cost.name, cost: cost.myCost, pct: 0 });
    });

    all = all.sort((a,b) => b.cost - a.cost);
    all.forEach(item => {
      item.pct = (item.cost / totals.total) * 100;
    });

    return all;
  }, [recipeData, totals.total]);

  return (
    <main className="min-h-screen bg-gray-100 flex justify-center font-sans text-gray-800">
      <div className="w-full md:max-w-3xl lg:max-w-4xl bg-gray-50 min-h-screen relative flex flex-col md:shadow-2xl overflow-x-hidden pb-24">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-20 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-blue-700">LOGARITMA HPP</h1>
          <p className="text-xs text-gray-500 mt-1">Logaritma memperkirakan. Anda menentukan.</p>
        </div>
        {step > 1 && (
           <button onClick={() => {setStep(1); setProductInput(''); setRecipeData(null);}} className="text-sm text-blue-600 font-medium">Reset</button>
        )}
      </header>
      
      <div className="flex-1 p-4 md:p-6 space-y-6">
        
        {/* STEP 1: Input */}
        {step === 1 && (
          <div className="mt-12 space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Hitung HPP. Temukan Biaya yang Membebani Bisnis.</h2>
              <p className="text-gray-600 md:text-lg max-w-xl mx-auto leading-relaxed">
                Cukup masukkan nama produk. Logaritma akan menyusun <strong>draft komposisi</strong> untuk Anda konfirmasi, lalu menemukan bagian yang paling memengaruhi laba Anda.
              </p>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md md:max-w-xl mx-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Nama Produk Anda</label>
                  <input
                    type="text"
                    placeholder="Contoh: Nasi Kuning Ayam"
                    className="w-full border-2 border-gray-200 rounded-xl p-4 text-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                    value={productInput}
                    onChange={e => setProductInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleStartClarification()}
                  />
                </div>
                <div className="text-center text-sm text-gray-400 font-bold">ATAU</div>
                <div>
                   <input 
                     type="file" 
                     id="foto-produk" 
                     className="hidden" 
                     accept="image/*" 
                     onChange={handleImageUpload} 
                   />
                   <label htmlFor="foto-produk" className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-gray-500 bg-gray-50 flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors cursor-pointer">
                     <span className="text-xl">📷</span> 
                     <span className="font-medium">Upload Foto Produk</span>
                   </label>
                </div>
                <button
                  onClick={handleStartClarification}
                  disabled={!productInput}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl mt-4 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  LANJUTKAN
                </button>
              </div>
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
                  onClick={handleAnalyzeProduct}
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
                <span className="text-4xl animate-pulse inline-block">🧠</span>
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
        {step === 3.5 && recipeData && (
          <div className="mt-12 space-y-6 animate-in fade-in zoom-in-95 duration-500 max-w-md md:max-w-xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-100 text-center">
              <div className="inline-block p-4 rounded-full bg-blue-50 text-3xl mb-4">📸</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Verifikasi Gambar</h3>
              <p className="text-gray-600 mb-6 text-sm">Berdasarkan foto, Logaritma mendeteksi produk ini sebagai:</p>
              
              <input
                type="text"
                className="w-full border-2 border-blue-200 rounded-xl p-4 text-xl font-bold text-center text-blue-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all mb-6"
                value={recipeData.productName}
                onChange={e => setRecipeData({...recipeData, productName: e.target.value})}
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
        {step === 4 && recipeData && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-yellow-50 border border-yellow-300 p-5 rounded-2xl flex gap-4 items-start shadow-sm">
              <div className="text-2xl mt-1">🟡</div>
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
              
              <div className="p-0">
                {recipeData.categories.map((cat, catIdx) => (
                  <div key={cat.id} className={`${catIdx !== 0 ? 'border-t border-gray-100' : ''}`}>
                    <div className="bg-slate-50 px-5 py-3 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-bold text-sm text-gray-700 uppercase tracking-wider flex items-center gap-2">
                        {cat.name.includes('Packaging') ? '📦' : '🍚'} {cat.name}
                      </h3>
                    </div>
                    
                    <div className="divide-y divide-gray-50">
                      {cat.items.map(item => (
                        <div key={item.id} className={`p-4 transition-colors ${item.deleted ? 'bg-red-50/50' : 'hover:bg-gray-50'}`}>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              {!item.deleted ? (
                                <span className="text-green-500 font-bold text-lg">✓</span>
                              ) : (
                                <span className="text-red-400 font-bold text-lg">✗</span>
                              )}
                              <div>
                                <span className={`font-semibold text-gray-900 ${item.deleted ? 'line-through text-gray-400' : ''}`}>
                                  {item.name} {item.isCustom && <span className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded ml-1">Baru</span>}
                                </span>
                                {!item.deleted && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <input 
                                      type="number" 
                                      value={item.qty}
                                      onChange={e => handleItemChange(cat.id, item.id, 'qty', Number(e.target.value))}
                                      className="w-12 border-b border-gray-300 focus:border-blue-500 outline-none text-sm font-medium text-gray-700 bg-transparent text-center"
                                    />
                                    <span className="text-xs text-gray-500">{item.unit}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              {!item.deleted ? (
                                <button 
                                  onClick={() => handleItemToggleDelete(cat.id, item.id)}
                                  className="text-xs font-semibold text-red-500 bg-red-50 px-3 py-1.5 rounded hover:bg-red-100 transition-colors flex items-center gap-1"
                                >
                                  🗑 Hapus
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleItemToggleDelete(cat.id, item.id)}
                                  className="text-xs font-semibold text-gray-600 bg-white border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors flex items-center gap-1 shadow-sm"
                                >
                                  + Kembalikan
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Custom Ingredient */}
                    <div className="p-4 bg-white border-t border-gray-50">
                      {addingToCat === cat.id ? (
                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                          <input 
                            type="text" 
                            placeholder="Nama Bahan" 
                            className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-sm outline-none"
                            value={newItemName}
                            onChange={e => setNewItemName(e.target.value)}
                            autoFocus
                          />
                          <input 
                            type="number" 
                            placeholder="Qty" 
                            className="w-16 bg-white border border-gray-200 rounded px-2 py-1 text-sm outline-none"
                            value={newItemQty}
                            onChange={e => setNewItemQty(e.target.value)}
                          />
                          <select 
                            className="bg-white border border-gray-200 rounded px-1 py-1 text-sm outline-none"
                            value={newItemUnit}
                            onChange={e => setNewItemUnit(e.target.value)}
                          >
                            <option value="gr">gr</option>
                            <option value="ml">ml</option>
                            <option value="pcs">pcs</option>
                          </select>
                          <button onClick={() => handleAddItem(cat.id)} className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded">Simpan</button>
                          <button onClick={() => setAddingToCat(null)} className="text-gray-400 px-1 text-xl">×</button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setAddingToCat(cat.id)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          + Tambahkan Bahan
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setStep(5)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-green-200 transition-all text-lg flex items-center justify-center gap-2"
            >
              <span className="text-2xl">✓</span> INI RESEP SAYA
            </button>
            <p className="text-xs text-center text-gray-500 mt-2">Komposisi ini akan digunakan sebagai dasar perhitungan HPP Anda.</p>
          </div>
        )}

        {/* STEP 5: PRICING & HPP */}
        {step === 5 && recipeData && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex gap-3 items-center shadow-sm">
              <div className="text-xl">🟢</div>
              <div>
                <h4 className="font-bold text-green-900 text-sm">Resep Dikonfirmasi</h4>
                <div className="text-xs font-semibold text-green-700 mt-1">LEVEL 2 — USER CONFIRMED</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-blue-50 p-5 border-b border-blue-100">
                 <h2 className="font-bold text-lg text-blue-900">Masukkan Harga Aktual Anda</h2>
                 <p className="text-sm text-blue-800 mt-1">Logaritma memberikan harga referensi, silakan ubah dengan harga beli Anda sebenarnya.</p>
                 <div className="text-xs font-semibold text-blue-700 bg-blue-100 inline-block px-2 py-1 rounded mt-3">
                  LEVEL 3 — ACTUAL COST
                 </div>
              </div>

              <div className="divide-y divide-gray-100 p-4 space-y-4">
                {recipeData.categories.map(cat => (
                  cat.items.filter(i => !i.deleted).map(item => (
                    <div key={item.id} className="pt-4 first:pt-0">
                       <div className="flex justify-between text-sm mb-2">
                         <span className="font-bold text-gray-800">{item.name}</span>
                         <span className="text-gray-500">Kebutuhan: <strong>{item.qty} {item.unit}</strong></span>
                       </div>
                       <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex justify-between items-center">
                         <div>
                           <div className="text-xs text-gray-500 mb-1">Harga Beli Saya</div>
                           <div className="flex items-center gap-1">
                              <span className="text-gray-500">Rp</span>
                              <input 
                                type="number" 
                                value={item.myPrice}
                                onChange={e => handleItemChange(cat.id, item.id, 'myPrice', Number(e.target.value))}
                                className={`w-24 border-b-2 outline-none font-bold text-lg text-right bg-transparent ${item.myPrice !== item.refPrice && !item.isCustom ? 'border-blue-500 text-blue-700' : 'border-gray-300 text-gray-900'}`}
                              />
                              <span className="text-sm font-medium text-gray-500">/ {item.buyUnit}</span>
                           </div>
                         </div>
                         {!item.isCustom && (
                           <div className="text-right">
                             <div className="text-xs text-gray-400 mb-1">Ref. Logaritma</div>
                             <div className="text-sm text-gray-500">Rp{item.refPrice.toLocaleString('id-ID')}</div>
                           </div>
                         )}
                       </div>
                    </div>
                  ))
                ))}

                {/* Production Costs Section */}
                <div className="pt-6 border-t-2 border-dashed border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-3">🔥 Biaya Produksi Lainnya (Per Porsi)</h3>
                    <div className="space-y-3">
                       {recipeData.productionCosts.map(cost => (
                         <div key={cost.id} className="flex justify-between items-center bg-orange-50/50 border border-orange-100 p-3 rounded-lg">
                           <span className="font-medium text-gray-700">{cost.name}</span>
                           <div className="flex items-center gap-2">
                             <span className="text-gray-500 text-sm">Rp</span>
                             <input 
                                type="number" 
                                value={cost.myCost}
                                onChange={e => handleProdCostChange(cost.id, Number(e.target.value))}
                                className="w-20 border-b-2 border-orange-200 focus:border-orange-500 outline-none font-bold text-orange-700 text-right bg-transparent"
                             />
                           </div>
                         </div>
                       ))}
                    </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setStep(6)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-4 rounded-xl shadow-lg transition-all text-lg flex items-center justify-center gap-2"
            >
              HITUNG HPP FINAL
            </button>
          </div>
        )}

        {/* STEP 6: HPP SUMMARY & BACKWARD MAPPING */}
        {step === 6 && recipeData && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Same HPP and Backward mapping UI as previous step 4 & 5 */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
               <h2 className="text-sm text-slate-400 font-semibold mb-1 uppercase tracking-wider">HPP Aktual Produk</h2>
               <h3 className="text-3xl font-extrabold mb-6">{recipeData.productName}</h3>
               
               <div className="flex items-end gap-2 mb-8 border-b border-slate-700 pb-6">
                 <span className="text-5xl font-black text-blue-400">Rp{totals.total.toLocaleString('id-ID')}</span>
                 <span className="text-slate-400 mb-2">/ porsi</span>
               </div>

               <h4 className="text-sm font-semibold text-slate-300 mb-4">KOMPOSISI HPP</h4>
               <div className="space-y-3">
                 <div className="flex justify-between text-sm">
                   <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-400"></div> Bahan Baku</span>
                   <span className="font-mono">Rp{totals.bahan.toLocaleString('id-ID')} <span className="text-slate-500">({((totals.bahan/totals.total)*100).toFixed(0)}%)</span></span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-400"></div> Biaya Produksi</span>
                   <span className="font-mono">Rp{totals.produksi.toLocaleString('id-ID')} <span className="text-slate-500">({((totals.produksi/totals.total)*100).toFixed(0)}%)</span></span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-400"></div> Packaging</span>
                   <span className="font-mono">Rp{totals.packaging.toLocaleString('id-ID')} <span className="text-slate-500">({((totals.packaging/totals.total)*100).toFixed(0)}%)</span></span>
                 </div>
               </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Target Bisnis & Backward Mapping</h3>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Harga Jual</label>
                  <input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 font-bold text-gray-800 outline-none focus:border-blue-500" value={hargaJual} onChange={e => setHargaJual(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Margin (%)</label>
                  <input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 font-bold text-gray-800 outline-none focus:border-blue-500" value={targetMargin} onChange={e => setTargetMargin(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Omzet (Jt)</label>
                  <input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 font-bold text-gray-800 outline-none focus:border-blue-500" value={targetOmzet/1000000} onChange={e => setTargetOmzet(Number(e.target.value) * 1000000)} />
                </div>
              </div>

              <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent mt-8">
                
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
                      ⚠️
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-red-50 p-4 rounded-xl border border-red-200 shadow-sm">
                      <span className="text-xs font-bold text-red-500 block mb-1">HPP AKTUAL</span>
                      <span className="text-xl font-black text-red-700 block mb-2">Rp{totals.total.toLocaleString('id-ID')}</span>
                      
                      {gap > 0 ? (
                        <div className="pt-2 border-t border-red-200">
                          <span className="text-sm font-bold text-red-800">GAP Rp{gap.toLocaleString('id-ID')}/porsi</span>
                          <p className="text-xs text-red-700 mt-1 leading-relaxed">HPP saat ini terlalu tinggi untuk mencapai margin {targetMargin}%. Omzet 30Jt bisa tercapai, tapi labanya akan jauh di bawah target.</p>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-green-200 bg-green-50 rounded p-2 mt-2">
                           <span className="text-sm font-bold text-green-800">✅ HPP AMAN</span>
                        </div>
                      )}
                    </div>
                </div>

              </div>
            </div>

            {gap > 0 && contributors.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                 <div className="border-b border-gray-100 pb-4">
                    <h3 className="font-bold text-gray-900 text-xl flex items-center gap-2">
                      🔎 Tersangka Utama HPP
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Komponen mana yang paling membebani HPP Anda?</p>
                 </div>

                 <div className="space-y-4">
                    {contributors.slice(0, 5).map((c, i) => (
                      <div key={c.id} className="relative">
                         <div className="flex justify-between items-end mb-1">
                           <span className="font-semibold text-gray-800">{i+1}. {c.name}</span>
                           <div className="text-right">
                             <span className="font-bold text-gray-900 block leading-none">Rp{c.cost.toLocaleString('id-ID')}</span>
                             <span className="text-xs font-bold text-red-500">{c.pct.toFixed(1)}%</span>
                           </div>
                         </div>
                         <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                           <div className="h-full bg-red-400 rounded-full" style={{width: `${c.pct}%`}}></div>
                         </div>
                      </div>
                    ))}
                 </div>

                 <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl mt-6">
                    <h4 className="font-bold text-blue-900 mb-2">🚨 Prioritas Penghematan: {contributors[0].name}</h4>
                    
                    <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm mt-3">
                      <div className="text-sm font-semibold text-gray-700 mb-3">Simulasi Keputusan (What If)</div>
                      
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-sm text-gray-600">Turunkan biaya <strong>{contributors[0].name}</strong> ke:</span>
                        <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded px-2 py-1">
                          <span className="text-gray-500 text-sm">Rp</span>
                          <input 
                             type="number"
                             className="w-20 outline-none bg-transparent font-bold text-blue-700 text-right"
                             placeholder={contributors[0].cost.toString()}
                             onChange={e => handleSimulate(contributors[0].id, Number(e.target.value))}
                          />
                        </div>
                      </div>

                      {simulations[contributors[0].id] !== undefined && (
                        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">HPP Baru</div>
                            <div className="font-bold text-green-600 text-lg">Rp{totals.total.toLocaleString('id-ID')}</div>
                            <div className="text-xs text-gray-400 line-through">Rp{(totals.total + contributors[0].cost - simulations[contributors[0].id]).toLocaleString('id-ID')}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Margin Baru</div>
                            <div className="font-bold text-blue-600 text-lg">{(((hargaJual - totals.total) / hargaJual) * 100).toFixed(1)}%</div>
                          </div>
                        </div>
                      )}
                    </div>
                 </div>
              </div>
            )}

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
      </div>
    </main>
  );
}
