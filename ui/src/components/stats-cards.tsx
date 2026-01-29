"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
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
import { springs, breathe, staggerContainer, listItem } from "@/lib/animations";

interface StatsCardsProps {
  stats: JobStats;
}

// Animated counter component
function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 50, damping: 20 });
  const display = useTransform(spring, (current) => Math.round(current));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    const unsubscribe = display.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = String(latest);
      }
    });
    return unsubscribe;
  }, [display]);

  return <span ref={ref}>0</span>;
}

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
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {cards.map((card, index) => (
        <motion.div key={card.title} variants={listItem}>
          <motion.div
            whileHover={{ y: -2 }}
            transition={springs.gentle}
          >
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    <p className="text-3xl font-bold mt-1">
                      <AnimatedNumber value={card.value} />
                    </p>
                  </div>
                  <motion.div
                    className={`p-3 rounded-xl ${card.bgColor}`}
                    variants={breathe}
                    animate="animate"
                  >
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
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
    <motion.div
      whileHover={{ y: -2 }}
      transition={springs.gentle}
    >
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <motion.span
              className="p-2 bg-violet-500/10 rounded-lg"
              variants={breathe}
              animate="animate"
            >
              <TrendingUp className="h-4 w-4 text-violet-500" />
            </motion.span>
            Top Technologies
          </h3>
          <div className="space-y-3">
            {topTech.map(([tech, count], index) => (
              <motion.div
                key={tech}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...springs.smooth, delay: index * 0.05 }}
                className="flex items-center gap-3 group"
              >
                <span className="text-sm font-medium w-24 truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  {tech}
                </span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / maxCount) * 100}%` }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.05,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                  />
                </div>
                <motion.span
                  className="text-sm text-muted-foreground w-8 text-right"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  {count}
                </motion.span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function LocationChart({ stats }: StatsCardsProps) {
  const locations = Object.entries(stats.locationCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, DISPLAY_LIMITS.LOCATIONS);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={springs.gentle}
    >
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <motion.span
              className="p-2 bg-emerald-500/10 rounded-lg"
              variants={breathe}
              animate="animate"
            >
              <MapPin className="h-4 w-4 text-emerald-500" />
            </motion.span>
            Locations
          </h3>
          <div className="space-y-2">
            {locations.map(([location, count], index) => (
              <motion.div
                key={location}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springs.smooth, delay: index * 0.08 }}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-all cursor-default"
              >
                <span className="font-medium">{location}</span>
                <motion.span
                  className="text-sm px-2 py-1 bg-background rounded-md"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.08 }}
                >
                  {count} jobs
                </motion.span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
