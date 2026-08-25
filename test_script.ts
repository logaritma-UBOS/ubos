import { buildLogaritmaState, LogaritmaConfig, RawTransaction, RawProduct } from './src/core/logaritma';

const config: LogaritmaConfig = { targetProfitMonthly: 3000000, budgetBelanjaDaily: 100000 };

function runTests() {
  console.log('--- SCENARIO 1: F&B (Low Profit + Low Stock) ---');
  const s1 = buildLogaritmaState(config, [], [{ qty: 0, status: 'habis' }, { qty: 0 }], { kategoriUsaha: 'F&B' });
  console.log('Primary Action:', s1.primaryAction?.id, '| Priority:', s1.primaryAction?.priority, '| Deskripsi:', s1.primaryAction?.deskripsi);

  console.log('--- SCENARIO 2: Retail (Low Trans + HIGH Confidence) ---');
  const s2 = buildLogaritmaState(config, [{total: 10000}], [{qty: 10}], { kategoriUsaha: 'Retail', umurAkunHari: 30, totalTransaksiHistori: 100 });
  console.log('Primary Action:', s2.primaryAction?.id, '| Tindakan:', s2.primaryAction?.tindakan);

  console.log('--- SCENARIO 3: Jasa (Zero Stock) ---');
  const s3 = buildLogaritmaState(config, [], [{ qty: 0 }], { kategoriUsaha: 'Jasa' });
  const hasStockRec = s3.recommendations.some(r => r.kategori === 'STOK');
  console.log('Has Stock Recommendation:', hasStockRec);

  console.log('--- SCENARIO 4: Data Confidence LOW ---');
  const s4 = buildLogaritmaState(config, [], [{qty: 10}], { kategoriUsaha: 'Retail', umurAkunHari: 1, totalTransaksiHistori: 0 });
  console.log('Primary Action:', s4.primaryAction?.id, '| Tindakan:', s4.primaryAction?.tindakan);

  console.log('--- SCENARIO 5: Low Margin ---');
  // Omzet = 1.000.000, Profit = 400.000 (Because 40% fixed in calculateDailyMetrics!)
  // Wait, if 40% is fixed, how can margin be < 10%? 
  // Let's test if our logic works if profit was low.
  const s5 = buildLogaritmaState(config, [{total_net: 100, total_gross: 10000}], [{qty: 10}], { kategoriUsaha: 'Retail' });
  const hasLowMargin = s5.recommendations.some(r => r.id === 'low_margin');
  console.log('Has Low Margin Rec:', hasLowMargin);

  console.log('--- SCENARIO 6: Evaluation ---');
  const s6 = buildLogaritmaState(config, [{total: 50000}], [{qty: 10}], { kategoriUsaha: 'Retail' }, { actionId: 'test', timestamp: '2026-08-25', metricsSebelum: { dailyProfit: 0, totalTransaksiHari: 0 } });
  console.log('Eval Result:', s6.evaluationResult);
}

runTests();
