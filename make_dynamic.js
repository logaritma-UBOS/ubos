const fs = require('fs');
const path = 'src/app/(dashboard)/layout.tsx';
let code = fs.readFileSync(path, 'utf8');
if (!code.includes('export const dynamic')) {
    code = 'export const dynamic = "force-dynamic";\n' + code;
    fs.writeFileSync(path, code);
    console.log('Added force-dynamic to layout');
} else {
    console.log('Already dynamic');
}
