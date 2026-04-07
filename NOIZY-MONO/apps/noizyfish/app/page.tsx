"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ARCHIVE_ITEMS, formatDepthZone, formatDuration } from "@/lib/data";

export default function HomePage() {
  const featuredWorks = ARCHIVE_ITEMS.slice(0, 3);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 ocean-gradient" />

        {/* Depth lines */}
        <div className="absolute inset-0 flex flex-col justify-between py-32 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-px w-full bg-gradient-to-r from-transparent via-ocean-600/10 to-transparent"
              style={{ opacity: 0.3 + i * 0.1 }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <p className="text-ocean-400/80 text-sm uppercase tracking-[0.3em] mb-8">
              A Living Archive
            </p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.2, ease: "easeOut" }}
            className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-white tracking-tight leading-[1.1]"
          >
            The ocean remembers
            <span className="hidden sm:inline"><br /></span>
            <span className="sm:hidden"> </span>
            <span className="text-gradient-ocean">what we forget</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
            className="mt-8 text-white/50 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Museum-grade recordings from the sunlit shallows to the midnight
            depths. Each sound carries its origin. Each origin carries its
            lineage. Preserved for generations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/archive" className="btn-ocean inline-flex items-center gap-3 group">
              <span>Enter the Archive</span>
              <svg
                className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link href="/lineage" className="btn-ghost">
              Understand Lineage
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-16 bg-gradient-to-b from-transparent via-ocean-500/50 to-transparent"
          />
        </motion.div>
      </section>

      {/* Featured Works Section */}
      <section className="relative py-20 sm:py-32 md:py-40">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <p className="text-ocean-400/60 text-xs uppercase tracking-[0.3em] mb-4">
              Curated Selection
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-white">
              Featured Works
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {featuredWorks.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: index * 0.15 }}
              >
                <Link
                  href={`/archive/${item.slug}`}
                  className="group block card-glass p-6 h-full hover:bg-white/[0.05] transition-all duration-700"
                >
                  {/* Waveform placeholder */}
                  <div className="h-24 mb-6 flex items-end justify-center gap-[2px] overflow-hidden">
                    {item.featuredMedia.waveformData?.slice(0, 60).map((val, i) => (
                      <motion.div
                        key={i}
                        className="w-[3px] bg-ocean-500/40 rounded-full group-hover:bg-ocean-400/60 transition-colors duration-500"
                        style={{ height: `${val * 100}%` }}
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.01 }}
                      />
                    ))}
                  </div>

                  <p className="text-ocean-400/60 text-xs uppercase tracking-wider mb-2">
                    {item.year} · {formatDepthZone(item.depth)}
                  </p>
                  <h3 className="font-display text-xl text-white mb-3 group-hover:text-ocean-200 transition-colors duration-500">
                    {item.title}
                  </h3>
                  <p className="text-white/40 text-sm leading-relaxed line-clamp-3">
                    {item.synopsis}
                  </p>

                  <div className="mt-6 pt-4 border-t border-white/[0.04] flex items-center justify-between">
                    <span className="text-white/30 text-xs">
                      {formatDuration(item.duration || 0)}
                    </span>
                    <span className="text-ocean-400/60 text-xs group-hover:text-ocean-300 transition-colors">
                      View Recording →
                    </span>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-12 text-center"
          >
            <Link
              href="/archive"
              className="inline-flex items-center gap-2 text-white/40 hover:text-ocean-300 text-sm transition-colors duration-500"
            >
              <span>View Full Archive</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Lineage Section */}
      <section className="relative py-20 sm:py-32 md:py-40 bg-abyss-dark/30">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="text-center"
          >
            <p className="text-ocean-400/60 text-xs uppercase tracking-[0.3em] mb-6">
              Provenance
            </p>
            <h2 className="font-display text-3xl md:text-5xl text-white leading-tight mb-8">
              No sound exists
              <br />
              without lineage
            </h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed">
              Every recording in this archive carries cryptographic proof of its
              origin. Where it was captured. When. By whom. This is not
              metadata—it is memory made verifiable. Lineage attached to sound,
              permanently.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.04] rounded-2xl overflow-hidden"
          >
            {[
              {
                label: "Origin",
                description: "Location, depth, equipment, conditions—captured at source.",
              },
              {
                label: "Chain",
                description: "Every transfer, every edit, every hand it passes through.",
              },
              {
                label: "Proof",
                description: "C2PA signatures. NOIZY governance. Verifiable forever.",
              },
            ].map((item, index) => (
              <div
                key={item.label}
                className="bg-abyss-dark/50 p-8 md:p-10"
              >
                <p className="text-ocean-400 text-xs uppercase tracking-[0.2em] mb-3">
                  0{index + 1}
                </p>
                <h3 className="font-display text-xl text-white mb-3">
                  {item.label}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-12 text-center"
          >
            <Link
              href="/lineage"
              className="inline-flex items-center gap-2 text-ocean-400/80 hover:text-ocean-300 text-sm transition-colors duration-500"
            >
              <span>Learn about lineage</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Archive as Memory Section */}
      <section className="relative py-20 sm:py-32 md:py-40">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.blockquote
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2 }}
          >
            <p className="font-display text-2xl md:text-4xl text-white/90 leading-relaxed italic">
              "An archive is not a warehouse of the past. It is a responsibility
              to the future. Every sound we preserve is a promise that those who
              come after us will inherit more than silence."
            </p>
            <footer className="mt-8 text-white/40 text-sm">
              — Robert Stephen Plowman, Founder
            </footer>
          </motion.blockquote>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 sm:py-32 md:py-40 bg-gradient-to-b from-abyss to-ocean-950/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
          >
            <h2 className="font-display text-3xl md:text-5xl text-white mb-6">
              Enter the vault
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto mb-10">
              From whale songs in the Pacific to ice shelf calving in
              Antarctica. Sounds you may never hear in person. Preserved so you
              can hear them forever.
            </p>
            <Link
              href="/archive"
              className="btn-ocean inline-flex items-center gap-3 text-lg px-8 py-4 group"
            >
              <span>Browse the Archive</span>
              <svg
                className="w-5 h-5 transition-transform duration-500 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
