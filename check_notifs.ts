
import { prisma } from './src/lib/prisma';
async function main() {
  const u = await prisma.user.findUnique({where:{email:'warunkarsi23@gmail.com'}}); 
  if(!u) return console.log('User not found');
  const revs = await prisma.ubosRevenue.findMany({where:{userId: u.id}}); 
  const notifs = await prisma.ownerNotification.findMany({where:{recipientId: u.id}}); 
  console.log('User:', u.id, 'Revs:', revs.length, 'Notifs:', notifs.length); 
}
main();

