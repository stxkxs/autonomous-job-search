"use client";

import { motion } from "framer-motion";
import {
  Building2,
  MapPin,
  DollarSign,
  ExternalLink,
  Calendar,
  Star,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Job, getScoreColor, getScoreBgColor } from "@/types/job";

interface JobCardProps {
  job: Job;
  index: number;
  onSelect: (job: Job) => void;
  isSelected?: boolean;
}

export function JobCard({ job, index, onSelect, isSelected }: JobCardProps) {
  const scoreColor = getScoreColor(job.match_score);
  const scoreBgColor = getScoreBgColor(job.match_score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
      className="group"
    >
      <Card
        className={`border cursor-pointer transition-all duration-200 hover:shadow-lg ${
          isSelected
            ? "ring-2 ring-violet-500 border-violet-500"
            : "border-border/50 hover:border-border"
        }`}
        onClick={() => onSelect(job)}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-xl ${scoreBgColor} border`}
                >
                  <span className={`text-lg font-bold ${scoreColor}`}>
                    {job.match_score}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-lg truncate group-hover:text-violet-600 transition-colors">
                    {job.role}
                  </h3>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" />
                    <span className="text-sm font-medium">{job.company}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                {job.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[200px]">{job.location}</span>
                  </div>
                )}
                {job.salary && job.salary !== "Not listed" && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[200px]">{job.salary}</span>
                  </div>
                )}
                {job.found_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
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
                  <Star className="h-3 w-3 mr-1" />
                  Priority
                </Badge>
              )}
              <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function JobCardSkeleton() {
  return (
    <Card className="border border-border/50">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-12 h-12 rounded-xl bg-muted animate-pulse" />
              <div>
                <div className="h-5 w-48 bg-muted rounded animate-pulse mb-1" />
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="flex gap-3 mb-3">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-5 w-16 bg-muted rounded animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
