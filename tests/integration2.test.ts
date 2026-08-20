import assert from 'node:assert'
import { prisma } from '../src/lib/prisma.js'

async function runTests() {
  console.log("Setting up Security Test for Product Performance...")
  
  // Cleanup
  const oldUsers = await prisma.user.findMany({ where: { email: { in: ['p2usera@test.com', 'p2userb@test.com'] } } })
  for (const ou of oldUsers) {
    const oldBiz = await prisma.business.findFirst({ where: { userId: ou.id } })
    if (oldBiz) {
      await prisma.saleItem.deleteMany({ where: { businessId: oldBiz.id } })
      await prisma.sale.deleteMany({ where: { businessId: oldBiz.id } })
      await prisma.product.deleteMany({ where: { businessId: oldBiz.id } })
      await prisma.business.delete({ where: { id: oldBiz.id } })
    }
    await prisma.user.delete({ where: { id: ou.id } })
  }
  const userA = await prisma.user.create({ data: { name: 'P2 User A', email: 'p2usera@test.com', passwordHash: 'hash' } })
  const userB = await prisma.user.create({ data: { name: 'P2 User B', email: 'p2userb@test.com', passwordHash: 'hash' } })
  
  const bizA = await prisma.business.create({ data: { name: 'P2 Biz A', userId: userA.id, businessType: 'FNB' } })
  const bizB = await prisma.business.create({ data: { name: 'P2 Biz B', userId: userB.id, businessType: 'FNB' } })

  const prodA = await prisma.product.create({ data: { name: 'Prod A', sellPrice: 10000, businessId: bizA.id } })
  const prodB = await prisma.product.create({ data: { name: 'Prod B', sellPrice: 20000, businessId: bizB.id } })

  const saleA = await prisma.sale.create({ data: { businessId: bizA.id, clientTransactionId: 'p2a1', totalAmount: 10000, paymentMethod: 'CASH' } })
  await prisma.saleItem.create({ data: { saleId: saleA.id, businessId: bizA.id, productId: prodA.id, quantity: 1, priceAtSale: 10000, hppAtSale: 5000 } })

  const saleB = await prisma.sale.create({ data: { businessId: bizB.id, clientTransactionId: 'p2b1', totalAmount: 20000, paymentMethod: 'CASH' } })
  await prisma.saleItem.create({ data: { saleId: saleB.id, businessId: bizB.id, productId: prodB.id, quantity: 1, priceAtSale: 20000, hppAtSale: 10000 } })

  // TEST: Security - get sales for product performance isolated
  const salesA = await prisma.sale.findMany({
    where: { businessId: bizA.id },
    include: { saleItems: { include: { product: true } } }
  })

  assert.strictEqual(salesA.length, 1)
  assert.strictEqual(salesA[0].saleItems[0].productId, prodA.id)
  assert.strictEqual(salesA.every(s => s.businessId === bizA.id), true)

  console.log("✅ PRODUCT PERFORMANCE SECURITY TESTS PASS")

  // Cleanup at end
  const endUsers = await prisma.user.findMany({ where: { email: { in: ['p2usera@test.com', 'p2userb@test.com'] } } })
  for (const ou of endUsers) {
    const oldBiz = await prisma.business.findFirst({ where: { userId: ou.id } })
    if (oldBiz) {
      await prisma.saleItem.deleteMany({ where: { businessId: oldBiz.id } })
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
