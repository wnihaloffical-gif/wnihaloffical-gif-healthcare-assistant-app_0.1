// app/api/doctor/metrics/route.ts
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

async function fetchDoctorMetrics() {
  try {
    // Get total consultations
    const totalConsultations = await prisma.consultation.count();

    // Get consultations by status
    const consultationsByStatus = await prisma.consultation.groupBy({
      by: ["status"],
      _count: true,
    });

    // Get pending consultations
    const pendingConsultations = await prisma.consultation.count({
      where: {
        status: "PENDING",
      },
    });

    // Get completed consultations
    const completedConsultations = await prisma.consultation.count({
      where: {
        status: "COMPLETED",
      },
    });

    // Get high-risk consultations
    const highRiskConsultations = await prisma.consultation.count({
      where: {
        riskLevel: {
          equals: "HIGH",
          mode: "insensitive",
        },
      },
    });

    // Get consultations by risk level
    const consultationsByRisk = await prisma.consultation.groupBy({
      by: ["riskLevel"],
      _count: true,
    });

    // Get top conditions diagnosed
    const topConditions = await prisma.consultation.findMany({
      where: {
        doctorId: { not: null },
        finalDiagnosis: { not: null },
      },
      select: { finalDiagnosis: true },
      take: 100,
    });

    // Parse and count conditions
    const conditionCounts: Record<string, number> = {};
    topConditions.forEach((consultation) => {
      if (consultation.finalDiagnosis) {
        try {
          const diagnosis = JSON.parse(consultation.finalDiagnosis);
          const conditions = Array.isArray(diagnosis)
            ? diagnosis
            : [diagnosis];
          conditions.forEach((condition: string) => {
            conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
          });
        } catch (e) {
          // Handle non-JSON diagnoses
          conditionCounts[consultation.finalDiagnosis] =
            (conditionCounts[consultation.finalDiagnosis] || 0) + 1;
        }
      }
    });

    const sortedConditions = Object.entries(conditionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([condition, count]) => ({ condition, count }));

    return {
      totalConsultations,
      pendingConsultations,
      completedConsultations,
      highRiskConsultations,
      consultationsByStatus: consultationsByStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
      consultationsByRisk: consultationsByRisk.map((item) => ({
        riskLevel: item.riskLevel,
        count: item._count,
      })),
      topConditions: sortedConditions,
    };
  } catch (error) {
    console.error("[DOCTOR METRICS API] Error fetching metrics:", error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check cache first
    if (isCacheValid()) {
      console.log("[DOCTOR METRICS API] Serving from cache");
      return NextResponse.json(metricsCache.data);
    }

    // Fetch fresh data
    const data = await fetchDoctorMetrics();

    // Update cache
    metricsCache.data = data;
    metricsCache.timestamp = Date.now();

    return NextResponse.json(data);
  } catch (error) {
    console.error("[DOCTOR METRICS API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctor metrics" },
      { status: 500 }
    );
  }
}
