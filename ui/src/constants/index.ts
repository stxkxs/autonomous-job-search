/**
 * Application Constants
 * Centralized configuration for scores, limits, and other magic numbers
 */

// Score Thresholds
export const SCORE_THRESHOLDS = {
  PRIORITY: 90,
  HIGH: 85,
  GOOD: 80,
} as const;

// Score Categories
export type ScoreCategory = 'priority' | 'high' | 'good' | 'low';

export const SCORE_CATEGORIES = {
  PRIORITY: 'priority' as const,
  HIGH: 'high' as const,
  GOOD: 'good' as const,
  LOW: 'low' as const,
};

// Score Labels
export const SCORE_LABELS = {
  [SCORE_CATEGORIES.PRIORITY]: 'Priority (90+)',
  [SCORE_CATEGORIES.HIGH]: 'High Match (85-89)',
  [SCORE_CATEGORIES.GOOD]: 'Good Match (80-84)',
  [SCORE_CATEGORIES.LOW]: 'Below 80',
} as const;

// Display Limits
export const DISPLAY_LIMITS = {
  TECH_ANALYTICS: 10,
  TECH_FILTER: 15,
  LOCATIONS: 5,
  COMPANIES: 10,
} as const;

// Layout Heights
export const LAYOUT = {
  JOB_LIST_HEIGHT: 'calc(100vh - 420px)',
  JOB_DETAIL_HEIGHT: 'calc(100vh - 200px)',
} as const;

// Score Color Mappings
export const SCORE_COLORS = {
  [SCORE_CATEGORIES.PRIORITY]: {
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    badge: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
  },
  [SCORE_CATEGORIES.HIGH]: {
    text: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    badge: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  },
  [SCORE_CATEGORIES.GOOD]: {
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    badge: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
  },
  [SCORE_CATEGORIES.LOW]: {
    text: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/20',
    badge: 'bg-gray-500/20 text-gray-700 dark:text-gray-300',
  },
} as const;

// ATS Platforms
export const ATS_PLATFORMS = {
  GREENHOUSE: 'greenhouse',
  LEVER: 'lever',
  ASHBY: 'ashby',
  WORKABLE: 'workable',
} as const;

export type ATSPlatform = typeof ATS_PLATFORMS[keyof typeof ATS_PLATFORMS];

// ATS Platform Metadata
export const ATS_METADATA = {
  [ATS_PLATFORMS.GREENHOUSE]: {
    name: 'Greenhouse',
    domain: 'boards.greenhouse.io',
    color: 'bg-green-500/20 text-green-700 dark:text-green-300',
  },
  [ATS_PLATFORMS.LEVER]: {
    name: 'Lever',
    domain: 'jobs.lever.co',
    color: 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
  },
  [ATS_PLATFORMS.ASHBY]: {
    name: 'Ashby',
    domain: 'jobs.ashbyhq.com',
    color: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300',
  },
  [ATS_PLATFORMS.WORKABLE]: {
    name: 'Workable',
    domain: 'apply.workable.com',
    color: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300',
  },
} as const;
