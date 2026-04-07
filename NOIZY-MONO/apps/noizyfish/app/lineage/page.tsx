"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function LineagePage() {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20 text-center"
        >
          <p className="text-ocean-400/60 text-xs uppercase tracking-[0.3em] mb-6">
            Provenance
          </p>
          <h1 className="font-display text-4xl md:text-6xl text-white mb-8 leading-tight">
            No sound exists
            <br />
            without lineage
          </h1>
          <p className="text-white/50 text-xl max-w-2xl mx-auto leading-relaxed">
            Every recording carries the weight of its origin. Where it was born.
            Who captured it. How it traveled to reach you. This is lineage—memory
            attached to sound, permanently.
          </p>
        </motion.header>

        {/* Philosophy */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-24"
        >
          <h2 className="text-ocean-400/60 text-xs uppercase tracking-[0.2em] mb-6">
            Philosophy
          </h2>
          <div className="space-y-8 text-white/60 leading-relaxed text-lg">
            <p>
              A whale song without its location is just a sound. A whale song
              from the Vava'u archipelago, recorded at 15 meters depth on August
              14, 2019, during the humpback breeding season—that is evidence. It
              is a document of a specific place, a specific time, a specific
              living being communicating in a way humans cannot fully comprehend.
            </p>
            <p>
              Lineage is the difference between noise and meaning.
            </p>
            <p>
              In the age of synthetic media, lineage becomes even more critical.
              Anyone can generate an audio file that sounds like a whale. But no
              one can forge a cryptographic signature that proves a recording was
              captured with a specific hydrophone, at a specific GPS coordinate,
              and deposited into a hash-chained ledger within seconds of capture.
            </p>
            <p>
              That is what NOIZYFISH provides: not just storage, but proof.
            </p>
          </div>
        </motion.section>

        {/* The Chain */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-24"
        >
          <h2 className="text-ocean-400/60 text-xs uppercase tracking-[0.2em] mb-8">
            The Chain of Custody
          </h2>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-ocean-500/50 via-ocean-500/30 to-transparent" />

            <div className="space-y-12">
              {[
                {
                  step: "01",
                  title: "Origin",
                  description:
                    "The moment of capture. GPS coordinates, depth, equipment specifications, environmental conditions. C2PA credentials are generated and embedded before the recording leaves the field.",
                },
                {
                  step: "02",
                  title: "Ingest",
                  description:
                    "The recording enters the NOIZYFISH archive. Hash verification confirms the file has not been altered since capture. Metadata is extracted and cross-referenced.",
                },
                {
                  step: "03",
                  title: "Ledger",
                  description:
                    "A permanent entry is written to the NOIZY audit ledger—an append-only, hash-chained record that cannot be modified or deleted. The recording's existence is now cryptographically provable.",
                },
                {
                  step: "04",
                  title: "Verification",
                  description:
                    "At any point in the future, anyone can verify a recording's authenticity by checking its C2PA manifest against the ledger. The chain of custody is complete and auditable.",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative pl-16"
                >
                  <div className="absolute left-0 w-12 h-12 rounded-full bg-ocean-500/10 border border-ocean-500/30 flex items-center justify-center">
                    <span className="text-ocean-400 text-sm font-mono">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-display text-xl text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-white/50 leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Technical Foundation */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-24"
        >
          <h2 className="text-ocean-400/60 text-xs uppercase tracking-[0.2em] mb-8">
            Technical Foundation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-glass p-6">
              <div className="w-10 h-10 rounded-lg bg-ocean-500/10 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-ocean-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-white font-medium mb-2">C2PA Credentials</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Content Credentials—the industry standard for provenance—are
                embedded at capture time and verified at every step of the chain.
              </p>
            </div>

            <div className="card-glass p-6">
              <div className="w-10 h-10 rounded-lg bg-ocean-500/10 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-ocean-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-white font-medium mb-2">Hash-Chained Ledger</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Every archive entry is linked to the previous entry by
                cryptographic hash, creating a tamper-evident chain.
              </p>
            </div>

            <div className="card-glass p-6">
              <div className="w-10 h-10 rounded-lg bg-ocean-500/10 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-ocean-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-white font-medium mb-2">Append-Only Storage</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Once a recording enters the archive, it cannot be modified or
                deleted. The history is immutable.
              </p>
            </div>

            <div className="card-glass p-6">
              <div className="w-10 h-10 rounded-lg bg-ocean-500/10 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-ocean-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-white font-medium mb-2">Public Verification</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Anyone can verify a recording's provenance. No special access
                required. Trust through transparency.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Future Alignment */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-24"
        >
          <h2 className="text-ocean-400/60 text-xs uppercase tracking-[0.2em] mb-6">
            Future Alignment
          </h2>
          <div className="card-glass p-8">
            <p className="text-white/60 leading-relaxed mb-6">
              NOIZYFISH is built on provenance-ready architecture designed to
              integrate with emerging standards for content authenticity. As the
              NOIZY ecosystem expands its governance infrastructure—including
              zero-knowledge proofs for privacy-preserving verification—the
              archive will inherit these capabilities.
            </p>
            <p className="text-white/50 leading-relaxed">
              Our goal is not just to preserve sounds for today, but to ensure
              they remain verifiable for the next hundred years and beyond.
            </p>
          </div>
        </motion.section>

        {/* Closing */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <blockquote className="mb-12">
            <p className="font-display text-2xl md:text-3xl text-white/90 italic leading-relaxed">
              "Memory must remain attached to origin. Archives are evidence of
              human signal. To preserve sound without lineage is to preserve
              nothing at all."
            </p>
          </blockquote>

          <Link href="/archive" className="btn-ocean inline-flex items-center gap-2">
            <span>Explore Verified Recordings</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.section>
      </div>
    </div>
  );
}
