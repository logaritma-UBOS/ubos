import { prisma } from './src/lib/prisma';
async function test() {
  const b = await prisma.business.findMany({ include: { user: true } });
  console.log(b.map(x => ({ id: x.id, name: x.name, email: x.user.email })));
}
test();
