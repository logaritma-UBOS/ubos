const fs = require('fs');
const file = 'src/app/(dashboard)/kasir/KasirClient.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add new states for draft phone and draft success
const draftStateAnchor = 'const [isSavingDraft, setIsSavingDraft] = useState(false)';
if (code.includes(draftStateAnchor) && !code.includes('draftPhoneInput')) {
    code = code.replace(
        draftStateAnchor,
        `${draftStateAnchor}
  const [draftPhoneInput, setDraftPhoneInput] = useState("")
  const [isDraftSaved, setIsDraftSaved] = useState(false)
  const [savedDraftData, setSavedDraftData] = useState<any>(null)`
    );
}

// 2. Modify `handleSaveDraft`
const handleSaveDraftOld = `const res = await saveDraftSale(
      cart.map(c => ({ ...c, quantity: c.quantity })),
      clientTransactionId,
      draftName
    );

    setIsSavingDraft(false);
    if (res.error) {
      alert(res.error);
    } else {
      setShowDraftModal(false);
      setCart([]);
      setActiveDraftId(null);
      setStep("CART");
      alert("Pesanan berhasil digantung/disimpan!");
    }`;

const handleSaveDraftNew = `const res = await saveDraftSale(
      cart.map(c => ({ ...c, quantity: c.quantity })),
      clientTransactionId,
      draftName,
      draftPhoneInput || null
    );

    setIsSavingDraft(false);
    if (res.error) {
      alert(res.error);
    } else {
      // Show success screen in modal
      setSavedDraftData({
        draftName,
        draftPhone: draftPhoneInput,
        clientTransactionId,
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.sellPrice * item.quantity), 0)
      });
      setIsDraftSaved(true);
      
      // Reset cart behind the modal
      setCart([]);
      setActiveDraftId(null);
      setStep("CART");
    }`;

if (code.includes('alert("Pesanan berhasil digantung/disimpan!");')) {
    code = code.replace(handleSaveDraftOld, handleSaveDraftNew);
}

// 3. Inject new logic when opening the modal (reset states)
const openModalOld = `setDraftNameInput(selectedCustomerId ? localCustomers.find((c: any) => c.id === selectedCustomerId)?.name || "" : "");
              setShowDraftModal(true);`;
const openModalNew = `setDraftNameInput(selectedCustomerId ? localCustomers.find((c: any) => c.id === selectedCustomerId)?.name || "" : "");
              setDraftPhoneInput(selectedCustomerId ? localCustomers.find((c: any) => c.id === selectedCustomerId)?.phone || "" : "");
              setIsDraftSaved(false);
              setSavedDraftData(null);
              setShowDraftModal(true);`;
// It appears in two places (Cart step and Payment step)
code = code.replace(new RegExp(openModalOld.replace(/[.*+?^$\\{}()|[\\]\\\\]/g, '\\\\$&'), 'g'), openModalNew);


// 4. Replace the old Draft Input Modal with the new Dual-Mode Modal
const oldModalStart = '{/* Draft Input Modal */}';
const oldModalEnd = '{/* Draft List Modal */}';

const newModalCode = `{/* Draft Input Modal */}
      {showDraftModal && (
        <div className="fixed inset-0 z-[100] flex justify-center items-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDraftModal(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            {!isDraftSaved ? (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Simpan Pesanan</h3>
                <p className="text-gray-500 text-sm mb-4">Pesanan akan digantung dan stok belum dipotong sampai lunas.</p>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Pemesan <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={draftNameInput}
                    onChange={e => setDraftNameInput(e.target.value)}
                    placeholder="Contoh: Meja 4 / Budi"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    autoFocus
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nomor WhatsApp <span className="text-gray-400 font-normal">(Opsional)</span></label>
                  <input 
                    type="text" 
                    value={draftPhoneInput}
                    onChange={e => setDraftPhoneInput(e.target.value.replace(/\\D/g, ''))}
                    placeholder="Contoh: 08123456789"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowDraftModal(false)} className="flex-1 py-3 text-gray-600 font-bold bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Batal</button>
                  <button onClick={handleSaveDraft} disabled={isSavingDraft || !draftNameInput.trim()} className="flex-1 py-3 text-white font-bold bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50">
                    {isSavingDraft ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-2">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Tersimpan!</h3>
                <p className="text-gray-500 text-sm mb-6">Pesanan a.n <strong className="text-gray-800">{savedDraftData?.draftName}</strong> berhasil digantung.</p>
                
                <div className="flex flex-col gap-3">
                  <a 
                    href={\`https://wa.me/\${savedDraftData?.draftPhone ? savedDraftData.draftPhone.replace(/^0/, "62") : ""}?text=\${encodeURIComponent(\`Halo \${savedDraftData?.draftName}! Pesanan Anda sudah kami simpan.\\n\\nDetail Pesanan:\\n\` + (savedDraftData?.items || []).map((item: any) => \`- \${item.quantity}x \${item.name} = \${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.quantity * item.sellPrice)}\`).join('\\n') + \`\\n\\nTotal Sementara: \${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(savedDraftData?.total)}\\n\\nSilakan tunjukkan pesan ini atau sebutkan nama Anda saat melakukan pembayaran di Kasir.\\nTerima kasih!\`)}\`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowDraftModal(false)}
                    className="w-full py-3.5 text-base rounded-xl font-bold bg-[#25D366] text-white hover:bg-[#1ebd5a] flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#25D366]/20"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Kirim Konfirmasi WA
                  </a>
                  <button onClick={() => setShowDraftModal(false)} className="w-full py-3.5 text-base font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                    Tutup & Lanjut Kasir
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      `;

const startIndex = code.indexOf(oldModalStart);
const endIndex = code.indexOf(oldModalEnd);
if (startIndex !== -1 && endIndex !== -1) {
    code = code.substring(0, startIndex) + newModalCode + code.substring(endIndex);
    fs.writeFileSync(file, code);
    console.log('Dual-mode modal injected successfully!');
} else {
    console.log('Could not find modal boundaries');
}
