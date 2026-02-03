"use client";

import { useState, useEffect, useCallback } from "react";
import { Interview } from "@/types/application";

export function useInterviews(applicationId: number | undefined) {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInterviews = useCallback(async () => {
    if (applicationId === undefined) {
      setInterviews([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/interviews?applicationId=${applicationId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch interviews");
      }

      const data = await response.json();
      setInterviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const addInterview = useCallback(
    async (
      data: Omit<Interview, "id" | "applicationId" | "createdAt" | "updatedAt">
    ): Promise<Interview> => {
      if (applicationId === undefined) {
        throw new Error("Application ID is required to add an interview");
      }

      const response = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, applicationId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create interview");
      }

      const newInterview = await response.json();
      setInterviews((prev) => [...prev, newInterview]);
      return newInterview;
    },
    [applicationId]
  );

  const updateInterview = useCallback(
    async (id: number, data: Partial<Interview>): Promise<Interview> => {
      const response = await fetch(`/api/interviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update interview");
      }

      const updatedInterview = await response.json();
      setInterviews((prev) =>
        prev.map((interview) =>
          interview.id === id ? updatedInterview : interview
        )
      );
      return updatedInterview;
    },
    []
  );

  const deleteInterview = useCallback(async (id: number): Promise<void> => {
    const response = await fetch(`/api/interviews/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete interview");
    }

    setInterviews((prev) => prev.filter((interview) => interview.id !== id));
  }, []);

  return {
    interviews,
    loading,
    error,
    addInterview,
    updateInterview,
    deleteInterview,
    refetch: fetchInterviews,
  };
}
