import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    

    const user = await prisma.user.findUnique({ where: { email: "logaritma.tim@gmail.com" } });
    if (!user) return NextResponse.json({ isVIP: false });

    const payment = await prisma.ubosRevenue.findFirst({
      where: { userId: user.id, status: "PAID" }
    });

    return NextResponse.json({ isVIP: !!payment });
  } catch (error) {
    return NextResponse.json({ isVIP: false });
  }
}
