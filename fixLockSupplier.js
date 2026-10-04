const fs = require('fs');
let code = fs.readFileSync('src/actions/inventory.ts', 'utf8');

// For recordStockMovement ingredient
code = code.replace(
  `...(data.supplierId && data.type === "IN" ? { supplierId: data.supplierId } : {})`,
  `...(data.supplierId && data.type === "IN" && !item.supplierId ? { supplierId: data.supplierId } : {})`
);

// For recordStockMovement product
code = code.replace(
  `...(data.supplierId && data.type === "IN" ? { supplierId: data.supplierId } : {})`,
  `...(data.supplierId && data.type === "IN" && !item.supplierId ? { supplierId: data.supplierId } : {})`
);

// For recordBulkStockMovement ingredient
code = code.replace(
  `...(data.supplierId && data.type === "IN" ? { supplierId: data.supplierId } : {})`,
  `...(data.supplierId && data.type === "IN" && !item.supplierId ? { supplierId: data.supplierId } : {})`
);

// For recordBulkStockMovement product
code = code.replace(
  `...(data.supplierId && data.type === "IN" ? { supplierId: data.supplierId } : {})`,
  `...(data.supplierId && data.type === "IN" && !item.supplierId ? { supplierId: data.supplierId } : {})`
);

fs.writeFileSync('src/actions/inventory.ts', code);
console.log("Updated inventory.ts");
