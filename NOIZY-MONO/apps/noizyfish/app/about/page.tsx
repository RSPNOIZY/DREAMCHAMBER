"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <p className="text-ocean-400/60 text-xs uppercase tracking-[0.3em] mb-4">
            About
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-white mb-8">
            Why we preserve
          </h1>
          <p className="text-white/50 text-xl leading-relaxed">
            The ocean is the largest acoustic environment on Earth. It speaks in
            frequencies humans rarely hear, in languages we are only beginning
            to understand. NOIZYFISH exists to ensure those voices are not lost.
          </p>
        </motion.header>

        {/* Mission */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <h2 className="text-ocean-400/60 text-xs uppercase tracking-[0.2em] mb-6">
            Our Mission
          </h2>
          <div className="space-y-6 text-white/60 leading-relaxed">
            <p>
              NOIZYFISH is a museum-grade archive of oceanic recordings.
              We collect, preserve, and verify sounds from across the world's
              oceans—from the sunlit surface to the hadal depths.
            </p>
            <p>
              Every recording in our collection carries cryptographic proof of
              its origin. Where it was captured. When. By whom. With what
              equipment. Under what conditions. This is not metadata tacked on
              after the fact—it is provenance embedded at the moment of
              creation, verified through C2PA content credentials and NOIZY
              governance infrastructure.
            </p>
            <p>
              We believe that sounds, like any cultural artifact, deserve to be
              preserved with their full history intact. An ocean recording
              without its lineage is just noise. An ocean recording with its
              lineage is evidence—of a place, a time, a living system, a moment
              in the ongoing story of our planet.
            </p>
          </div>
        </motion.section>

        {/* What We Archive */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <h2 className="text-ocean-400/60 text-xs uppercase tracking-[0.2em] mb-6">
            What We Archive
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Bioacoustic Recordings",
                description:
                  "Whale songs, dolphin communication, coral reef symphonies, the clicking of shrimp colonies—the sounds of marine life.",
              },
              {
                title: "Ambient Soundscapes",
                description:
                  "The texture of different ocean zones. The silence of the abyss. The constant background of a living reef.",
              },
              {
                title: "Weather Events",
                description:
                  "Storms passing overhead, ice calving from Antarctic shelves, the acoustic signature of climate change.",
              },
              {
                title: "Historical Recordings",
                description:
                  "Digitized and restored recordings from research expeditions, many capturing sounds that may no longer exist.",
              },
            ].map((item, index) => (
              <div key={index} className="card-glass p-6">
                <h3 className="font-display text-lg text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Why Provenance */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <h2 className="text-ocean-400/60 text-xs uppercase tracking-[0.2em] mb-6">
            Why Provenance Matters
          </h2>
          <div className="space-y-6 text-white/60 leading-relaxed">
            <p>
              In an age of synthetic media and generative AI, the question
              "Is this real?" has become urgent. For ocean recordings,
              provenance answers that question definitively.
            </p>
            <p>
              A verified recording from the Ross Ice Shelf in 2022 is not just
              audio—it is a timestamped document of the Antarctic soundscape at
              a specific moment in climate history. Researchers in 2050 will be
              able to compare it against future recordings with confidence that
              both are authentic.
            </p>
            <p>
              This is why we embed C2PA credentials at capture time, link all
              recordings to NOIZY's governance infrastructure, and maintain
              hash-chained audit logs that cannot be modified after the fact.
              The archive is not just storage—it is evidence.
            </p>
          </div>
          <div className="mt-8">
            <Link
              href="/lineage"
              className="inline-flex items-center gap-2 text-ocean-400 hover:text-ocean-300 text-sm transition-colors"
            >
              <span>Learn more about lineage</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </motion.section>

        {/* The Founder */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <h2 className="text-ocean-400/60 text-xs uppercase tracking-[0.2em] mb-6">
            The Founder
          </h2>
          <div className="card-glass p-8">
            <p className="text-white/70 leading-relaxed mb-6">
              NOIZYFISH was created by Robert Stephen Plowman as part of the
              NOIZY ecosystem—a consent-native infrastructure for preserving
              and protecting creative works.
            </p>
            <p className="text-white/50 leading-relaxed">
              "I built NOIZYFISH because I believe that the sounds of our oceans
              are cultural heritage, not just scientific data. They deserve the
              same care we give to museum artifacts—careful preservation,
              documented provenance, and responsible access. Future generations
              should inherit more than silence."
            </p>
            <p className="text-white/40 text-sm mt-6">
              — Robert Stephen Plowman, 2026
            </p>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="font-display text-2xl md:text-3xl text-white mb-6">
            Ready to listen?
          </h2>
          <Link href="/archive" className="btn-ocean inline-flex items-center gap-2">
            <span>Enter the Archive</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.section>
      </div>
    </div>
  );
}
