"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { headerVariants, iconRotate, springs } from "@/lib/animations";

export function Header() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle("dark", newIsDark);
  };

  return (
    <motion.header
      variants={headerVariants}
      initial="initial"
      animate="animate"
      className="sticky top-0 z-50 w-full glass border-b border-border/50"
    >
      {/* Subtle gradient border effect */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
          transition={springs.gentle}
        >
          <motion.div
            className="p-2 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl shadow-lg shadow-violet-500/20"
            whileHover={{
              boxShadow: "0 0 24px -4px rgba(139, 92, 246, 0.4)",
            }}
            transition={springs.gentle}
          >
            <Briefcase className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">Job Catalog</h1>
            <p className="text-xs text-muted-foreground">
              Autonomous Job Search
            </p>
          </div>
        </motion.div>

        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={springs.snappy}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="relative overflow-hidden"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                  <motion.div
                    key="sun"
                    variants={iconRotate}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <Sun className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    variants={iconRotate}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <Moon className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
