import { prisma } from './src/lib/prisma'; async function main() { await prisma.user.updateMany({ where: { phone: '' }, data: { phone: '085175150408' } }); console.log('Done'); } main();
