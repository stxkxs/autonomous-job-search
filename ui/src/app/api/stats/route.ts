import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const [
    totalJobs,
    statusCounts,
    platformCounts,
    upcomingInterviews,
    appliedThisWeek,
    totalApplied,
    totalResponses,
  ] = await Promise.all([
    prisma.job.count(),
    prisma.application.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.job.groupBy({
      by: ["atsPlatform"],
      _count: true,
    }),
    prisma.interview.count({
      where: {
        scheduledAt: { gt: new Date() },
        OR: [
          { outcome: null },
          { outcome: "pending" },
        ],
      },
    }),
    prisma.application.count({
      where: {
        appliedDate: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.application.count({
      where: { status: { not: "new" } },
    }),
    prisma.application.count({
      where: {
        status: { in: ["phone_screen", "interviewing", "offer", "accepted", "rejected"] },
      },
    }),
  ]);

  // Score distribution
  const scoreCounts = await prisma.job.groupBy({
    by: ["matchScore"],
    _count: true,
    where: { matchScore: { not: null } },
  });

  const byScore = {
    priority: 0,
    high: 0,
    good: 0,
    other: 0,
  };

  for (const row of scoreCounts) {
    const score = row.matchScore!;
    if (score >= 90) byScore.priority += row._count;
    else if (score >= 85) byScore.high += row._count;
    else if (score >= 80) byScore.good += row._count;
    else byScore.other += row._count;
  }

  return NextResponse.json({
    totalJobs,
    byStatus: Object.fromEntries(statusCounts.map((s) => [s.status, s._count])),
    byScore,
    byPlatform: Object.fromEntries(platformCounts.map((p) => [p.atsPlatform || "unknown", p._count])),
    upcomingInterviews,
    appliedThisWeek,
    responseRate: totalApplied > 0 ? Math.round((totalResponses / totalApplied) * 100 * 10) / 10 : 0,
  });
}
