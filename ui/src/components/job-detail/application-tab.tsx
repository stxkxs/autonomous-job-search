"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  ChevronDown,
  Clock,
  Phone,
  UserCheck,
  Gift,
  XCircle,
  MinusCircle,
  Eye,
  Loader2,
  CheckCircle,
  Calendar,
  FileText,
  Users,
  DollarSign,
  StickyNote,
  History,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Job,
  APPLICATION_STATUSES,
  getStatusLabel,
  type ApplicationStatus,
} from "@/types/job";
import { Application, getInterviewTypeLabel } from "@/types/application";
import { sectionReveal, sectionItem, springs } from "@/lib/animations";

function StatusIcon({ status, className }: { status: string; className?: string }) {
  const iconClass = className || "h-4 w-4 mr-1.5";
  switch (status) {
    case "new":
      return <Clock className={iconClass} />;
    case "reviewing":
      return <Eye className={iconClass} />;
    case "applied":
      return <CheckCircle className={iconClass} />;
    case "phone_screen":
      return <Phone className={iconClass} />;
    case "interviewing":
      return <UserCheck className={iconClass} />;
    case "offer":
      return <Gift className={iconClass} />;
    case "rejected":
      return <XCircle className={iconClass} />;
    case "declined":
    case "withdrawn":
      return <MinusCircle className={iconClass} />;
    default:
      return <Clock className={iconClass} />;
  }
}

interface ApplicationTabProps {
  job: Job;
  application: Application | null;
  onApplicationChange: (data: Partial<Application>) => void;
  updating?: boolean;
}

// Inner component that handles form state - key resets when application ID changes
function ApplicationForm({
  job,
  application,
  onApplicationChange,
  updating,
}: ApplicationTabProps) {
  // Local state for text fields - initialized from application
  const [nextStep, setNextStep] = useState(application?.nextStep || "");
  const [nextStepDate, setNextStepDate] = useState(application?.nextStepDate || "");
  const [resumeVersion, setResumeVersion] = useState(application?.resumeVersion || "");
  const [referral, setReferral] = useState(application?.referral || "");
  const [salaryDiscussed, setSalaryDiscussed] = useState(application?.salaryDiscussed || "");
  const [notes, setNotes] = useState(application?.notes || "");

  // Refs for debounce timers
  const debounceTimersRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Debounced field change handler
  const handleFieldChange = useCallback(
    (field: keyof Application, value: string | null) => {
      // Clear existing timer for this field
      if (debounceTimersRef.current[field]) {
        clearTimeout(debounceTimersRef.current[field]);
      }

      // Set new debounced call
      debounceTimersRef.current[field] = setTimeout(() => {
        onApplicationChange({ [field]: value || null });
      }, 500);
    },
    [onApplicationChange]
  );

  // Cleanup timers on unmount
  useEffect(() => {
    const timers = debounceTimersRef.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  // Input change handlers
  const handleNextStepChange = (value: string) => {
    setNextStep(value);
    handleFieldChange("nextStep", value);
  };

  const handleNextStepDateChange = (value: string) => {
    setNextStepDate(value);
    handleFieldChange("nextStepDate", value);
  };

  const handleResumeVersionChange = (value: string) => {
    setResumeVersion(value);
    handleFieldChange("resumeVersion", value);
  };

  const handleReferralChange = (value: string) => {
    setReferral(value);
    handleFieldChange("referral", value);
  };

  const handleSalaryDiscussedChange = (value: string) => {
    setSalaryDiscussed(value);
    handleFieldChange("salaryDiscussed", value);
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    handleFieldChange("notes", value);
  };

  const handleStatusChange = useCallback(
    (status: ApplicationStatus) => {
      onApplicationChange({ status });
    },
    [onApplicationChange]
  );

  const handleCoverLetterChange = useCallback(
    (checked: boolean) => {
      onApplicationChange({ coverLetterUsed: checked });
    },
    [onApplicationChange]
  );

  const timelineEvents = buildTimelineEvents(application);

  return (
    <div className="space-y-6">
      {/* Status Section */}
      <motion.div
        variants={sectionReveal}
        initial="initial"
        animate="animate"
      >
        <motion.h4
          variants={sectionItem}
          className="font-semibold mb-3 flex items-center gap-2"
        >
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
          Application Status
        </motion.h4>
        <motion.div variants={sectionItem} className="flex items-center gap-3 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={updating}
                className="gap-1"
              >
                {updating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <StatusIcon status={application?.status || job.status || "new"} />
                )}
                {getStatusLabel(application?.status || job.status || "new")}
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuRadioGroup
                value={application?.status || job.status || "new"}
                onValueChange={(value) => handleStatusChange(value as ApplicationStatus)}
              >
                {APPLICATION_STATUSES.map((opt) => (
                  <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                    <StatusIcon status={opt.value} className="h-4 w-4 mr-2" />
                    {opt.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          {application?.appliedDate && (
            <span className="text-xs text-muted-foreground">
              Applied {formatDate(application.appliedDate)}
            </span>
          )}
        </motion.div>
      </motion.div>

      <Separator />

      {/* Next Step Section */}
      <motion.div
        variants={sectionReveal}
        initial="initial"
        animate="animate"
      >
        <motion.h4
          variants={sectionItem}
          className="font-semibold mb-3 flex items-center gap-2"
        >
          <Calendar className="h-4 w-4 text-blue-500" />
          Next Step
        </motion.h4>
        <motion.div variants={sectionItem} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="nextStep">Description</Label>
            <Input
              id="nextStep"
              placeholder="e.g., Technical interview with engineering team"
              value={nextStep}
              onChange={(e) => handleNextStepChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nextStepDate">Due Date</Label>
            <Input
              id="nextStepDate"
              type="date"
              value={nextStepDate}
              onChange={(e) => handleNextStepDateChange(e.target.value)}
            />
          </div>
        </motion.div>
      </motion.div>

      <Separator />

      {/* Application Details Section */}
      <motion.div
        variants={sectionReveal}
        initial="initial"
        animate="animate"
      >
        <motion.h4
          variants={sectionItem}
          className="font-semibold mb-3 flex items-center gap-2"
        >
          <FileText className="h-4 w-4 text-violet-500" />
          Application Details
        </motion.h4>
        <motion.div variants={sectionItem} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resumeVersion">Resume Version</Label>
            <Input
              id="resumeVersion"
              placeholder="e.g., v2.3 - Backend Focus"
              value={resumeVersion}
              onChange={(e) => handleResumeVersionChange(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="coverLetterUsed"
              checked={application?.coverLetterUsed || false}
              onCheckedChange={handleCoverLetterChange}
            />
            <Label htmlFor="coverLetterUsed" className="cursor-pointer">
              Cover letter used
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referral" className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              Referral
            </Label>
            <Input
              id="referral"
              placeholder="e.g., John Doe - Senior Engineer"
              value={referral}
              onChange={(e) => handleReferralChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salaryDiscussed" className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              Salary Discussed
            </Label>
            <Input
              id="salaryDiscussed"
              placeholder="e.g., $150k-180k base + equity"
              value={salaryDiscussed}
              onChange={(e) => handleSalaryDiscussedChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-1">
              <StickyNote className="h-3.5 w-3.5" />
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes about this application..."
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              rows={4}
            />
          </div>
        </motion.div>
      </motion.div>

      <Separator />

      {/* Timeline Section */}
      <motion.div
        variants={sectionReveal}
        initial="initial"
        animate="animate"
      >
        <motion.h4
          variants={sectionItem}
          className="font-semibold mb-3 flex items-center gap-2"
        >
          <History className="h-4 w-4 text-amber-500" />
          Timeline
        </motion.h4>
        <motion.div variants={sectionItem}>
          {timelineEvents.length > 0 ? (
            <div className="relative pl-6 space-y-4">
              <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border" />

              {timelineEvents.map((event, index) => (
                <motion.div
                  key={index}
                  className="relative"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...springs.smooth, delay: index * 0.05 }}
                >
                  <div
                    className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 ${event.dotColor}`}
                  />
                  <div className="text-sm">
                    <span className="font-medium">{event.title}</span>
                    <span className="text-muted-foreground ml-2 text-xs">
                      {event.date}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {event.description}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No timeline events yet. Status changes and interviews will appear here.
            </p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

// Wrapper component that uses key to reset form state when application changes
export function ApplicationTab(props: ApplicationTabProps) {
  // Use application ID as key to reset form state when switching applications
  const key = props.application?.id ?? "new";
  return <ApplicationForm key={key} {...props} />;
}

interface TimelineEvent {
  title: string;
  date: string;
  description?: string;
  dotColor: string;
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

function buildTimelineEvents(application: Application | null): TimelineEvent[] {
  if (!application) return [];

  const events: TimelineEvent[] = [];

  if (application.createdAt) {
    events.push({
      title: "Application Created",
      date: formatDateTime(application.createdAt),
      dotColor: "bg-background border-slate-400",
    });
  }

  if (application.appliedDate) {
    events.push({
      title: "Applied",
      date: formatDate(application.appliedDate),
      dotColor: "bg-violet-500 border-violet-500",
    });
  }

  if (application.interviews && application.interviews.length > 0) {
    application.interviews.forEach((interview) => {
      const interviewType = getInterviewTypeLabel(interview.interviewType);
      let dotColor = "bg-blue-500 border-blue-500";

      if (interview.outcome === "passed") {
        dotColor = "bg-emerald-500 border-emerald-500";
      } else if (interview.outcome === "failed") {
        dotColor = "bg-red-500 border-red-500";
      } else if (interview.outcome === "cancelled") {
        dotColor = "bg-gray-400 border-gray-400";
      }

      events.push({
        title: `${interviewType} Interview`,
        date: interview.scheduledAt
          ? formatDateTime(interview.scheduledAt)
          : "Not scheduled",
        description: interview.outcome
          ? `Outcome: ${interview.outcome.charAt(0).toUpperCase() + interview.outcome.slice(1)}`
          : undefined,
        dotColor,
      });
    });
  }

  if (application.responseDate) {
    events.push({
      title: "Response Received",
      date: formatDate(application.responseDate),
      dotColor: "bg-amber-500 border-amber-500",
    });
  }

  if (
    application.updatedAt &&
    application.createdAt &&
    application.updatedAt !== application.createdAt
  ) {
    events.push({
      title: "Last Updated",
      date: formatDateTime(application.updatedAt),
      dotColor: "bg-background border-muted-foreground",
    });
  }

  events.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  return events;
}
