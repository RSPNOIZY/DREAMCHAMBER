"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ARCHIVE_ITEMS, formatDepthZone, formatDuration } from "@/lib/data";
import type { ArchiveCategory } from "@noizy/types";

const CATEGORIES: { value: ArchiveCategory | "all"; label: string }[] = [
  { value: "all", label: "All Works" },
  { value: "bioacoustic", label: "Bioacoustic" },
  { value: "ambient", label: "Ambient" },
  { value: "weather", label: "Weather" },
  { value: "field-recording", label: "Field Recording" },
];

const ZONES = [
  { value: "all", label: "All Depths" },
  { value: "sunlight", label: "Sunlight (0-200m)" },
  { value: "twilight", label: "Twilight (200-1000m)" },
  { value: "midnight", label: "Midnight (1000-4000m)" },
  { value: "abyssal", label: "Abyssal (4000m+)" },
];

export default function ArchivePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ArchiveCategory | "all">("all");
  const [zone, setZone] = useState("all");
  const [sortBy, setSortBy] = useState<"year" | "depth" | "title">("year");

  const filteredItems = useMemo(() => {
    let items = [...ARCHIVE_ITEMS];

    // Search
    if (search) {
      const query = search.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.synopsis.toLowerCase().includes(query) ||
          item.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Category
    if (category !== "all") {
      items = items.filter((item) => item.category === category);
    }

    // Zone
    if (zone !== "all") {
      items = items.filter((item) => {
        const depth = item.depth || 0;
        switch (zone) {
          case "sunlight":
            return depth < 200;
          case "twilight":
            return depth >= 200 && depth < 1000;
          case "midnight":
            return depth >= 1000 && depth < 4000;
          case "abyssal":
            return depth >= 4000;
          default:
            return true;
        }
      });
    }

    // Sort
    items.sort((a, b) => {
      switch (sortBy) {
        case "year":
          return b.year - a.year;
        case "depth":
          return (b.depth || 0) - (a.depth || 0);
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return items;
  }, [search, category, zone, sortBy]);

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <p className="text-ocean-400/60 text-xs uppercase tracking-[0.3em] mb-4">
            The Collection
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-white mb-4">
            Archive
          </h1>
          <p className="text-white/40 text-lg max-w-2xl">
            {ARCHIVE_ITEMS.length} recordings from {Math.min(...ARCHIVE_ITEMS.map((i) => i.year))} to{" "}
            {Math.max(...ARCHIVE_ITEMS.map((i) => i.year))}. Each with verified
            provenance.
          </p>
        </motion.header>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-12 space-y-6"
        >
          {/* Search */}
          <div className="relative max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, tag, or keyword..."
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 pl-11 text-white placeholder:text-white/30 focus:outline-none focus:border-ocean-500/30 transition-colors"
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

          {/* Filter Row */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4">
            {/* Category - horizontal scroll on mobile */}
            <div className="w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 -mx-6 px-6 sm:mx-0 sm:px-0">
              <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all duration-300 ${
                      category === cat.value
                        ? "bg-ocean-600/30 text-ocean-300 border border-ocean-500/30"
                        : "bg-white/[0.03] text-white/50 border border-white/[0.06] hover:border-white/10"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-6 w-px bg-white/10 hidden md:block" />

            {/* Zone & Sort - side by side on mobile */}
            <div className="flex gap-3 w-full sm:w-auto">
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="flex-1 sm:flex-initial bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 sm:px-4 py-2 text-sm text-white/70 focus:outline-none focus:border-ocean-500/30 cursor-pointer"
              >
                {ZONES.map((z) => (
                  <option key={z.value} value={z.value} className="bg-abyss">
                    {z.label}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="flex-1 sm:flex-initial bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 sm:px-4 py-2 text-sm text-white/70 focus:outline-none focus:border-ocean-500/30 cursor-pointer"
              >
                <option value="year" className="bg-abyss">
                  Newest
                </option>
                <option value="depth" className="bg-abyss">
                  Deepest
                </option>
                <option value="title" className="bg-abyss">
                  A-Z
                </option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-white/30 text-sm mb-8"
        >
          {filteredItems.length} {filteredItems.length === 1 ? "recording" : "recordings"}
        </motion.p>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
            >
              <Link
                href={`/archive/${item.slug}`}
                className="group block card-glass p-6 md:p-8 h-full hover:bg-white/[0.05] transition-all duration-700"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  {/* Waveform */}
                  <div className="flex-shrink-0 w-full md:w-40 h-20 flex items-end justify-center gap-[2px]">
                    {item.featuredMedia.waveformData?.slice(0, 40).map((val, i) => (
                      <div
                        key={i}
                        className="w-[3px] bg-ocean-500/30 rounded-full group-hover:bg-ocean-400/50 transition-colors duration-500"
                        style={{ height: `${val * 100}%` }}
                      />
                    ))}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-ocean-400/60 text-xs uppercase tracking-wider">
                        {item.year}
                      </span>
                      <span className="text-white/20">·</span>
                      <span className="text-white/40 text-xs">
                        {formatDepthZone(item.depth)}
                      </span>
                      <span className="text-white/20">·</span>
                      <span className="text-white/40 text-xs capitalize">
                        {item.category}
                      </span>
                    </div>

                    <h2 className="font-display text-xl text-white mb-2 group-hover:text-ocean-200 transition-colors duration-500">
                      {item.title}
                    </h2>

                    <p className="text-white/40 text-sm leading-relaxed line-clamp-2 mb-4">
                      {item.synopsis}
                    </p>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-white/30">
                        {formatDuration(item.duration || 0)}
                      </span>
                      {item.location && (
                        <span className="text-white/30">{item.location.name}</span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          item.provenanceStatus === "verified"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {item.provenanceStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-white/40 mb-4">No recordings match your filters.</p>
            <button
              onClick={() => {
                setSearch("");
                setCategory("all");
                setZone("all");
              }}
              className="text-ocean-400 hover:text-ocean-300 text-sm"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
