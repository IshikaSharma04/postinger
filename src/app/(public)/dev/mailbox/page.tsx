"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, RefreshCw, Trash2, ExternalLink, ArrowLeft, ShieldCheck } from "lucide-react";
import { PostlyLogo } from "@/components/brand/PostlyLogo";

interface CapturedEmail {
  id: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  timestamp: string;
  actionUrl?: string;
  type: string;
}

export default function DevMailboxPage() {
  const [emails, setEmails] = useState<CapturedEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<CapturedEmail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dev/mailbox");
      const json = await res.json();
      if (json.success && json.data?.emails) {
        setEmails(json.data.emails);
        if (json.data.emails.length > 0 && !selectedEmail) {
          setSelectedEmail(json.data.emails[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const clearInbox = async () => {
    await fetch("/api/dev/mailbox", { method: "DELETE" });
    setEmails([]);
    setSelectedEmail(null);
  };

  useEffect(() => {
    fetchEmails();
    const interval = setInterval(fetchEmails, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <PostlyLogo size="sm" />
          </Link>
          <span className="text-zinc-300">/</span>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Mail className="w-4 h-4" />
            </div>
            <h1 className="font-bold text-sm text-zinc-900">Local Dev Mailbox (Mailpit Style)</h1>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Live Interceptor
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchEmails}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={clearInbox}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
          <Link
            href="/login"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to App
          </Link>
        </div>
      </header>

      {/* Main Mailbox Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Email list */}
        <div className="md:col-span-5 bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Captured Messages ({emails.length})
            </h2>
            <span className="text-[11px] text-zinc-400 font-mono">Auto-refreshes every 3s</span>
          </div>

          <div className="divide-y divide-zinc-100 max-h-[680px] overflow-y-auto">
            {emails.length === 0 ? (
              <div className="p-8 text-center text-zinc-400">
                <Mail className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-medium">No emails captured yet</p>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Trigger a signup or password reset to see outgoing links here.
                </p>
              </div>
            ) : (
              emails.map((email) => {
                const isSelected = selectedEmail?.id === email.id;
                return (
                  <button
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={`w-full text-left p-4 transition-colors flex flex-col gap-1 ${
                      isSelected ? "bg-blue-50/70 border-l-4 border-blue-600" : "hover:bg-zinc-50"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-900 truncate">{email.to}</span>
                      <span className="text-[10px] text-zinc-400">
                        {new Date(email.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-zinc-800 line-clamp-1">{email.subject}</div>
                    <div className="text-[11px] text-zinc-500 line-clamp-1">{email.text}</div>
                    <span className="mt-1 inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 w-fit">
                      {email.type}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Email Preview */}
        <div className="md:col-span-7 bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden flex flex-col min-h-[680px]">
          {selectedEmail ? (
            <div className="p-6 flex-1 flex flex-col">
              {/* Message Header */}
              <div className="border-b border-zinc-100 pb-4 mb-4 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-zinc-900">{selectedEmail.subject}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      To: <span className="font-semibold text-zinc-800">{selectedEmail.to}</span>
                    </p>
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">
                    {new Date(selectedEmail.timestamp).toLocaleString()}
                  </span>
                </div>

                {selectedEmail.actionUrl && (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider block">
                        Action Link Detected
                      </span>
                      <span className="text-xs font-mono text-blue-900 truncate block">
                        {selectedEmail.actionUrl}
                      </span>
                    </div>
                    <a
                      href={selectedEmail.actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex-shrink-0 transition-colors shadow-xs"
                    >
                      Open Link
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Message Body */}
              <div
                className="flex-1 prose prose-sm max-w-none text-zinc-700 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: selectedEmail.html || `<p>${selectedEmail.text}</p>` }}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-zinc-400">
              <Mail className="w-12 h-12 opacity-30 mb-2" />
              <p className="text-sm font-semibold">Select an email to view its content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
