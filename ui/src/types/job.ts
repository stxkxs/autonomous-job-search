export interface Job {
  id: string;
  job_url: string;
  company: string;
  role: string;
  location?: string;
  salary?: string;
  found_date?: string;
  match_score: number;
  requirements?: string[];
  tech_stack?: string[];
  responsibilities?: string[];
  company_size?: string;
  glassdoor_rating?: string;
  funding?: string;
  why_good_fit?: string;
  experience_to_highlight?: string[];
  questions_to_ask?: string[];
  status?: "new" | "applied" | "priority" | "interviewing" | "rejected";
}

export type ScoreCategory = "priority" | "high" | "good" | "other";

export interface JobStats {
  total: number;
  priority: number;
  highMatch: number;
  goodMatch: number;
  other: number;
  techStackCounts: Record<string, number>;
  companyCounts: Record<string, number>;
  locationCounts: Record<string, number>;
}

export function getScoreCategory(score: number): ScoreCategory {
  if (score >= 90) return "priority";
  if (score >= 85) return "high";
  if (score >= 80) return "good";
  return "other";
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-500";
  if (score >= 85) return "text-blue-500";
  if (score >= 80) return "text-amber-500";
  return "text-gray-500";
}

export function getScoreBgColor(score: number): string {
  if (score >= 90) return "bg-emerald-500/10 border-emerald-500/20";
  if (score >= 85) return "bg-blue-500/10 border-blue-500/20";
  if (score >= 80) return "bg-amber-500/10 border-amber-500/20";
  return "bg-gray-500/10 border-gray-500/20";
}

export function calculateStats(jobs: Job[]): JobStats {
  const stats: JobStats = {
    total: jobs.length,
    priority: 0,
    highMatch: 0,
    goodMatch: 0,
    other: 0,
    techStackCounts: {},
    companyCounts: {},
    locationCounts: {},
  };

  jobs.forEach((job) => {
    // Score distribution
    if (job.match_score >= 90) stats.priority++;
    else if (job.match_score >= 85) stats.highMatch++;
    else if (job.match_score >= 80) stats.goodMatch++;
    else stats.other++;

    // Tech stack
    if (job.tech_stack) {
      job.tech_stack.forEach((tech) => {
        stats.techStackCounts[tech] = (stats.techStackCounts[tech] || 0) + 1;
      });
    }

    // Companies
    stats.companyCounts[job.company] =
      (stats.companyCounts[job.company] || 0) + 1;

    // Locations (simplified)
    const location = job.location
      ? job.location.includes("Remote")
        ? "Remote"
        : job.location.split(",")[0]
      : "Unknown";
    stats.locationCounts[location] =
      (stats.locationCounts[location] || 0) + 1;
  });

  return stats;
}
