import { prisma } from "./prisma"

export interface GapAnalysis {
  metric: string
  target: number
  actual: number
  gap: number
  severity: "LOW" | "MEDIUM" | "HIGH"
  cause: string
  recommendation: string
  confidence: "LOW" | "MEDIUM" | "HIGH"
}

export async function runOwnerEngine(): Promise<GapAnalysis[]> {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const totalUsers = await prisma.user.count()
  const totalBusinesses = await prisma.business.count()

  const hppUsage = await prisma.pilotEvent.count({ where: { eventName: 'hpp_calculated' } })
  const posUsage = await prisma.pilotEvent.count({ where: { eventName: 'pos_transaction_completed' } })
  
  const active7DaysEvents = await prisma.pilotEvent.findMany({ 
    where: { createdAt: { gte: startOfWeek } }, 
    select: { businessId: true } 
  })
  const active7Days = new Set(active7DaysEvents.map(e => e.businessId)).size

  const analysis: GapAnalysis[] = []

  const targetActivation = Math.round(totalUsers * 0.6)
  const gapActivation = totalBusinesses - targetActivation
  if (gapActivation < 0) {
    const ratio = totalUsers > 0 ? totalBusinesses / totalUsers : 0
    analysis.push({
      metric: "Activation (Register -> Business)",
      target: targetActivation,
      actual: totalBusinesses,
      gap: gapActivation,
      severity: ratio < 0.3 ? "HIGH" : "MEDIUM",
      cause: "Banyak user berhenti di onboarding atau bingung setelah mendaftar.",
      recommendation: "Tinjau ulang flow onboarding & sederhanakan UI pendaftaran.",
      confidence: totalUsers > 50 ? "HIGH" : "LOW"
    })
  }

  const targetPosUsage = Math.round(hppUsage * 0.5)
  const gapPos = posUsage - targetPosUsage
  if (hppUsage > 10 && gapPos < 0) {
    analysis.push({
      metric: "POS Feature Engagement",
      target: targetPosUsage,
      actual: posUsage,
      gap: gapPos,
      severity: gapPos < -(targetPosUsage * 0.5) ? "HIGH" : "MEDIUM",
      cause: "User menganggap UBOS lebih sebagai kalkulator HPP daripada sistem kasir utama.",
      recommendation: "Buat edukasi nilai POS atau tampilkan prompt setelah HPP selesai dihitung.",
      confidence: hppUsage > 100 ? "HIGH" : "MEDIUM"
    })
  }

  const targetRetention = Math.round(totalBusinesses * 0.3)
  const gapRetention = active7Days - targetRetention
  if (gapRetention < 0) {
    analysis.push({
      metric: "Weekly Active Users",
      target: targetRetention,
      actual: active7Days,
      gap: gapRetention,
      severity: "HIGH",
      cause: "Kurangnya trigger untuk membuat user kembali membuka aplikasi.",
      recommendation: "Kirim notifikasi WhatsApp otomatis atau email re-engagement.",
      confidence: totalBusinesses > 20 ? "HIGH" : "LOW"
    })
  }

  return analysis
}
