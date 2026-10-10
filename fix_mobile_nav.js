const fs = require('fs');
const file = 'src/components/layout/MobileBottomNav.tsx';
let code = fs.readFileSync(file, 'utf8');

const search = `{
      title: "TUMBUH",
      links: [
        { label: "Konten", href: "/konten", icon: "📝" },
        { label: "Promo", href: "/promo", icon: "🎟️" },
        { label: "Marketing", href: "/marketing", icon: "📱" },
      ]
    }`;

const replace = `{
      title: "TUMBUH",
      links: [
        { label: "Konten", href: "/konten", icon: "📝" },
        { label: "Promo", href: "/promo", icon: "🎟️" },
        { label: "Marketing", href: "/marketing", icon: "📱" },
        { label: "Integrasi WA", href: "/pengaturan/whatsapp", icon: "💬" },
      ]
    }`;

if (code.includes(search)) {
  code = code.replace(search, replace);
  fs.writeFileSync(file, code);
  console.log('REPLACED');
} else {
  console.log('NOT FOUND, writing exact state:');
}
