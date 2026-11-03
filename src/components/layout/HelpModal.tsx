"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  X,
  Search,
  BookOpen,
  MessageSquare,
  Keyboard,
  Send,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HELP_ARTICLES = [
  { title: "How to connect social accounts in Sandbox mode", category: "Channels", snippet: "Click '+' on the sidebar, choose any of the 12 platforms, and click 'Authorize & Connect' without needing external developer credentials." },
  { title: "Customizing posts per channel with Fan-Out", category: "Publishing", snippet: "Select multiple channels in /compose, click per-network tabs, and edit caption, hashtags, and schedule times independently." },
  { title: "Setting weekly queue slots and timezones", category: "Queue", snippet: "In /queue, add recurring weekly time slots. Times automatically recalculate for daylight saving time adjustments." },
  { title: "Using the AI Copywriter and Tone Adjustments", category: "AI Assistant", snippet: "Open the AI Copywriter sidebar in /compose, enter a prompt or paste copy, and choose from 10 distinct actions." },
  { title: "Building your Start Page link-in-bio", category: "Start Page", snippet: "Head to /start-page to customize color themes, typography, and links, then view your live mobile canvas at /p/{handle}." },
  { title: "Team roles & approval workflows", category: "Teams", snippet: "Contributors submit drafts for review. Managers and Admins can approve them directly into the publishing queue." },
];

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState<"ARTICLES" | "CONTACT" | "SHORTCUTS">("ARTICLES");
  const [search, setSearch] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const filteredArticles = HELP_ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.snippet.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSendSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    setSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `[Support Request] From: ${supportEmail || "anonymous"}\n\n${supportMessage}`,
          category: "support",
        }),
      });
      setSubmitted(true);
      toast.success("Support message sent! Our engineering team will review it.");
      setTimeout(() => {
        setSubmitted(false);
        setSupportMessage("");
        onClose();
      }, 2000);
    } catch {
      toast.error("Failed to submit support request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-zinc-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900">Help & Support Center</h3>
              <p className="text-[11px] text-zinc-500">Guides, shortcuts, and direct team contact</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-100 px-6 gap-6 text-xs font-bold text-zinc-500">
          <button
            onClick={() => setActiveTab("ARTICLES")}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "ARTICLES" ? "border-blue-600 text-blue-600" : "border-transparent hover:text-zinc-900"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Help Guides
          </button>
          <button
            onClick={() => setActiveTab("SHORTCUTS")}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "SHORTCUTS" ? "border-blue-600 text-blue-600" : "border-transparent hover:text-zinc-900"
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            Shortcuts
          </button>
          <button
            onClick={() => setActiveTab("CONTACT")}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "CONTACT" ? "border-blue-600 text-blue-600" : "border-transparent hover:text-zinc-900"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Contact Team
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === "ARTICLES" && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search guides (e.g. sandbox, fan-out, queue)..."
                  className="w-full text-xs pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-2.5 max-h-[360px] overflow-y-auto">
                {filteredArticles.length === 0 ? (
                  <p className="text-xs text-zinc-400 py-6 text-center">No guides matching your query.</p>
                ) : (
                  filteredArticles.map((art, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-zinc-100 hover:border-zinc-200 bg-white hover:bg-zinc-50/50 transition-all space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                          {art.category}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-zinc-900">{art.title}</h4>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">{art.snippet}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "SHORTCUTS" && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-500 mb-2">Boost your publishing speed with keyboard shortcuts:</p>
              <div className="space-y-2">
                {[
                  { keys: ["⌘", "K"], action: "Open Command Palette / Search everywhere" },
                  { keys: ["C"], action: "Open new multi-channel composer" },
                  { keys: ["G"], action: "Go to Publish Queue" },
                  { keys: ["I"], action: "Go to Idea Bank" },
                  { keys: ["M"], action: "Go to Community Inbox" },
                  { keys: ["H"], action: "Go to Analytics & Heatmap" },
                  { keys: ["Esc"], action: "Close modals, drawers, and menus" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs">
                    <span className="font-medium text-zinc-700">{s.action}</span>
                    <div className="flex items-center gap-1">
                      {s.keys.map((k) => (
                        <kbd key={k} className="px-2 py-0.5 rounded-md bg-white border border-zinc-300 font-mono text-[11px] text-zinc-800 shadow-2xs">
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "CONTACT" && (
            <div>
              {submitted ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h4 className="font-bold text-sm text-zinc-900">Message Delivered</h4>
                  <p className="text-xs text-zinc-500">Thanks for reaching out! We’ve logged your request.</p>
                </div>
              ) : (
                <form onSubmit={handleSendSupport} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 block mb-1">Your Email (optional)</label>
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 block mb-1">How can we help?</label>
                    <textarea
                      rows={4}
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      placeholder="Describe what you're trying to do or what issue you encountered..."
                      className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !supportMessage.trim()}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submitting ? "Sending..." : "Submit Support Request"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
