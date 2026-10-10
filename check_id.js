const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const members = await prisma.teamMember.findMany();
  console.log(members.map(m => ({ id: m.id, email: m.email, name: m.name })));
}
run();
