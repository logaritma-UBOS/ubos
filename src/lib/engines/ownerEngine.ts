import { prisma } from "@/lib/prisma"

export async function runOwnerEngine() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const fetchMayarBalance = async () => {
    try {
      const MAYAR_API_KEY = process.env.MAYAR_API_KEY || "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0NzExZTAxZi01ZjI4LTQ3MDgtYTc1Yy1iODE2ZjczZjM3YmQiLCJhY2NvdW50SWQiOiJjMTQyNmNkNi1lNTJiLTRmNzktYjlhNS1iMGY4ZmRjMjc2YzMiLCJjcmVhdGVkQXQiOiIxNzg4MDcwMjg2MDAxIiwicm9sZSI6ImRldmVsb3BlciIsInNjb3BlIjp7InJlYWQiOnRydWUsIndyaXRlIjp0cnVlfSwic3ViIjoibG9nYXJpdG1hLnRpbUBnbWFpbC5jb20iLCJuYW1lIjoiTG9nYXJpdG1hIiwibGluayI6ImxvZ2FyaXRtYS1wYXkiLCJpc1NlbGZEb21haW4iOmZhbHNlLCJpYXQiOjE3ODgwNzAyODZ9.i-0x6ok50c2ys7PpkbAEuLESGZHZ6glNpe-OjHnbnnXHjEAYgn2SkrhRxBUcWvDQvOaV8uIs9wo7La4aM0KtDcoHfbiH7jEtrSgEqLPG_50ZbUbhFN-alCT-_CUOUXMhbEbD3Xrh3L-QHOmwwI74-AqhUwius0d762VvF6tfQG8CHvabcn1GJHuYTikAAiKWNpiILDoyReoF2jcGn_vN4zrEoVb8Ma0oed2kBxYZRnEGytnDn45rrMt3TfP96hWBCcQZZO3Yo4UZfbSyiYem3QmT2iNTRw4quUONdcF73Hy7acaUqunIioy52p6PC3gHJVx1eKxsAbzalRZbYjKDLw";
      const balanceRes = await fetch("https://api.mayar.id/hl/v1/balance", {
        headers: { "Authorization": `Bearer ${MAYAR_API_KEY}` },
        next: { revalidate: 60 }
      });
      const balanceData = await balanceRes.json();
      if (balanceData?.data?.balance) {
        return balanceData.data.balance;
      }
    } catch(e) {}
    return 0;
  };

  // PARALLELIZE ALL QUERIES FOR PERFORMANCE
  const [
    targetSetting,
    totalUsers,
    paidUsersQuery,
    recentFeedbacks,
    recentInAppContent,
    upcomingSosmed,
    activePromos,
    currentRevenue
  ] = await Promise.all([
    prisma.systemSetting.findUnique({ where: { key: "MONTHLY_REVENUE_TARGET" } }),
    prisma.user.count(),
    prisma.ubosRevenue.groupBy({ by: ['userId'], where: { status: "PAID" } }),
    prisma.pilotFeedback.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.ubosFeedContent.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.ownerCampaign.count({ where: { objective: 'SOCIAL_MEDIA', startAt: { gte: now } } }),
    prisma.promo.count({ where: { isActive: true } }).catch(() => 0),
    fetchMayarBalance()
  ]);

  const targetRevenue = targetSetting ? parseInt(targetSetting.value, 10) : 10000000;
  
  const premiumUsers = paidUsersQuery.length;
  const freeUsers = totalUsers - premiumUsers;
  
  const gap = targetRevenue - currentRevenue;

  let type = "TRAFFIC";
  let reason = "";
  let actionText = "";
  let ctaLabel = "";
  let ctaHref = "";

  // LOGARITMA BACKWARD MAPPING: Start from GAP -> Conversion -> Traffic -> Retention -> Content/Asset
  if (gap > 0) {
    if (freeUsers > 10) {
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
