const fs = require('fs');
let file = 'src/hooks/useAILogaritmaEngine.ts';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(
  /\.select\('id'\)/, 
  ".select('id, kategori_usaha, created_at')"
);

c = c.replace(
  /const coreState = buildLogaritmaState\(\n        \{ targetProfitMonthly: targetProfit, budgetBelanjaDaily: budget \},\n        transactions,\n        products\n      \);/,
  "const umurAkunHari = merchant?.created_at ? Math.max(1, Math.floor((new Date().getTime() - new Date(merchant.created_at).getTime()) / (1000 * 3600 * 24))) : 30;\n      const coreState = buildLogaritmaState(\n        { targetProfitMonthly: targetProfit, budgetBelanjaDaily: budget },\n        transactions,\n        products,\n        { kategoriUsaha: merchant?.kategori_usaha || 'Retail', umurAkunHari }\n      );"
);

fs.writeFileSync(file, c);
console.log('Patched useAILogaritmaEngine core call');
