const fs = require('fs');

function patchInventory(category) {
  const file = `src/app/ubos/${category}/[slug]/inventory/page.tsx`;
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // Add HeaderAiTrigger import if missing
  if (!code.includes('HeaderAiTrigger')) {
    code = code.replace("import { toast } from 'sonner';", "import { toast } from 'sonner';\nimport HeaderAiTrigger from '@/components/ubos/HeaderAiTrigger';");
  }

  // Replace header block
  const oldHeaderRegex = /<header className="bg-gradient-to-r from-slate-900 to-slate-800.*?<\/header>/s;
  const newHeader = `
          {/* Header Inventory - Modern Clean */}
          <header className="px-5 py-6 md:py-8 flex justify-between items-center z-10 relative bg-slate-50">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center flex-wrap gap-3">
                Inventori ${category.charAt(0).toUpperCase() + category.slice(1)}
                <HeaderAiTrigger />
              </h1>
              <p className="text-slate-500 text-sm mt-1.5 flex items-center gap-1.5 font-medium">
                Manajemen produk & stok
              </p>
            </div>
          </header>`;

  if (oldHeaderRegex.test(code)) {
    code = code.replace(oldHeaderRegex, newHeader);
    
    // Replace negative margin container with standard max-w-7xl
    const containerRegex = /<div className="p-5 -mt-6 max-w-6xl mx-auto space-y-6 pb-28 md:pb-10 relative z-30 animate-in fade-in duration-500">/;
    const newContainer = `<div className="p-5 max-w-7xl mx-auto space-y-6 pb-28 md:pb-10 relative z-30 animate-in fade-in duration-500">`;
    code = code.replace(containerRegex, newContainer);
    
    // Also change max-w-6xl to max-w-7xl globally just in case
    code = code.replace(/max-w-6xl/g, 'max-w-7xl');

    fs.writeFileSync(file, code);
    console.log(`Updated inventory header in ${file}`);
  } else {
    console.log(`Header not found in ${file}`);
  }
}

['percetakan', 'ritel', 'jasa'].forEach(cat => {
  patchInventory(cat);
});
