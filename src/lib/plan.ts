import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getUserPlan() {
  const session = await auth();
  if (!session?.user?.email) return "STARTER";

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return "STARTER";

  if (user.email === "warunkarsi23@gmail.com") return "LIFETIME";

  const lifetimePayment = await prisma.ubosRevenue.findFirst({
    where: { userId: user.id, status: "PAID", amount: { gte: 399000 } }
  });
  if (lifetimePayment) return "LIFETIME";

  const yearlyPayment = await prisma.ubosRevenue.findFirst({
    where: { 
      userId: user.id, 
      status: "PAID", 
      amount: { gte: 349000, lt: 399000 },
      createdAt: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
    }
  });
  if (yearlyPayment) return "PRO";

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyPayment = await prisma.ubosRevenue.findFirst({
    where: { 
      userId: user.id, 
      status: "PAID",
      createdAt: { gte: firstDayOfMonth }
    }
  });
  if (monthlyPayment) return "PRO";

  return "STARTER";
}
