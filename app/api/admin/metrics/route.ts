// app/api/admin/metrics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// Simple in-memory cache with TTL
const metricsCache: {
  data: any;
  timestamp: number;
  ttl: number;
} = {
  data: null,
  timestamp: 0,
  ttl: 5 * 60 * 1000, // 5 minutes in milliseconds
};

function isCacheValid(): boolean {
  return (
    metricsCache.data !== null &&
    Date.now() - metricsCache.timestamp < metricsCache.ttl
  );
}

async function fetchAdminMetrics() {
  try {
    // Get total users by role
    const totalUsers = await prisma.user.count();
    const totalPatients = await prisma.user.count({
      where: { role: "PATIENT" },
    });
    const totalDoctors = await prisma.user.count({
      where: { role: "DOCTOR" },
    });
    const totalAdmins = await prisma.user.count({
      where: { role: "ADMIN" },
    });

    // Get total consultations
    const totalConsultations = await prisma.consultation.count();

    // Get consultation status breakdown
    const consultationsByStatus = await prisma.consultation.groupBy({
      by: ["status"],
      _count: true,
    });

    // Get consultation risk distribution
    const consultationsByRisk = await prisma.consultation.groupBy({
      by: ["riskLevel"],
      _count: true,
    });

    // Get average consultations per doctor
    const doctorsWithConsultations = await prisma.user.findMany({
      where: { role: "DOCTOR" },
      select: {
        id: true,
        name: true,
        _count: {
          select: { consultationsAsDoctor: true },
        },
      },
    });

    const avgConsultationsPerDoctor =
      doctorsWithConsultations.length > 0
        ? doctorsWithConsultations.reduce(
            (sum, doc) => sum + doc._count.consultationsAsDoctor,
            0
          ) / doctorsWithConsultations.length
        : 0;

    // Get high-risk consultations
    const highRiskConsultations = await prisma.consultation.count({
      where: { riskLevel: "HIGH" },
    });

    // Get recent audit logs
    const recentAuditLogs = await prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 10,
      select: {
        id: true,
        module: true,
        action: true,
        userId: true,
        timestamp: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Get consultations created in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const consultationsLastWeek = await prisma.consultation.count({
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
    });

    // Get blockchain records count
    const blockchainRecords = await prisma.blockchainRecord.count();

    // Get ML inference logs count
    const mlInferenceLogs = await prisma.mLInferenceLog.count();

    return {
      users: {
        total: totalUsers,
        patients: totalPatients,
        doctors: totalDoctors,
        admins: totalAdmins,
      },
      consultations: {
        total: totalConsultations,
        lastWeek: consultationsLastWeek,
        highRisk: highRiskConsultations,
        avgPerDoctor: Math.round(avgConsultationsPerDoctor * 100) / 100,
        byStatus: consultationsByStatus.map((item) => ({
          status: item.status,
          count: item._count,
        })),
        byRisk: consultationsByRisk.map((item) => ({
          riskLevel: item.riskLevel,
          count: item._count,
        })),
      },
      integrations: {
        blockchainRecords,
        mlInferenceLogs,
      },
      recentActivity: recentAuditLogs,
    };
  } catch (error) {
    console.error("[ADMIN METRICS API] Error fetching metrics:", error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check cache first
    if (isCacheValid()) {
      console.log("[ADMIN METRICS API] Serving from cache");
      return NextResponse.json(metricsCache.data);
    }

    // Fetch fresh data
    const data = await fetchAdminMetrics();

    // Update cache
    metricsCache.data = data;
    metricsCache.timestamp = Date.now();

    return NextResponse.json(data);
  } catch (error) {
    console.error("[ADMIN METRICS API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin metrics" },
      { status: 500 }
    );
  }
}
