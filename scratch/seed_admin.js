const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'logaritma.tim@gmail.com';
  const password = 'adminlog2026';
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: 'OWNER' },
    create: {
      email,
      name: 'Pilot Admin',
      passwordHash,
      role: 'OWNER',
    },
  });
  console.log('Admin user seeded locally!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
