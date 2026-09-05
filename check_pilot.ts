import { prisma } from './src/lib/prisma';
async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'logaritma.tim@gmail.com' }, include: { businesses: true } });
  console.log(user);
}
main();