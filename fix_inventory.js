const fs = require('fs');
let file = 'src/app/ubos/[category]/[slug]/inventory/page.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/\{products\.length\}/g, "{loading ? '...' : products.length}");
c = c.replace(/\{habisCount\}/g, "{loading ? '...' : habisCount}");
c = c.replace(/\{formatIDR\(totalAset\)\}/g, "{loading ? '...' : formatIDR(totalAset)}");

fs.writeFileSync(file, c);
console.log('Patched inventory formatting');
