const fs = require('fs');
const files = [
  'src/app/ubos/[category]/[slug]/inventory/new/page.tsx',
  'src/app/ubos/percetakan/[slug]/inventory/new/page.tsx',
  'src/app/ubos/ritel/[slug]/inventory/new/page.tsx',
  'src/app/ubos/jasa/[slug]/inventory/new/page.tsx'
];

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(
    '<header className="mb-6 flex items-center justify-between">',
    '<header className="mb-6 flex items-center justify-between px-5 pt-5 md:pt-8 max-w-7xl mx-auto">'
  );
  fs.writeFileSync(f, c);
});
console.log('Patched header padding');
