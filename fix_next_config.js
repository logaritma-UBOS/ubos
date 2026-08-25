const fs = require('fs');
let file = 'next.config.ts';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/  eslint: \{\n    ignoreDuringBuilds: true,\n  \},\n/g, "");

fs.writeFileSync(file, c);
console.log('Removed eslint block');
