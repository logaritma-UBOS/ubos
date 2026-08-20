import { calculateOmzet, calculateTransactionCount, calculateAOV, calculateDailyTarget, calculateGap, calculateTargetTransactions } from "./calculationEngine"
import { assessDataConfidence } from "./dataConfidence"
import { generateRecommendations } from "./recommendationEngine"
import { prisma } from "@/lib/prisma"

export async function runLogaritmaEngine(businessId: string) {
  // 1. Dapatkan periode (Hari ini)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  // 2. Ambil Profil dan Target
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { goals: true }
  })
  
  if (!business) throw new Error("Business not found")
  
  const targetOmzetBulanan = business.goals[0]?.targetOmzet || 0
  const targetOmzetHarian = calculateDailyTarget(targetOmzetBulanan, business.operatingDays > 0 ? (business.operatingDays * 4) : 30) // MVP simplify

  // 3. Hitung Aktual Hari Ini via Calculation Engine
  const actualOmzet = await calculateOmzet(businessId, today, endOfDay)
  const actualTransactions = await calculateTransactionCount(businessId, today, endOfDay)
  const actualAOV = calculateAOV(actualOmzet, actualTransactions)
  
  // 4. Hitung Gap
  const gap = calculateGap(targetOmzetHarian, actualOmzet)
  
  // 5. Asumsi Target AOV (Untuk MVP, asumsikan Target AOV adalah Target Harian dibagi rata-rata histori, tapi krn belum ada histori jauh, kita set static logic dulu atau pakai target harian / 10)
  const targetAOV = 20000 // Dummy target AOV for now, idealnya dihitung dari historikal
  const targetTransactionsTotal = Math.ceil(targetOmzetHarian / targetAOV)
  
  const targetTransactionsSisa = calculateTargetTransactions(gap, actualAOV, targetOmzetHarian)

  // 6. Data Confidence
  // Cek berapa hari toko buka (jumlah unik hari transaksi)
  const firstSale = await prisma.sale.findFirst({ where: { businessId }, orderBy: { createdAt: 'asc' } })
  const daysWithData = firstSale ? Math.ceil((Date.now() - firstSale.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0
  
  const totalSalesCount = await prisma.sale.count({ where: { businessId } })
  const isSetupComplete = true
  const confidence = assessDataConfidence(daysWithData, totalSalesCount, isSetupComplete)

  // 7. Cek Stok Kurang
  const lowStockItems = []
  // (Di sini harusnya cek bahan baku yang stoknya di bawah minStock, tapi sbg MVP jika stok <= 0 kita anggap low)
  const ingredients = await prisma.ingredient.findMany({ where: { businessId } })
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
