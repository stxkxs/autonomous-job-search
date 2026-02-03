import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search");
  const status = searchParams.get("status");
  const minScore = searchParams.get("minScore");
  const platform = searchParams.get("platform");
  const limit = parseInt(searchParams.get("limit") || "100");
  const offset = parseInt(searchParams.get("offset") || "0");

  const where: Prisma.JobWhereInput = {};

  if (search) {
    where.OR = [
      { role: { contains: search, mode: "insensitive" } },
      { companyName: { contains: search, mode: "insensitive" } },
      { location: { contains: search, mode: "insensitive" } },
    ];
  }

  if (minScore) {
    where.matchScore = { gte: parseInt(minScore) };
  }

  if (platform) {
    where.atsPlatform = platform;
  }

  if (status) {
    where.application = { status: status as any };
  }

  const jobs = await prisma.job.findMany({
    where,
    include: {
      application: true,
      tags: { include: { tag: true } },
    },
    orderBy: [{ matchScore: "desc" }, { foundDate: "desc" }],
    take: limit,
    skip: offset,
  });

  return NextResponse.json(jobs);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const job = await prisma.job.create({
    data: {
      externalId: body.externalId || body.id,
      jobUrl: body.jobUrl || body.job_url,
      atsPlatform: body.atsPlatform || body.ats_platform,
      companyName: body.companyName || body.company,
      role: body.role,
      location: body.location,
      salary: body.salary,
      foundDate: body.foundDate || body.found_date ? new Date(body.foundDate || body.found_date) : null,
      matchScore: body.matchScore || body.match_score,
      requirements: body.requirements || [],
      techStack: body.techStack || body.tech_stack || [],
      responsibilities: body.responsibilities || [],
      whyGoodFit: body.whyGoodFit || body.why_good_fit,
      experienceToHighlight: body.experienceToHighlight || body.experience_to_highlight || [],
      questionsToAsk: body.questionsToAsk || body.questions_to_ask || [],
      rawData: body,
    },
    include: { application: true },
  });

  // Create default application record
  await prisma.application.create({
    data: { jobId: job.id },
  });

  return NextResponse.json(job, { status: 201 });
}
