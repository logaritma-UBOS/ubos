const fs = require('fs');
let file = 'src/components/BottomNav.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/const coreState = buildLogaritmaState\(\n      \{ targetProfitMonthly: aiState\.targetProfitMonthly, budgetBelanjaDaily: aiState\.budgetBelanjaDaily \},\n      \[\],\n      aiState\.lowStockItems \|\| \[\]\n    \);/g, 
  "const coreState = buildLogaritmaState(\n      { targetProfitMonthly: aiState.targetProfitMonthly, budgetBelanjaDaily: aiState.budgetBelanjaDaily },\n      [],\n      aiState.lowStockItems || [],\n      { kategoriUsaha: merchant?.kategori_usaha || 'Retail' }\n    );");

fs.writeFileSync(file, c);
console.log('Patched bottomnav core call');
