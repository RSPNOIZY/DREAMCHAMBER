"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { getReadyVoices } from "@/lib/data";

export default function HomePage() {
  const readyVoices = getReadyVoices().slice(0, 3);

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 sovereign-gradient" />

        {/* Subtle glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-voice-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <p className="text-voice-400/80 text-sm uppercase tracking-[0.3em] mb-8">
              Sovereign Voice Platform
            </p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.2, ease: "easeOut" }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-white tracking-tight leading-[1.1]"
          >
            Your voice.
            <span className="hidden sm:inline"><br /></span>
            <span className="sm:hidden"> </span>
            <span className="text-gradient-voice">Your terms.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
            className="mt-8 text-white/50 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Consent-native infrastructure for voice identity. Every permission
            explicit. Every use tracked. Every creator in control.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/onboarding" className="btn-voice inline-flex items-center gap-3 group">
              <span>Start Enrollment</span>
              <svg
                className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link href="/casting" className="btn-ghost">
              Browse Voices
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
            className="w-px h-16 bg-gradient-to-b from-transparent via-voice-500/50 to-transparent"
          />
        </motion.div>
      </section>

      {/* Voice is Identity */}
      <section className="relative py-20 sm:py-20 sm:py-32 md:py-40">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="text-center mb-20"
          >
            <p className="text-voice-400/60 text-xs uppercase tracking-[0.3em] mb-6">
              Core Truth
            </p>
            <h2 className="text-3xl md:text-5xl text-white leading-tight mb-8">
              Voice is identity.
              <br />
              Identity demands sovereignty.
            </h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed">
              In an era of synthetic voices and AI cloning, the question is no
              longer "can my voice be replicated?" It's "who controls how my
              voice is used?" NOIZYVOX answers that question.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                title: "Explicit Consent",
                description:
                  "Every permission is recorded. No hidden terms. No retroactive changes. You decide what happens with your voice.",
              },
              {
                title: "Instant Revocation",
                description:
                  "Changed your mind? Revoke permissions immediately. No waiting periods. No negotiations. Your voice, your call.",
              },
              {
                title: "Tracked Usage",
                description:
                  "Know exactly where your voice is used. Hash-chained audit logs. Tamper-evident. Verifiable forever.",
              },
            ].map((item, index) => (
              <div
                key={item.title}
                className="card-glass p-8 hover:bg-white/[0.05] transition-all duration-500"
              >
                <p className="text-voice-400 text-xs uppercase tracking-[0.2em] mb-3">
                  0{index + 1}
                </p>
                <h3 className="text-xl text-white mb-3">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* For Creators Section */}
      <section className="relative py-20 sm:py-32 md:py-40 bg-sovereign-dark/30">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <p className="text-voice-400/60 text-xs uppercase tracking-[0.3em] mb-4">
              For Creators
            </p>
            <h2 className="text-3xl md:text-4xl text-white mb-4">
              Control your voice. Build your legacy.
            </h2>
            <p className="text-white/40 text-lg max-w-2xl">
              NOIZYVOX gives voice performers the infrastructure to manage
              their digital identity with the same care they bring to their
              craft.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Enrollment",
                description:
                  "A guided process that captures your voice identity, preferences, and permissions. No surprises. No fine print.",
                link: "/onboarding",
                linkText: "Start Enrollment",
              },
              {
                title: "Consent Center",
                description:
                  "Your command center. View all permissions, modify settings, revoke access. Everything in one place.",
                link: "/consent",
                linkText: "View Demo",
              },
              {
                title: "Usage Tracking",
                description:
                  "See where your voice is being used. Get notified of new requests. Maintain complete visibility.",
                link: "/dashboard",
                linkText: "Dashboard Preview",
              },
              {
                title: "Professional Casting",
                description:
                  "Connect with studios and producers who respect consent. Premium opportunities for consent-ready performers.",
                link: "/casting",
                linkText: "Browse Casting",
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="card-glass p-8"
              >
                <h3 className="text-xl text-white mb-3">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-6">
                  {item.description}
                </p>
                <Link
                  href={item.link}
                  className="text-voice-400 hover:text-voice-300 text-sm inline-flex items-center gap-2 transition-colors"
                >
                  <span>{item.linkText}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Voices */}
      <section className="relative py-20 sm:py-32 md:py-40">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <p className="text-voice-400/60 text-xs uppercase tracking-[0.3em] mb-4">
                Featured Performers
              </p>
              <h2 className="text-3xl md:text-4xl text-white">
                Consent-Ready Voices
              </h2>
            </div>
            <Link
              href="/casting"
              className="hidden md:inline-flex items-center gap-2 text-white/40 hover:text-voice-300 text-sm transition-colors"
            >
              <span>View All</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {readyVoices.map((voice, index) => (
              <motion.div
                key={voice.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link
                  href={`/voices/${voice.slug}`}
                  className="block card-glass p-6 hover:bg-white/[0.05] transition-all duration-500 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-voice-400/20 to-voice-600/20 flex items-center justify-center">
                      <span className="text-voice-400 font-medium text-lg">
                        {voice.performerName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="consent-indicator consent-ready" />
                      <span className="text-emerald-400 text-xs">Ready</span>
                    </div>
                  </div>

                  <h3 className="text-lg text-white mb-1 group-hover:text-voice-200 transition-colors">
                    {voice.performerName}
                  </h3>
                  <p className="text-white/40 text-sm mb-3">
                    {voice.tonalDescriptors.slice(0, 3).join(" · ")}
                  </p>
                  <p className="text-white/30 text-xs line-clamp-2">
                    {voice.voiceSummary}
                  </p>

                  <div className="mt-4 pt-4 border-t border-white/[0.04] flex flex-wrap gap-2">
                    {voice.styleCategories.slice(0, 3).map((style) => (
                      <span
                        key={style}
                        className="px-2 py-0.5 bg-white/[0.03] border border-white/[0.06] rounded text-white/40 text-xs"
                      >
                        {style}
                      </span>
                    ))}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link
              href="/casting"
              className="inline-flex items-center gap-2 text-voice-400 hover:text-voice-300 text-sm transition-colors"
            >
              <span>View All Voices</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="relative py-20 sm:py-32 md:py-40 bg-sovereign-dark/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <p className="text-voice-400/60 text-xs uppercase tracking-[0.3em] mb-6">
              Trust Infrastructure
            </p>
            <h2 className="text-3xl md:text-5xl text-white leading-tight mb-8">
              Built for accountability.
              <br />
              Designed for creators.
            </h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed mb-12">
              NOIZYVOX is built on NOIZY infrastructure—provenance-ready
              systems designed to make consent verifiable and rights enforceable.
              Not promises. Architecture.
            </p>
            <Link href="/trust" className="btn-voice inline-flex items-center gap-2">
              <span>Learn About Our Trust Framework</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 sm:py-32 md:py-40">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-3xl md:text-5xl text-white mb-6">
              Ready to take control?
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto mb-10">
              Join the performers who understand that voice sovereignty is not a
              feature—it's a right.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/onboarding"
                className="btn-voice inline-flex items-center gap-3 text-lg px-8 py-4 group"
              >
                <span>Begin Enrollment</span>
                <svg
                  className="w-5 h-5 transition-transform duration-500 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/casting" className="btn-ghost text-lg px-8 py-4">
                Browse Casting
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
