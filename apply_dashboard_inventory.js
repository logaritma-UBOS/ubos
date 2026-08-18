const fs = require('fs');

function patchDashboard(category) {
  const file = `src/app/ubos/${category}/[slug]/page.tsx`;
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  if (!code.includes('HeaderAiTrigger')) {
    code = code.replace("import CopilotWidget from '@/components/CopilotWidget';", "import CopilotWidget from '@/components/CopilotWidget';\nimport HeaderAiTrigger from '@/components/ubos/HeaderAiTrigger';");
  }
  
  // Replace max-w-6xl with max-w-7xl
  code = code.replace('className="max-w-6xl mx-auto', 'className="max-w-7xl mx-auto');

  // Find the exact Target Profit Banner to replace
  const bannerRegex = /\{\/\*\s*Target Profit Banner\s*\*\/\}.*?(?=\{\/\*\s*Onboarding Widget Majoo Style\s*\*\/\})/s;
  const modernHeader = `
        {/* Modern Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center flex-wrap gap-2">
              Dashboard ${category.charAt(0).toUpperCase() + category.slice(1)}
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">Live</span>
              <HeaderAiTrigger />
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              {new Date().toLocaleDateString('id-ID', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})}
            </p>
          </div>
          <div className="flex items-center gap-3">
             <button 
              onClick={() => setShowTargetModal(true)}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm shadow-sm" 
            >
              <Target size={16} className="text-blue-600" />
              Target: {formatIDR(parseInt(targetProfit || '0'))}
            </button>
          </div>
        </div>

        `;
  
  if (bannerRegex.test(code)) {
    code = code.replace(bannerRegex, modernHeader);
    fs.writeFileSync(file, code);
    console.log(`Updated ${file}`);
  } else {
    console.log(`Banner not found in ${file}`);
  }
}

function patchInventory(category) {
  const file = `src/app/ubos/${category}/[slug]/inventory/page.tsx`;
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  if (!code.includes('HeaderAiTrigger')) {
    code = code.replace("import Sidebar from '@/components/Sidebar';", "import Sidebar from '@/components/Sidebar';\nimport HeaderAiTrigger from '@/components/ubos/HeaderAiTrigger';");
  }

  // Replace header block
  const oldHeaderRegex = /<header className="bg-slate-900 text-white px-5 py-6 md:py-8.*?<\/header>/s;
  const newHeader = `
          {/* Header Inventory - Modern Clean */}
          <header className="px-5 py-6 md:py-8 flex justify-between items-center z-10 relative bg-slate-50">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center flex-wrap gap-3">
                Inventori ${category.charAt(0).toUpperCase() + category.slice(1)}
                <HeaderAiTrigger />
              </h1>
              <p className="text-slate-500 text-sm mt-1.5 flex items-center gap-1.5 font-medium">
                Manajemen stok & layanan
              </p>
            </div>
          </header>`;

  if (oldHeaderRegex.test(code)) {
    code = code.replace(oldHeaderRegex, newHeader);
    
    // Also remove any AIBanner in inventory if it exists
    if (code.includes('<AIBanner />')) {
        code = code.replace(/<div className="relative pt-4 px-4 md:px-5 z-20">\s*<AIBanner \/>\s*<\/div>/s, '');
    }

    fs.writeFileSync(file, code);
    console.log(`Updated ${file}`);
  } else {
    console.log(`Header not found in ${file}`);
  }
}

['percetakan', 'ritel', 'jasa'].forEach(cat => {
  patchDashboard(cat);
  patchInventory(cat);
});
