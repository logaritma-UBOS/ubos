const fs = require('fs');

const file = 'src/app/ubos/[category]/[slug]/inventory/new/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const returnStartIndex = code.indexOf('return (');
const codeBeforeReturn = code.substring(0, returnStartIndex);

const newRenderCode = `return (
    <>
      <header className="mb-6 flex items-center justify-between">
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
                    <div className={\`w-full h-full min-h-[160px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-colors \${imagePreview ? 'border-primary/50 bg-primary/5' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}\`}>
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

                {/* Nama & Harga */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Nama Produk</label>
                    <input type="text" required value={namaProduk} onChange={e => setNamaProduk(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" placeholder="Misal: Es Kopi Susu Aren" />
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
                    className={\`relative inline-flex h-8 w-14 items-center rounded-full transition-colors \${isAvailable ? 'bg-primary' : 'bg-slate-300'}\`}
                  >
                    <span className={\`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform \${isAvailable ? 'translate-x-7' : 'translate-x-1'}\`} />
                  </button>
                </div>
              </div>

              <div className="flex p-1 bg-slate-100 rounded-xl max-w-[400px] mb-4">
                <button type="button" onClick={() => setHppMode('cepat')} className={\`flex-1 py-2 text-xs font-bold rounded-lg transition-all \${hppMode === 'cepat' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}\`}>Mode Cepat</button>
                <button type="button" onClick={() => setHppMode('detail')} className={\`flex-1 py-2 text-xs font-bold rounded-lg transition-all \${hppMode === 'detail' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}\`}>Mode Detail</button>
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

      <div className="fixed bottom-0 z-50 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] max-w-7xl mx-auto flex justify-end">
        <button 
          type="submit" form="productForm" disabled={loading}
          className="w-full md:w-auto md:min-w-[200px] bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-6 rounded-2xl transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm shadow-primary/20"
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Simpan Produk</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
`;

fs.writeFileSync(file, codeBeforeReturn + newRenderCode);
console.log('Patched kuliner UI');
