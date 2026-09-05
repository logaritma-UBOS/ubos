import { prisma } from "@/lib/prisma"

export async function runOwnerEngine() {
  // Fetch dynamic target
  const targetSetting = await prisma.systemSetting.findUnique({ where: { key: "MONTHLY_REVENUE_TARGET" } });
  const targetRevenue = targetSetting ? parseInt(targetSetting.value, 10) : 10000000;
  
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
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
  
  // Cek matrik lain
  const recentFeedbacks = await prisma.pilotFeedback.count({
    where: { createdAt: { gte: sevenDaysAgo } }
  });

  const recentInAppContent = await prisma.ubosFeedContent.count({
    where: { createdAt: { gte: sevenDaysAgo } }
  });

  const upcomingSosmed = await prisma.ownerCampaign.count({
    where: { objective: 'SOCIAL_MEDIA', startAt: { gte: now } }
  });

  const activePromos = await prisma.promo.count({
    where: { isActive: true }
  }).catch(() => 0);
  
  const gap = targetRevenue - currentRevenue;

  let type = "TRAFFIC";
  let reason = "";
  let actionText = "";
  let ctaLabel = "";
  let ctaHref = "";

  // LOGARITMA BACKWARD MAPPING: Start from GAP -> Conversion -> Traffic -> Retention -> Content/Asset
  if (gap > 0) {
    if (freeUsers > 10) {
      // Punya user gratis tapi belum bayar.
      if (activePromos === 0) {
        type = "PROMO";
        reason = "Banyak user gratis (Free) namun tidak ada pancingan (Hook). Buat kode promo untuk mendesak mereka Upgrade.";
        actionText = "Buat Promo untuk mempercepat Konversi.";
        ctaLabel = "Kelola Promo";
        ctaHref = "/admin/pilot/promo";
      } else {
        type = "CONVERSION";
        reason = "Banyak user gratis (Free) yang belum berdonasi. Eksekusi strategi konversi melalui WhatsApp Follow Up atau edukasi.";
        actionText = "Fokus ubah Free User menjadi Premium User.";
        ctaLabel = "Optimasi Konversi";
        ctaHref = "/admin/pilot/konversi";
      }
    } else {
      // User gratis terlalu sedikit.
      if (upcomingSosmed === 0) {
        type = "SOSMED";
        reason = "Stok peluru konten sosial media kosong. Sulit mendatangkan trafik baru tanpa konten distribusi.";
        actionText = "Jadwalkan Konten Sosmed Baru.";
        ctaLabel = "Kalender Konten";
        ctaHref = "/admin/pilot/kalender-konten";
      } else {
        type = "TRAFFIC";
        reason = "Kolam (User Base) masih terlalu kecil untuk menghasilkan konversi maksimal. Sebarkan link pendaftaran.";
        actionText = "Tingkatkan trafik dan akuisisi user baru.";
        ctaLabel = "Kelola Trafik";
        ctaHref = "/admin/pilot/trafik";
      }
    }
  } else {
    // Target tercapai. Fokus pada RAWAT & TUMBUH.
    if (recentFeedbacks > 0) {
      type = "FEEDBACK";
      reason = "Ada masukan / saran baru dari tenant dalam 7 hari terakhir. Dengarkan keluhan mereka agar tidak churn.";
      actionText = "Tinjau dan balas Masukan / Saran tenant.";
      ctaLabel = "Buka Feedback";
      ctaHref = "/admin/pilot/feedback";
    } else if (recentInAppContent === 0) {
      type = "IN_APP_CONTENT";
      reason = "Sudah 7 hari tenant tidak mendapatkan asupan edukasi di dashboard mereka. Berikan mereka tips bisnis terbaru.";
      actionText = "Buat Konten Edukasi In-App.";
      ctaLabel = "Buat Konten In-App";
      ctaHref = "/admin/pilot/konten";
    } else {
      type = "RELATIONSHIP";
      reason = "Semua matrik sehat. Rawat user VIP Anda, kumpulkan testimoni, dan tawarkan layanan upsell premium (Coway/Lainnya).";
      actionText = "Rawat pelanggan VIP & tawarkan Upsell.";
      ctaLabel = "Kelola Relationship";
      ctaHref = "/admin/pilot/relationship";
    }
  }
  
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
