"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { INITIAL_ONBOARDING_STATE } from "@/lib/data";
import type { OnboardingState, CommercialCategory } from "@noizy/types";

const STEPS = [
  { id: 0, title: "Identity", description: "Your basic information" },
  { id: 1, title: "Goals", description: "What you want to achieve" },
  { id: 2, title: "Recording", description: "Consent to capture" },
  { id: 3, title: "Model", description: "Training permissions" },
  { id: 4, title: "Usage", description: "Commercial categories" },
  { id: 5, title: "Attribution", description: "Credit preferences" },
  { id: 6, title: "Territory", description: "Scope and duration" },
  { id: 7, title: "Review", description: "Final confirmation" },
];

const COMMERCIAL_OPTIONS: { value: CommercialCategory; label: string }[] = [
  { value: "audiobook", label: "Audiobook" },
  { value: "podcast", label: "Podcast" },
  { value: "documentary", label: "Documentary" },
  { value: "education", label: "Education" },
  { value: "corporate", label: "Corporate" },
  { value: "advertising", label: "Advertising" },
  { value: "film", label: "Film" },
  { value: "television", label: "Television" },
  { value: "gaming", label: "Gaming" },
];

export default function OnboardingPage() {
  const [state, setState] = useState<OnboardingState>(INITIAL_ONBOARDING_STATE);
  const currentStep = STEPS[state.currentStep];

  const updateState = (updates: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (state.currentStep < STEPS.length - 1) {
      updateState({
        currentStep: state.currentStep + 1,
        completedSteps: [...state.completedSteps, state.currentStep],
      });
    }
  };

  const prevStep = () => {
    if (state.currentStep > 0) {
      updateState({ currentStep: state.currentStep - 1 });
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center"
        >
          <p className="text-voice-400/60 text-xs uppercase tracking-[0.3em] mb-4">
            Creator Enrollment
          </p>
          <h1 className="text-3xl md:text-4xl text-white mb-4">
            Establish Your Voice Sovereignty
          </h1>
          <p className="text-white/40 text-lg">
            A guided process to document your identity, preferences, and permissions.
          </p>
        </motion.header>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/40 text-sm">
              Step {state.currentStep + 1} of {STEPS.length}
            </span>
            <span className="text-voice-400 text-sm">
              {currentStep.title}
            </span>
          </div>
          <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-voice-500 to-voice-400"
              initial={{ width: 0 }}
              animate={{
                width: `${((state.currentStep + 1) / STEPS.length) * 100}%`,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="card-glass p-8 mb-8"
          >
            {/* Step 0: Identity */}
            {state.currentStep === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl text-white mb-2">Creator Identity</h2>
                  <p className="text-white/40 text-sm">
                    Your legal name is used for contracts and rights management.
                    Your performer name is how you'll be credited.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-2">
                      Legal Name
                    </label>
                    <input
                      type="text"
                      value={state.creatorIdentity.legalName}
                      onChange={(e) =>
                        updateState({
                          creatorIdentity: {
                            ...state.creatorIdentity,
                            legalName: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-voice-500/30"
                      placeholder="Your legal name"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-2">
                      Performer Name
                    </label>
                    <input
                      type="text"
                      value={state.creatorIdentity.performerName}
                      onChange={(e) =>
                        updateState({
                          creatorIdentity: {
                            ...state.creatorIdentity,
                            performerName: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-voice-500/30"
                      placeholder="How you'll be credited"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={state.creatorIdentity.email}
                    onChange={(e) =>
                      updateState({
                        creatorIdentity: {
                          ...state.creatorIdentity,
                          email: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-voice-500/30"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            )}

            {/* Step 1: Goals */}
            {state.currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl text-white mb-2">Voice Goals</h2>
                  <p className="text-white/40 text-sm">
                    Understanding your goals helps us match you with appropriate
                    opportunities.
                  </p>
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-2">
                    Primary Use Case
                  </label>
                  <select
                    value={state.voiceGoals.primaryUseCase}
                    onChange={(e) =>
                      updateState({
                        voiceGoals: {
                          ...state.voiceGoals,
                          primaryUseCase: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-voice-500/30"
                  >
                    <option value="" className="bg-sovereign">Select primary use</option>
                    <option value="narration" className="bg-sovereign">Narration</option>
                    <option value="commercial" className="bg-sovereign">Commercial Work</option>
                    <option value="character" className="bg-sovereign">Character Voice</option>
                    <option value="audiobook" className="bg-sovereign">Audiobooks</option>
                    <option value="podcast" className="bg-sovereign">Podcasts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-2">
                    Experience Level
                  </label>
                  <select
                    value={state.voiceGoals.experienceLevel}
                    onChange={(e) =>
                      updateState({
                        voiceGoals: {
                          ...state.voiceGoals,
                          experienceLevel: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-voice-500/30"
                  >
                    <option value="" className="bg-sovereign">Select experience</option>
                    <option value="beginner" className="bg-sovereign">Beginner</option>
                    <option value="intermediate" className="bg-sovereign">Intermediate</option>
                    <option value="professional" className="bg-sovereign">Professional</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Recording Consent */}
            {state.currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl text-white mb-2">Recording Consent</h2>
                  <p className="text-white/40 text-sm">
                    Before we can create your voice profile, you must consent to
                    recording.
                  </p>
                </div>
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.recordingConsent.understandsProcess}
                      onChange={(e) =>
                        updateState({
                          recordingConsent: {
                            ...state.recordingConsent,
                            understandsProcess: e.target.checked,
                          },
                        })
                      }
                      className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-voice-500 focus:ring-voice-500/50"
                    />
                    <span className="text-white/60 text-sm">
                      I understand that my voice will be recorded and stored
                      securely for profile creation.
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.recordingConsent.agreesToRecording}
                      onChange={(e) =>
                        updateState({
                          recordingConsent: {
                            ...state.recordingConsent,
                            agreesToRecording: e.target.checked,
                          },
                        })
                      }
                      className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-voice-500 focus:ring-voice-500/50"
                    />
                    <span className="text-white/60 text-sm">
                      I consent to having my voice recorded for the purpose of
                      creating my NOIZYVOX profile.
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.recordingConsent.acknowledgesOwnership}
                      onChange={(e) =>
                        updateState({
                          recordingConsent: {
                            ...state.recordingConsent,
                            acknowledgesOwnership: e.target.checked,
                          },
                        })
                      }
                      className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-voice-500 focus:ring-voice-500/50"
                    />
                    <span className="text-white/60 text-sm">
                      I acknowledge that I retain ownership of my voice and can
                      revoke consent at any time.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Steps 3-6 would continue similarly... */}
            {state.currentStep >= 3 && state.currentStep <= 6 && (
              <div className="text-center py-8">
                <p className="text-white/60">
                  Step {state.currentStep + 1}: {currentStep.title}
                </p>
                <p className="text-white/40 text-sm mt-2">
                  {currentStep.description}
                </p>
              </div>
            )}

            {/* Step 7: Review */}
            {state.currentStep === 7 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl text-white mb-2">Review & Confirm</h2>
                  <p className="text-white/40 text-sm">
                    Please review your selections before finalizing enrollment.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-white/[0.02] rounded-lg">
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                      Performer Name
                    </p>
                    <p className="text-white">
                      {state.creatorIdentity.performerName || "Not provided"}
                    </p>
                  </div>
                  <div className="p-4 bg-white/[0.02] rounded-lg">
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                      Primary Use Case
                    </p>
                    <p className="text-white capitalize">
                      {state.voiceGoals.primaryUseCase || "Not selected"}
                    </p>
                  </div>
                  <div className="p-4 bg-white/[0.02] rounded-lg">
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                      Recording Consent
                    </p>
                    <p className="text-white">
                      {state.recordingConsent.agreesToRecording
                        ? "Granted"
                        : "Not granted"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={state.currentStep === 0}
            className={`px-6 py-3 rounded-lg text-sm transition-all ${
              state.currentStep === 0
                ? "text-white/20 cursor-not-allowed"
                : "text-white/60 hover:text-white border border-white/10 hover:border-white/20"
            }`}
          >
            Previous
          </button>

          {state.currentStep === STEPS.length - 1 ? (
            <Link
              href="/consent"
              className="btn-voice inline-flex items-center gap-2"
            >
              <span>Complete Enrollment</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </Link>
          ) : (
            <button
              onClick={nextStep}
              className="btn-voice inline-flex items-center gap-2"
            >
              <span>Continue</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
