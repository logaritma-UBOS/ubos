"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { getUserPlan } from "@/lib/plan"

export async function getTransactionHistory() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized", data: [] }
  
  const business = await prisma.business.findFirst({ where: { userId: session.user.id } })
  if (!business) return { error: "Business not found", data: [] }

  const plan = await getUserPlan()
  
  let dateFilter = {}
  if (plan === "STARTER") {
    // Limit history to last 7 days for Starter
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    dateFilter = { createdAt: { gte: sevenDaysAgo } }
  }

  const sales = await prisma.sale.findMany({
    where: { 
      businessId: business.id,
      ...dateFilter
    },
    include: {
      saleItems: {
        include: {
          product: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: plan === "STARTER" ? 100 : 500
  })

  return { success: true, data: sales }
}
