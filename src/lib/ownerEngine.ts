import { prisma } from "./prisma"
import { getStartOfDayUTC } from "./engines/timeEngine"

const OWNER_TZ = "Asia/Jakarta"

function getWeekBoundaries() {
  const now = new Date()
  const startOfToday = getStartOfDayUTC(OWNER_TZ, now)
  const startOfCurrent = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000)
  const startOfPrevious = new Date(startOfToday.getTime() - 14 * 24 * 60 * 60 * 1000)
  return { now, startOfToday, startOfCurrent, startOfPrevious }
}

export interface OwnerMetric {
  metric: string
  goal: string
  target: number
  actual: number
  gap: number
  gapPercentage: number
  severity: "LOW" | "MEDIUM" | "HIGH"
  where: string
  cause: string
  recommendation: string
  confidence: "LOW" | "MEDIUM" | "HIGH"
  actionType: string
  expectedResult: string
  measurementMetric: string
  status: string
  direction: "HIGHER_IS_BETTER" | "LOWER_IS_BETTER"
}

// ==========================================
// 1. RAW DATA
// ==========================================
async function collectRawData() {
  const { startOfToday, startOfCurrent, startOfPrevious } = getWeekBoundaries()

  const [
    totalUsers,
    totalBusinesses,
    users7d,
    activeEvents,
    allBusinesses,
    hppUsage,
    posUsage
  ] = await Promise.all([
    prisma.user.count(),
    prisma.business.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfCurrent, lt: startOfToday } } }),
    prisma.pilotEvent.findMany({ 
      where: { createdAt: { gte: startOfCurrent, lt: startOfToday } },
      select: { businessId: true }
    }),
    prisma.business.findMany({
      select: { id: true, products: { select: { id: true }, take: 1 }, ingredients: { select: { id: true }, take: 1 }, sales: { select: { id: true }, take: 1 } }
    }),
    prisma.pilotEvent.count({ where: { eventName: 'hpp_created' } }),
    prisma.pilotEvent.count({ where: { eventName: 'pos_transaction_completed' } })
  ])

  let businessesWithData = 0
  let businessesWithTx = 0
  
  for (const b of allBusinesses) {
    if (b.products.length > 0 || b.ingredients.length > 0) businessesWithData++
    if (b.sales.length > 0) businessesWithTx++
  }

  const activeBusinessesIds = [...new Set(activeEvents.map(e => e.businessId))].filter(Boolean)
  const weeklyActiveBusinesses = activeBusinessesIds.length

  // Revenue (Merchant Intelligence)
  const [currentAgg, previousAgg] = await Promise.all([
    prisma.sale.aggregate({ where: { createdAt: { gte: startOfCurrent, lt: startOfToday } }, _sum: { totalAmount: true }, _count: true }),
    prisma.sale.aggregate({ where: { createdAt: { gte: startOfPrevious, lt: startOfCurrent } }, _sum: { totalAmount: true }, _count: true })
  ])

  const settings = await prisma.systemSetting.findMany({
    where: { key: { in: ["owner_target_registered_users", "owner_target_activated_users", "owner_target_paid_users", "owner_revenue_target_weekly"] } }
  })
  
  const getTarget = (key: string) => {
    const s = settings.find(s => s.key === key)
    const val = s ? parseFloat(s.value) : NaN
    return (!isNaN(val) && val > 0) ? val : null
  }

  return {
    raw: { totalUsers, totalBusinesses, users7d, weeklyActiveBusinesses, businessesWithData, businessesWithTx, hppUsage, posUsage, currentAgg, previousAgg },
    targets: {
      registered: getTarget("owner_target_registered_users"),
      activated: getTarget("owner_target_activated_users"),
      paid: getTarget("owner_target_paid_users"),
      revenueWeekly: getTarget("owner_revenue_target_weekly")
    }
  }
}

// ==========================================
// 2. DATA CONFIDENCE
// ==========================================
function evaluateDataConfidence(actual: number, baselineRequired: number): "LOW" | "MEDIUM" | "HIGH" {
  if (actual >= baselineRequired * 2) return "HIGH"
  if (actual >= baselineRequired) return "MEDIUM"
  return "LOW"
}

// ==========================================
// 3. GAP CALCULATION
// ==========================================
function calculateGap(target: number | null, actual: number, direction: "HIGHER_IS_BETTER" | "LOWER_IS_BETTER") {
  if (target === null) return null
  return direction === "HIGHER_IS_BETTER" ? target - actual : actual - target
}

// ==========================================
// 4. METRICS & ENGINE
// ==========================================
export async function runOwnerEngine(): Promise<OwnerMetric[]> {
  const data = await collectRawData()
  const { raw, targets } = data
  const analysis: OwnerMetric[] = []

  // Helper to push recommendation
  const pushRec = (metric: string, goal: string, target: number, actual: number, direction: "HIGHER_IS_BETTER"|"LOWER_IS_BETTER", confidence: "LOW"|"MEDIUM"|"HIGH", severity: "LOW"|"MEDIUM"|"HIGH", where: string, cause: string, recommendation: string, actionType: string, expectedResult: string) => {
    const gap = calculateGap(target, actual, direction) || 0
    analysis.push({
      metric, goal, target, actual, gap, gapPercentage: Math.round((gap / target) * 100),
      severity, where, cause, recommendation, confidence, actionType, expectedResult, measurementMetric: metric, status: "RECOMMENDED", direction
    })
  }

  // A. Activation (Registered -> Business)
  const targetActivation = targets.activated ?? Math.round(raw.totalUsers * 0.6)
  const gapActivation = targetActivation - raw.totalBusinesses
  if (raw.totalUsers > 0 && gapActivation > 0) {
    const conf = evaluateDataConfidence(raw.totalUsers, 20)
    const ratio = raw.totalBusinesses / raw.totalUsers
    pushRec(
      "Activation (Register -> Biz)", "Mencapai target bisnis aktif", targetActivation, raw.totalBusinesses, "HIGHER_IS_BETTER", conf,
      ratio < 0.3 ? "HIGH" : "MEDIUM", "Onboarding Flow",
      "Banyak user berhenti setelah login pertama kali.",
      "Sederhanakan form pembuatan bisnis.",
      "UI_IMPROVEMENT",
      "Activation rate meningkat mendekati target."
    )
  }

  // B. First Data (Business -> Data)
  const targetData = Math.round(raw.totalBusinesses * 0.7)
  const gapData = targetData - raw.businessesWithData
  if (raw.totalBusinesses > 0 && gapData > 0) {
    const conf = evaluateDataConfidence(raw.totalBusinesses, 20)
    const ratio = raw.businessesWithData / raw.totalBusinesses
    pushRec(
      "First Data Input", "Bisnis memasukkan data produk/bahan", targetData, raw.businessesWithData, "HIGHER_IS_BETTER", conf,
      ratio < 0.4 ? "HIGH" : "MEDIUM", "Katalog / Dashboard",
      "Dashboard kosong membuat user bingung.",
      "Munculkan Setup Wizard saat dashboard kosong.",
      "ONBOARDING_WIZARD",
      "First Data rate naik ke 70%"
    )
  }

  // C. POS Feature Engagement
  const targetPos = Math.round(raw.hppUsage * 0.5)
  if (raw.hppUsage > 10 && raw.posUsage < targetPos) {
    const conf = evaluateDataConfidence(raw.hppUsage, 50)
    pushRec(
      "HPP to POS Conversion", "POS usage minimal 50% dari HPP usage", targetPos, raw.posUsage, "HIGHER_IS_BETTER", conf,
      raw.posUsage < (targetPos * 0.5) ? "HIGH" : "MEDIUM", "HPP Result Page",
      "User menganggap UBOS lebih sebagai kalkulator daripada sistem kasir.",
      "Tampilkan edukasi POS setelah HPP selesai.",
      "FEATURE_PROMPT",
      "POS usage meningkat"
    )
  }

  // D. Weekly Retention
  const targetRet = Math.round(raw.totalBusinesses * 0.3)
  if (raw.totalBusinesses > 0 && raw.weeklyActiveBusinesses < targetRet) {
    const conf = evaluateDataConfidence(raw.totalBusinesses, 20)
    pushRec(
      "Weekly Active Businesses", "30% bisnis aktif mingguan", targetRet, raw.weeklyActiveBusinesses, "HIGHER_IS_BETTER", conf,
      "HIGH", "App Retention",
      "Kurang trigger eksternal untuk kembali ke app.",
      "Kirim reminder laporan mingguan via notifikasi.",
      "CRM_CAMPAIGN",
      "Weekly Active Users naik"
    )
  }

  // E. Merchant Sales (Revenue Mingguan) - Move to Merchant Intelligence internally
  const curRev = raw.currentAgg._sum.totalAmount ?? 0
  const prevRev = raw.previousAgg._sum.totalAmount ?? 0
  if (raw.currentAgg._count > 0 || targets.revenueWeekly !== null) {
    const hasTarget = targets.revenueWeekly !== null
    const gapRev = hasTarget ? targets.revenueWeekly! - curRev : 0
    const trend = prevRev > 0 ? ((curRev - prevRev) / prevRev) * 100 : null

    let shouldRec = false
    let severity: "LOW" | "MEDIUM" | "HIGH" = "LOW"
    let cause = ""
    let rec = ""

    if (hasTarget && gapRev > 0) {
      shouldRec = true
      severity = gapRev / targets.revenueWeekly! > 0.3 ? "HIGH" : "MEDIUM"
      cause = "Revenue 7 hari kurang dari target mingguan."
      rec = "Dorong aktivitas POS merchant untuk tutup gap."
    } else if (trend !== null && trend < -5) {
      shouldRec = true
      severity = trend < -20 ? "HIGH" : "MEDIUM"
      cause = "Revenue 7 hari turun \% dari periode sebelumnya."
      rec = "Lakukan re-engagement bisnis yang turun transaksinya."
    }

    if (shouldRec) {
      pushRec(
        "Revenue Mingguan", hasTarget ? "Mencapai target revenue mingguan" : "Melampaui revenue minggu lalu",
        hasTarget ? targets.revenueWeekly! : prevRev, curRev, "HIGHER_IS_BETTER",
        evaluateDataConfidence(raw.currentAgg._count, 10), severity, "POS / Kasir",
        cause, rec, "REVENUE_RECOVERY", "Revenue stabil/naik"
      )
    }
  }

  return analysis
}

export interface RevenueSnapshot {
  currentPeriodRevenue: number
  previousPeriodRevenue: number
  allTimeRevenue: number
  totalTransactions: number
  currentPeriodTransactions: number
  previousPeriodTransactions: number
  avgTransactionValue: number
  periodLabel: string
}

export async function getRevenueSnapshot(): Promise<RevenueSnapshot> {
  const { startOfToday, startOfCurrent, startOfPrevious } = getWeekBoundaries()

  const [currentAgg, previousAgg, allTimeAgg, currentCount, previousCount, allTimeCount] = await Promise.all([
    prisma.sale.aggregate({ where: { createdAt: { gte: startOfCurrent, lt: startOfToday } }, _sum: { totalAmount: true } }),
    prisma.sale.aggregate({ where: { createdAt: { gte: startOfPrevious, lt: startOfCurrent } }, _sum: { totalAmount: true } }),
    prisma.sale.aggregate({ _sum: { totalAmount: true } }),
    prisma.sale.count({ where: { createdAt: { gte: startOfCurrent, lt: startOfToday } } }),
    prisma.sale.count({ where: { createdAt: { gte: startOfPrevious, lt: startOfCurrent } } }),
    prisma.sale.count(),
  ])

  const allTimeRevenue = allTimeAgg._sum.totalAmount ?? 0
  return {
    currentPeriodRevenue: currentAgg._sum.totalAmount ?? 0,
    previousPeriodRevenue: previousAgg._sum.totalAmount ?? 0,
    allTimeRevenue,
    totalTransactions: allTimeCount,
    currentPeriodTransactions: currentCount,
    previousPeriodTransactions: previousCount,
    avgTransactionValue: allTimeCount > 0 ? Math.round(allTimeRevenue / allTimeCount) : 0,
    periodLabel: "7 Hari Terakhir (WIB)"
  }
}
