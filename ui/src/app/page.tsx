"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/header";
import { StatsCards, TechStackChart, LocationChart } from "@/components/stats-cards";
import { JobCard, JobCardSkeleton } from "@/components/job-card";
import { JobDetail } from "@/components/job-detail";
import { JobFilters } from "@/components/job-filters";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { searchJobs, filterByScore, sortJobs } from "@/lib/jobs";
import { useJobs } from "@/hooks/use-jobs";
import { Job, calculateStats } from "@/types/job";
import { LayoutGrid, List, BarChart3, Loader2, Search } from "lucide-react";
import {
  SCORE_LABELS,
  SCORE_COLORS,
  SCORE_CATEGORIES,
  DISPLAY_LIMITS,
} from "@/constants";
import {
  fadeInUp,
  emptyStateBounce,
  springs,
  staggerContainer,
  listItem,
} from "@/lib/animations";

export default function Home() {
  const { jobs: allJobs, loading, error } = useJobs();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "date" | "company" | "salary">("score");
  const [scoreFilter, setScoreFilter] = useState(0);
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("jobs");

  const stats = useMemo(() => calculateStats(allJobs), [allJobs]);

  const availableTech = useMemo(() => {
    return Object.entries(stats.techStackCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([tech]) => tech);
  }, [stats]);

  const filteredJobs = useMemo(() => {
    let jobs = allJobs;

    if (searchQuery) {
      jobs = searchJobs(jobs, searchQuery);
    }

    if (scoreFilter > 0) {
      jobs = filterByScore(jobs, scoreFilter);
    }

    if (selectedTech.length > 0) {
      jobs = jobs.filter((job) =>
        job.tech_stack && selectedTech.some((tech) =>
          job.tech_stack!.some((t) => t.toLowerCase() === tech.toLowerCase())
        )
      );
    }

    return sortJobs(jobs, sortBy);
  }, [allJobs, searchQuery, scoreFilter, selectedTech, sortBy]);

  const filteredStats = useMemo(() => calculateStats(filteredJobs), [filteredJobs]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={springs.smooth}
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <p className="text-destructive font-medium">Error loading jobs: {error}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={springs.smooth}
            >
              <h2 className="text-2xl font-bold tracking-tight">
                Job Opportunities
              </h2>
              <p className="text-muted-foreground mt-1">
                {loading ? "Loading..." : `${stats.total} positions found across all platforms`}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springs.smooth, delay: 0.1 }}
            >
              <TabsList className="grid w-full sm:w-auto grid-cols-2">
                <TabsTrigger value="jobs" className="gap-2">
                  <List className="h-4 w-4" />
                  Jobs
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>
            </motion.div>
          </div>

          <TabsContent value="jobs" className="space-y-8">
            <StatsCards stats={filteredStats} />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springs.smooth, delay: 0.15 }}
            >
              <JobFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortChange={setSortBy}
                scoreFilter={scoreFilter}
                onScoreFilterChange={setScoreFilter}
                selectedTech={selectedTech}
                onTechChange={setSelectedTech}
                availableTech={availableTech}
                totalJobs={allJobs.length}
                filteredCount={filteredJobs.length}
              />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Job List */}
              <div className="lg:col-span-3">
                <ScrollArea className="h-[calc(100vh-460px)] scrollbar-thin">
                  <div className="space-y-3 pr-4 py-1 pl-1">
                    {loading ? (
                      <>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                          >
                            <JobCardSkeleton />
                          </motion.div>
                        ))}
                      </>
                    ) : (
                      <AnimatePresence mode="popLayout">
                        {filteredJobs.map((job, index) => (
                          <JobCard
                            key={job.id}
                            job={job}
                            index={index}
                            onSelect={setSelectedJob}
                            isSelected={selectedJob?.id === job.id}
                          />
                        ))}
                      </AnimatePresence>
                    )}
                    {!loading && filteredJobs.length === 0 && (
                      <motion.div
                        variants={emptyStateBounce}
                        initial="initial"
                        animate="animate"
                        className="text-center py-16"
                      >
                        <motion.div
                          className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4"
                          animate={{
                            scale: [1, 1.05, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <Search className="h-8 w-8 text-muted-foreground" />
                        </motion.div>
                        <p className="text-muted-foreground font-medium">
                          No jobs match your filters
                        </p>
                        <p className="text-sm text-muted-foreground/70 mt-1">
                          Try adjusting your search criteria
                        </p>
                      </motion.div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Job Detail Panel */}
              <div className="lg:col-span-2 hidden lg:block">
                <AnimatePresence mode="wait">
                  {selectedJob ? (
                    <JobDetail job={selectedJob} onClose={() => setSelectedJob(null)} />
                  ) : (
                    <motion.div
                      key="empty-state"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={springs.smooth}
                    >
                      <Card className="h-full border-0 shadow-lg flex items-center justify-center min-h-[400px]">
                        <CardContent className="text-center py-12">
                          <motion.div
                            className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4"
                            animate={{
                              scale: [1, 1.05, 1],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          >
                            <LayoutGrid className="h-8 w-8 text-muted-foreground" />
                          </motion.div>
                          <p className="text-muted-foreground font-medium">
                            Select a job to view details
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile Detail Sheet */}
            <AnimatePresence>
              {selectedJob && (
                <motion.div
                  initial={{ opacity: 0, y: "100%" }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: "100%" }}
                  transition={springs.smooth}
                  className="lg:hidden fixed inset-0 z-50 bg-background"
                >
                  <ScrollArea className="h-full scrollbar-thin">
                    <div className="p-4">
                      <JobDetail job={selectedJob} onClose={() => setSelectedJob(null)} />
                    </div>
                  </ScrollArea>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-8">
            {loading ? (
              <motion.div
                className="flex items-center justify-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="h-8 w-8 text-muted-foreground" />
                </motion.div>
              </motion.div>
            ) : (
              <>
                <StatsCards stats={stats} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <TechStackChart stats={stats} />
                  <LocationChart stats={stats} />
                </div>

                {/* Company Distribution */}
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={springs.gentle}
                >
                  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">Top Companies by Job Count</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <motion.div
                        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                      >
                        {Object.entries(stats.companyCounts)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, DISPLAY_LIMITS.COMPANIES)
                          .map(([company, count], index) => (
                            <motion.div
                              key={company}
                              variants={listItem}
                              whileHover={{ scale: 1.02, y: -2 }}
                              transition={springs.snappy}
                              className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-center cursor-default"
                            >
                              <p className="font-medium text-sm truncate">{company}</p>
                              <p className="text-2xl font-bold text-violet-500 mt-1">
                                {count}
                              </p>
                              <p className="text-xs text-muted-foreground">positions</p>
                            </motion.div>
                          ))}
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Score Distribution Details */}
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={springs.gentle}
                >
                  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">Score Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <motion.div
                        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                      >
                        {[
                          { key: SCORE_CATEGORIES.PRIORITY, count: stats.priority },
                          { key: SCORE_CATEGORIES.HIGH, count: stats.highMatch },
                          { key: SCORE_CATEGORIES.GOOD, count: stats.goodMatch },
                          { key: SCORE_CATEGORIES.LOW, count: stats.other },
                        ].map(({ key, count }) => {
                          const colors = SCORE_COLORS[key];
                          return (
                            <motion.div
                              key={key}
                              variants={listItem}
                              whileHover={{ scale: 1.02 }}
                              transition={springs.snappy}
                              className={`p-4 rounded-xl ${colors.bg} border ${colors.border}`}
                            >
                              <p className={`text-sm ${colors.text} font-medium`}>
                                {SCORE_LABELS[key]}
                              </p>
                              <p className={`text-3xl font-bold ${colors.text.split(' ')[0].replace('text-', 'text-')} mt-1`}>
                                {count}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0}% of total
                              </p>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
