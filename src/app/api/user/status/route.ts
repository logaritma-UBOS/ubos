import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ isAuthenticated: false, isVIP: false });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ isAuthenticated: true, isVIP: false });

    const payment = await prisma.ubosRevenue.findFirst({
      where: { userId: user.id, status: "PAID" }
    });

    return NextResponse.json({ isAuthenticated: true, isVIP: !!payment });
  } catch (error) {
    return NextResponse.json({ isAuthenticated: false, isVIP: false });
  }
}
