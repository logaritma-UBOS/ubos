const fs = require('fs');
const file = 'src/app/(dashboard)/kasir/KasirClient.tsx';
let code = fs.readFileSync(file, 'utf8');

const modalCode = `
      {/* Draft Input Modal */}
      {showDraftModal && (
        <div className="fixed inset-0 z-[100] flex justify-center items-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDraftModal(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Simpan Pesanan</h3>
            <p className="text-gray-500 text-sm mb-4">Pesanan ini akan digantung dan tidak akan memotong stok sampai dibayar.</p>
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Meja / Pelanggan</label>
              <input 
                type="text" 
                value={draftNameInput}
                onChange={e => setDraftNameInput(e.target.value)}
                placeholder="Contoh: Meja 4 / Budi"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDraftModal(false)} className="flex-1 py-3 text-gray-600 font-bold bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Batal</button>
              <button onClick={handleSaveDraft} disabled={isSavingDraft || !draftNameInput.trim()} className="flex-1 py-3 text-white font-bold bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50">
                {isSavingDraft ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Draft List Modal */}
      {showDraftListModal && (
        <div className="fixed inset-0 z-[100] flex justify-center items-end sm:items-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDraftListModal(false)}></div>
          <div className="bg-white w-full sm:max-w-md max-h-[85vh] sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col relative z-10 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Pesanan Gantung</h2>
              <button onClick={() => setShowDraftListModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {isLoadingDrafts ? (
                <div className="text-center py-10 text-gray-500">Memuat data...</div>
              ) : draftsList.length === 0 ? (
                <div className="text-center py-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Kosong</h3>
                  <p className="text-sm text-gray-500">Tidak ada pesanan gantung.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {draftsList.map((draft, i) => (
                    <div key={i} onClick={() => resumeDraft(draft)} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:border-emerald-500 active:scale-95 transition-all flex items-center justify-between group">
                      <div>
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                          {draft.draftName}
                          <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Draft</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{new Date(draft.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • {draft.saleItems.length} item</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-600">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(draft.totalAmount)}</div>
                        <div className="text-[10px] font-semibold text-gray-400 mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          LANJUTKAN <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" /></svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
`;

if (!code.includes('Draft Input Modal')) {
    const lastIndex = code.lastIndexOf('</div>');
    code = code.substring(0, lastIndex) + modalCode + '\n' + code.substring(lastIndex);
    fs.writeFileSync(file, code);
    console.log('Modals injected successfully!');
} else {
    console.log('Modals already exist.');
}
