import { prisma } from "@/lib/prisma"

export async function runOwnerEngine() {
  // Fetch dynamic target
  const targetSetting = await prisma.systemSetting.findUnique({ where: { key: "MONTHLY_REVENUE_TARGET" } });
  const targetRevenue = targetSetting ? parseInt(targetSetting.value, 10) : 10000000;
  
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Hitung pendapatan bulan ini
  const revenues = await prisma.ubosRevenue.findMany({
    where: { status: "PAID", createdAt: { gte: firstDay } }
  });
  const currentRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
  
  // Hitung jumlah user
  const totalUsers = await prisma.user.count();
  const paidUsersQuery = await prisma.ubosRevenue.groupBy({
    by: ['userId'],
    where: { status: "PAID" }
  });
  
  const premiumUsers = paidUsersQuery.length;
  const freeUsers = totalUsers - premiumUsers;
  
  let type = "TRAFFIC";
  let reason = "Trafik pendaftaran terlihat sepi. Fokus datangkan lebih banyak pengunjung ke Landing Page.";
  let actionText = "Tingkatkan akuisisi pengguna baru bulan ini.";
  let ctaLabel = "Kelola Trafik";
  let ctaHref = "/admin/pilot/trafik";
  
  if (totalUsers < 20) {
    type = "TRAFFIC";
    reason = "User base masih sangat sedikit. Sistem butuh lebih banyak user untuk dianalisa.";
    actionText = "Tingkatkan trafik dan akuisisi user baru.";
    ctaLabel = "Kelola Trafik";
    ctaHref = "/admin/pilot/trafik";
  } else if (freeUsers > (premiumUsers * 2)) {
    type = "CONVERSION";
    reason = "Banyak user gratis (Free) yang belum berdonasi. Segera eksekusi strategi konversi (seperti promosi atau penyesuaian nag screen).";
    actionText = "Fokus ubah Free User menjadi Premium User.";
    ctaLabel = "Optimasi Konversi";
    ctaHref = "/admin/pilot/konversi";
  } else {
    type = "RELATIONSHIP";
    reason = "Rasio konversi sudah cukup baik. Rawat user VIP Anda, kumpulkan testimoni, dan tawarkan layanan upsell.";
    actionText = "Rawat pelanggan VIP & tingkatkan Upsell.";
    ctaLabel = "Kelola Relationship";
    ctaHref = "/admin/pilot/relationship";
  }
  
  const gap = targetRevenue - currentRevenue;
  
  return {
    target: targetRevenue,
    actual: currentRevenue,
    gap: gap > 0 ? gap : 0,
    recommendation: {
      type,
      reason,
      actionText,
      ctaLabel,
      ctaHref
    },
    metrics: {
      totalUsers,
      freeUsers,
      premiumUsers
    }
  };
}
