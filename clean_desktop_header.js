const fs = require('fs');
const file = 'src/app/(dashboard)/kasir/KasirClient.tsx';
let code = fs.readFileSync(file, 'utf8');

const startDesktop = code.indexOf('{/* Desktop Header */}');
const endDesktop = code.indexOf('{/* Product Grid Container */}');

if (startDesktop !== -1 && endDesktop !== -1) {
    const replacement = `{/* Desktop Header */}
        <div className="hidden lg:flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-gray-900">Pilih Menu Transaksi</h1>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { loadDrafts(); setShowDraftListModal(true); }}
              className="bg-amber-100 text-amber-700 text-sm font-bold px-4 py-2 rounded-full shadow-sm active:scale-95 hover:bg-amber-200 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
              </svg>
              Pesanan Gantung
            </button>
            {syncCount > 0 && (
              <button onClick={syncTransactions} className="bg-yellow-400 text-yellow-900 text-sm font-bold px-3 py-2 rounded-full shadow-sm active:scale-95 hover:bg-yellow-500 transition-all cursor-pointer flex items-center gap-1.5">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Sync Offline ({syncCount})
              </button>
            )}
          </div>
        </div>

        `;
    
    code = code.substring(0, startDesktop) + replacement + code.substring(endDesktop);
    fs.writeFileSync(file, code);
    console.log('Desktop header fixed!');
} else {
    console.log('Could not find desktop header boundaries');
}
