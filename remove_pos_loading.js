const fs = require('fs');
let f = 'src/app/ubos/[category]/[slug]/pos/page.tsx';
let content = fs.readFileSync(f, 'utf8');
content = content.replace(/  if \(loading\) \{ return <UBOSLoading fullScreen=\{false\} show=\{true\} \/>; \}\n/g, '');
fs.writeFileSync(f, content);
console.log('Removed loading from POS');
