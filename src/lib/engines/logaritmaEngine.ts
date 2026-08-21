import { calculateOmzet, calculateTransactionCount, calculateAOV, calculateDailyTarget, calculateGap, calculateTargetTransactions } from "./calculationEngine"
import { assessDataConfidence } from "./dataConfidence"
import { generateRecommendations } from "./recommendationEngine"
import { prisma } from "@/lib/prisma"
import { getStartOfDayUTC } from "./timeEngine"

export async function runLogaritmaEngine(businessId: string) {
  // 1. Dapatkan business dan timezone-nya terlebih dahulu
  const business = await prisma.business.findUnique({ 
    where: { id: businessId }, 
    include: { goals: true, settings: true } 
  })
  if (!business) throw new Error("Business not found")

  const tz = business.settings?.timezone || "Asia/Jakarta"
  
  // 2. Dapatkan periode (Hari ini) berdasarkan Timezone yang benar
  const today = getStartOfDayUTC(tz)
  const endOfDay = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)

  // 3. Eksekusi Query metrik secara Paralel
  const [
    actualOmzet,
    actualTransactions,
    firstSale,
    totalSalesCount,
    ingredients
  ] = await Promise.all([
    calculateOmzet(businessId, today, endOfDay),
    calculateTransactionCount(businessId, today, endOfDay),
    prisma.sale.findFirst({ where: { businessId }, orderBy: { createdAt: 'asc' }, select: { createdAt: true } }),
    prisma.sale.count({ where: { businessId } }),
    prisma.ingredient.findMany({ where: { businessId }, select: { name: true, currentStock: true } })
  ])
  
  const targetOmzetBulanan = business.goals[0]?.targetOmzet || 0
  const targetOmzetHarian = calculateDailyTarget(targetOmzetBulanan, business.operatingDays > 0 ? (business.operatingDays * 4) : 30) // MVP simplify

  // 3. Hitung Aktual & Target
  const actualAOV = calculateAOV(actualOmzet, actualTransactions)
  const gap = calculateGap(targetOmzetHarian, actualOmzet)
  
  const targetAOV = 20000 // Dummy target AOV for now, idealnya dihitung dari historikal
  const targetTransactionsTotal = Math.ceil(targetOmzetHarian / targetAOV)
  
  const targetTransactionsSisa = calculateTargetTransactions(gap, actualAOV, targetOmzetHarian)

  // 4. Data Confidence
  const daysWithData = firstSale ? Math.ceil((Date.now() - firstSale.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0
  const isSetupComplete = true
  const confidence = assessDataConfidence(daysWithData, totalSalesCount, isSetupComplete)

  // 5. Cek Stok Kurang
  const lowStockItems = []
  for (const ing of ingredients) {
    if (ing.currentStock <= 0) lowStockItems.push(ing.name)
  }

  // 8. Generate Recommendation
  const recommendations = generateRecommendations({
    targetOmzet: targetOmzetHarian,
    actualOmzet,
    targetTransactions: targetTransactionsTotal,
    actualTransactions,
    targetAOV,
    actualAOV,
    marginDrop: false, // MVP simple
    lowStockItems,
    confidence
  })

  // 9. Susun Laporan UBOS Pagi Ini (Logaritma Result)
  return {
    targetHarian: targetOmzetHarian,
    sudahMasuk: actualOmzet,
    masihKurang: gap,
    butuhTransaksiSisa: targetTransactionsSisa,
    aovAktual: actualAOV,
    rekomendasiUtama: recommendations[0] || null,
    confidence,
    lowStockItems // Presentation-only: already computed in pipeline, exposed for Dashboard display
  }
}
