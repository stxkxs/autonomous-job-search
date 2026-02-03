"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
  type Interview,
  type InterviewOutcome,
  INTERVIEW_TYPES,
  INTERVIEW_OUTCOMES,
} from "@/types/application";

type InterviewFormData = Omit<Interview, "id" | "applicationId" | "createdAt" | "updatedAt">;

interface InterviewFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InterviewFormData) => Promise<void>;
  initialData?: Partial<Interview>;
  mode: "add" | "edit";
}

export function InterviewForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: InterviewFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<InterviewFormData>({
    interviewType: initialData?.interviewType ?? null,
    scheduledAt: initialData?.scheduledAt ?? null,
    durationMinutes: initialData?.durationMinutes ?? 60,
    interviewerNames: initialData?.interviewerNames ?? [],
    location: initialData?.location ?? null,
    notes: initialData?.notes ?? null,
    feedback: initialData?.feedback ?? null,
    outcome: initialData?.outcome ?? null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
      // Reset form after successful submission
      if (mode === "add") {
        setFormData({
          interviewType: null,
          scheduledAt: null,
          durationMinutes: 60,
          interviewerNames: [],
          location: null,
          notes: null,
          feedback: null,
          outcome: null,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInterviewersChange = (value: string) => {
    const names = value
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);
    setFormData((prev) => ({ ...prev, interviewerNames: names }));
  };

  // Format datetime-local value from ISO string
  const formatDateTimeLocal = (isoString: string | null | undefined): string => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

  // Convert datetime-local value to ISO string
  const toISOString = (dateTimeLocal: string): string | null => {
    if (!dateTimeLocal) return null;
    return new Date(dateTimeLocal).toISOString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Interview" : "Edit Interview"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            {/* Interview Type */}
            <div className="grid gap-2">
              <Label htmlFor="interviewType">Interview Type</Label>
              <Select
                value={formData.interviewType ?? ""}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, interviewType: value || null }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select interview type" />
                </SelectTrigger>
                <SelectContent>
                  {INTERVIEW_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date & Time */}
            <div className="grid gap-2">
              <Label htmlFor="scheduledAt">Date & Time</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={formatDateTimeLocal(formData.scheduledAt)}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    scheduledAt: toISOString(e.target.value),
                  }))
                }
              />
            </div>

            {/* Duration */}
            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min={15}
                max={480}
                step={15}
                value={formData.durationMinutes ?? 60}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    durationMinutes: parseInt(e.target.value) || 60,
                  }))
                }
              />
            </div>

            {/* Location */}
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Zoom link, Office address, Phone call"
                value={formData.location ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    location: e.target.value || null,
                  }))
                }
              />
            </div>

            {/* Interviewers */}
            <div className="grid gap-2">
              <Label htmlFor="interviewers">Interviewers</Label>
              <Input
                id="interviewers"
                placeholder="Comma-separated names"
                value={formData.interviewerNames.join(", ")}
                onChange={(e) => handleInterviewersChange(e.target.value)}
              />
            </div>

            {/* Outcome (only show in edit mode or for past interviews) */}
            {mode === "edit" && (
              <div className="grid gap-2">
                <Label htmlFor="outcome">Outcome</Label>
                <Select
                  value={formData.outcome ?? ""}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      outcome: (value as InterviewOutcome) || null,
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERVIEW_OUTCOMES.map((outcome) => (
                      <SelectItem key={outcome.value} value={outcome.value}>
                        {outcome.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Preparation notes, topics to cover, etc."
                value={formData.notes ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    notes: e.target.value || null,
                  }))
                }
                rows={3}
              />
            </div>

            {/* Feedback (only show in edit mode) */}
            {mode === "edit" && (
              <div className="grid gap-2">
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  placeholder="Post-interview feedback and impressions"
                  value={formData.feedback ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      feedback: e.target.value || null,
                    }))
                  }
                  rows={3}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {mode === "add" ? "Add Interview" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
