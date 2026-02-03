import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import fs from "fs/promises";
import path from "path";

// Import jobs from merged JSON file or agent outputs
export async function POST(request: NextRequest) {
  const body = await request.json();
  const source = body.source || "merged"; // "merged" | "agents" | "file"

  let jobs: any[] = [];

  if (source === "file" && body.jobs) {
    // Direct JSON import
    jobs = body.jobs;
  } else if (source === "merged") {
    // Read from merged output only - no fallback to stale data
    const filePath = path.join(process.cwd(), "..", "output", "merged", "jobs.json");
    try {
      const content = await fs.readFile(filePath, "utf-8");
      jobs = JSON.parse(content);
    } catch (e) {
      return NextResponse.json(
        { error: "No merged jobs file found. Run agents first: make search && make agents-merge" },
        { status: 404 }
      );
    }
  } else if (source === "agents") {
    // Read from all agent directories and merge
    const agentDirs = ["agent-1", "agent-2", "agent-3", "agent-4"];
    for (const dir of agentDirs) {
      const filePath = path.join(process.cwd(), "..", "output", dir, "jobs.json");
      try {
        const content = await fs.readFile(filePath, "utf-8");
        const agentJobs = JSON.parse(content);
        jobs.push(...agentJobs);
      } catch {
        // Agent directory might not exist
      }
    }
  }

  if (jobs.length === 0) {
    return NextResponse.json({ error: "No jobs found to import" }, { status: 400 });
  }

  // Import jobs, skip duplicates
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const job of jobs) {
    const jobUrl = job.job_url || job.jobUrl;
    if (!jobUrl) {
      errors.push(`Job missing URL: ${job.role || "unknown"}`);
      continue;
    }

    try {
      // Check for existing
      const existing = await prisma.job.findUnique({
        where: { jobUrl },
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Create job
      const created = await prisma.job.create({
        data: {
          externalId: job.id || job.external_id,
          jobUrl,
          atsPlatform: job.ats_platform || job.atsPlatform,
          companyName: job.company || job.companyName,
          role: job.role,
          location: job.location,
          salary: job.salary,
          foundDate: job.found_date || job.foundDate ? new Date(job.found_date || job.foundDate) : null,
          matchScore: job.match_score || job.matchScore,
          requirements: job.requirements || [],
          techStack: job.tech_stack || job.techStack || [],
          responsibilities: job.responsibilities || [],
          whyGoodFit: job.why_good_fit || job.whyGoodFit,
          experienceToHighlight: job.experience_to_highlight || job.experienceToHighlight || [],
          questionsToAsk: job.questions_to_ask || job.questionsToAsk || [],
          rawData: job,
        },
      });

      // Create application record
      await prisma.application.create({
        data: {
          jobId: created.id,
          status: job.status === "priority" ? "reviewing" : "new",
        },
      });

      imported++;
    } catch (e: any) {
      errors.push(`Failed to import ${jobUrl}: ${e.message}`);
    }
  }

  return NextResponse.json({
    imported,
    skipped,
    total: jobs.length,
    errors: errors.slice(0, 10), // First 10 errors
  });
}
