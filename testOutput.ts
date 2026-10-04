import { prisma } from './src/lib/prisma';

async function test() {
  const movements = await prisma.stockMovement.findMany({
    orderBy: { date: 'desc' },
    take: 5,
    include: {
      product: { select: { name: true, supplierId: true } },
      ingredient: { select: { name: true, unit: true, supplierId: true } },
      supplier: { select: { name: true } }
    }
  });
  
  for (const m of movements) {
     console.log(`Item: ${m.product?.name || m.ingredient?.name}, type: ${m.type}, qty: ${m.quantity}, m.productId: ${m.productId}, product.supplierId: ${m.product?.supplierId}, m.supplier: ${m.supplier?.name}`);
  }
}
test();
