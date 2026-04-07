"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  SectionWrapper,
  PageHeader,
  PremiumCard,
  MetadataList,
  StatusChip,
  CTARow,
} from "@noizy/ui";
import { VOICES, DEFAULT_CONSENT_STATE } from "../../lib/data";

// RSP_001's dashboard data
const myProfile = VOICES.find((v) => v.id === "rsp-001") || VOICES[0];
const myConsent = DEFAULT_CONSENT_STATE;

const recentActivity = [
  {
    id: "1",
    type: "license_request",
    title: "Licensing Request",
    description: "Documentary project seeking voice narration rights",
    requester: "Northern Lights Media",
    date: "2026-04-05",
    status: "pending",
  },
  {
    id: "2",
    type: "royalty",
    title: "Royalty Payment",
    description: "Q1 2026 royalty distribution",
    amount: "$2,847.50",
    date: "2026-04-01",
    status: "completed",
  },
  {
    id: "3",
    type: "usage",
    title: "New Usage Detected",
    description: "Your voice model used in approved educational content",
    project: "VoiceLearn Module 7",
    date: "2026-03-28",
    status: "verified",
  },
  {
    id: "4",
    type: "consent_update",
    title: "Consent Update",
    description: "You modified commercial usage permissions",
    date: "2026-03-25",
    status: "completed",
  },
];

const stats = {
  totalEarnings: "$12,450.75",
  activeProjects: 3,
  pendingRequests: 2,
  totalUsages: 47,
  consentScore: 98,
};

export default function DashboardPage() {
  const [selectedTab, setSelectedTab] = useState<"overview" | "activity" | "analytics">("overview");

  return (
    <main className="min-h-screen bg-zinc-950 pt-24">
      {/* Header */}
      <SectionWrapper>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12">
          <div>
            <p className="text-zinc-500 text-sm uppercase tracking-wider mb-2">
              Voice Identity Dashboard
            </p>
            <h1 className="text-4xl md:text-5xl font-light text-white">
              Welcome back, {myProfile.displayName.split(" ")[0]}
            </h1>
            <p className="text-zinc-400 mt-2">
              Your voice, your terms. Always.
            </p>
          </div>
          <div className="flex gap-3">
            <CTARow
              primary={{ label: "Manage Consent", href: "/consent" }}
              secondary={{ label: "View Requests", href: "#requests" }}
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 bg-zinc-900/50 rounded-lg p-1 w-fit">
          {(["overview", "activity", "analytics"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                selectedTab === tab
                  ? "bg-amber-500 text-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </SectionWrapper>

      {/* Overview Tab */}
      {selectedTab === "overview" && (
        <>
          {/* Stats Grid */}
          <SectionWrapper>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
              >
                <p className="text-zinc-500 text-sm mb-1">Total Earnings</p>
                <p className="text-2xl font-light text-emerald-400">{stats.totalEarnings}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
              >
                <p className="text-zinc-500 text-sm mb-1">Active Projects</p>
                <p className="text-2xl font-light text-white">{stats.activeProjects}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
              >
                <p className="text-zinc-500 text-sm mb-1">Pending Requests</p>
                <p className="text-2xl font-light text-amber-400">{stats.pendingRequests}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
              >
                <p className="text-zinc-500 text-sm mb-1">Total Usages</p>
                <p className="text-2xl font-light text-white">{stats.totalUsages}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
              >
                <p className="text-zinc-500 text-sm mb-1">Consent Score</p>
                <p className="text-2xl font-light text-white">{stats.consentScore}%</p>
              </motion.div>
            </div>
          </SectionWrapper>

          {/* Profile + Consent Summary */}
          <SectionWrapper>
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* Profile Card */}
              <PremiumCard>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-medium text-white mb-1">
                        {myProfile.displayName}
                      </h3>
                      <p className="text-zinc-500">{myProfile.id.toUpperCase()}</p>
                    </div>
                    <StatusChip
                      status={myProfile.readiness === "available" ? "verified" : "pending"}
                      label={myProfile.readiness === "available" ? "Available" : "Limited"}
                    />
                  </div>
                  <MetadataList
                    items={[
                      { label: "Primary Style", value: myProfile.styles.join(", ") },
                      { label: "Languages", value: myProfile.languages.join(", ") },
                      { label: "Member Since", value: "2024" },
                      { label: "Verification", value: "Voice DNA Enrolled" },
                    ]}
                  />
                  <div className="mt-6 pt-6 border-t border-zinc-800">
                    <a
                      href="/onboarding"
                      className="text-amber-500 hover:text-amber-400 text-sm"
                    >
                      Update Profile →
                    </a>
                  </div>
                </div>
              </PremiumCard>

              {/* Consent Summary */}
              <PremiumCard>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <h3 className="text-xl font-medium text-white">Consent Status</h3>
                    <a href="/consent" className="text-amber-500 hover:text-amber-400 text-sm">
                      Manage →
                    </a>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-zinc-800">
                      <span className="text-zinc-400">Voice Recording</span>
                      <StatusChip
                        status={myConsent.recordingConsent.granted ? "verified" : "revoked"}
                        label={myConsent.recordingConsent.granted ? "Granted" : "Denied"}
                      />
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-zinc-800">
                      <span className="text-zinc-400">Model Training</span>
                      <StatusChip
                        status={myConsent.modelTrainingConsent.granted ? "verified" : "revoked"}
                        label={myConsent.modelTrainingConsent.granted ? "Granted" : "Denied"}
                      />
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-zinc-800">
                      <span className="text-zinc-400">Commercial Usage</span>
                      <StatusChip
                        status="verified"
                        label={`${myConsent.commercialUsage.filter((c) => c.allowed).length} Categories`}
                      />
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-zinc-400">Territory</span>
                      <span className="text-white">
                        {myConsent.territoryRestrictions.type === "worldwide"
                          ? "Worldwide"
                          : `${myConsent.territoryRestrictions.territories?.length || 0} Regions`}
                      </span>
                    </div>
                  </div>
                </div>
              </PremiumCard>
            </div>
          </SectionWrapper>

          {/* Pending Requests */}
          <SectionWrapper>
            <div className="mb-12" id="requests">
              <h2 className="text-2xl font-light text-white mb-6">Pending Requests</h2>
              <div className="space-y-4">
                {recentActivity
                  .filter((a) => a.status === "pending")
                  .map((activity) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-zinc-900/50 border border-amber-500/20 rounded-xl p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-white font-medium mb-1">{activity.title}</h4>
                          <p className="text-zinc-400 text-sm mb-2">{activity.description}</p>
                          {"requester" in activity && (
                            <p className="text-zinc-500 text-sm">
                              From: {activity.requester}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-3">
                          <button className="px-4 py-2 bg-amber-500 text-black rounded-lg text-sm font-medium hover:bg-amber-400 transition-colors">
                            Review
                          </button>
                          <button className="px-4 py-2 border border-zinc-700 text-zinc-400 rounded-lg text-sm hover:border-zinc-600 transition-colors">
                            Decline
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          </SectionWrapper>
        </>
      )}

      {/* Activity Tab */}
      {selectedTab === "activity" && (
        <SectionWrapper>
          <h2 className="text-2xl font-light text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activity.type === "royalty"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : activity.type === "license_request"
                          ? "bg-amber-500/20 text-amber-400"
                          : activity.type === "usage"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-zinc-500/20 text-zinc-400"
                      }`}
                    >
                      {activity.type === "royalty" && "$"}
                      {activity.type === "license_request" && "📄"}
                      {activity.type === "usage" && "🎙"}
                      {activity.type === "consent_update" && "⚙"}
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">{activity.title}</h4>
                      <p className="text-zinc-400 text-sm">{activity.description}</p>
                      {"amount" in activity && (
                        <p className="text-emerald-400 text-sm mt-1">{activity.amount}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusChip
                      status={
                        activity.status === "completed"
                          ? "verified"
                          : activity.status === "pending"
                          ? "pending"
                          : "verified"
                      }
                      label={activity.status}
                    />
                    <p className="text-zinc-500 text-sm mt-2">{activity.date}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </SectionWrapper>
      )}

      {/* Analytics Tab */}
      {selectedTab === "analytics" && (
        <SectionWrapper>
          <h2 className="text-2xl font-light text-white mb-6">Usage Analytics</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            <PremiumCard>
              <div className="p-6">
                <h3 className="text-lg font-medium text-white mb-4">Earnings Over Time</h3>
                <div className="h-48 flex items-end justify-between gap-2">
                  {[65, 45, 80, 55, 90, 70, 85, 95, 75, 100, 88, 92].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-amber-500/20 to-amber-500/60 rounded-t"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-zinc-500 text-xs">
                  <span>Jan</span>
                  <span>Dec</span>
                </div>
              </div>
            </PremiumCard>

            <PremiumCard>
              <div className="p-6">
                <h3 className="text-lg font-medium text-white mb-4">Usage by Category</h3>
                <div className="space-y-4">
                  {[
                    { label: "Commercial Narration", percentage: 45, color: "amber" },
                    { label: "Educational", percentage: 30, color: "blue" },
                    { label: "Entertainment", percentage: 15, color: "purple" },
                    { label: "Other", percentage: 10, color: "zinc" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-zinc-400">{item.label}</span>
                        <span className="text-white">{item.percentage}%</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.color === "amber"
                              ? "bg-amber-500"
                              : item.color === "blue"
                              ? "bg-blue-500"
                              : item.color === "purple"
                              ? "bg-purple-500"
                              : "bg-zinc-600"
                          }`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </PremiumCard>
          </div>

          {/* Provenance Trail */}
          <div className="mt-8">
            <PremiumCard>
              <div className="p-6">
                <h3 className="text-lg font-medium text-white mb-4">Provenance Trail</h3>
                <p className="text-zinc-400 text-sm mb-6">
                  Every usage of your voice is cryptographically verified and permanently recorded.
                </p>
                <div className="space-y-3">
                  {[
                    { hash: "0x7f3a...b2c1", event: "Voice DNA enrollment", date: "2024-06-15" },
                    { hash: "0x9e2d...4f8a", event: "Model training authorized", date: "2024-06-16" },
                    { hash: "0x1c4b...d9e7", event: "Commercial license granted", date: "2024-07-01" },
                    { hash: "0x5a8f...c3b2", event: "Royalty distribution", date: "2026-04-01" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <code className="text-amber-500 text-xs font-mono">{item.hash}</code>
                        <span className="text-zinc-400 text-sm">{item.event}</span>
                      </div>
                      <span className="text-zinc-500 text-sm">{item.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </PremiumCard>
          </div>
        </SectionWrapper>
      )}
    </main>
  );
}
