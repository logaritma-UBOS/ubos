import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rawDonors = await prisma.ubosRevenue.findMany({
      where: { status: "PAID" },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        userId: true,
        amount: true
      }
    });
    
    const donors = await Promise.all(rawDonors.map(async (d) => {
      const user = await prisma.user.findUnique({ where: { id: d.userId } });
      return {
        name: user?.name || user?.email?.split('@')[0] || "Hamba Allah",
        amount: d.amount
      };
    }));

    return NextResponse.json(donors);
  } catch (error) {
    return NextResponse.json([]);
  }
}
