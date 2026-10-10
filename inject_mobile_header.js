const fs = require('fs');
const file = 'src/app/(dashboard)/kasir/KasirClient.tsx';
let code = fs.readFileSync(file, 'utf8');

const mobileHeaderAnchor = '<h1 className="text-lg font-bold">Kasir POS</h1>';
const buttonHTML = `
            <button 
              onClick={() => { loadDrafts(); setShowDraftListModal(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold hover:bg-yellow-500 transition-colors shadow-sm ml-auto mr-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
              </svg>
              Pesanan Gantung
            </button>`;

if (code.includes(mobileHeaderAnchor) && !code.includes('Pesanan Gantung</button>')) {
  // Wait, I already added a Pesanan Gantung button to desktop. Let's just blindly replace the mobile one.
  code = code.replace(mobileHeaderAnchor, mobileHeaderAnchor + buttonHTML);
  fs.writeFileSync(file, code);
  console.log('Mobile header injected');
} else if (code.includes('Pesanan Gantung</button>')) {
  // Try to replace it again anyway if not next to mobile header
  if(!code.substring(code.indexOf(mobileHeaderAnchor), code.indexOf(mobileHeaderAnchor)+300).includes('Pesanan Gantung')) {
      code = code.replace(mobileHeaderAnchor, mobileHeaderAnchor + buttonHTML);
      fs.writeFileSync(file, code);
      console.log('Mobile header injected (second time)');
  } else {
      console.log('Already exists near mobile header');
  }
} else {
  console.log('Mobile header anchor not found');
}
