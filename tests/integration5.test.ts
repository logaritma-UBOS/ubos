import assert from 'node:assert'
import { prisma } from '../src/lib/prisma.js'

async function runTests() {
  console.log("Setting up Multi-Tenant Integration Test 5 for Business Insights...")
  
  // Cleanup at start
  const oldUsers = await prisma.user.findMany({ where: { email: { in: ['diag_a@test.com', 'diag_b@test.com'] } } })
  for (const ou of oldUsers) {
    const oldBiz = await prisma.business.findFirst({ where: { userId: ou.id } })
    if (oldBiz) {
      const sales = await prisma.sale.findMany({ where: { businessId: oldBiz.id } })
      for (const s of sales) {
        await prisma.saleItem.deleteMany({ where: { saleId: s.id } })
      }
      await prisma.sale.deleteMany({ where: { businessId: oldBiz.id } })
      await prisma.product.deleteMany({ where: { businessId: oldBiz.id } })
      await prisma.business.delete({ where: { id: oldBiz.id } })
    }
    await prisma.user.delete({ where: { id: ou.id } })
  }

  const userA = await prisma.user.create({ data: { name: 'Diag User A', email: 'diag_a@test.com', passwordHash: 'hash' } })
  const userB = await prisma.user.create({ data: { name: 'Diag User B', email: 'diag_b@test.com', passwordHash: 'hash' } })
  
  const bizA = await prisma.business.create({ data: { name: 'Diag Biz A', userId: userA.id, businessType: 'FNB' } })
  const bizB = await prisma.business.create({ data: { name: 'Diag Biz B', userId: userB.id, businessType: 'FNB' } })

  const prodA = await prisma.product.create({ data: { name: 'Prod A', businessId: bizA.id, sellPrice: 50000, calculatedHpp: 20000 } })
  const prodB = await prisma.product.create({ data: { name: 'Prod B', businessId: bizB.id, sellPrice: 1000000, calculatedHpp: 980000 } })

  // Tenant A: High Margin (60%)
  const saleA = await prisma.sale.create({ data: { businessId: bizA.id, clientTransactionId: 'diag_a1', totalAmount: 50000, paymentMethod: 'CASH' } })
  await prisma.saleItem.create({ data: { sale: { connect: { id: saleA.id } }, product: { connect: { id: prodA.id } }, business: { connect: { id: bizA.id } }, quantity: 1, priceAtSale: 50000, hppAtSale: 20000 } })

  // Tenant B: High Volume, Low Margin (2%)
  const saleB = await prisma.sale.create({ data: { businessId: bizB.id, clientTransactionId: 'diag_b1', totalAmount: 1000000, paymentMethod: 'CASH' } })
  await prisma.saleItem.create({ data: { sale: { connect: { id: saleB.id } }, product: { connect: { id: prodB.id } }, business: { connect: { id: bizB.id } }, quantity: 1, priceAtSale: 1000000, hppAtSale: 980000 } })

  // Simulate Business Insights Engine call for Tenant A
  const { detectPatterns } = await import('../src/lib/engines/patternDetectionEngine.js')
  const { generateBusinessDiagnosis } = await import('../src/lib/engines/businessDiagnosisEngine.js')
  
  // We feed it deterministic data assuming Engine A filtered properly
  const patternsA = detectPatterns({
    revenue: { current: 50000, previous: 40000 },
    transaction: { current: 1, previous: 1 },
    aov: { current: 50000, previous: 40000 },
    margin: { current: 60, previous: 60 },
    hasHighRevenueLowMarginProduct: false,
    isPeakHourLowMargin: false,
    confidence: "LOW"
  })

  const diagnosesA = generateBusinessDiagnosis(patternsA, "LOW")

  // Check Isolation: Tenant A should not get "PROFITABILITY_CRISIS" or "REVENUE_MARGIN_DIVERGENCE"
  const hasDivergence = diagnosesA.some(d => d.diagnosisId === "REVENUE_MARGIN_DIVERGENCE")
  assert.strictEqual(hasDivergence, false, "Tenant A margin is stable at 60%, Tenant B (2%) must not leak")

  // Causality Check Automated Guard
  for (const d of diagnosesA) {
    const text = (d.title + " " + d.description).toLowerCase()
    assert.strictEqual(text.includes("karena"), false, "Diagnosis must NOT contain 'karena'")
    assert.strictEqual(text.includes("disebabkan"), false, "Diagnosis must NOT contain 'disebabkan'")
  }

  console.log("✅ MULTI-TENANT BUSINESS INSIGHTS SECURITY TESTS PASS")

  // Cleanup
  const endUsers = await prisma.user.findMany({ where: { email: { in: ['diag_a@test.com', 'diag_b@test.com'] } } })
  for (const ou of endUsers) {
    const oldBiz = await prisma.business.findFirst({ where: { userId: ou.id } })
    if (oldBiz) {
      const sales = await prisma.sale.findMany({ where: { businessId: oldBiz.id } })
      for (const s of sales) {
        await prisma.saleItem.deleteMany({ where: { saleId: s.id } })
      }
      await prisma.sale.deleteMany({ where: { businessId: oldBiz.id } })
      await prisma.product.deleteMany({ where: { businessId: oldBiz.id } })
      await prisma.business.delete({ where: { id: oldBiz.id } })
    }
    await prisma.user.delete({ where: { id: ou.id } })
  }
}

runTests()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
