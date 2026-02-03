"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
  Pencil,
  Trash2,
  Video,
  Phone,
  Building2,
} from "lucide-react";
import {
  type Interview,
  getInterviewTypeLabel,
  getOutcomeColor,
} from "@/types/application";
import { InterviewForm } from "./interview-form";

interface InterviewsTabProps {
  applicationId: number | undefined;
  interviews: Interview[];
  onAddInterview: (
    data: Omit<Interview, "id" | "applicationId" | "createdAt" | "updatedAt">
  ) => Promise<Interview>;
  onUpdateInterview: (id: number, data: Partial<Interview>) => Promise<Interview>;
  onDeleteInterview: (id: number) => Promise<void>;
}

// Get icon for interview type
function getInterviewIcon(type: string | null | undefined) {
  switch (type) {
    case "phone_screen":
      return Phone;
    case "technical":
    case "system_design":
      return Video;
    case "hiring_manager":
    case "team_fit":
    case "final_round":
      return Building2;
    default:
      return Video;
  }
}

// Format date for display
function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return "Not scheduled";
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Format duration
function formatDuration(minutes: number | null | undefined): string {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

// Get outcome label
function getOutcomeLabel(outcome: string | null | undefined): string {
  if (!outcome) return "";
  const labels: Record<string, string> = {
    pending: "Pending",
    passed: "Passed",
    failed: "Failed",
    cancelled: "Cancelled",
  };
  return labels[outcome] ?? outcome;
}

interface InterviewCardProps {
  interview: Interview;
  isPast: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function InterviewCard({ interview, isPast, onEdit, onDelete }: InterviewCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const Icon = getInterviewIcon(interview.interviewType);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="py-4">
      <CardContent className="px-4 py-0">
        <div className="flex items-start justify-between gap-4">
          {/* Main Content */}
          <div className="flex gap-3 flex-1 min-w-0">
            {/* Icon */}
            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 space-y-1">
              {/* Type and Outcome */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">
                  {getInterviewTypeLabel(interview.interviewType)}
                </span>
                {isPast && interview.outcome && (
                  <Badge className={getOutcomeColor(interview.outcome)}>
                    {getOutcomeLabel(interview.outcome)}
                  </Badge>
                )}
              </div>

              {/* Date/Time */}
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDateTime(interview.scheduledAt)}</span>
              </div>

              {/* Duration */}
              {interview.durationMinutes && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatDuration(interview.durationMinutes)}</span>
                </div>
              )}

              {/* Location */}
              {interview.location && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate">{interview.location}</span>
                </div>
              )}

              {/* Interviewers */}
              {interview.interviewerNames && interview.interviewerNames.length > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span className="truncate">{interview.interviewerNames.join(", ")}</span>
                </div>
              )}

              {/* Notes preview */}
              {interview.notes && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {interview.notes}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit interview</span>
            </Button>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete interview</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Interview</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this{" "}
                    {getInterviewTypeLabel(interview.interviewType).toLowerCase()} interview?
                    This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialogOpen(false)}
                    disabled={deleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function InterviewsTab({
  applicationId,
  interviews,
  onAddInterview,
  onUpdateInterview,
  onDeleteInterview,
}: InterviewsTabProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);

  // Split interviews into upcoming and past
  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    const sortedInterviews = [...interviews].sort((a, b) => {
      const dateA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
      const dateB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
      return dateA - dateB;
    });

    return sortedInterviews.reduce(
      (acc, interview) => {
        if (!interview.scheduledAt) {
          // Unscheduled interviews go to upcoming
          acc.upcoming.push(interview);
        } else {
          const interviewDate = new Date(interview.scheduledAt);
          if (interviewDate > now) {
            acc.upcoming.push(interview);
          } else {
            acc.past.push(interview);
          }
        }
        return acc;
      },
      { upcoming: [] as Interview[], past: [] as Interview[] }
    );
  }, [interviews]);

  const handleAddInterview = async (
    data: Omit<Interview, "id" | "applicationId" | "createdAt" | "updatedAt">
  ) => {
    await onAddInterview(data);
  };

  const handleUpdateInterview = async (
    data: Omit<Interview, "id" | "applicationId" | "createdAt" | "updatedAt">
  ) => {
    if (editingInterview) {
      await onUpdateInterview(editingInterview.id, data);
      setEditingInterview(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Interviews</h3>
        <Button
          size="sm"
          onClick={() => setAddDialogOpen(true)}
          disabled={!applicationId}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Interview
        </Button>
      </div>

      {/* No application notice */}
      {!applicationId && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Create an application first to track interviews.</p>
        </div>
      )}

      {/* Interviews content */}
      {applicationId && (
        <>
          {/* Empty state */}
          {interviews.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No interviews scheduled yet.</p>
              <p className="text-sm mt-1">
                Click &quot;Add Interview&quot; to track your first interview.
              </p>
            </div>
          )}

          {/* Upcoming Interviews */}
          {upcoming.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Upcoming Interviews ({upcoming.length})
              </h4>
              <div className="space-y-3">
                {upcoming.map((interview) => (
                  <InterviewCard
                    key={interview.id}
                    interview={interview}
                    isPast={false}
                    onEdit={() => setEditingInterview(interview)}
                    onDelete={() => onDeleteInterview(interview.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Past Interviews */}
          {past.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Past Interviews ({past.length})
              </h4>
              <div className="space-y-3">
                {past.map((interview) => (
                  <InterviewCard
                    key={interview.id}
                    interview={interview}
                    isPast={true}
                    onEdit={() => setEditingInterview(interview)}
                    onDelete={() => onDeleteInterview(interview.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Interview Dialog */}
      <InterviewForm
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddInterview}
        mode="add"
      />

      {/* Edit Interview Dialog */}
      {editingInterview && (
        <InterviewForm
          open={!!editingInterview}
          onOpenChange={(open) => {
            if (!open) setEditingInterview(null);
          }}
          onSubmit={handleUpdateInterview}
          initialData={editingInterview}
          mode="edit"
        />
      )}
    </div>
  );
}
