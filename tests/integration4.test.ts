import assert from 'node:assert'
import { prisma } from '../src/lib/prisma.js'

async function runTests() {
  console.log("Setting up Multi-Tenant Integration Test for AOV & Margin Analysis...")
  
  // Cleanup at start
  const oldUsers = await prisma.user.findMany({ where: { email: { in: ['aov_a@test.com', 'aov_b@test.com'] } } })
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

  const userA = await prisma.user.create({ data: { name: 'AOV User A', email: 'aov_a@test.com', passwordHash: 'hash' } })
  const userB = await prisma.user.create({ data: { name: 'AOV User B', email: 'aov_b@test.com', passwordHash: 'hash' } })
  
  const bizA = await prisma.business.create({ data: { name: 'AOV Biz A', userId: userA.id, businessType: 'FNB' } })
  const bizB = await prisma.business.create({ data: { name: 'AOV Biz B', userId: userB.id, businessType: 'FNB' } })

  const prodA = await prisma.product.create({ data: { name: 'Prod A', businessId: bizA.id, sellPrice: 50000, calculatedHpp: 20000 } })
  const prodB = await prisma.product.create({ data: { name: 'Prod B', businessId: bizB.id, sellPrice: 1000000, calculatedHpp: 100000 } })

  // Tenant A: 1 sale, 50k (HPP 20k, Margin 60%)
  const saleA = await prisma.sale.create({ data: { businessId: bizA.id, clientTransactionId: 'aov_a1', totalAmount: 50000, paymentMethod: 'CASH' } })
  await prisma.saleItem.create({ data: { sale: { connect: { id: saleA.id } }, product: { connect: { id: prodA.id } }, business: { connect: { id: bizA.id } }, quantity: 1, priceAtSale: 50000, hppAtSale: 20000 } })

  // Tenant B: 1 sale, 1.000.000 (HPP 100k, Margin 90%)
  const saleB = await prisma.sale.create({ data: { businessId: bizB.id, clientTransactionId: 'aov_b1', totalAmount: 1000000, paymentMethod: 'CASH' } })
  await prisma.saleItem.create({ data: { sale: { connect: { id: saleB.id } }, product: { connect: { id: prodB.id } }, business: { connect: { id: bizB.id } }, quantity: 1, priceAtSale: 1000000, hppAtSale: 100000 } })

  // TEST: Security - get sales isolated
  const selectQuery = {
    id: true,
    createdAt: true,
    totalAmount: true,
    saleItems: {
      select: {
        productId: true,
        product: { select: { name: true } },
        quantity: true,
        priceAtSale: true,
        hppAtSale: true
      }
    }
  }

  const salesA = await prisma.sale.findMany({
    where: { businessId: bizA.id },
    select: selectQuery
  })

  const { calculateAOVMarginAnalysis } = await import('../src/lib/engines/aovMarginEngine.js')
  const resA = calculateAOVMarginAnalysis(salesA as any, [], 1)

  assert.strictEqual(salesA.length, 1, "Hanya boleh 1 transaksi milik A")
  
  // Total isolation validation
  assert.strictEqual(resA.transactionCount, 1)
  assert.strictEqual(resA.totalOmzet, 50000, "Omzet Tenant B (1jt) tidak boleh masuk")
  assert.strictEqual(resA.totalHPP, 20000)
  assert.strictEqual(resA.currentMargin, 60, "Margin wajib murni 60%, tidak terkontaminasi 90% milik B")
  assert.strictEqual(resA.currentAOV, 50000)

  console.log("✅ MULTI-TENANT AOV MARGIN SECURITY TESTS PASS")

  // Cleanup
  const endUsers = await prisma.user.findMany({ where: { email: { in: ['aov_a@test.com', 'aov_b@test.com'] } } })
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
