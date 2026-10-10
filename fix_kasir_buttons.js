const fs = require('fs');
const file = 'src/app/(dashboard)/kasir/KasirClient.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Rename the header buttons back to "Pesanan Gantung" (because I blindly replaced it)
// For desktop header
const desktopHeaderOld = `<button onClick={syncTransactions}`;
const desktopHeaderAnchor = `<h1 className="text-2xl font-black text-gray-900">Pilih Menu Transaksi</h1>`;
if (code.includes(desktopHeaderAnchor) && !code.includes('Pesanan Gantung</button>')) {
  const btn = `
            <button 
              onClick={() => { loadDrafts(); setShowDraftListModal(true); }}
              className="bg-amber-100 text-amber-700 text-sm font-bold px-3 py-1.5 rounded-full shadow-sm active:scale-95 hover:bg-amber-200 transition-all cursor-pointer flex items-center gap-1.5 ml-auto mr-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
              </svg>
              Pesanan Gantung
            </button>`;
  code = code.replace(desktopHeaderOld, btn + '\n            ' + desktopHeaderOld);
}

// Rename the mobile header button back
code = code.replace(
  /Simpan Pesanan\s*<\/button>/g,
  'Pesanan Gantung\n            </button>'
);
code = code.replace(
  /Simpan Pesanan\s*<\/h2>/g,
  'Pesanan Gantung</h2>'
);

// 2. Inject "Simpan Pesanan" under "Lanjut Bayar"
const lanjutBayarAnchor = `<span>Lanjut Bayar</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Button>`;

const simpanBtn = `
            <Button onClick={() => {
              setDraftNameInput(selectedCustomerId ? localCustomers.find((c: any) => c.id === selectedCustomerId)?.name || "" : "");
              setShowDraftModal(true);
            }} disabled={cart.length === 0} variant="outline" className="w-full mt-3 py-4 text-lg rounded-xl flex items-center justify-center gap-2 text-gray-700 border-gray-300 hover:bg-gray-50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Simpan Pesanan (Hold)</span>
            </Button>`;

if (code.includes(lanjutBayarAnchor) && !code.includes('disabled={cart.length === 0} variant="outline"')) {
  code = code.replace(lanjutBayarAnchor, lanjutBayarAnchor + simpanBtn);
}

// 3. Remove the draft list button from the Payment step header (because it's confusing)
const paymentHeaderDraftBtn = `<button 
            onClick={() => { loadDrafts(); setShowDraftListModal(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-sm font-bold hover:bg-amber-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
            </svg>
            Pesanan Gantung
          </button>`;
code = code.replace(paymentHeaderDraftBtn, '');


fs.writeFileSync(file, code);
console.log('Fixed button logic and text');
