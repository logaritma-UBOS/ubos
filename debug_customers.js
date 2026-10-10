const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const campaigns = await prisma.campaign.findMany();
    console.log('Campaigns:', campaigns.slice(-2));
    const customers = await prisma.customer.findMany();
    console.log('Customers:', customers);
}
main().catch(console.error).finally(() => prisma.$disconnect());
