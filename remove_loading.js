const fs = require('fs');

const files = [
  'src/app/ubos/[category]/[slug]/finance/page.tsx',
  'src/app/ubos/[category]/[slug]/crm/page.tsx',
  'src/app/ubos/[category]/[slug]/inventory/page.tsx',
  'src/app/ubos/[category]/[slug]/transactions/page.tsx'
];

for (const f of files) {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    
    // Remove early return
    content = content.replace(/  if \(loading\) \{\n    return \(\n      <UBOSLoading fullScreen=\{false\} show=\{true\} \/>\n    \);\n  \}/g, '');
    content = content.replace(/  if \(loading\) \{ return <UBOSLoading fullScreen=\{false\} show=\{true\} \/>; \}/g, '');
    content = content.replace(/  if \(loading\) return <UBOSLoading fullScreen=\{false\} show=\{true\} \/>;/g, '');
    
    // Fallback UI adjustments if wallet/products are null
    if (f.includes('finance')) {
      content = content.replace(/formatIDR\(wallet\?.profit_bersih/g, 'loading ? "..." : formatIDR(wallet?.profit_bersih');
      content = content.replace(/formatIDR\(wallet\?.kas_operasional/g, 'loading ? "..." : formatIDR(wallet?.kas_operasional');
      content = content.replace(/formatIDR\(wallet\?.kas_bahan_baku/g, 'loading ? "..." : formatIDR(wallet?.kas_bahan_baku');
    }
    
    fs.writeFileSync(f, content);
    console.log('Removed loading block from ' + f.split('/').pop());
  }
}
