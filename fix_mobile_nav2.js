const fs = require('fs');
const file = 'src/components/layout/MobileBottomNav.tsx';
let code = fs.readFileSync(file, 'utf8');

const search = '{ label: "Marketing", href: "/marketing", icon: "📱" },';
const replace = '{ label: "Marketing", href: "/marketing", icon: "📱" },\n        { label: "Integrasi WA", href: "/pengaturan/whatsapp", icon: "💬" },';

if (code.includes(search)) {
  code = code.replace(search, replace);
  fs.writeFileSync(file, code);
  console.log('REPLACED');
} else {
  console.log('STILL NOT FOUND');
}
