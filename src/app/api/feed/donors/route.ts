import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const donors = await prisma.ubosRevenue.findMany({
      where: { status: "PAID" },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        name: true,
        amount: true
      }
    });
    return NextResponse.json(donors);
  } catch (error) {
    return NextResponse.json([]);
  }
}
