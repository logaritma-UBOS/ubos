import { prisma } from "../prisma";
import { getStartOfDayUTC } from "../engines/timeEngine";

const OWNER_TZ = "Asia/Jakarta";

export interface Opportunity {
  id: string;
  type: "ACTIVATION" | "RETENTION" | "FEATURE_ADOPTION" | "USER_GROWTH" | "MONETIZATION" | "CAMPAIGN";
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  confidence: "HIGH" | "MEDIUM" | "LOW";
  current: number;
  target: number;
  gap: number;
  diagnosis: string;
  audience: string;
  recommendedAction: string;
  recommendedMessage: string;
  expectedResult: string;
  impactScore: number;
  numberOfAffectedUsers: number;
}

function calculatePriority(gapPercentage: number, affectedUsers: number): "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" {
  const impact = gapPercentage * affectedUsers;
  if (impact > 1000) return "CRITICAL";
  if (impact > 500) return "HIGH";
  if (impact > 100) return "MEDIUM";
  return "LOW";
}

export async function getOwnerOpportunities(): Promise<Opportunity[]> {
  const opps: Opportunity[] = [];
  
  // 1. ACTIVATION OPPORTUNITY
  const totalRegistered = await prisma.user.count();
  const totalBusiness = await prisma.business.count();
  
  // Real event check (business_created vs pos_transaction_completed vs hpp_created)
  const businessesWithHpp = await prisma.pilotEvent.groupBy({
    by: ['businessId'],
    where: { eventName: 'hpp_created', businessId: { not: "" } }
  });
  
  const businessesWithTx = await prisma.pilotEvent.groupBy({
    by: ['businessId'],
    where: { eventName: 'pos_transaction_completed', businessId: { not: "" } }
  });

  const hppCount = businessesWithHpp.length;
  const txCount = businessesWithTx.length;
  
  if (totalBusiness > 0) {
    const gapHppTx = hppCount - txCount;
    if (gapHppTx > 0) {
      const gapPerc = (gapHppTx / hppCount) * 100;
      opps.push({
        id: "opp_act_hpp_tx",
        type: "ACTIVATION",
        priority: calculatePriority(gapPerc, gapHppTx),
        severity: gapPerc > 50 ? "HIGH" : "MEDIUM",
        confidence: "HIGH",
        current: txCount,
        target: hppCount,
        gap: gapHppTx,
        diagnosis: "HPP -> First Transaction adalah bottleneck utama. Banyak merchant sudah membuat resep tapi belum transaksi.",
        audience: "User yang sudah membuat HPP tetapi belum transaksi",
        recommendedAction: "Jalankan activation campaign / edukasi merchant.",
        recommendedMessage: "Mulai transaksi pertamamu menggunakan HPP yang sudah kamu buat!",
        expectedResult: "Peningkatan First Transaction",
        impactScore: gapPerc * gapHppTx,
        numberOfAffectedUsers: gapHppTx
      });
    }
  }

  // 2. RETENTION OPPORTUNITY (Active users inactive for 14 days)
  const now = new Date();
  const startOfToday = getStartOfDayUTC(OWNER_TZ, now);
  const fourteenDaysAgo = new Date(startOfToday.getTime() - 14 * 24 * 60 * 60 * 1000);
  
  const allBizIds = await prisma.business.findMany({ select: { id: true } });
  
  // Businesses active previously but not in last 14 days
  const recentEvents = await prisma.pilotEvent.groupBy({
    by: ['businessId'],
    where: { 
      createdAt: { gte: fourteenDaysAgo },
      businessId: { not: "" }
    }
  });
  const activeBiz14d = new Set(recentEvents.map(e => e.businessId));
  const dormantBizCount = allBizIds.filter(b => !activeBiz14d.has(b.id)).length;
  
  if (dormantBizCount > 0) {
    opps.push({
      id: "opp_ret_dormant",
      type: "RETENTION",
      priority: calculatePriority((dormantBizCount / allBizIds.length)*100, dormantBizCount),
      severity: dormantBizCount > (allBizIds.length * 0.3) ? "HIGH" : "MEDIUM",
      confidence: "HIGH",
      current: activeBiz14d.size,
      target: allBizIds.length,
      gap: dormantBizCount,
      diagnosis: "Banyak user tidak aktif selama lebih dari 14 hari.",
      audience: "Dormant users (>14 hari tidak ada aktivitas)",
      recommendedAction: "Kirim Retention Reminder / Re-engagement",
      recommendedMessage: "Kami merindukan Anda di UBOS! Lihat fitur terbaru kami.",
      expectedResult: "User kembali aktif",
      impactScore: (dormantBizCount / allBizIds.length)*100 * dormantBizCount,
      numberOfAffectedUsers: dormantBizCount
    });
  }

  // SORT BY IMPACT
  opps.sort((a, b) => b.impactScore - a.impactScore);

  return opps;
}

export async function getDailyBrief(opps: Opportunity[]) {
  if (opps.length === 0) return null;
  const top = opps[0];
  return {
    kondisi: `Ditemukan bottleneck pada ${top.type} (${top.gap} user terdampak).`,
    masalah: top.diagnosis,
    dampak: `${top.numberOfAffectedUsers} user terdampak`,
    penyebab: top.diagnosis,
    action: top.recommendedAction,
    expectedResult: top.expectedResult
  };
}
