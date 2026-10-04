const fs = require('fs');

let pageCode = fs.readFileSync('src/app/(dashboard)/stok/page.tsx', 'utf8');
pageCode = pageCode.replace(
  `product: { select: { name: true } },`,
  `product: { select: { name: true, supplierId: true } },`
);
pageCode = pageCode.replace(
  `ingredient: { select: { name: true, unit: true } },`,
  `ingredient: { select: { name: true, unit: true, supplierId: true } },`
);
fs.writeFileSync('src/app/(dashboard)/stok/page.tsx', pageCode);
console.log("Updated page.tsx");

let clientCode = fs.readFileSync('src/app/(dashboard)/stok/StokClient.tsx', 'utf8');

const oldFunc = `  const getSupplierName = (m: any) => {
    if (m.supplier?.name) return m.supplier.name;
    const finalSupplierId = m.productId 
      ? products.find((p: any) => p.id === m.productId)?.supplierId 
      : ingredients.find((i: any) => i.id === m.ingredientId)?.supplierId;
    if (finalSupplierId) {
      return suppliers.find((s: any) => s.id === finalSupplierId)?.name || "-";
    }
    return "-";
  };`;

const newFunc = `  const getSupplierName = (m: any) => {
    if (m.supplier?.name) return m.supplier.name;
    const finalSupplierId = m.product?.supplierId || m.ingredient?.supplierId;
    if (finalSupplierId) {
      return suppliers.find((s: any) => s.id === finalSupplierId)?.name || "-";
    }
    return "-";
  };`;

clientCode = clientCode.replace(oldFunc, newFunc);

const oldQty = `{m.type === "IN" ? "+" : "-"}{m.quantity}`;
const newQty = `{m.type === "IN" ? "+" : "-"}{Math.abs(m.quantity)}`;
clientCode = clientCode.replace(oldQty, newQty);

fs.writeFileSync('src/app/(dashboard)/stok/StokClient.tsx', clientCode);
console.log("Updated StokClient.tsx");
