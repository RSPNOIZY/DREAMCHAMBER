"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  getArchiveItem,
  getRelatedItems,
  formatDepthZone,
  formatDuration,
} from "@/lib/data";

interface PageProps {
  params: { slug: string };
}

export default function ArchiveDetailPage({ params }: PageProps) {
  const item = getArchiveItem(params.slug);

  if (!item) {
    notFound();
  }

  const relatedItems = getRelatedItems(params.slug, 3);

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link href="/archive" className="text-white/40 hover:text-ocean-300 transition-colors">
                Archive
              </Link>
            </li>
            <li className="text-white/20">/</li>
            <li className="text-white/60">{item.title}</li>
          </ol>
        </motion.nav>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-ocean-400/60 text-xs uppercase tracking-wider">
              {item.year}
            </span>
            <span className="text-white/20">·</span>
            <span className="text-white/40 text-xs capitalize">{item.category}</span>
            <span className="text-white/20">·</span>
            <span className="text-white/40 text-xs">{formatDepthZone(item.depth)}</span>
            <span
              className={`ml-2 px-2 py-0.5 rounded text-xs ${
                item.provenanceStatus === "verified"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              }`}
            >
              {item.provenanceStatus === "verified" ? "Provenance Verified" : "Pending Verification"}
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-6">
            {item.title}
          </h1>

          <p className="text-white/50 text-lg md:text-xl max-w-3xl leading-relaxed">
            {item.synopsis}
          </p>
        </motion.header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Left Column - Player & Description */}
          <div className="lg:col-span-2 space-y-12">
            {/* Audio Player */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="card-glass p-8"
            >
              {/* Waveform */}
              <div className="h-32 mb-6 flex items-end justify-center gap-[2px]">
                {item.featuredMedia.waveformData?.map((val, i) => (
                  <motion.div
                    key={i}
                    className="w-[4px] bg-ocean-500/50 rounded-full hover:bg-ocean-400 transition-colors cursor-pointer"
                    style={{ height: `${val * 100}%` }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.5, delay: i * 0.005 }}
                  />
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="w-12 h-12 rounded-full bg-ocean-500 hover:bg-ocean-400 flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                  <div>
                    <p className="text-white/60 text-sm">Duration</p>
                    <p className="text-white font-mono">
                      {formatDuration(item.duration || 0)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="p-2 text-white/40 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  <button className="p-2 text-white/40 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Legacy Significance */}
            {item.legacySignificance && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h2 className="text-ocean-400/60 text-xs uppercase tracking-[0.2em] mb-4">
                  Legacy Significance
                </h2>
                <p className="text-white/70 leading-relaxed">
                  {item.legacySignificance}
                </p>
              </motion.section>
            )}

            {/* Restoration Notes */}
            {item.restorationNotes && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <h2 className="text-ocean-400/60 text-xs uppercase tracking-[0.2em] mb-4">
                  Restoration Notes
                </h2>
                <p className="text-white/50 leading-relaxed text-sm">
                  {item.restorationNotes}
                </p>
              </motion.section>
            )}

            {/* Credits */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h2 className="text-ocean-400/60 text-xs uppercase tracking-[0.2em] mb-4">
                Credits
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {item.credits.map((credit, index) => (
                  <div key={index} className="card-glass p-4">
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                      {credit.role}
                    </p>
                    <p className="text-white/80">{credit.name}</p>
                    {credit.organization && (
                      <p className="text-white/40 text-sm">{credit.organization}</p>
                    )}
                  </div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* Right Column - Metadata */}
          <div className="space-y-8">
            {/* Metadata Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="card-glass p-6 space-y-6"
            >
              <h2 className="text-white/60 text-sm font-medium border-b border-white/[0.06] pb-3">
                Recording Data
              </h2>

              <div className="space-y-4">
                {item.location && (
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                      Location
                    </p>
                    <p className="text-white/80">{item.location.name}</p>
                    <p className="text-white/40 text-sm font-mono">
                      {item.location.lat.toFixed(2)}°, {item.location.lng.toFixed(2)}°
                    </p>
                  </div>
                )}

                {item.depth !== undefined && (
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                      Depth
                    </p>
                    <p className="text-white/80">{item.depth}m</p>
                    <p className="text-white/40 text-sm">{formatDepthZone(item.depth)}</p>
                  </div>
                )}

                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                    Medium
                  </p>
                  <p className="text-white/80">{item.medium}</p>
                </div>

                {item.recordedAt && (
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                      Recorded
                    </p>
                    <p className="text-white/80">
                      {new Date(item.recordedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Provenance Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="card-glass p-6 space-y-6"
            >
              <h2 className="text-white/60 text-sm font-medium border-b border-white/[0.06] pb-3">
                Provenance
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                    Status
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.provenanceStatus === "verified"
                          ? "bg-emerald-400"
                          : "bg-amber-400"
                      }`}
                    />
                    <span className="text-white/80 capitalize">
                      {item.provenanceStatus}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                    Rights
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs ${
                      item.rightsStatus === "cleared"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : item.rightsStatus === "public-domain"
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {item.rightsStatus.replace("-", " ")}
                  </span>
                </div>

                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                    Archive ID
                  </p>
                  <p className="text-white/60 font-mono text-sm">{item.id}</p>
                </div>
              </div>
            </motion.div>

            {/* Tags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <p className="text-white/40 text-xs uppercase tracking-wider mb-3">
                Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/archive?search=${tag}`}
                    className="px-3 py-1 bg-white/[0.03] border border-white/[0.06] rounded text-white/50 text-sm hover:border-ocean-500/30 hover:text-ocean-300 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Collaborators */}
            {item.collaborators.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <p className="text-white/40 text-xs uppercase tracking-wider mb-3">
                  Collaborators
                </p>
                <div className="space-y-2">
                  {item.collaborators.map((collab, index) => (
                    <div key={index} className="text-sm">
                      <p className="text-white/70">{collab.name}</p>
                      <p className="text-white/40">{collab.role}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Related Works */}
        {relatedItems.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-24 pt-16 border-t border-white/[0.04]"
          >
            <h2 className="text-ocean-400/60 text-xs uppercase tracking-[0.2em] mb-8">
              Related Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedItems.map((related) => (
                <Link
                  key={related.id}
                  href={`/archive/${related.slug}`}
                  className="group card-glass p-6 hover:bg-white/[0.05] transition-all duration-500"
                >
                  <p className="text-ocean-400/60 text-xs uppercase tracking-wider mb-2">
                    {related.year} · {formatDepthZone(related.depth)}
                  </p>
                  <h3 className="font-display text-lg text-white mb-2 group-hover:text-ocean-200 transition-colors">
                    {related.title}
                  </h3>
                  <p className="text-white/40 text-sm line-clamp-2">
                    {related.synopsis}
                  </p>
                </Link>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
