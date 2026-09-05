
import { prisma } from './src/lib/prisma';
async function main() {
  const users = await prisma.user.findMany({ take: 2 });
  if (users.length === 0) { console.log('No users found in SQLite'); return; }
  for (const user of users) {
    const existing = await prisma.ubosRevenue.findFirst({ where: { userId: user.id } });
    if (!existing) {
      await prisma.ubosRevenue.create({
        data: {
          userId: user.id,
          mayarTrxId: 'trx_' + Math.random().toString(),
          amount: 50000,
          status: 'PAID'
        }
      });
      console.log('Seeded VIP', user.email);
    } else {
      console.log('Already VIP', user.email);
    }
  }
}
main();

