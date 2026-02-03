"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  ExternalLink,
  X,
  FileText,
  Briefcase,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Job,
  getScoreColor,
  getScoreBgColor,
  type ApplicationStatus,
} from "@/types/job";
import { panelVariants, springs } from "@/lib/animations";
import { useApplication } from "@/hooks/use-application";
import { useInterviews } from "@/hooks/use-interviews";
import { OverviewTab } from "@/components/job-detail/overview-tab";
import { ApplicationTab } from "@/components/job-detail/application-tab";
import { InterviewsTab } from "@/components/job-detail/interviews-tab";

interface JobDetailProps {
  job: Job | null;
  onClose: () => void;
  onStatusChange?: (status: ApplicationStatus) => void;
  updating?: boolean;
  inSheet?: boolean;
}

export function JobDetail({ job, onClose, onStatusChange, updating, inSheet }: JobDetailProps) {
  // Hooks for application and interviews data
  const {
    application,
    interviews: appInterviews,
    updateApplication,
    refetch: refetchApplication,
  } = useApplication(job?.dbId);

  const {
    interviews,
    addInterview,
    updateInterview,
    deleteInterview,
    refetch: refetchInterviews,
  } = useInterviews(application?.id);

  // Merge interviews from application and from hook
  const allInterviews = interviews.length > 0 ? interviews : appInterviews;

  if (!job) return null;

  const scoreColor = getScoreColor(job.match_score);
  const scoreBgColor = getScoreBgColor(job.match_score);

  const containerClass = inSheet ? "h-full" : "h-full";

  const cardClass = inSheet
    ? "h-full border-0 shadow-none bg-transparent"
    : "h-full border-0 shadow-lg";

  const handleApplicationChange = async (data: Parameters<typeof updateApplication>[0]) => {
    await updateApplication(data);
    // Also update the parent component's status if it changed
    if (data.status && onStatusChange) {
      onStatusChange(data.status);
    }
    refetchApplication();
  };

  const handleAddInterview = async (data: Parameters<typeof addInterview>[0]) => {
    const newInterview = await addInterview(data);
    refetchInterviews();
    refetchApplication();
    return newInterview;
  };

  const handleUpdateInterview = async (id: number, data: Parameters<typeof updateInterview>[1]) => {
    const updated = await updateInterview(id, data);
    refetchInterviews();
    refetchApplication();
    return updated;
  };

  const handleDeleteInterview = async (id: number) => {
    await deleteInterview(id);
    refetchInterviews();
    refetchApplication();
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={job.id}
        variants={panelVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={containerClass}
      >
        <Card className={cardClass}>
          <CardHeader className="pb-4">
            <motion.div
              className="flex items-start justify-between"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springs.smooth, delay: 0.1 }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className={`flex items-center justify-center w-16 h-16 rounded-2xl ${scoreBgColor} border`}
                  whileHover={{ scale: 1.05 }}
                  transition={springs.snappy}
                >
                  <span className={`text-2xl font-bold ${scoreColor}`}>
                    {job.match_score}
                  </span>
                </motion.div>
                <div>
                  <CardTitle className="text-xl mb-1">{job.role}</CardTitle>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium">{job.company}</span>
                  </div>
                </div>
              </div>
              {!inSheet && (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={springs.snappy}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="lg:hidden"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </CardHeader>

          <Tabs defaultValue="overview" className="flex flex-col h-[calc(100%-88px)]">
            <div className="px-6">
              <TabsList className="w-full">
                <TabsTrigger value="overview" className="flex-1 gap-1.5">
                  <Briefcase className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="application" className="flex-1 gap-1.5">
                  <FileText className="h-4 w-4" />
                  Application
                </TabsTrigger>
                <TabsTrigger value="interviews" className="flex-1 gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Interviews
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className={inSheet ? "flex-1 scrollbar-thin" : "flex-1 scrollbar-thin"}>
              <CardContent className="pt-4">
                <TabsContent value="overview" className="mt-0">
                  <OverviewTab job={job} />
                </TabsContent>

                <TabsContent value="application" className="mt-0">
                  <ApplicationTab
                    job={job}
                    application={application}
                    onApplicationChange={handleApplicationChange}
                    updating={updating}
                  />
                </TabsContent>

                <TabsContent value="interviews" className="mt-0">
                  <InterviewsTab
                    applicationId={application?.id}
                    interviews={allInterviews}
                    onAddInterview={handleAddInterview}
                    onUpdateInterview={handleUpdateInterview}
                    onDeleteInterview={handleDeleteInterview}
                  />
                </TabsContent>
              </CardContent>
            </ScrollArea>

            {/* Apply Button - fixed at bottom */}
            <motion.div
              className="p-4 border-t"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springs.smooth, delay: 0.3 }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={springs.snappy}
              >
                <Button
                  asChild
                  className="w-full relative overflow-hidden bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 glow-violet group"
                  size="lg"
                >
                  <a
                    href={job.job_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {/* Shine effect */}
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <ExternalLink className="h-4 w-4 mr-2 relative z-10" />
                    <span className="relative z-10">View Job Posting</span>
                  </a>
                </Button>
              </motion.div>
            </motion.div>
          </Tabs>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
