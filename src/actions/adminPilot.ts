"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// Secure Authorization Check
async function authorizeAdmin() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized: No session")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized: Insufficient permissions")
  }
}

export async function getPilotDashboardData() {
  await authorizeAdmin()

  // 1. Funnel & Event Aggregation
  // Using groupBy is much more efficient than fetching all rows
  const eventCounts = await prisma.pilotEvent.groupBy({
    by: ['eventName'],
    _count: {
      _all: true
    }
  })

  const eventMap = Object.fromEntries(eventCounts.map(e => [e.eventName, e._count._all]))

  // 2. Active Tenants (Count of unique businesses in PilotEvents)
  // SQLite Prisma doesn't support distinct in aggregate count directly easily in all versions, 
  // so we fetch distinct businessIds efficiently
  const distinctTenants = await prisma.pilotEvent.findMany({
    select: { businessId: true },
    distinct: ['businessId']
  })
  const activeTenantsCount = distinctTenants.length

  // 3. Error & Feedback Counts
  const errorCount = await prisma.pilotError.count()
  const feedbackCount = await prisma.pilotFeedback.count()

  // 4. Recent Activity (Top 20)
  const recentEvents = await prisma.pilotEvent.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: { business: { select: { name: true } } }
  })

  // 5. Recent Errors (Top 20)
  const recentErrors = await prisma.pilotError.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: { business: { select: { name: true } } }
  })

  // 6. Recent Feedbacks (Top 20)
  const recentFeedbacks = await prisma.pilotFeedback.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: { business: { select: { name: true } } }
  })

  return {
    metrics: {
      activeTenants: activeTenantsCount,
      transactions: eventMap['pos_transaction_completed'] || 0,
      productsCreated: eventMap['product_created'] || 0,
      hppCreated: eventMap['hpp_created'] || 0,
      businessInsightViews: eventMap['business_insight_viewed'] || 0,
      inventoryEvents: eventMap['catalog_updated'] || 0,
      errors: errorCount,
      feedback: feedbackCount
    },
    funnel: {
      dashboardViewed: eventMap['dashboard_viewed'] || 0,
      productCreated: eventMap['product_created'] || 0,
      hppCreated: eventMap['hpp_created'] || 0,
      posTransaction: eventMap['pos_transaction_completed'] || 0,
      insightViewed: eventMap['business_insight_viewed'] || 0
    },
    recentEvents,
    recentErrors,
    recentFeedbacks
  }
}
