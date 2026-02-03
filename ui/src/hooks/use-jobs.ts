"use client";

import { useState, useEffect, useCallback } from "react";
import { Job } from "@/types/job";

const USE_API = process.env.NEXT_PUBLIC_USE_API === "true";

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const url = USE_API ? "/api/jobs" : "/data/jobs.json";
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch jobs data");
      }

      const data = await response.json();

      // Normalize data from API to match static format
      if (USE_API) {
        const normalized = data.map((job: any) => ({
          id: job.externalId || `db-${job.id}`,
          job_url: job.jobUrl,
          ats_platform: job.atsPlatform,
          company: job.companyName,
          role: job.role,
          location: job.location,
          salary: job.salary,
          found_date: job.foundDate?.split("T")[0],
          match_score: job.matchScore,
          status: job.application?.status || "new",
          requirements: job.requirements,
          tech_stack: job.techStack,
          responsibilities: job.responsibilities,
          why_good_fit: job.whyGoodFit,
          experience_to_highlight: job.experienceToHighlight,
          questions_to_ask: job.questionsToAsk,
          // DB-specific fields
          dbId: job.id,
          application: job.application,
        }));
        setJobs(normalized);
      } else {
        setJobs(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, loading, error, refetch: fetchJobs };
}

// Hook for updating application status
export function useApplicationStatus() {
  const [updating, setUpdating] = useState(false);

  const updateStatus = async (
    jobDbId: number,
    status: string,
    notes?: string
  ) => {
    if (!USE_API) {
      console.warn("API not enabled - status changes won't persist");
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: jobDbId, status, notes }),
      });

      if (!response.ok) throw new Error("Failed to update status");
      return await response.json();
    } finally {
      setUpdating(false);
    }
  };

  return { updateStatus, updating };
}

// Hook for importing jobs
export function useImportJobs() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    imported: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  const importJobs = async (source: "merged" | "agents" | "file" = "merged") => {
    setImporting(true);
    try {
      const response = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source }),
      });

      if (!response.ok) throw new Error("Failed to import jobs");
      const data = await response.json();
      setResult(data);
      return data;
    } finally {
      setImporting(false);
    }
  };

  return { importJobs, importing, result };
}
