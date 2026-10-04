const fs = require('fs');
let code = fs.readFileSync('src/app/(dashboard)/stok/StokClient.tsx', 'utf8');

const targetFunction = `  const handleSaveStock = async () => {`;
const helperFunction = `  const getSupplierName = (m: any) => {
    if (m.supplier?.name) return m.supplier.name;
    const finalSupplierId = m.productId 
      ? products.find((p: any) => p.id === m.productId)?.supplierId 
      : ingredients.find((i: any) => i.id === m.ingredientId)?.supplierId;
    if (finalSupplierId) {
      return suppliers.find((s: any) => s.id === finalSupplierId)?.name || "-";
    }
    return "-";
  };

  const handleSaveStock = async () => {`;

code = code.replace(targetFunction, helperFunction);

const oldTd = `<td className="p-4 text-gray-600">{m.supplier?.name || "-"}</td>`;
const newTd = `<td className="p-4 text-gray-600">{getSupplierName(m)}</td>`;
code = code.replace(oldTd, newTd);

fs.writeFileSync('src/app/(dashboard)/stok/StokClient.tsx', code);
console.log("Updated StokClient successfully");
