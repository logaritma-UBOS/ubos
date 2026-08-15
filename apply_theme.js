const fs = require('fs');

function updateTheme(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace emerald with blue theme mapping
  const replacements = {
    'bg-emerald-500': 'bg-[#4F75FF]',
    'border-emerald-600': 'border-[#3B5BDB]',
    'bg-emerald-600/50': 'bg-white/10', // using white opacity for better contrast on blue
    'hover:bg-emerald-600': 'hover:bg-white/20',
    'bg-emerald-600/30': 'bg-black/10',
    'hover:bg-emerald-600/30': 'hover:bg-white/10',
    'hover:bg-emerald-500/50': 'hover:bg-white/20',
    'text-emerald-100': 'text-blue-100',
    'text-emerald-200/50': 'text-white/50',
    'text-emerald-50': 'text-white/80',
    'text-emerald-600': 'text-[#4F75FF]',
    'border-emerald-400/50': 'border-white/10',
    'border-emerald-400/30': 'border-white/10',
  };

  for (const [key, value] of Object.entries(replacements)) {
    content = content.split(key).join(value);
  }

  fs.writeFileSync(filePath, content);
  console.log(`Updated theme for ${filePath}`);
}

updateTheme('src/components/Sidebar.tsx');
updateTheme('src/components/TopBar.tsx');

// For TopBar.tsx, we also need to change the logo to use the new image.
let topBarContent = fs.readFileSync('src/components/TopBar.tsx', 'utf8');
// Replace the Link href="/" block
const oldLogoBlock = `<Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#4F75FF] rounded-lg flex items-center justify-center font-black text-white text-lg">
            U
          </div>
          <span className="font-black text-xl text-[#4F75FF] tracking-tight hidden sm:block">
            logaritma
          </span>
        </Link>`;

const newLogoBlock = `<Link href="/" className="flex items-center gap-2">
          <img src="/ubos-logo.png" alt="UBOS Logo" className="h-8 w-auto object-contain" />
        </Link>`;

topBarContent = topBarContent.replace(oldLogoBlock, newLogoBlock);

// Also replace the fallback U with the UBOS image in TopBar just in case
topBarContent = topBarContent.replace(
  `<div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-white text-lg">\n            U\n          </div>\n          <span className="font-black text-xl text-emerald-500 tracking-tight hidden sm:block">\n            logaritma\n          </span>`, 
  `<img src="/ubos-logo.png" alt="UBOS Logo" className="h-8 md:h-10 w-auto object-contain" />`
);

fs.writeFileSync('src/components/TopBar.tsx', topBarContent);
