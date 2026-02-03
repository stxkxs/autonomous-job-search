import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id: parseInt(id) },
    include: {
      application: { include: { interviews: true } },
      tags: { include: { tag: true } },
      notes: true,
      company: true,
    },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json(job);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const job = await prisma.job.update({
    where: { id: parseInt(id) },
    data: body,
    include: { application: true },
  });

  return NextResponse.json(job);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.job.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ deleted: true });
}
