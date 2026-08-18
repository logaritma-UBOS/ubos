const fs = require('fs');

const files = [
  'src/app/ubos/[category]/[slug]/pos/page.tsx',
  'src/app/ubos/percetakan/[slug]/pos/page.tsx',
  'src/app/ubos/ritel/[slug]/pos/page.tsx',
  'src/app/ubos/jasa/[slug]/pos/page.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log(`Skipping ${file}`);
    continue;
  }
  let code = fs.readFileSync(file, 'utf8');

  // Fix CHANNEL_COMMISSIONS
  code = code.replace(/const CHANNEL_COMMISSIONS: Record<string, number> = \{[\s\S]*?\};/, `const CHANNEL_COMMISSIONS: Record<Channel, number> = {
  'DINE_IN': 0,
  'SHOPEEFOOD': 0.50,
  'GRABFOOD': 0.45,
  'GOFOOD': 0.35,
};`);

  // Ensure button rendering looks okay: DINE_IN -> Dine In, GOFOOD -> GoFood
  code = code.replace(/\{c\.replace\('_', ' '\)\}/, `{c === 'DINE_IN' ? 'Dine In' : c === 'GOFOOD' ? 'GoFood' : c === 'GRABFOOD' ? 'GrabFood' : c === 'SHOPEEFOOD' ? 'ShopeeFood' : c.replace('_', ' ')}`);

  // Fix calculateAdjustedPrice NaN
  // const price = basePrice / (1 - commission); -> const price = basePrice / (1 - (commission || 0));
  code = code.replace(/const price = basePrice \/ \(1 - commission\);/g, 'const price = basePrice / (1 - (commission || 0));');

  fs.writeFileSync(file, code);
  console.log(`Patched ${file}`);
}
