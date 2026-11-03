"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Briefcase,
  User,
  Users,
  Compass,
  Calendar,
  Target,
  Share2,
  Radio,
  Building,
  CheckCircle2,
} from "lucide-react";
import { PostlyLogo } from "@/components/brand/PostlyLogo";

interface OnboardingAnswers {
  currentStep: number;
  useCase: string;
  persona: string;
  teamSize: string;
  targetChannels: string[];
  postingFrequency: string;
  mainGoal: string;
  referralSource: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 7;
  const [saving, setSaving] = useState(false);

  const [answers, setAnswers] = useState<OnboardingAnswers>({
    currentStep: 1,
    useCase: "Work / Business",
    persona: "Solo Creator",
    teamSize: "Just me",
    targetChannels: ["TWITTER", "LINKEDIN", "INSTAGRAM"],
    postingFrequency: "4-7 times a week",
    mainGoal: "Save time scheduling content",
    referralSource: "Social media",
  });

  // Rehydrate saved progress from server on mount
  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await fetch("/api/onboarding");
        const json = await res.json();
        if (json.success && json.data?.onboarding) {
          const saved = json.data.onboarding;
          setStep(saved.currentStep || 1);
          setAnswers((prev) => ({
            ...prev,
            currentStep: saved.currentStep || 1,
            useCase: saved.useCase || prev.useCase,
            persona: saved.persona || prev.persona,
            teamSize: saved.teamSize || prev.teamSize,
            targetChannels: saved.targetChannels?.length ? saved.targetChannels : prev.targetChannels,
            postingFrequency: saved.postingFrequency || prev.postingFrequency,
            mainGoal: saved.mainGoal || prev.mainGoal,
            referralSource: saved.referralSource || prev.referralSource,
          }));
        }
      } catch (e) {
        console.error("Failed to load onboarding state", e);
      }
    }
    loadProgress();
  }, []);

  // Save progress to server
  const saveStep = async (nextStep: number, isDone = false) => {
    setSaving(true);
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...answers,
          currentStep: nextStep,
          isCompleted: isDone,
        }),
      });
      if (isDone) {
        router.push("/dashboard");
      } else {
        setStep(nextStep);
      }
    } catch (e) {
      console.error(e);
      if (!isDone) setStep(nextStep);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      saveStep(step + 1);
    } else {
      saveStep(step, true);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleChannel = (channel: string) => {
    setAnswers((prev) => {
      const exists = prev.targetChannels.includes(channel);
      return {
        ...prev,
        targetChannels: exists
          ? prev.targetChannels.filter((c) => c !== channel)
          : [...prev.targetChannels, channel],
      };
    });
  };

  const progressPercent = Math.round((step / totalSteps) * 100);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-between font-sans">
      {/* Top Bar with Progress */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <PostlyLogo size="sm" />
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-zinc-500">
              Step {step} of {totalSteps}
            </span>
            <button
              onClick={() => saveStep(step, true)}
              className="text-xs font-semibold text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              Skip setup
            </button>
          </div>
        </div>
        {/* Progress Line */}
        <div className="max-w-3xl mx-auto mt-3 h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Main Question Card */}
      <main className="flex-1 max-w-xl w-full mx-auto p-6 flex flex-col justify-center">
        <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
          {/* ── STEP 1: What will you use it for ── */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Getting Started</span>
                <h2 className="text-2xl font-black text-zinc-900 mt-1">What will you use Postinger for?</h2>
                <p className="text-xs text-zinc-500 mt-1">Help us tailor your workspace experience.</p>
              </div>

              <div className="space-y-3">
                {[
                  { title: "Work / Business", desc: "For a company, startup, or freelance client work", icon: Briefcase },
                  { title: "Personal brand / Creator", desc: "Building my audience, sharing content, or creative projects", icon: User },
                  { title: "Something else", desc: "Non-profit, student project, or casual exploring", icon: Compass },
                ].map((opt) => (
                  <button
                    key={opt.title}
                    onClick={() => setAnswers({ ...answers, useCase: opt.title })}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center gap-4 transition-all ${
                      answers.useCase === opt.title
                        ? "border-blue-600 bg-blue-50/50 shadow-xs"
                        : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        answers.useCase === opt.title ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      <opt.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm text-zinc-900">{opt.title}</div>
                      <div className="text-xs text-zinc-500">{opt.desc}</div>
                    </div>
                    {answers.useCase === opt.title && <Check className="w-5 h-5 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 2: Who are you ── */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Your Role</span>
                <h2 className="text-2xl font-black text-zinc-900 mt-1">Who best describes you?</h2>
                <p className="text-xs text-zinc-500 mt-1">We’ll tune your suggestions based on your background.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Solo Creator",
                  "Small Business Owner",
                  "Marketing / Agency Team",
                  "Freelance Social Manager",
                  "Non-profit Organizer",
                  "Educator / Student",
                ].map((persona) => (
                  <button
                    key={persona}
                    onClick={() => setAnswers({ ...answers, persona })}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      answers.persona === persona
                        ? "border-blue-600 bg-blue-50/50 shadow-xs"
                        : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50"
                    }`}
                  >
                    <span className="font-bold text-xs text-zinc-900">{persona}</span>
                    {answers.persona === persona && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 3: Team Size ── */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Collaboration</span>
                <h2 className="text-2xl font-black text-zinc-900 mt-1">How big is your team?</h2>
                <p className="text-xs text-zinc-500 mt-1">Determine approval workflows and multi-user seats.</p>
              </div>

              <div className="space-y-2.5">
                {["Just me (Solo)", "2 – 5 people", "6 – 15 people", "16 – 50 people", "50+ people"].map((size) => (
                  <button
                    key={size}
                    onClick={() => setAnswers({ ...answers, teamSize: size })}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      answers.teamSize === size
                        ? "border-blue-600 bg-blue-50/50 shadow-xs"
                        : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50"
                    }`}
                  >
                    <span className="font-bold text-xs text-zinc-900">{size}</span>
                    {answers.teamSize === size && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 4: Channels to Manage ── */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Channels</span>
                <h2 className="text-2xl font-black text-zinc-900 mt-1">Which channels do you plan to connect?</h2>
                <p className="text-xs text-zinc-500 mt-1">Select all that apply. You can connect them anytime.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: "TWITTER", name: "Twitter / X" },
                  { id: "LINKEDIN", name: "LinkedIn" },
                  { id: "INSTAGRAM", name: "Instagram" },
                  { id: "FACEBOOK", name: "Facebook" },
                  { id: "TIKTOK", name: "TikTok" },
                  { id: "THREADS", name: "Threads" },
                  { id: "YOUTUBE", name: "YouTube Shorts" },
                  { id: "PINTEREST", name: "Pinterest" },
                  { id: "GOOGLE_BUSINESS", name: "Google Business" },
                  { id: "BLUESKY", name: "Bluesky" },
                  { id: "MASTODON", name: "Mastodon" },
                  { id: "SUBSTACK", name: "Substack Notes" },
                ].map((ch) => {
                  const selected = answers.targetChannels.includes(ch.id);
                  return (
                    <button
                      key={ch.id}
                      onClick={() => toggleChannel(ch.id)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        selected
                          ? "border-blue-600 bg-blue-50/60 shadow-xs font-bold text-blue-900"
                          : "border-zinc-200 hover:border-zinc-300 text-zinc-700"
                      }`}
                    >
                      <span className="text-xs">{ch.name}</span>
                      {selected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STEP 5: Posting Frequency ── */}
          {step === 5 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Cadence</span>
                <h2 className="text-2xl font-black text-zinc-900 mt-1">How often do you plan to publish?</h2>
                <p className="text-xs text-zinc-500 mt-1">We’ll initialize your weekly posting goal based on this.</p>
              </div>

              <div className="space-y-3">
                {[
                  { title: "1 – 3 times a week", desc: "Consistent cadence without overwhelm" },
                  { title: "4 – 7 times a week", desc: "Daily or near-daily publishing for rapid growth" },
                  { title: "Multiple times a day", desc: "High-volume multi-platform publishing" },
                  { title: "Just getting started", desc: "Exploring schedules and best times" },
                ].map((freq) => (
                  <button
                    key={freq.title}
                    onClick={() => setAnswers({ ...answers, postingFrequency: freq.title })}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      answers.postingFrequency === freq.title
                        ? "border-blue-600 bg-blue-50/50 shadow-xs"
                        : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-zinc-900">{freq.title}</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">{freq.desc}</div>
                    </div>
                    {answers.postingFrequency === freq.title && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 6: Main Goal ── */}
          {step === 6 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Objectives</span>
                <h2 className="text-2xl font-black text-zinc-900 mt-1">What is your primary goal right now?</h2>
                <p className="text-xs text-zinc-500 mt-1">We’ll recommend the best templates for your dashboard.</p>
              </div>

              <div className="space-y-2.5">
                {[
                  "Save time scheduling content",
                  "Grow my follower audience and reach",
                  "Engage with comments and community",
                  "Analyze what content performs best",
                  "Build a link-in-bio Start Page",
                ].map((goal) => (
                  <button
                    key={goal}
                    onClick={() => setAnswers({ ...answers, mainGoal: goal })}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      answers.mainGoal === goal
                        ? "border-blue-600 bg-blue-50/50 shadow-xs"
                        : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50"
                    }`}
                  >
                    <span className="font-bold text-xs text-zinc-900">{goal}</span>
                    {answers.mainGoal === goal && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 7: Referral Source ── */}
          {step === 7 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Almost Done!</span>
                <h2 className="text-2xl font-black text-zinc-900 mt-1">How did you hear about Postinger?</h2>
                <p className="text-xs text-zinc-500 mt-1">Help us know where creators discover us.</p>
              </div>

              <div className="space-y-2.5">
                {[
                  "Search engine (Google / Bing)",
                  "Social media (X, LinkedIn, YouTube)",
                  "Friend, Colleague or Community",
                  "Podcast, Newsletter or Blog",
                  "GitHub or Developer Showcase",
                  "Other",
                ].map((src) => (
                  <button
                    key={src}
                    onClick={() => setAnswers({ ...answers, referralSource: src })}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      answers.referralSource === src
                        ? "border-blue-600 bg-blue-50/50 shadow-xs"
                        : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50"
                    }`}
                  >
                    <span className="font-bold text-xs text-zinc-900">{src}</span>
                    {answers.referralSource === src && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={handleBack}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={handleNext}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
            >
              {saving
                ? "Saving..."
                : step === totalSteps
                ? "Finish & Open Dashboard 🎉"
                : "Continue"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-zinc-400">
        Postinger · Personalized social media management
      </footer>
    </div>
  );
}
