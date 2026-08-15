const fs = require('fs');

const files = [
  'src/app/ubos/[category]/[slug]/page.tsx',
  'src/app/ubos/jasa/[slug]/page.tsx',
  'src/app/ubos/percetakan/[slug]/page.tsx',
  'src/app/ubos/ritel/[slug]/page.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Fix Top Banner Gradient
  content = content.replace(
    /bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600/g,
    'bg-gradient-to-r from-blue-600 to-emerald-500'
  );

  // Fix Target Button (to be less huge and more elegant)
  content = content.replace(
    /bg-white text-emerald-600 px-6 py-3 md:px-5 md:py-2\.5 rounded-\[1\.5rem\] md:rounded-xl font-black transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-xl md:shadow-md mt-4 md:mt-0 text-sm md:text-base mb-\[-36px\] md:mb-0 md:mr-4 relative z-30 hover:bg-slate-50/g,
    'bg-white/95 backdrop-blur-sm text-emerald-700 px-5 py-2 md:px-6 md:py-2.5 rounded-2xl md:rounded-xl font-bold transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 shadow-lg mt-4 md:mt-0 text-sm md:text-base mb-[-24px] md:mb-0 md:mr-4 relative z-30 hover:bg-white'
  );
  
  content = content.replace(
    /bg-white px-6 py-3 md:px-5 md:py-2\.5 rounded-\[1\.5rem\] md:rounded-xl font-black transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-xl md:shadow-md mt-4 md:mt-0 text-sm md:text-base mb-\[-36px\] md:mb-0 md:mr-4 relative z-30 text-emerald-600 hover:bg-slate-50/g,
    'bg-white/95 backdrop-blur-sm text-emerald-700 px-5 py-2 md:px-6 md:py-2.5 rounded-2xl md:rounded-xl font-bold transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 shadow-lg mt-4 md:mt-0 text-sm md:text-base mb-[-24px] md:mb-0 md:mr-4 relative z-30 hover:bg-white'
  );

  // Fix Cards to use glass-card
  content = content.replace(
    /className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"/g,
    'className="glass-card p-6 rounded-3xl"'
  );

  // Banner pb-4 md:pb-8 -> pb-6 md:pb-8
  content = content.replace(
    /pb-4 md:pb-8 rounded-b-\[1\.5rem\] md:rounded-b-\[2rem\] shadow-xl relative/g,
    'pb-6 md:pb-8 rounded-b-[1.5rem] md:rounded-b-[2rem] shadow-xl relative'
  );

  fs.writeFileSync(file, content);
  console.log("Fixed " + file);
}
