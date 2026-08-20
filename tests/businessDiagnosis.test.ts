import assert from 'node:assert'
import { generateBusinessDiagnosis } from '../src/lib/engines/businessDiagnosisEngine.js'
import { BusinessPattern, PatternEvidence } from '../src/lib/engines/patternDetectionEngine.js'

function runTests() {
  console.log("Running Business Diagnosis Engine Tests...")

  const ev: PatternEvidence = { metric: "Rev", currentValue: 100, previousValue: 90, changePercentage: 11 }
  
  const patterns: BusinessPattern[] = [
    { patternId: "REVENUE_UP_MARGIN_DOWN", category: "PROFITABILITY", severity: "HIGH", confidence: "HIGH", evidence: [ev] },
    { patternId: "REVENUE_UP_TRANSACTION_UP", category: "GROWTH", severity: "INFO", confidence: "HIGH", evidence: [ev] }
  ]

  const diagnoses = generateBusinessDiagnosis(patterns, "HIGH")
  
  // 1. Should deduplicate and rank
  assert.ok(diagnoses.length <= 3, "Max 3 diagnoses")
  assert.strictEqual(diagnoses[0].diagnosisId, "REVENUE_MARGIN_DIVERGENCE") // High severity goes first
  assert.strictEqual(diagnoses[0].severity, "HIGH")

  // 2. Causality Guard - Title should not contain "karena" (because)
  assert.strictEqual(diagnoses[0].title.includes("karena"), false, "Title should not claim causality")
  assert.strictEqual(diagnoses[0].description.includes("karena"), false, "Description should not claim causality")

  // 3. Evidence check
  assert.ok(diagnoses[0].evidence.length > 0)
  assert.strictEqual(diagnoses[0].evidence[0].metric, "Rev")

  console.log("✅ BUSINESS DIAGNOSIS TESTS PASS")
}

runTests()
