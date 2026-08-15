const fs = require('fs');

const files = [
  'src/app/ubos/[category]/[slug]/page.tsx',
  'src/app/ubos/jasa/[slug]/page.tsx',
  'src/app/ubos/percetakan/[slug]/page.tsx',
  'src/app/ubos/ritel/[slug]/page.tsx'
];

const replacements = {
  'bg-emerald-50': 'bg-blue-50',
  'bg-emerald-100': 'bg-blue-100',
  'bg-emerald-500': 'bg-[#4F75FF]',
  'bg-emerald-600/50': 'bg-blue-600/50',
  'text-emerald-500': 'text-[#4F75FF]',
  'text-emerald-600': 'text-[#3B5BDB]',
  'text-emerald-700': 'text-blue-700',
  'border-emerald-100': 'border-blue-100',
  'border-emerald-200': 'border-blue-200',
  'border-emerald-500': 'border-[#4F75FF]',
  'group-hover:text-emerald-500': 'group-hover:text-[#4F75FF]',
  'shadow-emerald-500/20': 'shadow-blue-500/20',
  'from-emerald-500/20': 'from-[#4F75FF]/20',
  'hover:text-emerald-500': 'hover:text-[#4F75FF]',
};

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // We only want to replace inside the newly added Promo Banner and Onboarding Widget, 
  // not the existing margin guard which is supposed to be emerald!
  // Wait, if we replace all, even the "Profit Bersih" icon will turn blue. Is that okay?
  // Logaritma's default uses emerald for success (profit) but maybe it's fine.
  
  // Let's restrict replacement to just the newly added sections:
  const startMarker = '{/* Promo Banner Majoo Style */}';
  const endMarker = '{/* 2. Top Stats Grid - 4 Metric Cards */}';
  
  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker);
  
  if (startIndex !== -1 && endIndex !== -1) {
    let sectionToReplace = content.substring(startIndex, endIndex);
    
    for (const [key, value] of Object.entries(replacements)) {
      sectionToReplace = sectionToReplace.split(key).join(value);
    }
    
    content = content.substring(0, startIndex) + sectionToReplace + content.substring(endIndex);
    fs.writeFileSync(file, content);
    console.log(`Updated theme in dashboard: ${file}`);
  }
}
