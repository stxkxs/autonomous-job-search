"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  MapPin,
  DollarSign,
  ExternalLink,
  Users,
  Star,
  X,
  Briefcase,
  CheckCircle,
  HelpCircle,
  Lightbulb,
  Trophy,
  BadgeCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Job, getScoreColor, getScoreBgColor } from "@/types/job";

interface JobDetailProps {
  job: Job | null;
  onClose: () => void;
}

export function JobDetail({ job, onClose }: JobDetailProps) {
  if (!job) return null;

  const scoreColor = getScoreColor(job.match_score);
  const scoreBgColor = getScoreBgColor(job.match_score);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="h-full"
      >
        <Card className="h-full border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-16 h-16 rounded-2xl ${scoreBgColor} border`}
                >
                  <span className={`text-2xl font-bold ${scoreColor}`}>
                    {job.match_score}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-xl mb-1">{job.role}</CardTitle>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium">{job.company}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="lg:hidden"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <ScrollArea className="h-[calc(100vh-280px)]">
            <CardContent className="space-y-6">
              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{job.location || "Not specified"}</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm truncate">
                    {job.salary || "Not disclosed"}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{job.company_size || "Unknown"}</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Glassdoor: {job.glassdoor_rating || "N/A"}
                  </span>
                </div>
              </div>

              {/* Funding */}
              {job.funding && (
                <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                  <div className="flex items-center gap-2 text-sm">
                    <BadgeCheck className="h-4 w-4 text-violet-500" />
                    <span className="font-medium text-violet-700 dark:text-violet-300">
                      {job.funding}
                    </span>
                  </div>
                </div>
              )}

              <Separator />

              {/* Why Good Fit */}
              {job.why_good_fit && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    Why This Is a Good Fit
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {job.why_good_fit}
                  </p>
                </div>
              )}

              {/* Tech Stack */}
              {job.tech_stack && job.tech_stack.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-blue-500" />
                    Tech Stack
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {job.tech_stack.map((tech) => (
                      <Badge key={tech} variant="secondary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    Requirements
                  </h4>
                  <ul className="space-y-2">
                    {job.requirements.map((req, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-violet-500" />
                    Responsibilities
                  </h4>
                  <ul className="space-y-2">
                    {job.responsibilities.map((resp, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
                        {resp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Experience to Highlight */}
              {job.experience_to_highlight && job.experience_to_highlight.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    Experience to Highlight
                  </h4>
                  <ul className="space-y-2">
                    {job.experience_to_highlight.map((exp, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                        {exp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Questions to Ask */}
              {job.questions_to_ask && job.questions_to_ask.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-blue-500" />
                    Questions to Ask
                  </h4>
                  <ul className="space-y-2">
                    {job.questions_to_ask.map((q, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Apply Button */}
              <div className="pt-4">
                <Button asChild className="w-full" size="lg">
                  <a
                    href={job.job_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Job Posting
                  </a>
                </Button>
              </div>
            </CardContent>
          </ScrollArea>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
