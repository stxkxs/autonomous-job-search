import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const existingInterview = await prisma.interview.findUnique({
    where: { id: parseInt(id) },
  });

  if (!existingInterview) {
    return NextResponse.json({ error: "Interview not found" }, { status: 404 });
  }

  const interview = await prisma.interview.update({
    where: { id: parseInt(id) },
    data: {
      interviewType: body.interviewType,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
      durationMinutes: body.durationMinutes,
      interviewerNames: body.interviewerNames,
      location: body.location,
      notes: body.notes,
      feedback: body.feedback,
      outcome: body.outcome,
    },
    include: { application: true },
  });

  return NextResponse.json(interview);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existingInterview = await prisma.interview.findUnique({
    where: { id: parseInt(id) },
  });

  if (!existingInterview) {
    return NextResponse.json({ error: "Interview not found" }, { status: 404 });
  }

  await prisma.interview.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ deleted: true });
}
