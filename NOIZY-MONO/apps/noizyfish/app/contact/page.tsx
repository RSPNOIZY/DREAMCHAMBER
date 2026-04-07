"use client";

import { motion } from "framer-motion";

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <p className="text-ocean-400/60 text-xs uppercase tracking-[0.3em] mb-4">
            Contact
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-white mb-6">
            Get in touch
          </h1>
          <p className="text-white/50 text-lg leading-relaxed">
            Questions about the archive, collaboration inquiries, or contribution
            proposals—we welcome correspondence from researchers, institutions,
            and fellow sound preservationists.
          </p>
        </motion.header>

        {/* Contact Methods */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-glass p-6">
              <h3 className="text-white font-medium mb-2">General Inquiries</h3>
              <p className="text-white/50 text-sm mb-4">
                Questions about the archive, licensing, or collaboration.
              </p>
              <a
                href="mailto:rsp@noizy.ai"
                className="text-ocean-400 hover:text-ocean-300 transition-colors"
              >
                rsp@noizy.ai
              </a>
            </div>

            <div className="card-glass p-6">
              <h3 className="text-white font-medium mb-2">Contributions</h3>
              <p className="text-white/50 text-sm mb-4">
                Have ocean recordings you'd like to contribute to the archive?
              </p>
              <a
                href="mailto:rsp@noizy.ai?subject=Archive Contribution"
                className="text-ocean-400 hover:text-ocean-300 transition-colors"
              >
                Submit a proposal
              </a>
            </div>
          </div>
        </motion.section>

        {/* Contribution Guidelines */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-ocean-400/60 text-xs uppercase tracking-[0.2em] mb-6">
            Contribution Guidelines
          </h2>
          <div className="space-y-6 text-white/60 leading-relaxed">
            <p>
              NOIZYFISH accepts contributions from field recordists, research
              institutions, and conservation organizations. We prioritize
              recordings that meet our provenance standards:
            </p>
            <ul className="space-y-3 pl-4">
              <li className="flex gap-3">
                <span className="text-ocean-400">•</span>
                <span>
                  Clear documentation of capture location, date, equipment, and
                  conditions
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-ocean-400">•</span>
                <span>
                  High-quality audio (minimum 48kHz/24-bit for new recordings)
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-ocean-400">•</span>
                <span>
                  Rights clearance or public domain status
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-ocean-400">•</span>
                <span>
                  Willingness to have provenance verified and published
                </span>
              </li>
            </ul>
            <p>
              Historical recordings with incomplete metadata may still be
              considered if they have significant cultural or scientific value.
            </p>
          </div>
        </motion.section>

        {/* Location */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-ocean-400/60 text-xs uppercase tracking-[0.2em] mb-6">
            Location
          </h2>
          <div className="card-glass p-6">
            <p className="text-white/70 mb-1">NOIZY Labs</p>
            <p className="text-white/50">Ottawa, Canada</p>
          </div>
        </motion.section>

        {/* Response Time */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-white/40 text-sm text-center">
            We aim to respond to all inquiries within 48 hours.
          </p>
        </motion.section>
      </div>
    </div>
  );
}
