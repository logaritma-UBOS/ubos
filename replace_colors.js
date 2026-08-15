const fs = require('fs');
const paths = [
  'src/app/ubos/jasa/[slug]/page.tsx',
  'src/app/ubos/percetakan/[slug]/page.tsx',
  'src/app/ubos/ritel/[slug]/page.tsx'
];

paths.forEach(p => {
  if (!fs.existsSync(p)) return;
  let c = fs.readFileSync(p, 'utf8');

  // Remove brand_color extraction
  c = c.replace(/const primaryColor = merchant\?\.brand_color \|\| '\#[a-zA-Z0-9]+';\n/g, '');
  
  // Remove dynamic documentElement style injection
  c = c.replace(/if \(data\.brand_color\) \{\s*document\.documentElement\.style\.setProperty\('--brand-color', data\.brand_color\);\s*\}/g, '');
  
  // Replace banner styling
  c = c.replace(/style=\{\{\s*background: `linear-gradient\(135deg, \$\{primaryColor\} 0%, \$\{primaryColor\}dd 100%\)`\s*\}\}/g, '');
  c = c.replace(/className=\"text-white p-4 md:p-10 pb-4 md:pb-8 rounded-b-\[1\.5rem\] md:rounded-b-\[2rem\] shadow-xl relative\"/g, 'className=\"text-white p-4 md:p-10 pb-4 md:pb-8 rounded-b-[1.5rem] md:rounded-b-[2rem] shadow-xl relative bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600\"');
  
  // Replace target button text color style
  c = c.replace(/style=\{\{ color: primaryColor \}\}/g, '');
  c = c.replace(/className=\"(w-full md:w-auto bg-white[^"]*?)\"/g, 'className=\"$1 text-emerald-600 hover:bg-slate-50\"');

  // Replace indigo colors
  c = c.replace(/bg-indigo-600/g, 'btn-gradient-primary border-none text-white');
  c = c.replace(/text-indigo-600/g, 'text-emerald-600');
  c = c.replace(/bg-indigo-50/g, 'bg-emerald-50');
  c = c.replace(/text-indigo-900/g, 'text-slate-900');
  c = c.replace(/shadow-indigo-600\/20/g, 'shadow-emerald-500/20');
  c = c.replace(/focus:border-indigo-500/g, 'focus:border-emerald-500');
  c = c.replace(/hover:bg-indigo-700/g, '');

  fs.writeFileSync(p, c);
});
console.log('Done replacing multiple files');
