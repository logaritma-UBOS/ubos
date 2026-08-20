import assert from 'node:assert'
import { calculateSalesTimeAnalysis } from '../src/lib/engines/salesTimeEngine.js'

function runTests() {
  console.log("Running Sales Time Engine Unit Tests...")

  // Mock Sales Data (UTC times)
  // Let's assume Timezone is Asia/Jakarta (UTC+7)
  // 1. tx at 01:00 UTC -> 08:00 WIB (Morning)
  // 2. tx at 01:30 UTC -> 08:30 WIB
  // 3. tx at 05:00 UTC -> 12:00 WIB (Noon)
  // 4. tx at 17:00 UTC -> 00:00 WIB (Midnight next day)

  const tzWIB = "Asia/Jakarta"
  const tzWIT = "Asia/Jayapura" // UTC+9
  
  const now = new Date("2026-08-20T12:00:00Z") // 19:00 WIB
  
  // Conf LOW test: < 2 days
  const currentSalesLOW = [
    { createdAt: new Date("2026-08-20T01:00:00Z"), totalAmount: 50000 }, // 08:00 WIB
    { createdAt: new Date("2026-08-20T01:30:00Z"), totalAmount: 50000 }, // 08:00 WIB
    { createdAt: new Date("2026-08-20T05:00:00Z"), totalAmount: 150000 }, // 12:00 WIB
    { createdAt: new Date("2026-08-20T17:00:00Z"), totalAmount: 0 }, // 00:00 WIB boundary
  ]

  const prevSales = [
    { createdAt: new Date("2026-08-19T01:00:00Z"), totalAmount: 100000 }
  ]

  const res1 = calculateSalesTimeAnalysis(tzWIB, currentSalesLOW, prevSales, now)

  // Confidence check
  assert.strictEqual(res1.confidence, "LOW")
  
  // Midnight boundary check (00:00 WIB)
  assert.strictEqual(res1.hourlyMetrics[0].transactionCount, 1)
  assert.strictEqual(res1.hourlyMetrics[0].omzet, 0)
  assert.strictEqual(res1.hourlyMetrics[0].aov, 0) // Zero Omzet

  // Hour 8 (WIB)
  assert.strictEqual(res1.hourlyMetrics[8].transactionCount, 2)
  assert.strictEqual(res1.hourlyMetrics[8].omzet, 100000)

  // Hour 12 (WIB)
  assert.strictEqual(res1.hourlyMetrics[12].transactionCount, 1)
  assert.strictEqual(res1.hourlyMetrics[12].omzet, 150000)

  // Peak Tie-Breaker Tests
  // Transaction peak: Hour 8 has 2 tx, Hour 12 has 1 tx. => Peak Tx = 8.
  assert.strictEqual(res1.peakTransactionHour, 8)
  
  // Revenue peak: Hour 12 has 150k, Hour 8 has 100k. => Peak Rev = 12.
  assert.strictEqual(res1.peakRevenueHour, 12)
  
  // AOV peak: Hour 12 AOV = 150k, Hour 8 AOV = 50k. => Peak AOV = 12.
  assert.strictEqual(res1.peakAOVHour, 12)

  // Current Business Hour & Status
  // Now is 12:00 UTC -> 19:00 WIB.
  assert.strictEqual(res1.currentBusinessHour, 19)
  // Peak TX is 8. Now is 19. Peak is passed.
  assert.strictEqual(res1.peakHourStatus, "PASSED")
  assert.strictEqual(res1.isPeakHourActive, false)

  // Trend
  // Current omzet = 250000. Prev = 100000. diff 150k -> 150%
  assert.strictEqual(res1.hourlyTrend.trendPercentage, 150)

  // ----------------------------------------------------
  // Tie-breaker specific test
  const tieSales = [
    { createdAt: new Date("2026-08-20T01:00:00Z"), totalAmount: 100000 }, // H8: 1 tx, 100k (AOV 100k)
    { createdAt: new Date("2026-08-20T02:00:00Z"), totalAmount: 100000 }  // H9: 1 tx, 100k (AOV 100k)
  ]
  const resTie = calculateSalesTimeAnalysis(tzWIB, tieSales, [], now)
  
  // TX Tie: H8 and H9 have 1 tx. Rev same. Pagi wins => H8.
  assert.strictEqual(resTie.peakTransactionHour, 8)
  assert.strictEqual(resTie.peakRevenueHour, 8)
  assert.strictEqual(resTie.peakAOVHour, 8)

  // ----------------------------------------------------
  // Timezone test WIT (Asia/Jayapura)
  // 01:00 UTC -> 10:00 WIT
  const resWIT = calculateSalesTimeAnalysis(tzWIT, tieSales, [], now)
  assert.strictEqual(resWIT.peakTransactionHour, 10) // Pagi wins between 10 and 11
  assert.strictEqual(resWIT.currentBusinessHour, 21) // 12:00 UTC -> 21:00 WIT

  console.log("✅ SALES TIME ENGINE UNIT TESTS PASS")
}

runTests()
