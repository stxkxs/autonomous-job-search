import { Variants, Transition } from "framer-motion";

// Spring presets for different interaction types
export const springs = {
  // Quick, responsive - for buttons and immediate feedback
  snappy: { type: "spring", stiffness: 400, damping: 30 } as Transition,
  // Soft, subtle - for hover states
  gentle: { type: "spring", stiffness: 300, damping: 25 } as Transition,
  // Smooth entrance - for page/section reveals
  smooth: { type: "spring", stiffness: 200, damping: 30 } as Transition,
  // Playful - for success states and celebrations
  bouncy: { type: "spring", stiffness: 400, damping: 15 } as Transition,
};

// Reusable animation variants
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

// Container with staggered children
export const staggerContainer: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

// List item for staggered animations
export const listItem: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: springs.smooth,
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.15 },
  },
};

// Card hover effects
export const cardHover = {
  rest: {
    y: 0,
    boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  },
  hover: {
    y: -2,
    boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  },
  tap: {
    scale: 0.995,
    y: 0,
  },
};

// Button press effect
export const buttonPress = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.97 },
};

// Badge animations (for filter badges)
export const badgeVariants: Variants = {
  initial: { opacity: 0, scale: 0.8, y: -10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springs.snappy,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: -10,
    transition: { duration: 0.15 },
  },
};

// Icon rotation for theme toggle
export const iconRotate: Variants = {
  initial: { rotate: -90, opacity: 0 },
  animate: {
    rotate: 0,
    opacity: 1,
    transition: springs.snappy,
  },
  exit: {
    rotate: 90,
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

// Pulse animation for priority items
export const pulse: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Breathing animation for icons
export const breathe: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.08, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Section reveal with stagger
export const sectionReveal: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

export const sectionItem: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: springs.smooth,
  },
};

// Counter animation helper - returns animation config for useSpring
export const counterConfig = {
  duration: 0.8,
  ease: [0.25, 0.1, 0.25, 1] as const, // ease-out
};

// Header entrance
export const headerVariants: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: springs.smooth,
  },
};

// Panel slide (for job detail)
export const panelVariants: Variants = {
  initial: { opacity: 0, x: 24, scale: 0.98 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: springs.gentle,
  },
  exit: {
    opacity: 0,
    x: 24,
    scale: 0.98,
    transition: { duration: 0.2 },
  },
};

// Empty state bounce
export const emptyStateBounce: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: springs.bouncy,
  },
};

// Selection indicator
export const selectionIndicator: Variants = {
  initial: { scaleY: 0, opacity: 0 },
  animate: {
    scaleY: 1,
    opacity: 1,
    transition: springs.snappy,
  },
  exit: {
    scaleY: 0,
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

// Shimmer skeleton - use with CSS animation
export const shimmerBase = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent";
