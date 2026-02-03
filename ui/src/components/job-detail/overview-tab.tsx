"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  DollarSign,
  Users,
  Star,
  Briefcase,
  CheckCircle,
  HelpCircle,
  Lightbulb,
  Trophy,
  BadgeCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Job } from "@/types/job";
import {
  sectionReveal,
  sectionItem,
  listItem,
  springs,
} from "@/lib/animations";

interface OverviewTabProps {
  job: Job;
}

export function OverviewTab({ job }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Quick Info */}
      <motion.div
        className="grid grid-cols-2 gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.smooth, delay: 0.15 }}
      >
        {[
          {
            icon: MapPin,
            value: job.location || "Not specified",
          },
          {
            icon: DollarSign,
            value: job.salary || "Not disclosed",
          },
          {
            icon: Users,
            value: job.company_size || "Unknown",
          },
          {
            icon: Star,
            value: `Glassdoor: ${job.glassdoor_rating || "N/A"}`,
          },
        ].map(({ icon: Icon, value }, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
            whileHover={{ scale: 1.02 }}
            transition={springs.snappy}
          >
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm truncate">{value}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Funding */}
      {job.funding && (
        <motion.div
          className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.smooth, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 text-sm">
            <BadgeCheck className="h-4 w-4 text-violet-500" />
            <span className="font-medium text-violet-700 dark:text-violet-300">
              {job.funding}
            </span>
          </div>
        </motion.div>
      )}

      {/* Why Good Fit */}
      {job.why_good_fit && (
        <motion.div
          variants={sectionReveal}
          initial="initial"
          animate="animate"
        >
          <motion.h4
            variants={sectionItem}
            className="font-semibold mb-3 flex items-center gap-2"
          >
            <Trophy className="h-4 w-4 text-amber-500" />
            Why This Is a Good Fit
          </motion.h4>
          <motion.p
            variants={sectionItem}
            className="text-sm text-muted-foreground leading-relaxed"
          >
            {job.why_good_fit}
          </motion.p>
        </motion.div>
      )}

      {/* Tech Stack */}
      {job.tech_stack && job.tech_stack.length > 0 && (
        <motion.div
          variants={sectionReveal}
          initial="initial"
          animate="animate"
        >
          <motion.h4
            variants={sectionItem}
            className="font-semibold mb-3 flex items-center gap-2"
          >
            <Briefcase className="h-4 w-4 text-blue-500" />
            Tech Stack
          </motion.h4>
          <motion.div variants={sectionItem} className="flex flex-wrap gap-2">
            {job.tech_stack.map((tech, i) => (
              <motion.div
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...springs.snappy, delay: i * 0.03 }}
              >
                <Badge variant="secondary">{tech}</Badge>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Requirements */}
      {job.requirements && job.requirements.length > 0 && (
        <motion.div
          variants={sectionReveal}
          initial="initial"
          animate="animate"
        >
          <motion.h4
            variants={sectionItem}
            className="font-semibold mb-3 flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            Requirements
          </motion.h4>
          <motion.ul className="space-y-2">
            {job.requirements.map((req, i) => (
              <motion.li
                key={i}
                variants={listItem}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                {req}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      )}

      {/* Responsibilities */}
      {job.responsibilities && job.responsibilities.length > 0 && (
        <motion.div
          variants={sectionReveal}
          initial="initial"
          animate="animate"
        >
          <motion.h4
            variants={sectionItem}
            className="font-semibold mb-3 flex items-center gap-2"
          >
            <Briefcase className="h-4 w-4 text-violet-500" />
            Responsibilities
          </motion.h4>
          <motion.ul className="space-y-2">
            {job.responsibilities.map((resp, i) => (
              <motion.li
                key={i}
                variants={listItem}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
                {resp}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      )}

      {/* Experience to Highlight */}
      {job.experience_to_highlight && job.experience_to_highlight.length > 0 && (
        <motion.div
          variants={sectionReveal}
          initial="initial"
          animate="animate"
        >
          <motion.h4
            variants={sectionItem}
            className="font-semibold mb-3 flex items-center gap-2"
          >
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Experience to Highlight
          </motion.h4>
          <motion.ul className="space-y-2">
            {job.experience_to_highlight.map((exp, i) => (
              <motion.li
                key={i}
                variants={listItem}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                {exp}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      )}

      {/* Questions to Ask */}
      {job.questions_to_ask && job.questions_to_ask.length > 0 && (
        <motion.div
          variants={sectionReveal}
          initial="initial"
          animate="animate"
        >
          <motion.h4
            variants={sectionItem}
            className="font-semibold mb-3 flex items-center gap-2"
          >
            <HelpCircle className="h-4 w-4 text-blue-500" />
            Questions to Ask
          </motion.h4>
          <motion.ul className="space-y-2">
            {job.questions_to_ask.map((q, i) => (
              <motion.li
                key={i}
                variants={listItem}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                {q}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      )}
    </div>
  );
}
