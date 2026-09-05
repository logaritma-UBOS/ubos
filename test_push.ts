
import { prisma } from './src/lib/prisma';
async function main() {
  const revs = await prisma.ubosRevenue.findMany({ where: { status: 'PAID' } });
  const pIds = Array.from(new Set(revs.map(r => r.userId))).filter(Boolean);
  console.log('Premium User IDs:', pIds);
  
  if (pIds.length > 0) {
    for (const uid of pIds) {
      const notif = await prisma.ownerNotification.create({
        data: {
          recipientId: uid,
          segment: 'PREMIUM_USERS',
          trigger: 'MANUAL_BROADCAST',
          title: 'Terima Kasih atas Dukungan Anda!',
          message: 'Dukungan Anda membuat UBOS terus berkembang...',
          cta: 'Hubungi Support VIP',
          ctaUrl: '/bantuan',
          priority: 'MEDIUM',
          status: 'SENT'
        }
      });
      console.log('Created notif:', notif.id);
    }
  }
}
main();

