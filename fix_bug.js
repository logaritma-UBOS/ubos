const fs = require('fs');
let code = fs.readFileSync('src/actions/catalog.ts', 'utf8');

// Fix editProduct
code = code.replace(
  `const updateData: any = { 
      name, 
      sellPrice,
      supplierId: (formData.get("supplierId") as string) || null
    };`,
  `const updateData: any = { 
      name, 
      sellPrice,
    };
    if (formData.has("supplierId")) {
      updateData.supplierId = (formData.get("supplierId") as string) || null;
    }`
);

// Do the same for editIngredient just in case it ever gets conditionally rendered
code = code.replace(
  `const supplierId = formData.get("supplierId") as string;
    await prisma.ingredient.update({ 
      where: { id }, 
      data: { 
        unit, 
        costPerUnit, 
        currentStock,
        supplierId: supplierId || null 
      } 
    })`,
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
console.log('Fixed catalog.ts');
