"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { VOICE_PROFILES } from "@/lib/data";
import type { VoiceStyle } from "@noizy/types";

const STYLE_FILTERS: { value: VoiceStyle | "all"; label: string }[] = [
  { value: "all", label: "All Styles" },
  { value: "narration", label: "Narration" },
  { value: "commercial", label: "Commercial" },
  { value: "character", label: "Character" },
  { value: "documentary", label: "Documentary" },
  { value: "audiobook", label: "Audiobook" },
];

const READINESS_FILTERS = [
  { value: "all", label: "All" },
  { value: "ready", label: "Consent Ready" },
  { value: "pending", label: "Pending" },
];

export default function CastingPage() {
  const [search, setSearch] = useState("");
  const [style, setStyle] = useState<VoiceStyle | "all">("all");
  const [readiness, setReadiness] = useState("all");

  const filteredVoices = useMemo(() => {
    return VOICE_PROFILES.filter((voice) => {
      // Search
      if (search) {
        const query = search.toLowerCase();
        const matches =
          voice.performerName.toLowerCase().includes(query) ||
          voice.voiceSummary.toLowerCase().includes(query) ||
          voice.tonalDescriptors.some((t) => t.toLowerCase().includes(query));
        if (!matches) return false;
      }

      // Style
      if (style !== "all" && !voice.styleCategories.includes(style)) {
        return false;
      }

      // Readiness
      if (readiness === "ready") {
        return voice.consentReadiness === "ready" && voice.licensingReadiness === "ready";
      }

      return true;
    });
  }, [search, style, readiness]);

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
          <p className="text-voice-400/60 text-xs uppercase tracking-[0.3em] mb-4">
            Professional Casting
          </p>
          <h1 className="text-4xl md:text-5xl text-white mb-4">
            Discover Voices
          </h1>
          <p className="text-white/40 text-lg max-w-2xl">
            Consent-ready performers for studios and producers who value ethical
            voice work. Every voice here has documented permissions and clear
            terms.
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
              placeholder="Search by name, tone, or description..."
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 pl-11 text-white placeholder:text-white/30 focus:outline-none focus:border-voice-500/30 transition-colors"
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
          <div className="flex flex-wrap items-center gap-4">
            {/* Style */}
            <div className="flex flex-wrap gap-2">
              {STYLE_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStyle(filter.value)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                    style === filter.value
                      ? "bg-voice-600/30 text-voice-300 border border-voice-500/30"
                      : "bg-white/[0.03] text-white/50 border border-white/[0.06] hover:border-white/10"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-white/10 hidden md:block" />

            {/* Readiness */}
            <div className="flex gap-2">
              {READINESS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setReadiness(filter.value)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                    readiness === filter.value
                      ? "bg-voice-600/30 text-voice-300 border border-voice-500/30"
                      : "bg-white/[0.03] text-white/50 border border-white/[0.06] hover:border-white/10"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <p className="text-white/30 text-sm mb-8">
          {filteredVoices.length} {filteredVoices.length === 1 ? "voice" : "voices"}
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVoices.map((voice, index) => (
            <motion.article
              key={voice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
            >
              <Link
                href={`/voices/${voice.slug}`}
                className="block card-glass p-6 h-full hover:bg-white/[0.05] transition-all duration-500 group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-voice-400/20 to-voice-600/20 flex items-center justify-center">
                    <span className="text-voice-400 font-medium text-xl">
                      {voice.performerName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`consent-indicator ${
                          voice.consentReadiness === "ready"
                            ? "consent-ready"
                            : voice.consentReadiness === "pending"
                            ? "consent-pending"
                            : "consent-unavailable"
                        }`}
                      />
                      <span
                        className={`text-xs ${
                          voice.consentReadiness === "ready"
                            ? "text-emerald-400"
                            : voice.consentReadiness === "pending"
                            ? "text-amber-400"
                            : "text-red-400"
                        }`}
                      >
                        Consent {voice.consentReadiness}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`consent-indicator ${
                          voice.licensingReadiness === "ready"
                            ? "consent-ready"
                            : "consent-pending"
                        }`}
                      />
                      <span
                        className={`text-xs ${
                          voice.licensingReadiness === "ready"
                            ? "text-emerald-400"
                            : "text-amber-400"
                        }`}
                      >
                        Licensing {voice.licensingReadiness}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Name & Tone */}
                <h2 className="text-xl text-white mb-2 group-hover:text-voice-200 transition-colors">
                  {voice.performerName}
                </h2>
                <p className="text-voice-400/60 text-sm mb-3">
                  {voice.tonalDescriptors.join(" · ")}
                </p>

                {/* Summary */}
                <p className="text-white/40 text-sm leading-relaxed line-clamp-3 mb-4">
                  {voice.voiceSummary}
                </p>

                {/* Languages */}
                <div className="mb-4">
                  <p className="text-white/30 text-xs mb-2">Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {voice.languages.map((lang) => (
                      <span
                        key={lang.code}
                        className="px-2 py-0.5 bg-white/[0.03] border border-white/[0.06] rounded text-white/50 text-xs"
                      >
                        {lang.name} ({lang.fluency})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Styles */}
                <div className="pt-4 border-t border-white/[0.04]">
                  <div className="flex flex-wrap gap-2">
                    {voice.styleCategories.map((style) => (
                      <span
                        key={style}
                        className="px-2 py-0.5 bg-voice-500/10 border border-voice-500/20 rounded text-voice-300 text-xs"
                      >
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        {/* Empty State */}
        {filteredVoices.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-white/40 mb-4">No voices match your filters.</p>
            <button
              onClick={() => {
                setSearch("");
                setStyle("all");
                setReadiness("all");
              }}
              className="text-voice-400 hover:text-voice-300 text-sm"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
