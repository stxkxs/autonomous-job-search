"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Star,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Job,
  getScoreColor,
  getScoreBgColor,
  getATSDisplayName,
  getATSColor,
  detectATSPlatform,
} from "@/types/job";
import { springs, selectionIndicator, pulse } from "@/lib/animations";

interface JobCardProps {
  job: Job;
  index: number;
  onSelect: (job: Job) => void;
  isSelected?: boolean;
}

export function JobCard({ job, index, onSelect, isSelected }: JobCardProps) {
  const scoreColor = getScoreColor(job.match_score);
  const scoreBgColor = getScoreBgColor(job.match_score);
  const atsPlatform = job.ats_platform || detectATSPlatform(job.job_url);
  const isPriority = job.match_score >= 90;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ ...springs.smooth, delay: index * 0.04 }}
      className="group"
    >
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.995 }}
        transition={springs.gentle}
      >
        <Card
          className={`border cursor-pointer transition-all duration-200 overflow-hidden relative ${
            isSelected
              ? "ring-2 ring-violet-500/50 border-violet-500/50 bg-violet-500/5"
              : "border-border/40 hover:border-border/60 hover:shadow-lg hover:shadow-black/5"
          }`}
          onClick={() => onSelect(job)}
          role="button"
          aria-label={`View details for ${job.role} at ${job.company}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect(job);
            }
          }}
        >
          {/* Selection indicator */}
          <AnimatePresence>
            {isSelected && (
              <motion.div
                variants={selectionIndicator}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500 origin-top"
              />
            )}
          </AnimatePresence>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <motion.div
                    className={`flex items-center justify-center w-12 h-12 rounded-xl ${scoreBgColor} border border-current/10`}
                    title={`Match score: ${job.match_score}/100`}
                    aria-label={`Match score ${job.match_score} out of 100`}
                    whileHover={{ scale: 1.05 }}
                    transition={springs.snappy}
                    variants={isPriority ? pulse : undefined}
                    animate={isPriority ? "animate" : undefined}
                  >
                    <span className={`text-lg font-bold ${scoreColor}`}>
                      {job.match_score}
                    </span>
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className="font-semibold text-lg truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors"
                        title={job.role}
                      >
                        {job.role}
                      </h3>
                      {atsPlatform && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 h-4 ${getATSColor(atsPlatform)}`}
                        >
                          {getATSDisplayName(atsPlatform)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="text-sm font-medium">{job.company}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                  {job.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="truncate max-w-[200px]" title={job.location}>
                        {job.location}
                      </span>
                    </div>
                  )}
                  {job.salary && job.salary !== "Not listed" && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="truncate max-w-[200px]" title={job.salary}>
                        {job.salary}
                      </span>
                    </div>
                  )}
                  {job.found_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{job.found_date}</span>
                    </div>
                  )}
                </div>

                {job.tech_stack && job.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {job.tech_stack.slice(0, 5).map((tech) => (
                      <Badge
                        key={tech}
                        variant="secondary"
                        className="text-xs font-normal"
                      >
                        {tech}
                      </Badge>
                    ))}
                    {job.tech_stack.length > 5 && (
                      <Badge variant="outline" className="text-xs font-normal">
                        +{job.tech_stack.length - 5}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                {job.status === "priority" && (
                  <Badge className="bg-emerald-500 hover:bg-emerald-600">
                    <Star className="h-3 w-3 mr-1" aria-hidden="true" />
                    Priority
                  </Badge>
                )}
                <motion.div
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 0, x: -4 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  className="opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight
                    className="h-5 w-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export function JobCardSkeleton() {
  return (
    <Card className="border border-border/40 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {/* Score skeleton */}
              <div className="w-12 h-12 rounded-xl bg-muted relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
              <div className="flex-1">
                {/* Title skeleton */}
                <div className="h-5 w-48 bg-muted rounded relative overflow-hidden mb-1.5">
                  <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" style={{ animationDelay: "0.1s" }} />
                </div>
                {/* Company skeleton */}
                <div className="h-4 w-32 bg-muted rounded relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
            {/* Meta info skeleton */}
            <div className="flex gap-3 mb-3">
              <div className="h-4 w-24 bg-muted rounded relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" style={{ animationDelay: "0.3s" }} />
              </div>
              <div className="h-4 w-32 bg-muted rounded relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
            {/* Tags skeleton */}
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-5 w-16 bg-muted rounded relative overflow-hidden"
                >
                  <div
                    className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    style={{ animationDelay: `${0.4 + i * 0.1}s` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
