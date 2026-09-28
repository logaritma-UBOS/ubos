const fs = require('fs');
const files = [
  { path: 'src/app/(dashboard)/stok/page.tsx', name: 'Stok & Supplier' },
  { path: 'src/app/(dashboard)/pelanggan/page.tsx', name: 'Database Pelanggan' },
  { path: 'src/app/(dashboard)/pengeluaran/page.tsx', name: 'Manajemen Pengeluaran' },
  { path: 'src/app/(dashboard)/wawasan-bisnis/page.tsx', name: 'Wawasan Bisnis' },
  { path: 'src/app/(dashboard)/marketing/page.tsx', name: 'Marketing' },
  { path: 'src/app/(dashboard)/konten/page.tsx', name: 'Mesin Konten' }
];

files.forEach(f => {
  if (!fs.existsSync(f.path)) { console.log('Not found:', f.path); return; }
  let code = fs.readFileSync(f.path, 'utf8');
  
  if (!code.includes('getUserPlan')) {
    code = code.replace(/import \{ redirect \} from "next\/navigation"/, 'import { redirect } from "next/navigation"\nimport { getUserPlan } from "@/lib/plan"\nimport FreemiumLock from "@/components/layout/FreemiumLock"');
    
    code = code.replace(/const session = await auth\(\)/, 'const session = await auth()\n  const plan = await getUserPlan()\n  if (plan === "STARTER") return <AppShell><FreemiumLock featureName="' + f.name + '" /></AppShell>');
    
    fs.writeFileSync(f.path, code);
    console.log('Updated ' + f.path);
  }
});
