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
import { LayoutGrid, List, BarChart3, Loader2 } from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <p className="text-destructive font-medium">Error loading jobs: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold"
              >
                Job Opportunities
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground"
              >
                {loading ? "Loading..." : `${stats.total} positions found from Greenhouse ATS`}
              </motion.p>
            </div>

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
          </div>

          <TabsContent value="jobs" className="space-y-6">
            <StatsCards stats={filteredStats} />

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

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Job List */}
              <div className="lg:col-span-3">
                <ScrollArea className="h-[calc(100vh-420px)]">
                  <div className="space-y-3 pr-4">
                    {loading ? (
                      <>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <JobCardSkeleton key={i} />
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
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                      >
                        <p className="text-muted-foreground">
                          No jobs match your filters
                        </p>
                      </motion.div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Job Detail Panel */}
              <div className="lg:col-span-2 hidden lg:block">
                {selectedJob ? (
                  <JobDetail job={selectedJob} onClose={() => setSelectedJob(null)} />
                ) : (
                  <Card className="h-full border-0 shadow-lg flex items-center justify-center">
                    <CardContent className="text-center py-12">
                      <div className="p-4 bg-muted rounded-full w-fit mx-auto mb-4">
                        <LayoutGrid className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">
                        Select a job to view details
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Mobile Detail Sheet */}
            {selectedJob && (
              <div className="lg:hidden fixed inset-0 z-50 bg-background">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <JobDetail job={selectedJob} onClose={() => setSelectedJob(null)} />
                  </div>
                </ScrollArea>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <StatsCards stats={stats} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <TechStackChart stats={stats} />
                  <LocationChart stats={stats} />
                </div>

                {/* Company Distribution */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Top Companies by Job Count</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      {Object.entries(stats.companyCounts)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 10)
                        .map(([company, count], index) => (
                          <motion.div
                            key={company}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-center"
                          >
                            <p className="font-medium text-sm truncate">{company}</p>
                            <p className="text-2xl font-bold text-violet-500 mt-1">
                              {count}
                            </p>
                            <p className="text-xs text-muted-foreground">positions</p>
                          </motion.div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Score Distribution Details */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Score Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                          Priority (90+)
                        </p>
                        <p className="text-3xl font-bold text-emerald-500 mt-1">
                          {stats.priority}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {stats.total > 0 ? ((stats.priority / stats.total) * 100).toFixed(1) : 0}% of total
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                          High Match (85-89)
                        </p>
                        <p className="text-3xl font-bold text-blue-500 mt-1">
                          {stats.highMatch}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {stats.total > 0 ? ((stats.highMatch / stats.total) * 100).toFixed(1) : 0}% of total
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                          Good Match (80-84)
                        </p>
                        <p className="text-3xl font-bold text-amber-500 mt-1">
                          {stats.goodMatch}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {stats.total > 0 ? ((stats.goodMatch / stats.total) * 100).toFixed(1) : 0}% of total
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-500/10 border border-gray-500/20">
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          Other (&lt;80)
                        </p>
                        <p className="text-3xl font-bold text-gray-500 mt-1">
                          {stats.other}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {stats.total > 0 ? ((stats.other / stats.total) * 100).toFixed(1) : 0}% of total
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
