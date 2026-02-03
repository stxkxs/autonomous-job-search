"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, Eye, EyeOff, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SCORE_THRESHOLDS, DISPLAY_LIMITS } from "@/constants";
import { badgeVariants, springs } from "@/lib/animations";

interface JobFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: "score" | "date" | "company" | "salary";
  onSortChange: (sort: "score" | "date" | "company" | "salary") => void;
  scoreFilter: number;
  onScoreFilterChange: (score: number) => void;
  selectedTech: string[];
  onTechChange: (tech: string[]) => void;
  availableTech: string[];
  totalJobs: number;
  filteredCount: number;
  // Hidden jobs
  showHidden: boolean;
  onShowHiddenChange: (show: boolean) => void;
  hiddenCount: number;
  onClearAllHidden?: () => void;
}

export function JobFilters({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  scoreFilter,
  onScoreFilterChange,
  selectedTech,
  onTechChange,
  availableTech,
  totalJobs,
  filteredCount,
  showHidden,
  onShowHiddenChange,
  hiddenCount,
  onClearAllHidden,
}: JobFiltersProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const scoreOptions = [
    { value: 0, label: "All Jobs" },
    { value: SCORE_THRESHOLDS.GOOD, label: `${SCORE_THRESHOLDS.GOOD}+ Score` },
    { value: SCORE_THRESHOLDS.HIGH, label: `${SCORE_THRESHOLDS.HIGH}+ Score` },
    { value: SCORE_THRESHOLDS.PRIORITY, label: `${SCORE_THRESHOLDS.PRIORITY}+ Score` },
  ];

  const topTech = availableTech.slice(0, DISPLAY_LIMITS.TECH_FILTER);

  const handleTechToggle = useCallback(
    (tech: string) => {
      if (selectedTech.includes(tech)) {
        onTechChange(selectedTech.filter((t) => t !== tech));
      } else {
        onTechChange([...selectedTech, tech]);
      }
    },
    [selectedTech, onTechChange]
  );

  const clearFilters = () => {
    onSearchChange("");
    onScoreFilterChange(0);
    onTechChange([]);
  };

  const hasActiveFilters =
    searchQuery || scoreFilter > 0 || selectedTech.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <motion.div
          className="relative flex-1"
          animate={{
            scale: isSearchFocused ? 1.01 : 1,
          }}
          transition={springs.gentle}
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs, companies, tech..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={`pl-9 transition-shadow duration-200 ${
              isSearchFocused ? "ring-2 ring-violet-500/20" : ""
            }`}
          />
        </motion.div>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={springs.snappy}
            >
              <Button variant="outline" className="shrink-0">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Sort:{" "}
                {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={sortBy}
              onValueChange={(v) =>
                onSortChange(v as "score" | "date" | "company" | "salary")
              }
            >
              <DropdownMenuRadioItem value="score">
                Match Score
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="date">
                Date Found
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="company">
                Company Name
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="salary">
                Salary (High to Low)
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Score Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={springs.snappy}
            >
              <Button
                variant={scoreFilter > 0 ? "default" : "outline"}
                className="shrink-0"
              >
                {scoreOptions.find((o) => o.value === scoreFilter)?.label ||
                  "All Jobs"}
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Minimum Score</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={scoreFilter.toString()}
              onValueChange={(v) => onScoreFilterChange(parseInt(v))}
            >
              {scoreOptions.map((option) => (
                <DropdownMenuRadioItem
                  key={option.value}
                  value={option.value.toString()}
                >
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tech Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={springs.snappy}
            >
              <Button
                variant={selectedTech.length > 0 ? "default" : "outline"}
                className="shrink-0"
              >
                Tech
                {selectedTech.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-background/20 text-xs"
                  >
                    {selectedTech.length}
                  </Badge>
                )}
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filter by Technology</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {topTech.map((tech) => (
              <DropdownMenuCheckboxItem
                key={tech}
                checked={selectedTech.includes(tech)}
                onCheckedChange={() => handleTechToggle(tech)}
              >
                {tech}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Hidden Jobs Toggle */}
        {hiddenCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springs.snappy}
            className="flex items-center gap-1"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={springs.snappy}
            >
              <Button
                variant={showHidden ? "default" : "outline"}
                className="shrink-0"
                onClick={() => onShowHiddenChange(!showHidden)}
              >
                {showHidden ? (
                  <Eye className="h-4 w-4 mr-2" />
                ) : (
                  <EyeOff className="h-4 w-4 mr-2" />
                )}
                Hidden
                <Badge
                  variant="secondary"
                  className="ml-2 bg-background/20 text-xs"
                >
                  {hiddenCount}
                </Badge>
              </Button>
            </motion.div>
            {showHidden && onClearAllHidden && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={springs.snappy}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClearAllHidden}
                  className="text-muted-foreground hover:text-red-500"
                  title="Restore all hidden jobs"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Active Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <AnimatePresence mode="popLayout">
            {hasActiveFilters && (
              <motion.span
                key="filters-label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-muted-foreground"
              >
                Filters:
              </motion.span>
            )}
            {searchQuery && (
              <motion.div
                key="search-badge"
                variants={badgeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                layout
              >
                <Badge variant="secondary" className="gap-1 pr-1">
                  &quot;{searchQuery}&quot;
                  <motion.button
                    whileHover={{ rotate: 90 }}
                    transition={springs.snappy}
                    onClick={() => onSearchChange("")}
                    className="ml-1 rounded-full p-0.5 hover:bg-background/50"
                    aria-label="Remove search filter"
                  >
                    <X className="h-3 w-3 cursor-pointer" />
                  </motion.button>
                </Badge>
              </motion.div>
            )}
            {scoreFilter > 0 && (
              <motion.div
                key="score-badge"
                variants={badgeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                layout
              >
                <Badge variant="secondary" className="gap-1 pr-1">
                  {scoreFilter}+ score
                  <motion.button
                    whileHover={{ rotate: 90 }}
                    transition={springs.snappy}
                    onClick={() => onScoreFilterChange(0)}
                    className="ml-1 rounded-full p-0.5 hover:bg-background/50"
                    aria-label="Remove score filter"
                  >
                    <X className="h-3 w-3 cursor-pointer" />
                  </motion.button>
                </Badge>
              </motion.div>
            )}
            {selectedTech.map((tech) => (
              <motion.div
                key={`tech-${tech}`}
                variants={badgeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                layout
              >
                <Badge variant="secondary" className="gap-1 pr-1">
                  {tech}
                  <motion.button
                    whileHover={{ rotate: 90 }}
                    transition={springs.snappy}
                    onClick={() => handleTechToggle(tech)}
                    className="ml-1 rounded-full p-0.5 hover:bg-background/50"
                    aria-label={`Remove ${tech} filter`}
                  >
                    <X className="h-3 w-3 cursor-pointer" />
                  </motion.button>
                </Badge>
              </motion.div>
            ))}
            {hasActiveFilters && (
              <motion.div
                key="clear-all"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={springs.snappy}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <motion.span
                    whileHover={{ x: 2 }}
                    transition={springs.snappy}
                  >
                    Clear all
                  </motion.span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.span
          className="text-sm text-muted-foreground"
          key={filteredCount}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springs.snappy}
        >
          {filteredCount} of {totalJobs} jobs
        </motion.span>
      </div>
    </div>
  );
}
