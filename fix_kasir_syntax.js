const fs = require('fs');
const file = 'src/app/(dashboard)/kasir/KasirClient.tsx';
let code = fs.readFileSync(file, 'utf8');

// The string literal `\\\`` didn't work because of PS, so here we do:
code = code.split('\\`').join('`');

fs.writeFileSync(file, code);
console.log('Fixed');
