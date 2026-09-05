import { prisma } from './src/lib/prisma';
async function run() {
  const p = await prisma.product.findFirst({ where: { name: 'Bacang Daging' } });
  console.log('SUPPLIER:', p?.supplierId);
}
run();
