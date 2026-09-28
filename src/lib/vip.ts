import { prisma } from "@/lib/prisma";

export async function checkIsVIP(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return false;

  const userRole = user.role;
  const PERMANENT_VIPS = ["warunkarsi23@gmail.com"];
  
  if (PERMANENT_VIPS.includes(user.email || "")) return true;
  if (userRole === "VIP" || userRole === "PREMIUM" || userRole === "SUPER_ADMIN") return true;

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const payment = await prisma.ubosRevenue.findFirst({
    where: { 
      userId: user.id, 
      status: "PAID",
      createdAt: { gte: firstDayOfMonth }
    }
  });

  return !!payment;
}
