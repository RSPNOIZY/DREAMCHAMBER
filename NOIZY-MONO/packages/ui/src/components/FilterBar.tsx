"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils";
import type { FilterGroup } from "@noizy/types";

interface FilterBarProps {
  filters: FilterGroup[];
  activeFilters: Record<string, string[]>;
  onFilterChange: (filterId: string, values: string[]) => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  className?: string;
}

export function FilterBar({
  filters,
  activeFilters,
  onFilterChange,
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  className,
}: FilterBarProps) {
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

  const toggleFilter = (filterId: string, value: string, multiple?: boolean) => {
    const current = activeFilters[filterId] || [];
    if (multiple) {
      const newValues = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      onFilterChange(filterId, newValues);
    } else {
      onFilterChange(filterId, current.includes(value) ? [] : [value]);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search */}
      {onSearchChange && (
        <div className="relative">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pl-11 text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      )}

      {/* Filter Groups */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <div key={filter.id} className="relative">
            <button
              onClick={() =>
                setExpandedFilter(expandedFilter === filter.id ? null : filter.id)
              }
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
                (activeFilters[filter.id]?.length ?? 0) > 0
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-transparent border-white/10 text-white/60 hover:border-white/20"
              )}
            >
              <span className="text-sm">{filter.label}</span>
              {(activeFilters[filter.id]?.length ?? 0) > 0 && (
                <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">
                  {activeFilters[filter.id]?.length}
                </span>
              )}
              <svg
                className={cn(
                  "w-4 h-4 transition-transform",
                  expandedFilter === filter.id && "rotate-180"
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <AnimatePresence>
              {expandedFilter === filter.id && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 mt-2 z-50 min-w-[200px] bg-abyss-light border border-white/10 rounded-lg p-2 shadow-xl"
                >
                  {filter.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        toggleFilter(filter.id, option.value, filter.multiple)
                      }
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                        activeFilters[filter.id]?.includes(option.value)
                          ? "bg-white/10 text-white"
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <span>{option.label}</span>
                      {option.count !== undefined && (
                        <span className="text-white/30">{option.count}</span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
