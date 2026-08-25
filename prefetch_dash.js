const fs = require('fs');
let file = 'src/app/ubos/[category]/[slug]/page.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/<Link href=/g, "<Link prefetch={true} href=");
c = c.replace(/<Link \n/g, "<Link prefetch={true} \n");

fs.writeFileSync(file, c);
console.log('Prefetch added to Dashboard Links');
