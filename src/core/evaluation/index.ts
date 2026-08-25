import type { BusinessMetrics } from '../recommendation';

export interface ActionRecord {
  actionId: string;
  timestamp: string;
  metricsSebelum: Partial<BusinessMetrics>;
}

export interface EvaluationResult {
  isImproved: boolean;
  deltaProfit: number;
  deltaSales: number;
  kesimpulan: string;
}

export function evaluateAction(
  record: ActionRecord,
  currentMetrics: BusinessMetrics
): EvaluationResult {
  const profitSebelum = record.metricsSebelum.dailyProfit || 0;
  const salesSebelum = record.metricsSebelum.totalTransaksiHari || 0;
  
  const deltaProfit = currentMetrics.dailyProfit - profitSebelum;
  const deltaSales = currentMetrics.totalTransaksiHari - salesSebelum;
  
  const isImproved = deltaProfit > 0 || deltaSales > 0;
  
  let kesimpulan = 'Belum ada perubahan signifikan.';
  if (deltaProfit > 0) kesimpulan = 'Profit meningkat Rp ' + deltaProfit.toLocaleString('id-ID') + ' setelah tindakan.';
  else if (deltaSales > 0) kesimpulan = 'Ada peningkatan ' + deltaSales + ' transaksi baru.';

  return {
    isImproved,
    deltaProfit,
    deltaSales,
    kesimpulan
  };
}
