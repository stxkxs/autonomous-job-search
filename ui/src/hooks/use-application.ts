"use client";

import { useState, useEffect, useCallback } from "react";
import { Application, Interview } from "@/types/application";

const USE_API = process.env.NEXT_PUBLIC_USE_API === "true";

interface ApplicationWithInterviews extends Application {
  interviews?: Interview[];
}

interface UseApplicationReturn {
  application: Application | null;
  interviews: Interview[];
  loading: boolean;
  error: string | null;
  updateApplication: (data: Partial<Application>) => Promise<void>;
  refetch: () => void;
}

export function useApplication(jobId: number | undefined): UseApplicationReturn {
  const [application, setApplication] = useState<Application | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplication = useCallback(async () => {
    if (!jobId || !USE_API) {
      setApplication(null);
      setInterviews([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all applications and filter by jobId client-side
      const response = await fetch("/api/applications");

      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      const applications: ApplicationWithInterviews[] = await response.json();

      // Find the application matching this jobId
      const matchingApp = applications.find((app) => app.jobId === jobId);

      if (matchingApp) {
        setApplication(matchingApp);
        setInterviews(matchingApp.interviews || []);
      } else {
        setApplication(null);
        setInterviews([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setApplication(null);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const updateApplication = useCallback(
    async (data: Partial<Application>): Promise<void> => {
      if (!USE_API) {
        console.warn("API not enabled - application changes won't persist");
        return;
      }

      if (!application?.id) {
        // No existing application, create one
        if (!jobId) {
          throw new Error("Cannot create application without jobId");
        }

        try {
          const response = await fetch("/api/applications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jobId, ...data }),
          });

          if (!response.ok) {
            throw new Error("Failed to create application");
          }

          const newApplication = await response.json();
          setApplication(newApplication);
          setInterviews(newApplication.interviews || []);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Unknown error";
          setError(errorMessage);
          throw err;
        }
        return;
      }

      // Update existing application
      try {
        const response = await fetch(`/api/applications/${application.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Failed to update application");
        }

        const updatedApplication = await response.json();
        setApplication(updatedApplication);
        // Note: PATCH response doesn't include interviews, so we keep existing
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        throw err;
      }
    },
    [application?.id, jobId]
  );

  return {
    application,
    interviews,
    loading,
    error,
    updateApplication,
    refetch: fetchApplication,
  };
}
