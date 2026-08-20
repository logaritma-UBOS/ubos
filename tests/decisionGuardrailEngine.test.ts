import assert from 'node:assert'
import { applyDecisionGuardrail } from '../src/lib/engines/decisionGuardrailEngine.js'
import { RecommendationAction } from '../src/lib/engines/recommendationEngineV2.js'
import { BusinessDiagnosis } from '../src/lib/engines/businessDiagnosisEngine.js'

function runTests() {
  console.log("Running Decision Guardrail Engine Tests...")

  const diag1: BusinessDiagnosis = {
    diagnosisId: "REVENUE_MARGIN_DIVERGENCE", title: "Diag 1", description: "Diag 1", severity: "HIGH", confidence: "HIGH",
    evidence: [{ metric: "Margin", currentValue: 10, previousValue: 20, changePercentage: -50 }] // > 15 = STRONG
  }
  
  const rec1: RecommendationAction = {
    actionId: "REC_DIVERGENCE_HPP", title: "Rec 1", description: "Rec 1 desc",
    impactArea: "PROFITABILITY", priority: "SUGGESTION", riskLevel: "HIGH_RISK", relatedDiagnosisId: "REVENUE_MARGIN_DIVERGENCE"
  }

  // TEST 1: LOW CONFIDENCE SUPPRESSION
  const lowConfRes = applyDecisionGuardrail([rec1], [diag1], "LOW")
  assert.strictEqual(lowConfRes.length, 0, "LOW confidence must suppress everything")

  // TEST 2: MISSING DIAGNOSIS SUPPRESSION
  const missingDiagRes = applyDecisionGuardrail([rec1], [], "HIGH")
  assert.strictEqual(missingDiagRes.length, 0, "Missing diagnosis must suppress")

  // TEST 3: EMPTY EVIDENCE SUPPRESSION
  const diagEmptyEv: BusinessDiagnosis = { ...diag1, evidence: [] }
  const emptyEvRes = applyDecisionGuardrail([rec1], [diagEmptyEv], "HIGH")
  assert.strictEqual(emptyEvRes.length, 0, "Empty evidence must suppress")

  // TEST 4: WEAK EVIDENCE SUPPRESSION
  const diagWeakEv: BusinessDiagnosis = { ...diag1, evidence: [{ metric: "M", currentValue: 1, previousValue: 1, changePercentage: 4 }] } // < 5 = WEAK
  const weakEvRes = applyDecisionGuardrail([rec1], [diagWeakEv], "HIGH")
  assert.strictEqual(weakEvRes.length, 0, "Weak evidence (<5% delta) must suppress")

  // TEST 5: HIGH RISK REQUIRES STRONG EVIDENCE + HIGH CONFIDENCE
  // diag1 has STRONG evidence. confidence is HIGH. Should PASS.
  const highRiskPassRes = applyDecisionGuardrail([rec1], [diag1], "HIGH")
  assert.strictEqual(highRiskPassRes.length, 1, "HIGH risk passes on HIGH conf & STRONG ev")
  
  // High risk, Medium confidence -> Suppress
  const highRiskFailRes = applyDecisionGuardrail([rec1], [diag1], "MEDIUM")
  assert.strictEqual(highRiskFailRes.length, 0, "HIGH risk suppressed on MEDIUM conf")

  // TEST 6: CRITICAL SUPPRESSION
  const recCritical: RecommendationAction = { ...rec1, priority: "CRITICAL", actionId: "REC_CRITICAL" }
  const criticalRes = applyDecisionGuardrail([recCritical], [diag1], "HIGH")
  assert.strictEqual(criticalRes.length, 0, "CRITICAL priority must be suppressed")

  // TEST 7: DEDUPLICATION BY IMPACT AREA
  const rec2: RecommendationAction = { ...rec1, actionId: "REC_2", title: "Rec 2", riskLevel: "LOW_RISK" }
  const dupRes = applyDecisionGuardrail([rec1, rec2], [diag1], "HIGH")
  assert.strictEqual(dupRes.length, 1, "Must deduplicate based on impactArea")
  assert.strictEqual(dupRes[0].actionId, "REC_2", "Lower risk should win on deduplication if severity & strength are equal")

  // TEST 8: CONFLICT RESOLUTION
  const diag2: BusinessDiagnosis = {
    diagnosisId: "DEMAND_VOLUME_WEAKENING", title: "Diag 2", description: "Diag 2", severity: "MEDIUM", confidence: "HIGH",
    evidence: [{ metric: "Tx", currentValue: 10, previousValue: 20, changePercentage: -50 }] // STRONG
  }
  const recVol: RecommendationAction = {
    actionId: "REC_VOLUME_WEAKENING", title: "Rec Vol", description: "Rec Vol", impactArea: "TRANSACTION", priority: "MAINTENANCE", riskLevel: "MEDIUM_RISK", relatedDiagnosisId: "DEMAND_VOLUME_WEAKENING"
  }
  const diag3: BusinessDiagnosis = {
    diagnosisId: "VOLUME_DOWN_VALUE_UP", title: "Diag 3", description: "Diag 3", severity: "HIGH", confidence: "HIGH",
    evidence: [{ metric: "AOV", currentValue: 10, previousValue: 5, changePercentage: 100 }] // STRONG
  }
  const recPrem: RecommendationAction = {
    actionId: "REC_PREMIUM_FOCUS", title: "Rec Prem", description: "Rec Prem", impactArea: "AOV", priority: "MAINTENANCE", riskLevel: "LOW_RISK", relatedDiagnosisId: "VOLUME_DOWN_VALUE_UP"
  }
  // Conflict mapping: REC_PREMIUM_FOCUS vs REC_VOLUME_WEAKENING
  // diag3 (HIGH) vs diag2 (MEDIUM). REC_PREMIUM_FOCUS should win.
  const conflictRes = applyDecisionGuardrail([recVol, recPrem], [diag2, diag3], "HIGH")
  assert.strictEqual(conflictRes.length, 1, "Conflict resolved to 1")
  assert.strictEqual(conflictRes[0].actionId, "REC_PREMIUM_FOCUS", "Winner by higher severity")

  // TEST 9: SATURATION (Max 3)
  const diagList: BusinessDiagnosis[] = [diag1, diag2, diag3, { ...diag1, diagnosisId: "AOV_VALUE_CHANGE" }]
  const recList: RecommendationAction[] = [
    { ...rec1, impactArea: "PROFITABILITY" },
    { ...recVol, impactArea: "TRANSACTION" },
    { ...recPrem, actionId: "REC_NO_CONFLICT", impactArea: "AOV" }, // bypass conflict rule name
    { ...recPrem, actionId: "REC_EXTRA", impactArea: "TIME", relatedDiagnosisId: "AOV_VALUE_CHANGE" }
  ]
  const satRes = applyDecisionGuardrail(recList, diagList, "HIGH")
  assert.strictEqual(satRes.length, 3, "Saturation must cap at 3")

  // TEST 10: CAUSALITY GUARD IN TEST ITSELF
  for (const r of satRes) {
    const text = (r.title + " " + r.description).toLowerCase()
    assert.strictEqual(text.includes("karena"), false, "No causality 'karena'")
    assert.strictEqual(text.includes("disebabkan"), false, "No causality 'disebabkan'")
  }

  // TEST 11: INVENTORY CONTEXTUAL SUPPRESSION (RULE 8)
  const productMix = [
    { productId: "PROD_X", quadrant: "VOLUME_TINGGI_MARGIN_PERHATIAN" as any }
  ]
  const invContext = {
    "PROD_X": {
      productId: "PROD_X", hasRecipe: true, stockAvailable: 0, isOutOfStock: true, isLowStock: true
    }
  }
  const recReprice: RecommendationAction = {
    actionId: "REC_REPRICE_HIGH_REV", title: "Reprice", description: "Reprice", impactArea: "PRODUCT_MIX", priority: "SUGGESTION", riskLevel: "HIGH_RISK", relatedDiagnosisId: "HIGH_REVENUE_LOW_MARGIN_MIX"
  }
  const diagReprice: BusinessDiagnosis = {
    diagnosisId: "HIGH_REVENUE_LOW_MARGIN_MIX", title: "Diag Reprice", description: "Diag Reprice", severity: "HIGH", confidence: "HIGH", evidence: [{ metric: "Margin", currentValue: 10, previousValue: 20, changePercentage: 50 }]
  }

  // High revenue product is OOS -> suppress REC_REPRICE_HIGH_REV
  const invRes1 = applyDecisionGuardrail([recReprice], [diagReprice], "HIGH", productMix, invContext)
  assert.strictEqual(invRes1.length, 0, "Should suppress REC_REPRICE_HIGH_REV if CASH_COW product is OOS")

  // If product is NOT out of stock, should pass
  const invContextPass = {
    "PROD_X": {
      productId: "PROD_X", hasRecipe: true, stockAvailable: 5, isOutOfStock: false, isLowStock: false
    }
  }
  const invRes2 = applyDecisionGuardrail([recReprice], [diagReprice], "HIGH", productMix, invContextPass)
  assert.strictEqual(invRes2.length, 1, "Should NOT suppress if product is available")

  console.log("✅ DECISION GUARDRAIL ENGINE TESTS PASS")
}

runTests()
