import assert from 'node:assert'
import { generateRecommendations } from '../src/lib/engines/recommendationEngineV2.js'
import { BusinessDiagnosis } from '../src/lib/engines/businessDiagnosisEngine.js'

function runTests() {
  console.log("Running Recommendation Engine v2 Tests...")

  const baseDiag: BusinessDiagnosis = {
    diagnosisId: "REVENUE_MARGIN_DIVERGENCE",
    title: "Test",
    description: "Test",
    severity: "HIGH",
    confidence: "HIGH",
    evidence: [{ metric: "test", currentValue: 1, previousValue: 1, changePercentage: 1 }]
  }

  // 1. Guard against LOW Confidence
  const lowRes = generateRecommendations([baseDiag], "LOW")
  assert.strictEqual(lowRes.length, 0, "LOW confidence must yield 0 recommendations")

  // 2. Medium/High Confidence behavior
  const highRes = generateRecommendations([baseDiag], "HIGH")
  assert.strictEqual(highRes.length, 1)
  assert.strictEqual(highRes[0].actionId, "REC_DIVERGENCE_HPP")
  assert.strictEqual(highRes[0].priority, "SUGGESTION")

  // 3. Peak Hour Evidence Guard
  const peakDiagEmpty: BusinessDiagnosis = {
    diagnosisId: "PEAK_HOUR_LOW_MARGIN_MIX",
    title: "Test",
    description: "Test",
    severity: "WATCH",
    confidence: "HIGH",
    evidence: [] // Empty evidence approximation
  }
  const peakResEmpty = generateRecommendations([peakDiagEmpty], "HIGH")
  assert.strictEqual(peakResEmpty.length, 0, "Empty evidence on Peak Hour must yield 0 recommendations")

  const peakDiagValid: BusinessDiagnosis = {
    ...peakDiagEmpty,
    evidence: [{ metric: "Time", currentValue: 1, previousValue: 1, changePercentage: 1 }]
  }
  const peakResValid = generateRecommendations([peakDiagValid], "HIGH")
  assert.strictEqual(peakResValid.length, 1, "Valid evidence on Peak Hour must yield 1 recommendation")

  // 4. Causality Guard - Ensure texts do not contain "karena", "disebabkan"
  const allDiags: BusinessDiagnosis[] = [
    { diagnosisId: "REVENUE_MARGIN_DIVERGENCE", title: "", description: "", severity: "INFO", confidence: "HIGH", evidence: [] },
    { diagnosisId: "PROFITABILITY_CRISIS", title: "", description: "", severity: "INFO", confidence: "HIGH", evidence: [] },
    { diagnosisId: "DEMAND_VOLUME_WEAKENING", title: "", description: "", severity: "INFO", confidence: "HIGH", evidence: [] },
    { diagnosisId: "VOLUME_UP_VALUE_DOWN", title: "", description: "", severity: "INFO", confidence: "HIGH", evidence: [] },
    { diagnosisId: "VOLUME_DOWN_VALUE_UP", title: "", description: "", severity: "INFO", confidence: "HIGH", evidence: [] },
    { diagnosisId: "HIGH_REVENUE_LOW_MARGIN_MIX", title: "", description: "", severity: "INFO", confidence: "HIGH", evidence: [] },
  ]
  const allRecs = generateRecommendations(allDiags, "HIGH")
  for (const r of allRecs) {
    const txt = (r.title + " " + r.description).toLowerCase()
    assert.strictEqual(txt.includes("karena"), false, `Rekomendasi ${r.actionId} tidak boleh mengandung kata 'karena'`)
    assert.strictEqual(txt.includes("disebabkan"), false, `Rekomendasi ${r.actionId} tidak boleh mengandung kata 'disebabkan'`)
    assert.notStrictEqual(r.priority, "CRITICAL", `Priority CRITICAL dilarang di MVP (${r.actionId})`)
  }

  // 5. Deduplication
  const dupRes = generateRecommendations([baseDiag, baseDiag], "HIGH")
  assert.strictEqual(dupRes.length, 1, "Duplicate diagnosis should yield distinct recommendation")

  console.log("✅ RECOMMENDATION ENGINE V2 TESTS PASS")
}

runTests()
