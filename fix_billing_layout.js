const fs = require('fs');

const files = [
  'src/app/ubos/[category]/[slug]/billing/page.tsx',
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Fix Header Gradient
  content = content.replace(
    /className="bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-white p-6 md:p-10 pb-16 rounded-b-\[2rem\] shadow-xl relative overflow-hidden"/g,
    'className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white p-6 md:p-10 pb-16 rounded-b-3xl md:rounded-b-[2rem] shadow-xl relative overflow-hidden"'
  );

  // Fix Diskon Badge position
  content = content.replace(
    /className="absolute -top-3 left-1\/2 -translate-x-1\/2 bg-gradient-to-r from-rose-500 to-red-500 text-white text-\[10px\] md:text-xs font-black px-4 py-1\.5 rounded-full flex items-center gap-1\.5 shadow-lg shadow-rose-500\/20 whitespace-nowrap"/g,
    'className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-rose-500 to-red-500 text-white text-[10px] md:text-xs font-black px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-rose-500/20 whitespace-nowrap z-10"'
  );

  fs.writeFileSync(file, content);
  console.log("Fixed " + file);
}
