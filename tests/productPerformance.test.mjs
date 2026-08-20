import assert from 'node:assert'
import { calculateProductPerformance } from '../src/lib/engines/productPerformanceEngine.js'

// Mock Data
const currentSales = [
  {
    id: "tx1",
    saleItems: [
      { productId: "p1", product: { name: "Produk A" }, quantity: 2, priceAtSale: 10000, hppAtSale: 6000 },
      { productId: "p2", product: { name: "Produk B" }, quantity: 1, priceAtSale: 15000, hppAtSale: 10000 }
    ]
  },
  {
    id: "tx2",
    saleItems: [
      { productId: "p1", product: { name: "Produk A" }, quantity: 3, priceAtSale: 10000, hppAtSale: 6000 }
    ]
  },
  // Zero revenue product mock
  {
    id: "tx3",
    saleItems: [
      { productId: "p3", product: { name: "Produk C Zero" }, quantity: 1, priceAtSale: 0, hppAtSale: 0 }
    ]
  }
]

const previousSales = [
  {
    id: "txPrev1",
    saleItems: [
      { productId: "p1", product: { name: "Produk A" }, quantity: 2, priceAtSale: 10000, hppAtSale: 6000 },
      { productId: "p2", product: { name: "Produk B" }, quantity: 3, priceAtSale: 15000, hppAtSale: 10000 }
    ]
  }
]

function runTests() {
  const activeDays = 7
  const result = calculateProductPerformance(currentSales, previousSales, activeDays)
  
  // Find Product A
  const pA = result.find(p => p.productId === "p1")
  const pB = result.find(p => p.productId === "p2")
  const pC = result.find(p => p.productId === "p3")

  // Test salesVolume
  assert.strictEqual(pA.salesVolume, 5) // 2 + 3
  
  // Test revenue
  assert.strictEqual(pA.revenue, 50000)
  
  // Test grossProfit
  // Rev: 50000. HPP: 5 * 6000 = 30000. Gross Profit: 20000.
  assert.strictEqual(pA.grossProfit, 20000)
  
  // Test margin
  // GP: 20000, Rev: 50000 => 40%
  assert.strictEqual(pA.margin, 40)
  
  // Test transactionCount
  assert.strictEqual(pA.transactionCount, 2)
  
  // Test Trend & Percentage
  // pA current rev: 50000. prev rev: 20000. Diff = 30000. 30000/20000 = 150%
  assert.strictEqual(pA.trend, "UP")
  assert.strictEqual(pA.trendPercentage, 150)
  
  // pB current rev: 15000. prev rev: 45000. Diff = -30000. -30000/45000 = -66.66%
  assert.strictEqual(pB.trend, "DOWN")
  assert.ok(pB.trendPercentage < -66 && pB.trendPercentage > -67)

  // Zero revenue test
  assert.strictEqual(pC.revenue, 0)
  assert.strictEqual(pC.margin, 0) // NaN check
  assert.strictEqual(pC.trend, "NEW")
  
  console.log("✅ PRODUCT PERFORMANCE UNIT TESTS PASS")
}

runTests()
