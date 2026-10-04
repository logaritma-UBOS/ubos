const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const sales = await prisma.sale.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { saleItems: true }
  });
  console.dir(sales, { depth: null });
}

check().catch(console.error).finally(() => prisma.$disconnect());
