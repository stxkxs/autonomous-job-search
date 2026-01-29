import { Job } from "@/types/job";

export function searchJobs(jobs: Job[], query: string): Job[] {
  const lowerQuery = query.toLowerCase();
  return jobs.filter(
    (job) =>
      job.company.toLowerCase().includes(lowerQuery) ||
      job.role.toLowerCase().includes(lowerQuery) ||
      (job.location && job.location.toLowerCase().includes(lowerQuery)) ||
      (job.tech_stack && job.tech_stack.some((tech) => tech.toLowerCase().includes(lowerQuery)))
  );
}

export function filterByScore(jobs: Job[], minScore: number): Job[] {
  return jobs.filter((job) => job.match_score >= minScore);
}

export function filterByTech(jobs: Job[], tech: string): Job[] {
  return jobs.filter((job) =>
    job.tech_stack && job.tech_stack.some((t) => t.toLowerCase() === tech.toLowerCase())
  );
}

export function filterByLocation(jobs: Job[], location: string): Job[] {
  if (location === "Remote") {
    return jobs.filter((job) => job.location && job.location.includes("Remote"));
  }
  return jobs.filter((job) => job.location && job.location.includes(location));
}

export function sortJobs(
  jobs: Job[],
  sortBy: "score" | "date" | "company" | "salary"
): Job[] {
  return [...jobs].sort((a, b) => {
    switch (sortBy) {
      case "score":
        return b.match_score - a.match_score;
      case "date":
        const dateA = a.found_date ? new Date(a.found_date).getTime() : 0;
        const dateB = b.found_date ? new Date(b.found_date).getTime() : 0;
        return dateB - dateA;
      case "company":
        return a.company.localeCompare(b.company);
      case "salary":
        const getSalaryNum = (s?: string) => {
          if (!s) return 0;
          const match = s.match(/\$?([\d,]+)/);
          return match ? parseInt(match[1].replace(/,/g, "")) : 0;
        };
        return getSalaryNum(b.salary) - getSalaryNum(a.salary);
      default:
        return 0;
    }
  });
}
