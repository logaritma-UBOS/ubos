import { prisma } from "./prisma"

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
  currentPeriodRevenue: number   // 7 days
  previousPeriodRevenue: number  // 7 days prior
  allTimeRevenue: number
  totalTransactions: number
  currentPeriodTransactions: number
  previousPeriodTransactions: number
  avgTransactionValue: number
  periodLabel: string
}

export async function getRevenueSnapshot(): Promise<RevenueSnapshot> {
  const now = new Date()
  const startOfCurrent = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const startOfPrevious = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  // Current period: last 7 days
  const currentSales = await prisma.sale.findMany({
    where: { createdAt: { gte: startOfCurrent } },
    select: { totalAmount: true }
  })

  // Previous period: 7-14 days ago
  const previousSales = await prisma.sale.findMany({
    where: { createdAt: { gte: startOfPrevious, lt: startOfCurrent } },
    select: { totalAmount: true }
  })

  // All time
  const allSales = await prisma.sale.findMany({
    select: { totalAmount: true }
  })

  const currentPeriodRevenue = currentSales.reduce((sum, s) => sum + (s.totalAmount ?? 0), 0)
  const previousPeriodRevenue = previousSales.reduce((sum, s) => sum + (s.totalAmount ?? 0), 0)
  const allTimeRevenue = allSales.reduce((sum, s) => sum + (s.totalAmount ?? 0), 0)
  const totalTransactions = allSales.length
  const currentPeriodTransactions = currentSales.length
  const previousPeriodTransactions = previousSales.length
  const avgTransactionValue = totalTransactions > 0
    ? Math.round(allTimeRevenue / totalTransactions)
    : 0

  return {
    currentPeriodRevenue,
    previousPeriodRevenue,
    allTimeRevenue,
    totalTransactions,
    currentPeriodTransactions,
    previousPeriodTransactions,
    avgTransactionValue,
    periodLabel: "7 Hari Terakhir"
  }
}

export async function runOwnerEngine(): Promise<OwnerMetric[]> {
  const now = new Date()
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const startOfPreviousWeek = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  const totalUsers = await prisma.user.count()
  
  const activeBusinessesEvents = await prisma.pilotEvent.findMany({ 
    where: { createdAt: { gte: startOfWeek } }, 
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

  // Revenue data: actual SUM from Sale.totalAmount
  const currentSales = await prisma.sale.findMany({
    where: { createdAt: { gte: startOfWeek } },
    select: { totalAmount: true }
  })
  const previousSales = await prisma.sale.findMany({
    where: { createdAt: { gte: startOfPreviousWeek, lt: startOfWeek } },
    select: { totalAmount: true }
  })
  const currentRevenue = currentSales.reduce((sum, s) => sum + (s.totalAmount ?? 0), 0)
  const previousRevenue = previousSales.reduce((sum, s) => sum + (s.totalAmount ?? 0), 0)

  // Revenue target: read from SystemSetting if set, otherwise null (no fake target)
  const revenueSetting = await prisma.systemSetting.findUnique({ where: { key: "owner_revenue_target_weekly" } })
  const revenueTarget = revenueSetting ? parseFloat(revenueSetting.value) : null

  const analysis: OwnerMetric[] = []

  // ─── METRIC 0: WEEKLY REVENUE INTELLIGENCE ───────────────────────────────
  // Only push if we have transaction data OR there's a set target
  if (currentSales.length > 0 || previousSales.length > 0 || revenueTarget !== null) {
    const hasTarget = revenueTarget !== null && revenueTarget > 0
    const revenueGap = hasTarget ? currentRevenue - revenueTarget : 0
    const revenueTrend = previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : null

    // Severity: if has target, use gap; if no target, use trend
    let severity: "LOW" | "MEDIUM" | "HIGH" = "LOW"
    if (hasTarget) {
      const gapRatio = revenueGap / revenueTarget
      if (gapRatio < -0.3) severity = "HIGH"
      else if (gapRatio < -0.1) severity = "MEDIUM"
      else severity = "LOW"
    } else if (revenueTrend !== null) {
      if (revenueTrend < -20) severity = "HIGH"
      else if (revenueTrend < -5) severity = "MEDIUM"
      else severity = "LOW"
    }

    // Confidence: based on transaction volume
    const confidence: "LOW" | "MEDIUM" | "HIGH" =
      currentSales.length >= 50 ? "HIGH" : currentSales.length >= 10 ? "MEDIUM" : "LOW"

    // Recommendation: based on gap / trend
    let recommendation = ""
    let cause = ""
    let expectedResult = ""

    if (hasTarget && revenueGap < 0) {
      const deficit = Math.abs(revenueGap)
      const remainingDays = 7
      const neededPerDay = Math.round(deficit / remainingDays)
      cause = `Revenue periode berjalan lebih rendah ${deficit.toLocaleString('id-ID')} dari target mingguan.`
      recommendation = `Dorong aktivitas POS di bisnis aktif. Target tambahan Rp ${neededPerDay.toLocaleString('id-ID')}/hari untuk menutup gap.`
      expectedResult = `Revenue 7 hari mendekati atau melampaui target Rp ${revenueTarget!.toLocaleString('id-ID')}`
    } else if (revenueTrend !== null && revenueTrend < -5) {
      cause = `Revenue 7 hari ini (Rp ${currentRevenue.toLocaleString('id-ID')}) turun ${Math.abs(revenueTrend).toFixed(1)}% dari periode sebelumnya.`
      recommendation = `Cek bisnis yang aktif minggu lalu namun tidak transaksi minggu ini. Lakukan re-engagement via WhatsApp atau promo.`
      expectedResult = `Revenue kembali setara atau melampaui periode sebelumnya (Rp ${previousRevenue.toLocaleString('id-ID')})`
    } else if (revenueTrend !== null && revenueTrend >= 0) {
      cause = `Revenue 7 hari ini naik ${revenueTrend.toFixed(1)}% dari periode sebelumnya.`
      recommendation = `Pertahankan momentum. Pantau bisnis dengan volume transaksi tinggi untuk optimasi margin.`
      expectedResult = `Revenue tetap tumbuh positif minggu berikutnya`
    } else {
      cause = `Revenue 7 hari terbaca: Rp ${currentRevenue.toLocaleString('id-ID')}. Belum ada data pembanding yang cukup.`
      recommendation = `Pastikan seluruh bisnis aktif menggunakan fitur POS secara konsisten.`
      expectedResult = `Peningkatan frekuensi transaksi POS`
    }

    // Only push as gap-based recommendation if there's an actual gap
    const shouldRecommend = (hasTarget && revenueGap < 0) || (revenueTrend !== null && revenueTrend < -5)

    if (shouldRecommend) {
      analysis.push({
        metric: "Revenue Mingguan",
        goal: hasTarget
          ? `Revenue 7 hari mencapai target Rp ${revenueTarget!.toLocaleString('id-ID')}`
          : `Revenue minggu ini melampaui periode sebelumnya`,
        target: hasTarget ? revenueTarget! : previousRevenue,
        actual: currentRevenue,
        gap: hasTarget ? revenueGap : (currentRevenue - previousRevenue),
        gapPercentage: hasTarget
          ? Math.round((revenueGap / revenueTarget!) * 100)
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
