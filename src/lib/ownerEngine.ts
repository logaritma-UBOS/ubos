import { prisma } from "./prisma"
import { getStartOfDayUTC } from "./engines/timeEngine"

// Owner Backend timezone (global — all merchants, WIB by convention)
const OWNER_TZ = "Asia/Jakarta"

/** Compute a 7-day rolling window boundary in WIB-aligned UTC */
function getWeekBoundaries() {
  const now = new Date()
  // "Now" aligned to WIB — but for rolling 7d window we subtract milliseconds,
  // not calendar days, so UTC offset doesn't affect the window width.
  // We DO want the "start of today" in WIB so reports are stable intra-day.
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

  // Use DB-level aggregation — avoids loading all rows into memory
  const [currentAgg, previousAgg, allTimeAgg, currentCount, previousCount, allTimeCount] = await Promise.all([
    prisma.sale.aggregate({
      where: { createdAt: { gte: startOfCurrent, lt: startOfToday } },
      _sum: { totalAmount: true },
    }),
    prisma.sale.aggregate({
      where: { createdAt: { gte: startOfPrevious, lt: startOfCurrent } },
      _sum: { totalAmount: true },
    }),
    prisma.sale.aggregate({
      _sum: { totalAmount: true },
    }),
    prisma.sale.count({ where: { createdAt: { gte: startOfCurrent, lt: startOfToday } } }),
    prisma.sale.count({ where: { createdAt: { gte: startOfPrevious, lt: startOfCurrent } } }),
    prisma.sale.count(),
  ])

  const currentPeriodRevenue = currentAgg._sum.totalAmount ?? 0
  const previousPeriodRevenue = previousAgg._sum.totalAmount ?? 0
  const allTimeRevenue = allTimeAgg._sum.totalAmount ?? 0
  const avgTransactionValue = allTimeCount > 0
    ? Math.round(allTimeRevenue / allTimeCount)
    : 0

  return {
    currentPeriodRevenue,
    previousPeriodRevenue,
    allTimeRevenue,
    totalTransactions: allTimeCount,
    currentPeriodTransactions: currentCount,
    previousPeriodTransactions: previousCount,
    avgTransactionValue,
    periodLabel: "7 Hari Terakhir (WIB)"
  }
}

export async function runOwnerEngine(): Promise<OwnerMetric[]> {
  const { startOfToday, startOfCurrent, startOfPrevious } = getWeekBoundaries()
  const startOfWeek = startOfCurrent   // alias for readability
  const startOfPreviousWeek = startOfPrevious

  const totalUsers = await prisma.user.count()
  
  const activeBusinessesEvents = await prisma.pilotEvent.findMany({ 
    where: { createdAt: { gte: startOfWeek, lt: startOfToday } }, 
    select: { businessId: true } 
  })
  const activeBusinessesIds = [...new Set(activeBusinessesEvents.map(e => e.businessId))].filter(Boolean)
  const weeklyActiveBusinesses = activeBusinessesIds.length

  const allBusinesses = await prisma.business.findMany({
    include: {
      products: { select: { id: true } },
      ingredients: { select: { id: true } },
      sales: { select: { id: true } }
    }
  })
  
  const businessesCreated = allBusinesses.length
  let businessesWithData = 0
  let businessesWithTx = 0
  
  for (const b of allBusinesses) {
    if (b.products.length > 0 || b.ingredients.length > 0) businessesWithData++
    if (b.sales.length > 0) businessesWithTx++
  }

  const hppUsage = await prisma.pilotEvent.count({ where: { eventName: 'hpp_created' } })
  const posUsage = await prisma.pilotEvent.count({ where: { eventName: 'pos_transaction_completed' } })

  // Revenue: DB aggregation, no in-memory SUM
  const [currentAgg, previousAgg] = await Promise.all([
    prisma.sale.aggregate({
      where: { createdAt: { gte: startOfWeek, lt: startOfToday } },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.sale.aggregate({
      where: { createdAt: { gte: startOfPreviousWeek, lt: startOfWeek } },
      _sum: { totalAmount: true },
      _count: true,
    }),
  ])

  const currentRevenue = currentAgg._sum.totalAmount ?? 0
  const previousRevenue = previousAgg._sum.totalAmount ?? 0
  const currentTxCount = currentAgg._count
  const previousTxCount = previousAgg._count

  // Revenue target: SystemSetting only — no hardcoded default
  const revenueSetting = await prisma.systemSetting.findUnique({ where: { key: "owner_revenue_target_weekly" } })
  const rawTarget = revenueSetting ? parseFloat(revenueSetting.value) : NaN
  const revenueTarget: number | null = !isNaN(rawTarget) && rawTarget > 0 ? rawTarget : null

  const analysis: OwnerMetric[] = []

  // ─── METRIC 0: WEEKLY REVENUE INTELLIGENCE ───────────────────────────────
  // Trigger only when there's a real gap or a real negative trend
  if (currentTxCount > 0 || previousTxCount > 0 || revenueTarget !== null) {
    const hasTarget = revenueTarget !== null

    // gapBefore for HIGHER_IS_BETTER = target - actual (positive means below target)
    const gapBefore = hasTarget ? revenueTarget - currentRevenue : 0

    // Trend: safe against division by zero and zero-previous
    const revenueTrend: number | null = previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : (currentRevenue > 0 ? null : null)  // No comparison possible if prev = 0

    // Severity
    let severity: "LOW" | "MEDIUM" | "HIGH" = "LOW"
    if (hasTarget) {
      const gapRatio = gapBefore / revenueTarget
      if (gapRatio > 0.3) severity = "HIGH"
      else if (gapRatio > 0.1) severity = "MEDIUM"
      else severity = "LOW"
    } else if (revenueTrend !== null) {
      if (revenueTrend < -20) severity = "HIGH"
      else if (revenueTrend < -5) severity = "MEDIUM"
      else severity = "LOW"
    }

    // Confidence
    const confidence: "LOW" | "MEDIUM" | "HIGH" =
      currentTxCount >= 50 ? "HIGH" : currentTxCount >= 10 ? "MEDIUM" : "LOW"

    let recommendation = ""
    let cause = ""
    let expectedResult = ""

    if (hasTarget && gapBefore > 0) {
      const deficit = gapBefore
      const neededPerDay = Math.round(deficit / 7)
      cause = `Revenue 7 hari lebih rendah ${deficit.toLocaleString('id-ID')} dari target mingguan.`
      recommendation = `Dorong aktivitas POS di bisnis aktif. Butuh tambahan Rp ${neededPerDay.toLocaleString('id-ID')}/hari untuk menutup gap.`
      expectedResult = `Revenue 7 hari mendekati atau melampaui target Rp ${revenueTarget.toLocaleString('id-ID')}`
    } else if (revenueTrend !== null && revenueTrend < -5) {
      cause = `Revenue 7 hari (Rp ${currentRevenue.toLocaleString('id-ID')}) turun ${Math.abs(revenueTrend).toFixed(1)}% dari periode sebelumnya.`
      recommendation = `Cek bisnis yang aktif minggu lalu namun tidak transaksi minggu ini. Lakukan re-engagement via WhatsApp atau promo.`
      expectedResult = `Revenue kembali setara atau melampaui periode sebelumnya (Rp ${previousRevenue.toLocaleString('id-ID')})`
    } else {
      cause = ""
      recommendation = ""
      expectedResult = ""
    }

    const shouldRecommend = (hasTarget && gapBefore > 0) || (revenueTrend !== null && revenueTrend < -5)

    if (shouldRecommend) {
      analysis.push({
        metric: "Revenue Mingguan",
        goal: hasTarget
          ? `Revenue 7 hari mencapai target Rp ${revenueTarget.toLocaleString('id-ID')}`
          : `Revenue minggu ini melampaui periode sebelumnya`,
        target: hasTarget ? revenueTarget : previousRevenue,
        actual: currentRevenue,
        gap: hasTarget ? gapBefore : (currentRevenue - previousRevenue),
        gapPercentage: hasTarget
          ? Math.round((gapBefore / revenueTarget) * 100)
          : (revenueTrend !== null ? Math.round(revenueTrend) : 0),
        severity,
        where: "POS / Kasir — Seluruh Merchant",
        cause,
        recommendation,
        confidence,
        actionType: "REVENUE_RECOVERY",
        expectedResult,
        measurementMetric: "Revenue Mingguan",
        status: "RECOMMENDED",
        direction: "HIGHER_IS_BETTER"
      })
    }
  }

  // ─── METRIC 1: REGISTER -> BUSINESS CREATED ──────────────────────────────
  const targetActivation = Math.round(totalUsers * 0.6)
  const gapActivation = businessesCreated - targetActivation
  if (totalUsers > 0 && gapActivation < 0) {
    const ratio = businessesCreated / totalUsers
    analysis.push({
      metric: "Activation (Register → Biz)",
      goal: "Konversi registrasi ke pembuatan bisnis > 60%",
      target: targetActivation,
      actual: businessesCreated,
      gap: gapActivation,
      gapPercentage: Math.round((gapActivation / targetActivation) * 100),
      severity: ratio < 0.3 ? "HIGH" : "MEDIUM",
      where: "Onboarding Flow",
      cause: "Banyak user berhenti atau bingung setelah login pertama kali.",
      recommendation: "Sederhanakan form pembuatan bisnis (Business Creation).",
      confidence: totalUsers > 50 ? "HIGH" : "LOW",
      actionType: "UI_IMPROVEMENT",
      expectedResult: "Activation rate naik ke 60%",
      measurementMetric: "Activation (Register → Biz)",
      status: "RECOMMENDED",
      direction: "HIGHER_IS_BETTER"
    })
  }

  // ─── METRIC 2: BUSINESS CREATED -> FIRST DATA ────────────────────────────
  const targetData = Math.round(businessesCreated * 0.7)
  const gapData = businessesWithData - targetData
  if (businessesCreated > 0 && gapData < 0) {
    const ratio = businessesWithData / businessesCreated
    analysis.push({
      metric: "First Data Input",
      goal: "Konversi bisnis ke input data pertama > 70%",
      target: targetData,
      actual: businessesWithData,
      gap: gapData,
      gapPercentage: Math.round((gapData / targetData) * 100),
      severity: ratio < 0.4 ? "HIGH" : "MEDIUM",
      where: "Katalog / Dashboard",
      cause: "Kosongnya dashboard membuat user bingung apa yang harus di-klik selanjutnya.",
      recommendation: "Munculkan Setup Wizard atau dummy product saat dashboard kosong.",
      confidence: businessesCreated > 20 ? "HIGH" : "LOW",
      actionType: "ONBOARDING_WIZARD",
      expectedResult: "First Data rate naik ke 70%",
      measurementMetric: "First Data Input",
      status: "RECOMMENDED",
      direction: "HIGHER_IS_BETTER"
    })
  }

  // ─── METRIC 3: POS FEATURE ENGAGEMENT ───────────────────────────────────
  const targetPosUsage = Math.round(hppUsage * 0.5)
  const gapPos = posUsage - targetPosUsage
  if (hppUsage > 10 && gapPos < 0) {
    analysis.push({
      metric: "HPP to POS Conversion",
      goal: "Penggunaan POS minimal 50% dari penggunaan kalkulator HPP",
      target: targetPosUsage,
      actual: posUsage,
      gap: gapPos,
      gapPercentage: Math.round((gapPos / targetPosUsage) * 100),
      severity: gapPos < -(targetPosUsage * 0.5) ? "HIGH" : "MEDIUM",
      where: "HPP Result Page",
      cause: "User menganggap UBOS lebih sebagai kalkulator HPP daripada sistem kasir operasional.",
      recommendation: "Buat edukasi nilai POS atau tampilkan prompt setelah HPP selesai dihitung.",
      confidence: hppUsage > 100 ? "HIGH" : "MEDIUM",
      actionType: "FEATURE_PROMPT",
      expectedResult: "POS usage meningkat mendekati 50% HPP usage",
      measurementMetric: "HPP to POS Conversion",
      status: "RECOMMENDED",
      direction: "HIGHER_IS_BETTER"
    })
  }

  // ─── METRIC 4: WEEKLY RETENTION ─────────────────────────────────────────
  const targetRetention = Math.round(businessesCreated * 0.3)
  const gapRetention = weeklyActiveBusinesses - targetRetention
  if (businessesCreated > 0 && gapRetention < 0) {
    analysis.push({
      metric: "Weekly Active Businesses",
      goal: "Minimal 30% dari total bisnis aktif mingguan",
      target: targetRetention,
      actual: weeklyActiveBusinesses,
      gap: gapRetention,
      gapPercentage: Math.round((gapRetention / targetRetention) * 100),
      severity: "HIGH",
      where: "App Retention",
      cause: "Kurangnya trigger eksternal untuk membuat user kembali membuka aplikasi.",
      recommendation: "Kirim notifikasi WhatsApp otomatis atau email re-engagement berisi laporan mingguan.",
      confidence: businessesCreated > 20 ? "HIGH" : "LOW",
      actionType: "CRM_CAMPAIGN",
      expectedResult: "WAU rate naik ke 30%",
      measurementMetric: "Weekly Active Businesses",
      status: "RECOMMENDED",
      direction: "HIGHER_IS_BETTER"
    })
  }

  return analysis
}
