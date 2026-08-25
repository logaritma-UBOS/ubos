const fs = require('fs');
let file = 'src/app/ubos/[category]/[slug]/crm/page.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/\{customers\.length === 0 \? \(/g, 
  "{loading ? (<div className=\"p-10 text-center text-slate-500 font-bold text-sm animate-pulse\">Memuat data pelanggan...</div>) : customers.length === 0 ? (");

fs.writeFileSync(file, c);
console.log('Patched crm empty state');
