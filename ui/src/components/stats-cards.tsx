"use client";

import { motion } from "framer-motion";
import {
  Briefcase,
  Target,
  TrendingUp,
  CheckCircle,
  MapPin,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { JobStats } from "@/types/job";
import { DISPLAY_LIMITS, SCORE_LABELS } from "@/constants";

interface StatsCardsProps {
  stats: JobStats;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Jobs",
      value: stats.total,
      icon: Briefcase,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
    },
    {
      title: SCORE_LABELS.priority,
      value: stats.priority,
      icon: Target,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: SCORE_LABELS.high,
      value: stats.highMatch,
      icon: TrendingUp,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: SCORE_LABELS.good,
      value: stats.goodMatch,
      icon: CheckCircle,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {cards.map((card) => (
        <motion.div key={card.title} variants={item}>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${card.bgColor}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

export function TechStackChart({ stats }: StatsCardsProps) {
  const topTech = Object.entries(stats.techStackCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, DISPLAY_LIMITS.TECH_ANALYTICS);

  const maxCount = Math.max(...topTech.map(([, count]) => count));

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="p-2 bg-violet-500/10 rounded-lg">
            <TrendingUp className="h-4 w-4 text-violet-500" />
          </span>
          Top Technologies
        </h3>
        <div className="space-y-3">
          {topTech.map(([tech, count], index) => (
            <motion.div
              key={tech}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3"
            >
              <span className="text-sm font-medium w-24 truncate">{tech}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / maxCount) * 100}%` }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                />
              </div>
              <span className="text-sm text-muted-foreground w-8 text-right">
                {count}
              </span>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function LocationChart({ stats }: StatsCardsProps) {
  const locations = Object.entries(stats.locationCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, DISPLAY_LIMITS.LOCATIONS);

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="p-2 bg-emerald-500/10 rounded-lg">
            <MapPin className="h-4 w-4 text-emerald-500" />
          </span>
          Locations
        </h3>
        <div className="space-y-2">
          {locations.map(([location, count], index) => (
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <span className="font-medium">{location}</span>
              <span className="text-sm px-2 py-1 bg-background rounded-md">
                {count} jobs
              </span>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
