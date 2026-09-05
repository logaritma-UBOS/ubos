"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { logPilotActivityRaw } from "@/lib/pilotAudit";

export async function submitDailyActivity(activityType: string, note: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");
  
  const userName = session.user.name || "Unknown";
  const userEmail = session.user.email;
  
  const TARGET_EMAILS = [
    "logaritma.tim@gmail.com",
    "tony@logaritma.id",
    "reza@logaritma.id",
    "bana@logaritma.id"
  ];
  
  if (!TARGET_EMAILS.includes(userEmail)) {
     throw new Error("Bukan anggota tim internal");
  }

  const detail = note ? `${activityType} - Catatan: ${note}` : activityType;
  await logPilotActivityRaw(userName, userEmail, "Check-in Aktivitas Harian", detail);
  
  return { success: true };
}

// 1. Performa Trafik
export async function getTrafikAnalytics() {
  const [totalVisits, uniquePaths, recentVisits, topPaths] = await Promise.all([
    prisma.visitorAnalytics.count(),
    prisma.visitorAnalytics.groupBy({
      by: ['path'],
      _count: { path: true },
      orderBy: { _count: { path: 'desc' } },
      take: 5
    }),
    prisma.visitorAnalytics.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    prisma.visitorAnalytics.groupBy({
      by: ['path'],
      _count: { path: true },
      orderBy: { _count: { path: 'desc' } },
      take: 10
    })
  ]);

  return { totalVisits, uniquePaths: uniquePaths.length, recentVisits, topPaths };
}

// 2. Performa Konversi
export async function getKonversiAnalytics() {
  const [totalUsers, totalBusinesses, revenueRows] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.business.count(),
    prisma.ubosRevenue.findMany()
  ]);

  const totalRevenue = revenueRows.reduce((sum, r) => sum + r.amount, 0);
  const premiumUsersCount = new Set(revenueRows.map(r => r.userId)).size;
  const conversionRate = totalUsers > 0 ? (premiumUsersCount / totalUsers) * 100 : 0;

  return { totalUsers, totalBusinesses, totalRevenue, premiumUsersCount, conversionRate };
}

// 3. Performa Relationship
export async function getRelationshipAnalytics() {
  const [totalFeedback, activeCampaigns, totalOwnerActions] = await Promise.all([
    prisma.pilotFeedback.count(),
    prisma.ownerCampaign.count(),
    prisma.ownerAction.count()
  ]);

  const recentFeedbacks = await prisma.pilotFeedback.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { business: true }
  });

  return { totalFeedback, activeCampaigns, totalOwnerActions, recentFeedbacks };
}

// 4. Performa Tim
export async function getTeamAnalytics() {
  const TARGET_EMAILS = [
    "logaritma.tim@gmail.com",
    "tony@logaritma.id",
    "reza@logaritma.id",
    "bana@logaritma.id"
  ];

  const teamMembers = await prisma.user.findMany({
    where: { 
      role: "OWNER",
      email: { in: TARGET_EMAILS }
    },
    select: { id: true, name: true, email: true, createdAt: true }
  });

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const stats = await Promise.all(teamMembers.map(async (member) => {
    const logs = await prisma.pilotActivityLog.findMany({
      where: { ownerEmail: member.email }
    });

    const loginLogs = logs.filter(l => l.action.toLowerCase().includes("login"));
    const actionLogs = logs.filter(l => !l.action.toLowerCase().includes("login"));

    const loginDay = loginLogs.filter(l => new Date(l.createdAt) >= startOfDay).length;
    const loginWeek = loginLogs.filter(l => new Date(l.createdAt) >= startOfWeek).length;
    const loginMonth = loginLogs.filter(l => new Date(l.createdAt) >= startOfMonth).length;

    const actionDay = actionLogs.filter(l => new Date(l.createdAt) >= startOfDay).length;
    const actionWeek = actionLogs.filter(l => new Date(l.createdAt) >= startOfWeek).length;
    const actionMonth = actionLogs.filter(l => new Date(l.createdAt) >= startOfMonth).length;

    // Simple performance status logic based on this month's activity
    let status = "SANGAT PASIF";
    let color = "red";
    if (actionMonth >= 10 || loginMonth >= 15) { status = "AKTIF"; color = "emerald"; }
    else if (actionMonth >= 5 || loginMonth >= 7) { status = "PASIF"; color = "amber"; }

    return {
      ...member,
      loginDay, loginWeek, loginMonth,
      actionDay, actionWeek, actionMonth,
      status, color
    };
  }));

  const recentActivities = await prisma.pilotActivityLog.findMany({
    where: { ownerEmail: { in: TARGET_EMAILS } },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  return { teamMembers: stats, recentActivities };
}
