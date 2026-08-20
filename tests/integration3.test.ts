import assert from 'node:assert'
import { prisma } from '../src/lib/prisma.js'

async function runTests() {
  console.log("Setting up Multi-Tenant Integration Test for Sales Time Analysis...")
  
  // Cleanup at start
  const oldUsers = await prisma.user.findMany({ where: { email: { in: ['st_a@test.com', 'st_b@test.com'] } } })
  for (const ou of oldUsers) {
    const oldBiz = await prisma.business.findFirst({ where: { userId: ou.id } })
    if (oldBiz) {
      await prisma.sale.deleteMany({ where: { businessId: oldBiz.id } })
      await prisma.business.delete({ where: { id: oldBiz.id } })
    }
    await prisma.user.delete({ where: { id: ou.id } })
  }

  const userA = await prisma.user.create({ data: { name: 'ST User A', email: 'st_a@test.com', passwordHash: 'hash' } })
  const userB = await prisma.user.create({ data: { name: 'ST User B', email: 'st_b@test.com', passwordHash: 'hash' } })
  
  const bizA = await prisma.business.create({ data: { name: 'ST Biz A', userId: userA.id, businessType: 'FNB' } })
  const bizB = await prisma.business.create({ data: { name: 'ST Biz B', userId: userB.id, businessType: 'FNB' } })

  // Tenant A: 3 tx at 08:00 WIB (01:00 UTC), total 150k
  await prisma.sale.create({ data: { businessId: bizA.id, clientTransactionId: 'st_a1', totalAmount: 50000, paymentMethod: 'CASH', createdAt: new Date("2026-08-20T01:00:00Z") } })
  await prisma.sale.create({ data: { businessId: bizA.id, clientTransactionId: 'st_a2', totalAmount: 50000, paymentMethod: 'CASH', createdAt: new Date("2026-08-20T01:30:00Z") } })
  await prisma.sale.create({ data: { businessId: bizA.id, clientTransactionId: 'st_a3', totalAmount: 50000, paymentMethod: 'CASH', createdAt: new Date("2026-08-20T01:45:00Z") } })

  // Tenant B: 5 tx at 20:00 WIB (13:00 UTC), total 500k
  for (let i = 0; i < 5; i++) {
    await prisma.sale.create({ data: { businessId: bizB.id, clientTransactionId: `st_b${i}`, totalAmount: 100000, paymentMethod: 'CASH', createdAt: new Date("2026-08-20T13:00:00Z") } })
  }

  // TEST: Security - get sales isolated
  const salesA = await prisma.sale.findMany({
    where: { businessId: bizA.id, createdAt: { gte: new Date("2026-08-19T00:00:00Z"), lte: new Date("2026-08-21T00:00:00Z") } },
    select: { createdAt: true, totalAmount: true }
  })

  // Dynamic import since calculateSalesTimeAnalysis is ES module or TS 
  // We can just assert the raw array first, but to strictly test the engine output:
  const { calculateSalesTimeAnalysis } = await import('../src/lib/engines/salesTimeEngine.js')
  const resA = calculateSalesTimeAnalysis("Asia/Jakarta", salesA, [], new Date("2026-08-20T14:00:00Z"))

  assert.strictEqual(salesA.length, 3, "Hanya boleh 3 transaksi (milik A)")
  
  // Total transaction count isolation
  const txA = resA.hourlyMetrics.reduce((sum, h) => sum + h.transactionCount, 0)
  assert.strictEqual(txA, 3)

  // Total omzet isolation
  const omzetA = resA.hourlyMetrics.reduce((sum, h) => sum + h.omzet, 0)
  assert.strictEqual(omzetA, 150000)

  // Peak isolation
  assert.strictEqual(resA.peakTransactionHour, 8, "Peak harus 8 pagi, B yang malam hari tidak boleh masuk")
  assert.strictEqual(resA.peakRevenueHour, 8)

  console.log("✅ MULTI-TENANT SALES TIME SECURITY TESTS PASS")

  // Cleanup at end
  const endUsers = await prisma.user.findMany({ where: { email: { in: ['st_a@test.com', 'st_b@test.com'] } } })
  for (const ou of endUsers) {
    const oldBiz = await prisma.business.findFirst({ where: { userId: ou.id } })
    if (oldBiz) {
      await prisma.sale.deleteMany({ where: { businessId: oldBiz.id } })
      await prisma.business.delete({ where: { id: oldBiz.id } })
    }
    await prisma.user.delete({ where: { id: ou.id } })
  }
}

runTests()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
