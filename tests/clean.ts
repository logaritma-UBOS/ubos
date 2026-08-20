import { prisma } from "../src/lib/prisma"

async function clean() {
  await prisma.user.deleteMany({ where: { email: 'pilot@test.com' } })
  console.log("Done cleaning user")
}

clean().catch(console.error).finally(() => process.exit(0))
