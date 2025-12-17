"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
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
}: JobFiltersProps) {
  const scoreOptions = [
    { value: 0, label: "All Jobs" },
    { value: 80, label: "80+ Score" },
    { value: 85, label: "85+ Score" },
    { value: 90, label: "90+ Score" },
  ];

  const topTech = availableTech.slice(0, 15);

  const handleTechToggle = (tech: string) => {
    if (selectedTech.includes(tech)) {
      onTechChange(selectedTech.filter((t) => t !== tech));
    } else {
      onTechChange([...selectedTech, tech]);
    }
  };

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
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs, companies, tech..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="shrink-0">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Sort:{" "}
              {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
            </Button>
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
            <Button
              variant={scoreFilter > 0 ? "default" : "outline"}
              className="shrink-0"
            >
              {scoreOptions.find((o) => o.value === scoreFilter)?.label ||
                "All Jobs"}
            </Button>
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
      </div>

      {/* Active Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {hasActiveFilters && (
            <>
              <span className="text-sm text-muted-foreground">Filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  &quot;{searchQuery}&quot;
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => onSearchChange("")}
                  />
                </Badge>
              )}
              {scoreFilter > 0 && (
                <Badge variant="secondary" className="gap-1">
                  {scoreFilter}+ score
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => onScoreFilterChange(0)}
                  />
                </Badge>
              )}
              {selectedTech.map((tech) => (
                <Badge key={tech} variant="secondary" className="gap-1">
                  {tech}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleTechToggle(tech)}
                  />
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground"
              >
                Clear all
              </Button>
            </>
          )}
        </div>
        <span className="text-sm text-muted-foreground">
          {filteredCount} of {totalJobs} jobs
        </span>
      </div>
    </div>
  );
}
