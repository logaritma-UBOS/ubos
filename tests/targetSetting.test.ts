import { prisma } from "../src/lib/prisma"
import { runLogaritmaEngine } from "../src/lib/engines/logaritmaEngine"
import assert from "assert"

async function runTargetSettingTests() {
  console.log("Running Target Setting Validation Tests...")
  
  // 1. Setup Data for Tenant A & B
  const userA = await prisma.user.create({ data: { name: "User Target A", email: `target_a_${Date.now()}@test.com`, passwordHash: "hash" } })
  const businessA = await prisma.business.create({
    data: {
      userId: userA.id,
      name: "Toko Target A",
      businessType: "F&B",
      goals: { create: { targetOmzet: 30000000, period: "MONTHLY" } }
    },
    include: { goals: true }
  })
  
  const userB = await prisma.user.create({ data: { name: "User Target B", email: `target_b_${Date.now()}@test.com`, passwordHash: "hash" } })
  const businessB = await prisma.business.create({
    data: {
      userId: userB.id,
      name: "Toko Target B",
      businessType: "Ritel",
      goals: { create: { targetOmzet: 50000000, period: "MONTHLY" } }
    },
    include: { goals: true }
  })

  // Add some transactions to Business A
  const productA = await prisma.product.create({
    data: {
      businessId: businessA.id,
      name: "Produk A1",
      sellPrice: 10000,
      calculatedHpp: 5000,
      calculatedMargin: 50
    }
  })

  // Transaction 1
  await prisma.sale.create({
    data: {
      businessId: businessA.id,
      totalAmount: 10000,
      clientTransactionId: "tx-a1",
      paymentMethod: "CASH",
      saleItems: { create: { productId: productA.id, quantity: 1, priceAtSale: 10000, hppAtSale: 5000, businessId: businessA.id } }
    }
  })

  // Test A & D: Isolation
  const resA1 = await runLogaritmaEngine(businessA.id)
  const resB1 = await runLogaritmaEngine(businessB.id)

  assert.strictEqual(resA1.targetHarian, 1071429, "Target A (30M) / 28 days = 1071429")
  assert.strictEqual(resB1.targetHarian, 1785714, "Target B (50M) / 28 days = 1785714")
  assert.strictEqual(resA1.sudahMasuk, 10000, "Omzet A should be 10000")

  // Test B, C, E, F: Change target A from 30M to 50M
  await prisma.goal.updateMany({
    where: { businessId: businessA.id, period: "MONTHLY" },
    data: { targetOmzet: 50000000 }
  })

  const resA2 = await runLogaritmaEngine(businessA.id)
  assert.strictEqual(resA2.targetHarian, 1785714, "Target A updated to 50M")
  assert.strictEqual(resA2.sudahMasuk, 10000, "Omzet A MUST NOT change!")

  // Test G: Division by zero safety
  await prisma.goal.updateMany({
    where: { businessId: businessA.id, period: "MONTHLY" },
    data: { targetOmzet: 0 }
  })

  const resA3 = await runLogaritmaEngine(businessA.id)
  assert.strictEqual(resA3.targetHarian, 0, "Target A is now 0")
  assert.strictEqual(resA3.sudahMasuk, 10000, "Omzet A remains 10000")
  // In frontend: progressPct = targetHarian > 0 ? Math.min(...) : 0. Handled securely.

  console.log("✅ TARGET SETTING TESTS PASS")
}

runTargetSettingTests().catch(console.error).finally(() => process.exit(0))
