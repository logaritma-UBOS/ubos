import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import * as dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db',
  authToken: process.env.TURSO_AUTH_TOKEN
})

const prisma = new PrismaClient({ adapter })

async function main() {
  const members = [
    { email: "logaritma.tim@gmail.com", name: "Baim", role: "SUPER_ADMIN" as any, sharePercentage: 40 },
    { email: "tony@logaritma.id", name: "Tony", role: "METHODOLOGY" as any, sharePercentage: 25 },
    { email: "reza@logaritma.id", name: "Reza", role: "DEVELOPER" as any, sharePercentage: 20 },
    { email: "bana@logaritma.id", name: "Bana", role: "OPERATIONS" as any, sharePercentage: 15 },
  ];

  for (const m of members) {
    await prisma.teamMember.upsert({
      where: { email: m.email },
      update: m,
      create: m
    });
  }
  console.log("Team seeded successfully");
}

main().finally(() => prisma.$disconnect());
