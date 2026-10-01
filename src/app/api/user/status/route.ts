import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ isAuthenticated: false, isVIP: false, tier: "Starter", hasPhone: false });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ isAuthenticated: true, isVIP: false, tier: "Starter", hasPhone: false });

    
    
    let targetUserId = user.id;
    let targetEmail = user.email;

    if ((session.user as any).staffBusinessId) {
       const business = await prisma.business.findUnique({
          where: { id: (session.user as any).staffBusinessId },
          include: { user: true }
       });
       if (business && business.user) {
          targetUserId = business.user.id;
          targetEmail = business.user.email;
       }
    }

    // Pengecualian Khusus (Permanent VIP / Lifetime)
    const PERMANENT_VIPS = ["warunkarsi23@gmail.com"];
    if (PERMANENT_VIPS.includes(targetEmail)) {
      return NextResponse.json({ 
        isAuthenticated: true, 
        isVIP: true,
        tier: "Lifetime",
        hasPhone: !!user.phone || user.role === "KASIR" || user.role === "MANAGER"
      });
    }

    const payment = await prisma.ubosRevenue.findFirst({
      where: { userId: targetUserId, status: "PAID"
      }
    });

    const isVIP = !!payment;
    const tier = isVIP ? "Pro Bulanan" : "Starter";

    return NextResponse.json({ 
      isAuthenticated: true, 
      isVIP: isVIP,
      tier: tier,
      hasPhone: !!user.phone || user.role === "KASIR" || user.role === "MANAGER"
    });
  } catch (error) {
    return NextResponse.json({ isAuthenticated: false, isVIP: false, tier: "Starter", hasPhone: false });
  }
}