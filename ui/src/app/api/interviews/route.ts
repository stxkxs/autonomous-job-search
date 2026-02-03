import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const upcoming = searchParams.get("upcoming") === "true";
  const applicationId = searchParams.get("applicationId");

  const where: any = {};

  if (upcoming) {
    where.scheduledAt = { gt: new Date() };
    where.outcome = { in: [null, "pending"] };
  }

  if (applicationId) {
    where.applicationId = parseInt(applicationId);
  }

  const interviews = await prisma.interview.findMany({
    where,
    include: {
      application: { include: { job: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json(interviews);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const interview = await prisma.interview.create({
    data: {
      applicationId: body.applicationId,
      interviewType: body.interviewType,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      durationMinutes: body.durationMinutes,
      interviewerNames: body.interviewerNames || [],
      location: body.location,
      notes: body.notes,
    },
    include: { application: { include: { job: true } } },
  });

  // Update application status to interviewing
  await prisma.application.update({
    where: { id: body.applicationId },
    data: { status: "interviewing" },
  });

  return NextResponse.json(interview, { status: 201 });
}
