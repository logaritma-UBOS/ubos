import { prisma } from './src/lib/prisma';
async function main() {
  const sales = await prisma.sale.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { saleItems: true }
  });
  console.dir(sales, { depth: null });
}
main();
