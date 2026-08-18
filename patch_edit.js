const fs = require('fs');

function patchEditPage(category) {
  const file = `src/app/ubos/${category}/[slug]/inventory/edit/[id]/page.tsx`;
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  const oldHeaderRegex = /<header className="fixed top-0.*?<\/header>/s;
  const newHeader = `
      {/* Header Inventory - Modern Clean */}
      <header className="px-5 py-6 md:py-8 flex justify-between items-center z-10 relative bg-slate-50">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center flex-wrap gap-3">
            Edit Produk
          </h1>
          <p className="text-slate-500 text-sm mt-1.5 flex items-center gap-1.5 font-medium">
            Ubah detail kalkulator HPP
          </p>
        </div>
        <button 
          onClick={() => router.back()}
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>
      </header>`;
      
  code = code.replace(oldHeaderRegex, newHeader);
  // Also remove `pt-24` from the container div just below the header since it's not fixed anymore
  code = code.replace(/<div className="flex-1 overflow-y-auto p-4 space-y-6 pb-28 pt-24">/, '<div className="flex-1 overflow-y-auto p-4 space-y-6 pb-28">');
  
  fs.writeFileSync(file, code);
  console.log(`Patched edit page for ${category}`);
}

['percetakan', 'ritel', 'jasa'].forEach(cat => patchEditPage(cat));
