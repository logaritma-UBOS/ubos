import { prisma } from './src/lib/prisma';
async function main() {
  const users = await prisma.user.findMany({ where: { phone: '' } });
  for (let i = 0; i < users.length; i++) {
    await prisma.user.update({ where: { id: users[i].id }, data: { phone: '08517515040' + i } });
  }
  console.log('Updated ' + users.length + ' empty phones.');
}
main();