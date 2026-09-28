import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ isAuthenticated: false, plan: "STARTER", isVIP: false, hasPhone: false });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ isAuthenticated: true, plan: "STARTER", isVIP: false, hasPhone: false });

    if (user.email === "warunkarsi23@gmail.com") {
      return NextResponse.json({ isAuthenticated: true, plan: "LIFETIME", isVIP: true, hasPhone: !!user.phone });
    }

    const lifetimePayment = await prisma.ubosRevenue.findFirst({
      where: { userId: user.id, status: "PAID", amount: { gte: 399000 } }
    });

    if (lifetimePayment) {
      return NextResponse.json({ isAuthenticated: true, plan: "LIFETIME", isVIP: true, hasPhone: !!user.phone });
    }

    const yearlyPayment = await prisma.ubosRevenue.findFirst({
      where: { 
        userId: user.id, 
        status: "PAID", 
        amount: { gte: 349000, lt: 399000 },
        createdAt: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
      }
    });

    if (yearlyPayment) {
      return NextResponse.json({ isAuthenticated: true, plan: "PRO", isVIP: true, hasPhone: !!user.phone });
    }

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyPayment = await prisma.ubosRevenue.findFirst({
      where: { 
        userId: user.id, 
        status: "PAID",
        createdAt: { gte: firstDayOfMonth }
      }
    });

    if (monthlyPayment) {
      return NextResponse.json({ isAuthenticated: true, plan: "PRO", isVIP: true, hasPhone: !!user.phone });
    }

    return NextResponse.json({ isAuthenticated: true, plan: "STARTER", isVIP: false, hasPhone: !!user.phone });
  } catch (error) {
    return NextResponse.json({ isAuthenticated: false, plan: "STARTER", isVIP: false, hasPhone: false });
  }
}