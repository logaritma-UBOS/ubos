const fs = require('fs');

let posCode = fs.readFileSync('src/actions/pos.ts', 'utf8');

posCode = posCode.replace(/type: "OUT",\s*quantity: -qtyToReduce,/g, 'type: "SALE",\n                  quantity: -qtyToReduce,');
posCode = posCode.replace(/type: "OUT",\s*quantity: -item\.quantity,/g, 'type: "SALE",\n                quantity: -item.quantity,');

fs.writeFileSync('src/actions/pos.ts', posCode);
console.log("Updated pos.ts");
