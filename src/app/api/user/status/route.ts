import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ isAuthenticated: false, isVIP: false, hasPhone: false });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ isAuthenticated: true, isVIP: false, hasPhone: false });

    // Pengecualian Khusus (Permanent VIP)
    const PERMANENT_VIPS = ["warunkarsi23@gmail.com"];
    if (PERMANENT_VIPS.includes(user.email)) {
      return NextResponse.json({ 
        isAuthenticated: true, 
        isVIP: true,
        hasPhone: !!user.phone
      });
    }

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const payment = await prisma.ubosRevenue.findFirst({
      where: { 
        userId: user.id, 
        status: "PAID",
        createdAt: {
          gte: firstDayOfMonth
        }
      }
    });

    return NextResponse.json({ 
      isAuthenticated: true, 
      isVIP: !!payment,
      hasPhone: !!user.phone
    });
  } catch (error) {
    return NextResponse.json({ isAuthenticated: false, isVIP: false, hasPhone: false });
  }
}