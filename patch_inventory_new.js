const fs = require('fs');

const files = [
  'src/app/ubos/percetakan/[slug]/inventory/new/page.tsx',
  'src/app/ubos/ritel/[slug]/inventory/new/page.tsx',
  'src/app/ubos/jasa/[slug]/inventory/new/page.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log(`Skipping ${file}`);
    continue;
  }
  let code = fs.readFileSync(file, 'utf8');

  // 1. Remove the existing button section
  const btnRegex = /<div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">[\s\S]*?<\/button>\s*<\/div>/g;
  code = code.replace(btnRegex, '');

  // 2. Increase padding bottom of main container
  code = code.replace(/pb-28 md:pb-10/g, 'pb-32');

  // 3. Inject the fixed footer right before the final `</>`
  const footerCode = `
      <div className="fixed bottom-0 z-50 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] max-w-7xl mx-auto flex justify-end">
        <button 
          onClick={handleSaveProduct} 
          disabled={saving || !namaProduk}
          className="w-full md:w-auto md:min-w-[200px] bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-6 rounded-2xl transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm shadow-primary/20"
        >
          {saving ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
             <>
               <Save size={18} />
               <span>Simpan Produk</span>
             </>
          )}
        </button>
      </div>`;
  
  // Find the last `</>` to insert before it.
  const lastTagIndex = code.lastIndexOf('</>');
  if (lastTagIndex !== -1) {
    code = code.slice(0, lastTagIndex) + footerCode + '\n    </>' + code.slice(lastTagIndex + 3);
  }

  fs.writeFileSync(file, code);
  console.log(`Patched ${file}`);
}
