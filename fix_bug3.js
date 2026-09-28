const fs = require('fs');
let code = fs.readFileSync('src/actions/catalog.ts', 'utf8');

code = code.replace(
  /const updateData: any = \{\s*name,\s*sellPrice,\s*supplierId: \(formData\.get\("supplierId"\) as string\) \|\| null\s*\};/,
  `const updateData: any = { 
      name, 
      sellPrice,
    };
    if (formData.has("supplierId")) {
      updateData.supplierId = (formData.get("supplierId") as string) || null;
    }`
);

fs.writeFileSync('src/actions/catalog.ts', code);
console.log('Fixed catalog.ts Product');
