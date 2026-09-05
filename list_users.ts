import { prisma } from './src/lib/prisma';
async function main() {
  const users = await prisma.user.findMany();
  console.log(users.map(u => ({ email: u.email, name: u.name, phone: u.phone })));
}
main();