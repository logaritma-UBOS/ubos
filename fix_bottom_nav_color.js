const fs = require('fs');
let file = 'src/components/BottomNav.tsx';
let c = fs.readFileSync(file, 'utf8');

if (!c.includes('purple:')) {
  c = c.replace(/emerald: \{ bg: 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500\/30', icon: Sparkles, label: coreAction\?\.label \|\| 'Aksi Logaritma', href: coreAction\?\.href \|\| basePath \},/g, 
    "emerald: { bg: 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/30', icon: Sparkles, label: coreAction?.label || 'Aksi Logaritma', href: coreAction?.href || basePath },\n    purple: { bg: 'bg-gradient-to-r from-purple-500 to-fuchsia-600 shadow-purple-500/30', icon: Users, label: coreAction?.label || 'Pelanggan', href: coreAction?.href || basePath },");
  fs.writeFileSync(file, c);
  console.log('Patched bottomnav purple mapping');
}
