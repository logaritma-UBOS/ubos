const fs = require('fs');
const file = 'src/app/(dashboard)/kasir/KasirClient.tsx';
let code = fs.readFileSync(file, 'utf8');

const startMobile = code.indexOf('{/* Header - Mobile Only */}');
const endMobile = code.indexOf('{/* Desktop Header */}');

if (startMobile !== -1 && endMobile !== -1) {
    const replacement = `{/* Header - Mobile Only */}
        <div className="bg-primary-700 text-white p-4 sticky top-0 z-20 flex justify-between items-center shadow-sm lg:hidden">
          <h1 className="text-lg font-bold">Kasir POS</h1>
          <button 
            onClick={() => { loadDrafts(); setShowDraftListModal(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold hover:bg-yellow-500 transition-colors shadow-sm ml-auto mr-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
            </svg>
            Pesanan Gantung
          </button>
          {syncCount > 0 && (
            <button onClick={syncTransactions} className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-sm active:scale-95 transition-transform flex items-center gap-1 cursor-pointer hover:bg-yellow-500">
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Sync ({syncCount})
            </button>
          )}
        </div>
        
        `;
    
    code = code.substring(0, startMobile) + replacement + code.substring(endMobile);
    fs.writeFileSync(file, code);
    console.log('Mobile header fixed!');
} else {
    console.log('Could not find mobile header boundaries');
}
