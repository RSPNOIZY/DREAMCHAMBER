"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function TrustPage() {
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
          <p className="text-voice-400/60 text-xs uppercase tracking-[0.3em] mb-6">
            Trust Framework
          </p>
          <h1 className="text-4xl md:text-6xl text-white mb-8 leading-tight">
            Voice is identity.
            <br />
            Trust is infrastructure.
          </h1>
          <p className="text-white/50 text-xl max-w-2xl mx-auto leading-relaxed">
            NOIZYVOX is not a promise of protection. It is architecture designed
            to make consent verifiable, permissions traceable, and rights
            enforceable.
          </p>
        </motion.header>

        {/* Why This Matters */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-24"
        >
          <h2 className="text-voice-400/60 text-xs uppercase tracking-[0.2em] mb-6">
            Why This Matters
          </h2>
          <div className="space-y-6 text-white/60 leading-relaxed">
            <p>
              Synthetic voice technology has reached a point where anyone can
              clone a voice with minimal samples. The question is no longer
              whether your voice can be replicated—it's whether you have any
              control over how that replica is used.
            </p>
            <p>
              NOIZYVOX exists because creators need infrastructure, not just
              intentions. We're building the systems that make consent
              structural—embedded in the technology itself, not bolted on as
              policy.
            </p>
          </div>
        </motion.section>

        {/* Trust Pillars */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-24"
        >
          <h2 className="text-voice-400/60 text-xs uppercase tracking-[0.2em] mb-8">
            Trust Pillars
          </h2>

          <div className="space-y-6">
            {[
              {
                title: "Explicit Consent",
                description:
                  "Every permission is captured explicitly during enrollment. No hidden clauses. No retroactive changes. What you agree to is documented in cryptographically verifiable form.",
              },
              {
                title: "Granular Control",
                description:
                  "Permissions are not binary. You can allow narration but exclude advertising. Allow one territory but not another. Allow time-limited use but retain the right to revoke.",
              },
              {
                title: "Instant Revocation",
                description:
                  "Revocation is not a request—it's a technical operation. When you revoke permission, the system enforces it immediately. No waiting periods. No negotiations.",
              },
              {
                title: "Audit Trail",
                description:
                  "Every permission grant, modification, and use is logged in a hash-chained audit system. The history cannot be modified. Disputes have evidence.",
              },
              {
                title: "Provenance Verification",
                description:
                  "C2PA content credentials provide cryptographic proof of origin. When a voice is used legitimately, that legitimacy is verifiable.",
              },
            ].map((pillar, index) => (
              <div key={pillar.title} className="card-glass p-8">
                <div className="flex items-start gap-6">
                  <span className="text-voice-400 font-mono text-sm">
                    0{index + 1}
                  </span>
                  <div>
                    <h3 className="text-xl text-white mb-3">{pillar.title}</h3>
                    <p className="text-white/50 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Rights Explanation */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-24"
        >
          <h2 className="text-voice-400/60 text-xs uppercase tracking-[0.2em] mb-6">
            Your Rights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                right: "Right to Know",
                explanation: "You have complete visibility into how your voice is being used.",
              },
              {
                right: "Right to Control",
                explanation: "You decide what uses are permitted, under what terms, for how long.",
              },
              {
                right: "Right to Revoke",
                explanation: "You can withdraw permission at any time, and the system enforces it.",
              },
              {
                right: "Right to Evidence",
                explanation: "Every consent decision is documented in tamper-evident form.",
              },
            ].map((item) => (
              <div key={item.right} className="card-glass p-6">
                <h3 className="text-voice-300 font-medium mb-2">{item.right}</h3>
                <p className="text-white/50 text-sm">{item.explanation}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Provenance Ready */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-24"
        >
          <h2 className="text-voice-400/60 text-xs uppercase tracking-[0.2em] mb-6">
            Provenance-Ready Architecture
          </h2>
          <div className="card-glass p-8">
            <p className="text-white/60 leading-relaxed mb-6">
              NOIZYVOX is built on NOIZY infrastructure—systems designed from
              the ground up for verifiable consent and cryptographic provenance.
              As NOIZY expands its governance capabilities, NOIZYVOX will
              inherit them:
            </p>
            <ul className="space-y-3 text-white/50">
              <li className="flex gap-3">
                <span className="text-voice-400">→</span>
                <span>C2PA content credentials for voice assets</span>
              </li>
              <li className="flex gap-3">
                <span className="text-voice-400">→</span>
                <span>Hash-chained consent receipts</span>
              </li>
              <li className="flex gap-3">
                <span className="text-voice-400">→</span>
                <span>Future ZK-proof integration for privacy-preserving verification</span>
              </li>
              <li className="flex gap-3">
                <span className="text-voice-400">→</span>
                <span>Append-only audit logs on immutable infrastructure</span>
              </li>
            </ul>
          </div>
        </motion.section>

        {/* What We Don't Claim */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-24"
        >
          <h2 className="text-voice-400/60 text-xs uppercase tracking-[0.2em] mb-6">
            Transparency
          </h2>
          <div className="card-glass p-8 border-amber-500/20">
            <h3 className="text-white font-medium mb-4">What We Don't Claim</h3>
            <ul className="space-y-3 text-white/50 text-sm">
              <li className="flex gap-3">
                <span className="text-amber-400">•</span>
                <span>
                  We cannot prevent all unauthorized voice use. We can make
                  authorized use verifiable and unauthorized use detectable.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-400">•</span>
                <span>
                  Legal enforcement varies by jurisdiction. Our infrastructure
                  provides evidence, not legal guarantees.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-400">•</span>
                <span>
                  Some capabilities are provenance-ready but not yet fully
                  deployed. We are building in public.
                </span>
              </li>
            </ul>
          </div>
        </motion.section>

        {/* Creator Sovereignty */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <blockquote className="mb-12">
            <p className="text-2xl md:text-3xl text-white/90 italic leading-relaxed">
              "Creators are not disposable source material. Voice is not a
              commodity to be extracted. The AI era requires infrastructure that
              puts humans first—not as a marketing message, but as architecture."
            </p>
          </blockquote>

          <Link href="/onboarding" className="btn-voice inline-flex items-center gap-2">
            <span>Begin Enrollment</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.section>
      </div>
    </div>
  );
}
