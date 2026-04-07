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
          <p className="text-voice-400/60 text-xs uppercase tracking-[0.3em] mb-4">
            About
          </p>
          <h1 className="text-4xl md:text-5xl text-white mb-8">
            Why NOIZYVOX exists
          </h1>
          <p className="text-white/50 text-xl leading-relaxed">
            Voice technology has outpaced voice rights. NOIZYVOX is the
            infrastructure that lets creators catch up.
          </p>
        </motion.header>

        {/* Problem */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <h2 className="text-voice-400/60 text-xs uppercase tracking-[0.2em] mb-6">
            The Problem
          </h2>
          <div className="space-y-6 text-white/60 leading-relaxed">
            <p>
              Synthetic voice technology has made it trivially easy to clone
              anyone's voice with minimal samples. What took days now takes
              minutes. What required studios now requires a laptop.
            </p>
            <p>
              For voice performers—actors, narrators, voice-over artists—this is
              not just a technological shift. It's an existential question:
              When anyone can synthesize your voice, what happens to your
              livelihood? When your voice can be used without your knowledge,
              what happens to your identity?
            </p>
            <p>
              The current landscape offers two inadequate options: refuse to
              engage with AI entirely (impossible in practice), or sign broad
              licensing agreements that give up control in exchange for access
              (exploitative by design).
            </p>
          </div>
        </motion.section>

        {/* Our Approach */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <h2 className="text-voice-400/60 text-xs uppercase tracking-[0.2em] mb-6">
            Our Approach
          </h2>
          <div className="space-y-6 text-white/60 leading-relaxed">
            <p>
              NOIZYVOX is built on a simple premise: consent should be
              structural, not contractual. Permissions should be embedded in the
              technology, not bolted on as policy.
            </p>
            <p>
              We're building infrastructure where:
            </p>
            <ul className="space-y-3 pl-4">
              <li className="flex gap-3">
                <span className="text-voice-400">•</span>
                <span>Every permission is explicit, recorded, and verifiable</span>
              </li>
              <li className="flex gap-3">
                <span className="text-voice-400">•</span>
                <span>Creators can modify or revoke permissions at any time</span>
              </li>
              <li className="flex gap-3">
                <span className="text-voice-400">•</span>
                <span>Every use is tracked in tamper-evident audit logs</span>
              </li>
              <li className="flex gap-3">
                <span className="text-voice-400">•</span>
                <span>Legitimate use is provably legitimate</span>
              </li>
            </ul>
            <p>
              This isn't about blocking AI. It's about ensuring that AI-powered
              voice work happens on terms that respect the humans whose voices
              make it possible.
            </p>
          </div>
        </motion.section>

        {/* Part of NOIZY */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <h2 className="text-voice-400/60 text-xs uppercase tracking-[0.2em] mb-6">
            Part of NOIZY
          </h2>
          <div className="card-glass p-8">
            <p className="text-white/60 leading-relaxed mb-6">
              NOIZYVOX is built on NOIZY infrastructure—a consent-native
              ecosystem for creative work in the AI era. NOIZY provides the
              governance layer: hash-chained audit logs, consent verification,
              and provenance tracking.
            </p>
            <p className="text-white/50 leading-relaxed">
              By building on NOIZY, NOIZYVOX inherits capabilities as they're
              developed: C2PA content credentials, zero-knowledge proofs,
              revocation enforcement, and more. The infrastructure grows; your
              voice protection grows with it.
            </p>
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
          <h2 className="text-voice-400/60 text-xs uppercase tracking-[0.2em] mb-6">
            The Founder
          </h2>
          <div className="card-glass p-8">
            <p className="text-white/70 leading-relaxed mb-6">
              NOIZYVOX was created by Robert Stephen Plowman—also the founder of
              NOIZY and the first enrolled performer in the NOIZYVOX consent
              system. He built this platform from the creator's position because
              that's the position he occupies.
            </p>
            <p className="text-white/50 leading-relaxed">
              "I designed NOIZYVOX because I needed it to exist. Every creator
              facing the AI era needs infrastructure that treats their work as
              valuable and their consent as non-negotiable. I couldn't find
              that infrastructure, so I built it."
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
          <h2 className="text-2xl md:text-3xl text-white mb-6">
            Ready to take control?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/onboarding" className="btn-voice inline-flex items-center gap-2">
              <span>Begin Enrollment</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link href="/trust" className="btn-ghost">
              Learn About Trust
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
