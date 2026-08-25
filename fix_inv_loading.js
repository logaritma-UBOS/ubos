const fs = require('fs');
let file = 'src/app/ubos/[category]/[slug]/inventory/page.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/\{filteredProducts\.length === 0 \? \(/g, 
  "{loading ? (<div className=\"bg-white rounded-3xl p-10 shadow-sm border border-slate-200/80 text-center text-slate-500 font-bold text-sm animate-pulse\">Memuat data inventaris...</div>) : filteredProducts.length === 0 ? (");

fs.writeFileSync(file, c);
console.log('Patched inventory empty state');
