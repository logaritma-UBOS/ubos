import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const updates = [
      { email: "mhariyadisaputra20@gmail.com", amount: 25000 },
      { email: "rosadimanansite@gmail.com", amount: 25000 },
      { email: "nengnia2409@gmail.com", amount: 25000 },
      { email: "iyosrosidah59@gmail.com", amount: 25000 },
      { email: "suryadarma889@gmail.com", amount: 25000 },
      { email: "nuraisyah.nr77@gmail.com", amount: 25000 },
      { email: "sabrinann23@gmail.com", amount: 25000 },
      { email: "naifimut059@gmail.com", amount: 25000 },
      { email: "reza0809@gmail.com", amount: 50000 },
      { email: "jubaharfadly@gmail.com", amount: 25000 },
      { email: "bintangtory08@gmail.com", amount: 100000 }
    ];

    const results = [];
    for (const u of updates) {
      const user = await prisma.user.findFirst({ where: { email: { contains: u.email.split('@')[0] } } });
      if (user) {
        const res = await prisma.ubosRevenue.updateMany({
          where: { userId: user.id },
          data: { amount: u.amount }
        });
        results.push({ email: u.email, count: res.count });
      }
    }
    
    return NextResponse.json({ success: true, results })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message })
  }
}

