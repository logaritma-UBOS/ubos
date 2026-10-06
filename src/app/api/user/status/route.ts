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

    // Cari status VIP dengan memprioritaskan yang tahunan jika ada banyak
    const payments = await prisma.ubosRevenue.findMany({
      where: { userId: targetUserId, status: "PAID" },
      orderBy: { createdAt: "desc" }
    });

    const isVIP = payments.length > 0;
    let tier = "Starter";
    
    if (isVIP) {
      // Jika ada salah satu riwayat pembayaran yang mengandung TAHUNAN
      const hasTahunan = payments.some(p => p.paymentMethod && p.paymentMethod.includes("PRO_TAHUNAN"));
      tier = hasTahunan ? "Pro Tahunan" : "Pro Bulanan";
    }

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