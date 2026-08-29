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
}

export async function runOwnerEngine(): Promise<OwnerMetric[]> {
  const now = new Date()
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

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

  const hppUsage = await prisma.pilotEvent.count({ where: { eventName: 'hpp_calculated' } })
  const posUsage = await prisma.pilotEvent.count({ where: { eventName: 'pos_transaction_completed' } })

  const analysis: OwnerMetric[] = []

  // 1. REGISTER -> BUSINESS CREATED
  const targetActivation = Math.round(totalUsers * 0.6)
  const gapActivation = businessesCreated - targetActivation
  if (totalUsers > 0 && gapActivation < 0) {
    const ratio = businessesCreated / totalUsers
    analysis.push({
      metric: "Activation (Register -> Biz)",
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
      measurementMetric: "Activation (Register -> Biz)",
      status: "RECOMMENDED"
    })
  }

  // 2. BUSINESS CREATED -> FIRST DATA (Product/Ingredient)
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
      status: "RECOMMENDED"
    })
  }

  // 3. POS FEATURE ENGAGEMENT
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
      status: "RECOMMENDED"
    })
  }

  // 4. WEEKLY RETENTION (Active Businesses)
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
      status: "RECOMMENDED"
    })
  }

  return analysis
}
