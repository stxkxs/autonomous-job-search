import {
  SCORE_THRESHOLDS,
  SCORE_CATEGORIES,
  SCORE_COLORS,
  ATS_PLATFORMS,
  ATS_METADATA,
  type ScoreCategory,
  type ATSPlatform,
} from "@/constants";

export type { ScoreCategory, ATSPlatform };

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
  ats_platform?: ATSPlatform;
}

export interface JobStats {
  total: number;
  priority: number;
  highMatch: number;
  goodMatch: number;
  other: number;
  techStackCounts: Record<string, number>;
  companyCounts: Record<string, number>;
  locationCounts: Record<string, number>;
  atsPlatformCounts: Record<ATSPlatform, number>;
}

export function getScoreCategory(score: number): ScoreCategory {
  if (score >= SCORE_THRESHOLDS.PRIORITY) return SCORE_CATEGORIES.PRIORITY;
  if (score >= SCORE_THRESHOLDS.HIGH) return SCORE_CATEGORIES.HIGH;
  if (score >= SCORE_THRESHOLDS.GOOD) return SCORE_CATEGORIES.GOOD;
  return SCORE_CATEGORIES.LOW;
}

export function getScoreColor(score: number): string {
  const category = getScoreCategory(score);
  return SCORE_COLORS[category].text;
}

export function getScoreBgColor(score: number): string {
  const category = getScoreCategory(score);
  return `${SCORE_COLORS[category].bg} ${SCORE_COLORS[category].border}`;
}

export function getScoreBadgeColor(score: number): string {
  const category = getScoreCategory(score);
  return SCORE_COLORS[category].badge;
}

export function detectATSPlatform(jobUrl: string): ATSPlatform | undefined {
  const url = jobUrl.toLowerCase();
  if (url.includes(ATS_METADATA[ATS_PLATFORMS.GREENHOUSE].domain)) {
    return ATS_PLATFORMS.GREENHOUSE;
  }
  if (url.includes(ATS_METADATA[ATS_PLATFORMS.LEVER].domain)) {
    return ATS_PLATFORMS.LEVER;
  }
  if (url.includes(ATS_METADATA[ATS_PLATFORMS.ASHBY].domain)) {
    return ATS_PLATFORMS.ASHBY;
  }
  if (url.includes(ATS_METADATA[ATS_PLATFORMS.WORKABLE].domain)) {
    return ATS_PLATFORMS.WORKABLE;
  }
  return undefined;
}

export function getATSDisplayName(platform: ATSPlatform): string {
  return ATS_METADATA[platform].name;
}

export function getATSColor(platform: ATSPlatform): string {
  return ATS_METADATA[platform].color;
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
    atsPlatformCounts: {
      [ATS_PLATFORMS.GREENHOUSE]: 0,
      [ATS_PLATFORMS.LEVER]: 0,
      [ATS_PLATFORMS.ASHBY]: 0,
      [ATS_PLATFORMS.WORKABLE]: 0,
    },
  };

  jobs.forEach((job) => {
    // Score distribution using constants
    if (job.match_score >= SCORE_THRESHOLDS.PRIORITY) stats.priority++;
    else if (job.match_score >= SCORE_THRESHOLDS.HIGH) stats.highMatch++;
    else if (job.match_score >= SCORE_THRESHOLDS.GOOD) stats.goodMatch++;
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

    // ATS Platform detection
    const platform = job.ats_platform || detectATSPlatform(job.job_url);
    if (platform) {
      stats.atsPlatformCounts[platform]++;
    }
  });

  return stats;
}
