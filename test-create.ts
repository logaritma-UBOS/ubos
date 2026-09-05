import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  try {
    const res = await prisma.ownerCampaign.create({
      data: {
        name: "Test Name",
        channel: "INSTAGRAM",
        message: "Test Message",
        startAt: new Date(),
        status: "DRAFT",
        objective: 'SOCIAL_MEDIA',
        targetSegment: 'PUBLIC',
        author: "Pilot Admin"
      }
    })
    console.log("Success:", res)
  } catch (err: any) {
    console.error("Error:", err.message)
  }
}

main().finally(() => prisma.$disconnect())
