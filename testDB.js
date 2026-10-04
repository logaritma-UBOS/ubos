const { PrismaClient } = require('@prisma/client');

async function test() {
  const prisma = new PrismaClient();
  const sales = await prisma.sale.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { saleItems: true }
  });
  console.dir(sales, { depth: null });
}

test();
