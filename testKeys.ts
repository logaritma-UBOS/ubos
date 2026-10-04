import { PrismaClient } from '@prisma/client';

async function test() {
  const prisma = new PrismaClient();
  const m = await prisma.stockMovement.findFirst({
    include: {
      product: { select: { name: true } }
    }
  });
  console.log("Movement keys:", m ? Object.keys(m) : "None");
}
test();
