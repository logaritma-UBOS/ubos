import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ isVIP: false });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ isVIP: false });

    const payment = await prisma.ubosRevenue.findFirst({
      where: { userId: user.id, status: "PAID" }
    });

    return NextResponse.json({ isVIP: !!payment });
  } catch (error) {
    return NextResponse.json({ isVIP: false });
  }
}
