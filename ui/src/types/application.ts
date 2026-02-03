import { type ApplicationStatus } from "./job";

export interface Application {
  id: number;
  jobId: number;
  status: ApplicationStatus;
  appliedDate?: string | null;
  responseDate?: string | null;
  nextStep?: string | null;
  nextStepDate?: string | null;
  salaryDiscussed?: string | null;
  notes?: string | null;
  resumeVersion?: string | null;
  coverLetterUsed: boolean;
  referral?: string | null;
  interviews?: Interview[];
  createdAt?: string;
  updatedAt?: string;
}

export type InterviewOutcome = "pending" | "passed" | "failed" | "cancelled";

export interface Interview {
  id: number;
  applicationId: number;
  interviewType?: string | null;
  scheduledAt?: string | null;
  durationMinutes?: number | null;
  interviewerNames: string[];
  location?: string | null;
  notes?: string | null;
  feedback?: string | null;
  outcome?: InterviewOutcome | null;
  createdAt?: string;
  updatedAt?: string;
}

export const INTERVIEW_TYPES = [
  { value: "phone_screen", label: "Phone Screen" },
  { value: "technical", label: "Technical" },
  { value: "behavioral", label: "Behavioral" },
  { value: "system_design", label: "System Design" },
  { value: "hiring_manager", label: "Hiring Manager" },
  { value: "team_fit", label: "Team Fit" },
  { value: "final_round", label: "Final Round" },
] as const;

export const INTERVIEW_OUTCOMES = [
  { value: "pending", label: "Pending", color: "bg-slate-500/20 text-slate-600 dark:text-slate-400" },
  { value: "passed", label: "Passed", color: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" },
  { value: "failed", label: "Failed", color: "bg-red-500/20 text-red-600 dark:text-red-400" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-500/20 text-gray-600 dark:text-gray-400" },
] as const;

export function getInterviewTypeLabel(type: string | null | undefined): string {
  if (!type) return "Interview";
  const found = INTERVIEW_TYPES.find((t) => t.value === type);
  return found?.label ?? type;
}

export function getOutcomeColor(outcome: string | null | undefined): string {
  if (!outcome) return "bg-slate-500/20 text-slate-600 dark:text-slate-400";
  const found = INTERVIEW_OUTCOMES.find((o) => o.value === outcome);
  return found?.color ?? "bg-slate-500/20 text-slate-600 dark:text-slate-400";
}
