
import { prisma } from './src/lib/prisma';
async function main() {
  await prisma.user.updateMany({ data: { phone: null } });
  console.log('All local users now have NO phone number (for testing Interceptor).');
}
main();

