const fs = require('fs');
const file = 'src/app/(dashboard)/kasir/KasirClient.tsx';
let code = fs.readFileSync(file, 'utf8');

const idx = code.indexOf('if (step === "SUCCESS") {');
console.log(code.substring(idx, idx + 2000));
