export type TargetPeriod = 'MONTHLY' | 'DAILY' | 'WEEKLY' | 'YEARLY';
export type TargetType = 'REVENUE' | 'LEADS' | 'TRANSACTION' | 'FOLLOWERS' | 'OTHER';

export interface TargetData {
  type: TargetType;
  value: number;
  currentValue: number;
  unit: string;
  period: TargetPeriod;
}

export interface MappingStep {
  label: string;
  value: string;
  subLabel?: string;
}

export interface NeedData {
  gapValue: number;
  gapText: string;
  category: 'TRAFFIC' | 'CONVERSION' | 'TRANSACTION' | 'AVERAGE_VALUE' | 'RETENTION' | 'PRODUCTIVITY' | 'SKILL' | 'SYSTEM' | 'GENERAL';
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ActionPlan {
  action: string;
  target: string;
  frequency: string;
  metric: string;
  expectedResult: string;
}

export function formatCurrency(value: number): string {
  if (value >= 1000000000) return `Rp ${(value / 1000000000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} Miliar`;
  if (value >= 1000000) return `Rp ${(value / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} Juta`;
  if (value >= 1000) return `Rp ${(value / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} Ribu`;
  return `Rp ${value.toLocaleString('id-ID')}`;
}

export function formatNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}M`;
  if (value >= 1000) return `${(value / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}K`;
  return value.toLocaleString('id-ID');
}

export function buildMapping(target: TargetData, profesi: string, businessType: string): MappingStep[] {
  const steps: MappingStep[] = [];
  
  // Format original target
  const isRev = target.type === 'REVENUE';
  const valStr = isRev ? formatCurrency(target.value) : `${formatNumber(target.value)}`;
  const periodStr = target.period === 'MONTHLY' ? '/bulan' : target.period === 'DAILY' ? '/hari' : target.period === 'YEARLY' ? '/tahun' : '/minggu';
  
  steps.push({ label: 'Target Utama', value: `${valStr}${periodStr}` });

  // Breakdown to daily if monthly/yearly
  let dailyValue = target.value;
  if (target.period === 'MONTHLY') dailyValue = target.value / 30;
  if (target.period === 'YEARLY') dailyValue = target.value / 365;
  if (target.period === 'WEEKLY') dailyValue = target.value / 7;

  if (target.period !== 'DAILY') {
    const dailyStr = isRev ? formatCurrency(dailyValue) : `${formatNumber(Math.ceil(dailyValue))}`;
    steps.push({ label: 'Target Harian', value: `${dailyStr}/hari` });
  }

  // Activity breakdown based on type & profesi
  if (target.type === 'REVENUE') {
    // Assume average transaction value based on business type (dummy logic for mapping illustration)
    let atv = 50000;
    if (businessType === 'F&B') atv = 35000;
    if (businessType === 'Jasa') atv = 250000;
    if (businessType === 'Retail') atv = 150000;
    if (profesi === 'Marketing / Agen Coway') atv = 3000000; // Coway products are high ticket

    const dailyTransactions = Math.ceil(dailyValue / atv);
    steps.push({ label: 'Volume Transaksi', value: `${formatNumber(dailyTransactions)} trx/hari`, subLabel: `Asumsi nilai rata-rata: ${formatCurrency(atv)}` });
    
    // Traffic / Leads needed (assume 10% conversion)
    const trafficNeeded = dailyTransactions * 10;
    steps.push({ label: 'Traffic / Leads', value: `${formatNumber(trafficNeeded)} prospek/hari`, subLabel: 'Asumsi konversi 10%' });
  } else if (target.type === 'LEADS' || target.type === 'TRANSACTION') {
    const trafficNeeded = Math.ceil(dailyValue * 5); // 20% conversion
    steps.push({ label: 'Traffic / Pengunjung', value: `${formatNumber(trafficNeeded)} orang/hari`, subLabel: 'Asumsi konversi 20%' });
  } else if (target.type === 'FOLLOWERS') {
    const viewsNeeded = Math.ceil(dailyValue * 100); // 1% follow rate
    steps.push({ label: 'Reach / Views', value: `${formatNumber(viewsNeeded)} views/hari`, subLabel: 'Asumsi 1% rasio follow' });
  }

  return steps;
}

export function analyzeNeeds(target: TargetData): NeedData {
  const gapValue = Math.max(0, target.value - target.currentValue);
  const isRev = target.type === 'REVENUE';
  const valStr = isRev ? formatCurrency(gapValue) : `${formatNumber(gapValue)}`;
  const periodStr = target.period === 'MONTHLY' ? '/bulan' : target.period === 'DAILY' ? '/hari' : target.period === 'YEARLY' ? '/tahun' : '/minggu';

  let confidence: 'LOW' | 'MEDIUM' | 'HIGH' = 'HIGH';
  let gapText = `Gap ${isRev ? 'omzet' : target.type.toLowerCase()} sebesar ${valStr}${periodStr}`;

  if (target.currentValue === 0) {
    confidence = 'LOW';
    gapText = `Data aktual belum cukup. Target Anda adalah mencapai ${isRev ? formatCurrency(target.value) : formatNumber(target.value)}${periodStr} dari kondisi awal.`;
  } else if (target.currentValue < target.value * 0.1) {
    confidence = 'MEDIUM';
    gapText = `Kondisi saat ini masih jauh dari target (Gap: ${valStr}${periodStr}). Dibutuhkan lonjakan konversi yang sistematis.`;
  }

  let category: NeedData['category'] = 'GENERAL';
  if (target.type === 'REVENUE') category = 'TRANSACTION';
  if (target.type === 'LEADS') category = 'TRAFFIC';
  if (target.type === 'FOLLOWERS') category = 'TRAFFIC';

  return { gapValue, gapText, category, confidence };
}

export function generateActionPlan(target: TargetData, needs: NeedData, profesi: string): ActionPlan[] {
  const plans: ActionPlan[] = [];

  if (target.type === 'REVENUE') {
    plans.push({
      action: 'Optimasi & monitoring transaksi',
      target: 'Mencapai target harian',
      frequency: 'Setiap Hari',
      metric: 'Jumlah Transaksi',
      expectedResult: 'Gap omzet harian tertutup'
    });
    plans.push({
      action: 'Aktifkan program repeat order',
      target: '15% pelanggan kembali',
      frequency: 'Mingguan',
      metric: 'Retention Rate',
      expectedResult: 'Peningkatan LTV pelanggan'
    });
  } else if (target.type === 'LEADS' || profesi === 'Marketing / Agen Coway') {
    plans.push({
      action: 'Distribusi penawaran (Funneling)',
      target: 'Prospect Database',
      frequency: 'Setiap Hari',
      metric: 'Jumlah Leads Masuk',
      expectedResult: 'Pipeline penjualan penuh'
    });
    plans.push({
      action: 'Follow-up prospek hangat',
      target: 'Leads yang belum closing',
      frequency: 'Harian (H+1 sd H+3)',
      metric: 'Conversion Rate',
      expectedResult: 'Leads menjadi closing'
    });
  } else if (target.type === 'FOLLOWERS' || profesi === 'Konten Kreator') {
    plans.push({
      action: 'Publikasi konten berkualitas',
      target: 'Audience spesifik',
      frequency: '1-2x Sehari',
      metric: 'Reach / Impressions',
      expectedResult: 'Pertumbuhan traffic organik'
    });
  } else {
    plans.push({
      action: 'Evaluasi alur kerja harian',
      target: 'Meningkatkan produktivitas',
      frequency: 'Setiap Hari',
      metric: 'Output',
      expectedResult: 'Lebih dekat ke target'
    });
  }

  return plans;
}
