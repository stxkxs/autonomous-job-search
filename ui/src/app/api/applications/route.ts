import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");

  const where = status ? { status: status as any } : {};

  const applications = await prisma.application.findMany({
    where,
    include: {
      job: true,
      interviews: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(applications);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Check if application already exists for this job
  const existing = await prisma.application.findUnique({
    where: { jobId: body.jobId },
  });

  if (existing) {
    // Update existing
    const updated = await prisma.application.update({
      where: { id: existing.id },
      data: {
        status: body.status,
        appliedDate: body.appliedDate ? new Date(body.appliedDate) : null,
        responseDate: body.responseDate ? new Date(body.responseDate) : null,
        nextStep: body.nextStep,
        nextStepDate: body.nextStepDate ? new Date(body.nextStepDate) : null,
        salaryDiscussed: body.salaryDiscussed,
        notes: body.notes,
        resumeVersion: body.resumeVersion,
        coverLetterUsed: body.coverLetterUsed,
        referral: body.referral,
      },
      include: { job: true },
    });
    return NextResponse.json(updated);
  }

  const application = await prisma.application.create({
    data: {
      jobId: body.jobId,
      status: body.status || "new",
      appliedDate: body.appliedDate ? new Date(body.appliedDate) : null,
      notes: body.notes,
    },
    include: { job: true },
  });

  return NextResponse.json(application, { status: 201 });
}
