import { prisma } from './src/lib/prisma';
async function run() {
  const b = await prisma.business.findFirst();
  if(!b) return;
  const s = await prisma.supplier.create({ data: { businessId: b.id, name: 'Test Supplier' } });
  const p = await prisma.product.create({ 
    data: { 
      businessId: b.id, 
      name: 'Test Product', 
      sellPrice: 1000,
      supplierId: s.id
    } 
  });
  console.log('Created product supplierId:', p.supplierId);
  const p2 = await prisma.product.findUnique({ where: { id: p.id } });
  console.log('Fetched product supplierId:', p2?.supplierId);
}
run().finally(() => process.exit(0));
