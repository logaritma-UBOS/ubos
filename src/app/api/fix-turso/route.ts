import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const updates = [
      { name: "Aisyah Nur Rahmawita", amount: 25000 },
      { name: "Reza Triansyah", amount: 50000 },
      { name: "Fadly", amount: 25000 },
      { name: "Sri Widiana", amount: 25000 },
      { name: "Nany Kurniawati", amount: 25000 },
      { name: "Nany Kurnia", amount: 25000 }
    ];

    const results = [];
    for (const u of updates) {
      const users = await prisma.user.findMany({ where: { name: { contains: u.name } } });
      for (const user of users) {
        const res = await prisma.ubosRevenue.updateMany({
          where: { userId: user.id },
          data: { amount: u.amount }
        });
        results.push({ name: user.name, count: res.count });
      }
    }
    
    return NextResponse.json({ success: true, results })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message })
  }
}

