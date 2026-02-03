"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

const STORAGE_KEY = "hidden-jobs";

interface HiddenJobsState {
  hiddenIds: Set<string>;
  hiddenAt: Map<string, number>; // timestamp when hidden
}

function loadFromStorage(): HiddenJobsState {
  if (typeof window === "undefined") {
    return { hiddenIds: new Set(), hiddenAt: new Map() };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { hiddenIds: new Set(), hiddenAt: new Map() };
    }

    const parsed = JSON.parse(stored);
    return {
      hiddenIds: new Set(parsed.ids || []),
      hiddenAt: new Map(Object.entries(parsed.timestamps || {})),
    };
  } catch {
    console.error("Failed to load hidden jobs from localStorage");
    return { hiddenIds: new Set(), hiddenAt: new Map() };
  }
}

function saveToStorage(state: HiddenJobsState): void {
  if (typeof window === "undefined") return;

  try {
    const toStore = {
      ids: Array.from(state.hiddenIds),
      timestamps: Object.fromEntries(state.hiddenAt),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    console.error("Failed to save hidden jobs to localStorage");
  }
}

export function useHiddenJobs() {
  const [state, setState] = useState<HiddenJobsState>(() => loadFromStorage());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    setState(loadFromStorage());
    setIsLoaded(true);
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (isLoaded) {
      saveToStorage(state);
    }
  }, [state, isLoaded]);

  // Hide a job
  const hideJob = useCallback((jobId: string) => {
    setState((prev) => {
      const newHiddenIds = new Set(prev.hiddenIds);
      const newHiddenAt = new Map(prev.hiddenAt);
      newHiddenIds.add(jobId);
      newHiddenAt.set(jobId, Date.now());
      return { hiddenIds: newHiddenIds, hiddenAt: newHiddenAt };
    });
  }, []);

  // Show (unhide) a job
  const showJob = useCallback((jobId: string) => {
    setState((prev) => {
      const newHiddenIds = new Set(prev.hiddenIds);
      const newHiddenAt = new Map(prev.hiddenAt);
      newHiddenIds.delete(jobId);
      newHiddenAt.delete(jobId);
      return { hiddenIds: newHiddenIds, hiddenAt: newHiddenAt };
    });
  }, []);

  // Clear all hidden jobs
  const clearAllHidden = useCallback(() => {
    setState({ hiddenIds: new Set(), hiddenAt: new Map() });
  }, []);

  // Toggle a job's hidden state
  const toggleHidden = useCallback((jobId: string) => {
    setState((prev) => {
      const newHiddenIds = new Set(prev.hiddenIds);
      const newHiddenAt = new Map(prev.hiddenAt);

      if (newHiddenIds.has(jobId)) {
        newHiddenIds.delete(jobId);
        newHiddenAt.delete(jobId);
      } else {
        newHiddenIds.add(jobId);
        newHiddenAt.set(jobId, Date.now());
      }

      return { hiddenIds: newHiddenIds, hiddenAt: newHiddenAt };
    });
  }, []);

  // Check if a job is hidden
  const isHidden = useCallback(
    (jobId: string) => state.hiddenIds.has(jobId),
    [state.hiddenIds]
  );

  // Get hidden count
  const hiddenCount = useMemo(() => state.hiddenIds.size, [state.hiddenIds]);

  // Get list of hidden job IDs
  const hiddenJobIds = useMemo(
    () => Array.from(state.hiddenIds),
    [state.hiddenIds]
  );

  // Get hidden jobs with timestamps, sorted by most recently hidden
  const hiddenJobsWithTimestamps = useMemo(() => {
    return Array.from(state.hiddenAt.entries())
      .map(([id, timestamp]) => ({ id, timestamp }))
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [state.hiddenAt]);

  return {
    hideJob,
    showJob,
    clearAllHidden,
    toggleHidden,
    isHidden,
    hiddenCount,
    hiddenJobIds,
    hiddenJobsWithTimestamps,
    isLoaded,
  };
}

export type UseHiddenJobsReturn = ReturnType<typeof useHiddenJobs>;
