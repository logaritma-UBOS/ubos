const fs = require('fs');
let file = 'src/app/ubos/[category]/[slug]/finance/page.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/\{formatIDR\(recommendedModalKulakan\)\}/g, "{loading ? '...' : formatIDR(recommendedModalKulakan)}");
c = c.replace(/\{formatIDR\(estimatedNetProfit\)\}/g, "{loading ? '...' : formatIDR(estimatedNetProfit)}");
c = c.replace(/\{formatIDR\(totalPendapatan\)\}/g, "{loading ? '...' : formatIDR(totalPendapatan)}");
c = c.replace(/\{formatIDR\(totalPengeluaran\)\}/g, "{loading ? '...' : formatIDR(totalPengeluaran)}");

fs.writeFileSync(file, c);
console.log('Patched finance formatting');
