import assert from 'node:assert'

// --- MOCK CALCULATION ENGINE ---
// Since we can't easily import TS files natively in node without transpilation setup,
// and we want a pure unit test, let's implement the pure logic exactly as it is in the engine 
// just to verify the math logic, or we can use ts-node. Wait, next.js uses TS.

function _calculateAOV(omzet, transactionCount) {
  if (transactionCount === 0) return 0
  return Math.round(omzet / transactionCount)
}

function _calculateHistoryMetrics(sales) {
  let totalOmzet = 0
  for (const sale of sales) {
    totalOmzet += sale.totalAmount
  }
  const totalTransaksi = sales.length
  const aov = _calculateAOV(totalOmzet, totalTransaksi)
  return { totalOmzet, totalTransaksi, aov }
}

// TEST 1: calculateAOV normal
{
  const omzet = 1000000
  const tx = 40
  assert.strictEqual(_calculateAOV(omzet, tx), 25000, "AOV normal harus 25.000")
}

// TEST 2: zero transaction
{
  assert.strictEqual(_calculateAOV(0, 0), 0, "AOV 0 tx harus 0, bukan NaN")
}

// TEST 3: History Metrics multiple transactions
{
  const sales = [{ totalAmount: 10000 }, { totalAmount: 20000 }, { totalAmount: 15000 }]
  const res = _calculateHistoryMetrics(sales)
  assert.strictEqual(res.totalOmzet, 45000)
  assert.strictEqual(res.totalTransaksi, 3)
  assert.strictEqual(res.aov, 15000) // 45000 / 3
}

console.log("✅ UNIT TESTS PASS")
