const fs = require('fs');

const files = [
  'src/app/ubos/[category]/[slug]/inventory/page.tsx',
  'src/app/ubos/jasa/[slug]/inventory/page.tsx',
  'src/app/ubos/percetakan/[slug]/inventory/page.tsx',
  'src/app/ubos/ritel/[slug]/inventory/page.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Fix Header
  content = content.replace(
    /<header className="fixed top-0 z-40 h-\[80px\] bg-primary shadow-md max-w-md md:max-w-none mx-auto md:mx-0 left-0 md:left-64 right-0 px-5 py-4 flex justify-between items-center">[\s\S]*?<\/header>/,
    `<header className="bg-gradient-to-r from-slate-900 to-slate-800 pb-10 pt-6 md:pt-8 px-5 relative md:rounded-b-[2rem] rounded-b-3xl shadow-xl z-20">
        <div className="max-w-6xl mx-auto flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-sm">Kalkulator HPP & Stok</h1>
            <p className="text-slate-300 text-sm mt-1 font-medium">Manajemen produk & biaya produksi</p>
          </div>
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
            <Package size={24} className="text-white" />
          </div>
        </div>
      </header>`
  );
  
  // Fix main container padding
  content = content.replace(
    /className="p-5 pt-24 max-w-6xl mx-auto space-y-6 pb-28 md:pb-10 animate-in fade-in duration-500"/g,
    'className="p-5 -mt-6 max-w-6xl mx-auto space-y-6 pb-28 md:pb-10 relative z-30 animate-in fade-in duration-500"'
  );
  
  content = content.replace(
    /className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200"/g,
    'className="glass-card rounded-3xl p-6"'
  );

  fs.writeFileSync(file, content);
  console.log("Fixed " + file);
}
