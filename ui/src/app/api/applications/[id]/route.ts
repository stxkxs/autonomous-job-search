import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const application = await prisma.application.findUnique({
    where: { id: parseInt(id) },
    include: { job: true, interviews: true },
  });

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  return NextResponse.json(application);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const application = await prisma.application.update({
    where: { id: parseInt(id) },
    data: {
      status: body.status,
      appliedDate: body.appliedDate ? new Date(body.appliedDate) : undefined,
      responseDate: body.responseDate ? new Date(body.responseDate) : undefined,
      nextStep: body.nextStep,
      nextStepDate: body.nextStepDate ? new Date(body.nextStepDate) : undefined,
      salaryDiscussed: body.salaryDiscussed,
      notes: body.notes,
      resumeVersion: body.resumeVersion,
      coverLetterUsed: body.coverLetterUsed,
      referral: body.referral,
    },
    include: { job: true },
  });

  return NextResponse.json(application);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.application.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ deleted: true });
}
