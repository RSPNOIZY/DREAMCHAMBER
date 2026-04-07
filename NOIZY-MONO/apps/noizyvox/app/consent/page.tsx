"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { DEFAULT_CONSENT_STATE } from "@/lib/data";
import type { ConsentState, CommercialCategory } from "@noizy/types";

const COMMERCIAL_CATEGORIES: { value: CommercialCategory; label: string }[] = [
  { value: "advertising", label: "Advertising" },
  { value: "film", label: "Film" },
  { value: "television", label: "Television" },
  { value: "gaming", label: "Gaming" },
  { value: "audiobook", label: "Audiobook" },
  { value: "podcast", label: "Podcast" },
  { value: "corporate", label: "Corporate" },
  { value: "education", label: "Education" },
  { value: "non-profit", label: "Non-Profit" },
];

export default function ConsentCenterPage() {
  // Mock state - in production, this would come from backend
  const [consentState, setConsentState] = useState<ConsentState>({
    ...DEFAULT_CONSENT_STATE,
    recordingConsent: { granted: true, grantedAt: "2026-01-15T00:00:00Z" },
    modelTrainingConsent: { granted: true, grantedAt: "2026-01-15T00:00:00Z" },
    commercialUsage: {
      allowed: true,
      categories: ["audiobook", "podcast", "documentary", "education"] as CommercialCategory[],
      excludedCategories: ["advertising"] as CommercialCategory[],
    },
    revocationStatus: "active",
    attributionRequired: true,
    approvalRequired: true,
    territoryScope: [
      { code: "US", name: "United States" },
      { code: "CA", name: "Canada" },
      { code: "GB", name: "United Kingdom" },
    ],
    duration: { type: "limited", expiresAt: "2028-01-15T00:00:00Z" },
    licensingStatus: "available",
    readinessState: "ready",
  });

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <p className="text-voice-400/60 text-xs uppercase tracking-[0.3em] mb-4">
            Consent Center
          </p>
          <h1 className="text-4xl md:text-5xl text-white mb-4">
            Your Rights Dashboard
          </h1>
          <p className="text-white/40 text-lg max-w-2xl">
            Complete visibility into your voice permissions. Every setting is
            meaningful. Every change is recorded.
          </p>
        </motion.header>

        {/* Status Overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-12"
        >
          <div className="card-glass p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-3 h-3 rounded-full ${
                    consentState.readinessState === "ready"
                      ? "bg-emerald-400"
                      : consentState.readinessState === "pending"
                      ? "bg-amber-400"
                      : "bg-red-400"
                  }`}
                />
                <div>
                  <p className="text-white font-medium">Consent Status</p>
                  <p className="text-white/40 text-sm capitalize">
                    {consentState.readinessState}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    consentState.revocationStatus === "active"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}
                >
                  {consentState.revocationStatus === "active" ? "Active" : "Revoked"}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    consentState.licensingStatus === "available"
                      ? "bg-voice-500/10 text-voice-300 border border-voice-500/20"
                      : "bg-white/5 text-white/50 border border-white/10"
                  }`}
                >
                  Licensing: {consentState.licensingStatus}
                </span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Permissions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Recording Consent */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="card-glass p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-white font-medium">Recording Consent</h3>
              <span
                className={`px-2 py-0.5 rounded text-xs ${
                  consentState.recordingConsent.granted
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-white/5 text-white/50"
                }`}
              >
                {consentState.recordingConsent.granted ? "Granted" : "Not Granted"}
              </span>
            </div>
            <p className="text-white/40 text-sm mb-4">
              Permission to capture and store recordings of your voice for
              profile creation.
            </p>
            {consentState.recordingConsent.grantedAt && (
              <p className="text-white/30 text-xs">
                Granted:{" "}
                {new Date(consentState.recordingConsent.grantedAt).toLocaleDateString()}
              </p>
            )}
          </motion.div>

          {/* Model Training */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="card-glass p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-white font-medium">Model Training</h3>
              <span
                className={`px-2 py-0.5 rounded text-xs ${
                  consentState.modelTrainingConsent.granted
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-white/5 text-white/50"
                }`}
              >
                {consentState.modelTrainingConsent.granted ? "Granted" : "Not Granted"}
              </span>
            </div>
            <p className="text-white/40 text-sm mb-4">
              Permission to use recordings to create a voice model for
              synthesis.
            </p>
            {consentState.modelTrainingConsent.grantedAt && (
              <p className="text-white/30 text-xs">
                Granted:{" "}
                {new Date(consentState.modelTrainingConsent.grantedAt).toLocaleDateString()}
              </p>
            )}
          </motion.div>

          {/* Attribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="card-glass p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-white font-medium">Attribution Required</h3>
              <span
                className={`px-2 py-0.5 rounded text-xs ${
                  consentState.attributionRequired
                    ? "bg-voice-500/10 text-voice-300"
                    : "bg-white/5 text-white/50"
                }`}
              >
                {consentState.attributionRequired ? "Required" : "Not Required"}
              </span>
            </div>
            <p className="text-white/40 text-sm">
              All uses of your voice must include proper attribution and credit.
            </p>
          </motion.div>

          {/* Approval Required */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="card-glass p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-white font-medium">Approval Required</h3>
              <span
                className={`px-2 py-0.5 rounded text-xs ${
                  consentState.approvalRequired
                    ? "bg-voice-500/10 text-voice-300"
                    : "bg-white/5 text-white/50"
                }`}
              >
                {consentState.approvalRequired ? "Required" : "Auto-Approve"}
              </span>
            </div>
            <p className="text-white/40 text-sm">
              New usage requests require your explicit approval before proceeding.
            </p>
          </motion.div>
        </div>

        {/* Commercial Usage */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="card-glass p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-white font-medium mb-1">Commercial Usage</h3>
                <p className="text-white/40 text-sm">
                  Categories where commercial use is permitted.
                </p>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-xs ${
                  consentState.commercialUsage.allowed
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {consentState.commercialUsage.allowed ? "Allowed" : "Not Allowed"}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {COMMERCIAL_CATEGORIES.map((cat) => {
                const isAllowed = consentState.commercialUsage.categories?.includes(cat.value);
                const isExcluded = consentState.commercialUsage.excludedCategories?.includes(cat.value);

                return (
                  <div
                    key={cat.value}
                    className={`px-4 py-3 rounded-lg border ${
                      isExcluded
                        ? "bg-red-500/5 border-red-500/20 text-red-400"
                        : isAllowed
                        ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                        : "bg-white/[0.02] border-white/[0.06] text-white/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{cat.label}</span>
                      {isExcluded && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      {isAllowed && !isExcluded && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* Territory & Duration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Territory */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="card-glass p-6"
          >
            <h3 className="text-white font-medium mb-4">Territory Scope</h3>
            <p className="text-white/40 text-sm mb-4">
              Regions where voice use is permitted.
            </p>
            <div className="flex flex-wrap gap-2">
              {consentState.territoryScope.map((territory) => (
                <span
                  key={territory.code}
                  className="px-3 py-1 bg-voice-500/10 border border-voice-500/20 rounded text-voice-300 text-sm"
                >
                  {territory.name}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Duration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="card-glass p-6"
          >
            <h3 className="text-white font-medium mb-4">Duration</h3>
            <p className="text-white/40 text-sm mb-4">
              Time period for which permissions are valid.
            </p>
            <div>
              <span className="text-white capitalize">
                {consentState.duration.type}
              </span>
              {consentState.duration.expiresAt && (
                <p className="text-white/40 text-sm mt-1">
                  Expires:{" "}
                  {new Date(consentState.duration.expiresAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Revocation */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="card-glass p-6 border-red-500/10">
            <h3 className="text-white font-medium mb-2">Revocation</h3>
            <p className="text-white/40 text-sm mb-6">
              Revoking consent will immediately disable all permissions. This
              action is recorded in the audit log and cannot be undone without
              re-enrollment.
            </p>
            <button
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 text-sm transition-colors"
              onClick={() => alert("Revocation flow would open here")}
            >
              Revoke All Permissions
            </button>
          </div>
        </motion.section>

        {/* Explanation Panel */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="card-glass p-6">
            <h3 className="text-voice-400/60 text-xs uppercase tracking-[0.2em] mb-4">
              Understanding Your Permissions
            </h3>
            <div className="space-y-4 text-white/50 text-sm">
              <p>
                <strong className="text-white/70">Recording Consent</strong>{" "}
                allows us to capture and store your voice samples. Without this,
                no profile can be created.
              </p>
              <p>
                <strong className="text-white/70">Model Training</strong> allows
                your recordings to be used to create a voice model. This is
                required for synthesis capabilities.
              </p>
              <p>
                <strong className="text-white/70">Attribution</strong> ensures
                you are credited whenever your voice is used. This is a
                fundamental creator right.
              </p>
              <p>
                <strong className="text-white/70">Approval</strong> gives you
                final say on each new use case before it proceeds.
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
