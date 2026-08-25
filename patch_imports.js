const fs = require('fs');
const files = [
  'src/app/ubos/[category]/[slug]/finance/page.tsx',
  'src/app/ubos/[category]/[slug]/crm/page.tsx',
  'src/app/ubos/[category]/[slug]/transactions/page.tsx',
  'src/app/ubos/[category]/[slug]/pos/page.tsx',
  'src/app/ubos/[category]/[slug]/inventory/page.tsx',
];

for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  let changed = false;
  
  if (c.includes("import Copilot from '@/components/Copilot';")) {
    c = c.replace("import Copilot from '@/components/Copilot';", 
      "import dynamic from 'next/dynamic';\nconst Copilot = dynamic(() => import('@/components/Copilot'), { ssr: false });");
    changed = true;
  }
  
  if (c.includes("import HeaderAiTrigger from '@/components/ubos/HeaderAiTrigger';")) {
    // Only add dynamic import line if not already present
    if (!c.includes("import dynamic from 'next/dynamic'")) {
      c = c.replace("import HeaderAiTrigger from '@/components/ubos/HeaderAiTrigger';",
        "import dynamic from 'next/dynamic';\nconst HeaderAiTrigger = dynamic(() => import('@/components/ubos/HeaderAiTrigger'), { ssr: false });");
    } else {
      c = c.replace("import HeaderAiTrigger from '@/components/ubos/HeaderAiTrigger';",
        "const HeaderAiTrigger = dynamic(() => import('@/components/ubos/HeaderAiTrigger'), { ssr: false });");
    }
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(f, c);
    console.log('Patched: ' + f.split('/').pop());
  } else {
    console.log('Skip: ' + f.split('/').pop());
  }
}
