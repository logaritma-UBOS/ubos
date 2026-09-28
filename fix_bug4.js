const fs = require('fs');
let code = fs.readFileSync('src/actions/catalog.ts', 'utf8');

code = code.replace(
  /const supplierId = formData\.get\("supplierId"\) as string;\s*await prisma\.ingredient\.update\(\{\s*where: \{ id \},\s*data: \{\s*unit,\s*costPerUnit,\s*currentStock,\s*supplierId: supplierId \|\| null\s*\}\s*\}\)/,
  `const updateData: any = { unit, costPerUnit, currentStock };
    if (formData.has("supplierId")) {
      updateData.supplierId = (formData.get("supplierId") as string) || null;
    }
    await prisma.ingredient.update({ 
      where: { id }, 
      data: updateData 
    })`
);

fs.writeFileSync('src/actions/catalog.ts', code);
console.log('Fixed catalog.ts Ingredient');
