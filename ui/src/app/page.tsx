"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/header";
import { StatsCards, TechStackChart, LocationChart } from "@/components/stats-cards";
import { JobCard, JobCardSkeleton } from "@/components/job-card";
import { JobDetail } from "@/components/job-detail";
import { JobFilters } from "@/components/job-filters";
import { Pagination } from "@/components/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { searchJobs, filterByScore, sortJobs } from "@/lib/jobs";
import { useJobs, useApplicationStatus } from "@/hooks/use-jobs";
import { useHiddenJobs } from "@/hooks/use-hidden-jobs";
import { Job, calculateStats, type ApplicationStatus } from "@/types/job";
import { List, BarChart3, Loader2, Search } from "lucide-react";
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
  const { jobs: allJobs, loading, error, refetch } = useJobs();
  const { hideJob, showJob, clearAllHidden, isHidden, hiddenCount, isLoaded: hiddenLoaded } = useHiddenJobs();
  const { updateStatus, updating } = useApplicationStatus();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "date" | "company" | "salary">("score");
  const [scoreFilter, setScoreFilter] = useState(0);
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("jobs");
  const [showHidden, setShowHidden] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const stats = useMemo(() => calculateStats(allJobs), [allJobs]);

  const availableTech = useMemo(() => {
    return Object.entries(stats.techStackCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([tech]) => tech);
  }, [stats]);

  const filteredJobs = useMemo(() => {
    let jobs = allJobs;

    // Filter hidden jobs (unless showing hidden)
    if (hiddenLoaded && !showHidden) {
      jobs = jobs.filter((job) => !isHidden(job.id));
    } else if (hiddenLoaded && showHidden) {
      // When showing hidden, only show hidden jobs
      jobs = jobs.filter((job) => isHidden(job.id));
    }

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
  }, [allJobs, searchQuery, scoreFilter, selectedTech, sortBy, showHidden, isHidden, hiddenLoaded]);

  // Pagination
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredJobs.length / pageSize);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, scoreFilter, selectedTech, sortBy, showHidden]);

  const filteredStats = useMemo(() => calculateStats(filteredJobs), [filteredJobs]);

  // Status change handler
  const handleStatusChange = useCallback(
    async (job: Job, newStatus: ApplicationStatus) => {
      if (!job.dbId) {
        console.warn("Status changes require database mode");
        return;
      }
      await updateStatus(job.dbId, newStatus);
      refetch();
    },
    [updateStatus, refetch]
  );

  // Update selected job when jobs list refreshes
  useEffect(() => {
    if (selectedJob) {
      const updated = allJobs.find((j) => j.id === selectedJob.id);
      if (updated) {
        setSelectedJob(updated);
      }
    }
  }, [allJobs, selectedJob?.id]);

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
                showHidden={showHidden}
                onShowHiddenChange={setShowHidden}
                hiddenCount={hiddenCount}
                onClearAllHidden={clearAllHidden}
              />
            </motion.div>

            {/* Job List - Full Width */}
            <div className="space-y-3">
              {loading ? (
                <div className="space-y-3">
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
                </div>
              ) : (
                <>
                  <AnimatePresence mode="popLayout">
                    {paginatedJobs.map((job, index) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        index={index}
                        onSelect={setSelectedJob}
                        isSelected={selectedJob?.id === job.id}
                        isHidden={isHidden(job.id)}
                        onHide={hideJob}
                        onShow={showJob}
                      />
                    ))}
                  </AnimatePresence>
                  {filteredJobs.length === 0 && (
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
                  {filteredJobs.length > 0 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={filteredJobs.length}
                      pageSize={pageSize}
                      onPageChange={setCurrentPage}
                      onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                      }}
                    />
                  )}
                </>
              )}
            </div>

            {/* Job Detail Sheet (Slide-over) */}
            <Sheet open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
              <SheetContent side="right" className="w-full sm:max-w-lg lg:max-w-xl overflow-y-auto">
                <SheetHeader className="sr-only">
                  <SheetTitle>{selectedJob?.role}</SheetTitle>
                  <SheetDescription>Job details and application status</SheetDescription>
                </SheetHeader>
                {selectedJob && (
                  <JobDetail
                    job={selectedJob}
                    onClose={() => setSelectedJob(null)}
                    onStatusChange={(status) => handleStatusChange(selectedJob, status)}
                    updating={updating}
                    inSheet
                  />
                )}
              </SheetContent>
            </Sheet>
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
