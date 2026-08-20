import assert from 'node:assert'
import { detectPatterns, PatternDetectionInput } from '../src/lib/engines/patternDetectionEngine.js'

function runTests() {
  console.log("Running Pattern Detection Engine Tests...")

  const baseInput: PatternDetectionInput = {
    revenue: { current: 11000, previous: 10000 },
    transaction: { current: 11, previous: 10 },
    aov: { current: 1000, previous: 1000 },
    margin: { current: 50, previous: 50 },
    hasHighRevenueLowMarginProduct: false,
    isPeakHourLowMargin: false,
    confidence: "HIGH"
  }

  // TEST 1: REVENUE UP, TX UP
  const res1 = detectPatterns(baseInput)
  assert.strictEqual(res1.some(p => p.patternId === "REVENUE_UP_TRANSACTION_UP"), true)

  // TEST 2: REVENUE UP, MARGIN DOWN
  const mDownInput = { ...baseInput, margin: { current: 30, previous: 50 } }
  const res2 = detectPatterns(mDownInput)
  assert.strictEqual(res2.some(p => p.patternId === "REVENUE_UP_MARGIN_DOWN"), true)

  // TEST 3: FLAT THRESHOLD (< 5%)
  const flatInput = { ...baseInput, revenue: { current: 10100, previous: 10000 } } // 1% change
  const res3 = detectPatterns(flatInput)
  // Should NOT have REVENUE_UP_TRANSACTION_UP because rev is FLAT
  assert.strictEqual(res3.some(p => p.patternId === "REVENUE_UP_TRANSACTION_UP"), false)

  // TEST 4: Zero division fallback
  const zeroInput = { ...baseInput, revenue: { current: 1000, previous: 0 } }
  const res4 = detectPatterns(zeroInput)
  // 1000 vs 0 => UP (100%)
  assert.strictEqual(res4.some(p => p.patternId === "REVENUE_UP_TRANSACTION_UP"), true)

  console.log("✅ PATTERN DETECTION TESTS PASS")
}

runTests()
