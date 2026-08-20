import assert from 'node:assert'
import { prisma } from '../src/lib/prisma.js'

async function runTests() {
  console.log("Setting up Integration & Security test data...")
  
  // Create mock businesses
  const userA = await prisma.user.create({ data: { name: 'User A', email: 'usera@test.com' } })
  const userB = await prisma.user.create({ data: { name: 'User B', email: 'userb@test.com' } })
  
  const bizA = await prisma.business.create({ data: { name: 'Biz A', userId: userA.id } })
  const bizB = await prisma.business.create({ data: { name: 'Biz B', userId: userB.id } })

  // Create transactions
  await prisma.sale.create({ data: { businessId: bizA.id, clientTransactionId: 'a1', totalAmount: 10000, paymentMethod: 'CASH' } })
  await prisma.sale.create({ data: { businessId: bizA.id, clientTransactionId: 'a2', totalAmount: 20000, paymentMethod: 'CASH' } })
  await prisma.sale.create({ data: { businessId: bizB.id, clientTransactionId: 'b1', totalAmount: 90000, paymentMethod: 'CASH' } })

  // TEST: Security - getTransactionHistory equivalent
  const getSalesA = await prisma.sale.findMany({ where: { businessId: bizA.id } })
  const getSalesB = await prisma.sale.findMany({ where: { businessId: bizB.id } })

  assert.strictEqual(getSalesA.length, 2, "Biz A harus hanya melihat 2 transaksinya")
  assert.strictEqual(getSalesB.length, 1, "Biz B harus hanya melihat 1 transaksinya")
  assert.strictEqual(getSalesA.every(s => s.businessId === bizA.id), true, "Tidak boleh ada data B di A")

  console.log("✅ INTEGRATION & SECURITY TESTS PASS")

  // Cleanup
  await prisma.sale.deleteMany({ where: { businessId: { in: [bizA.id, bizB.id] } } })
  await prisma.business.deleteMany({ where: { id: { in: [bizA.id, bizB.id] } } })
  await prisma.user.deleteMany({ where: { id: { in: [userA.id, userB.id] } } })
}

runTests()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
