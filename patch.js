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
    'className="fixed bottom-0 z-50 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] max-w-7xl mx-auto flex justify-end"',
    'className="fixed bottom-0 z-50 left-0 md:left-64 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] flex justify-center md:justify-end"'
  );
  fs.writeFileSync(f, c);
});
console.log('Patched fixed footer overlap');
