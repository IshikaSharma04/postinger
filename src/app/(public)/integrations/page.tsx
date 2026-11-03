"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ExternalLink, Image, HardDrive, Palette, Cloud, Sparkles, X, ShieldCheck } from "lucide-react";
import { PostlyLogo } from "@/components/brand/PostlyLogo";

interface IntegrationItem {
  id: string;
  name: string;
  category: "Media & Assets" | "Cloud Storage" | "Automation";
  status: "WORKING" | "ADAPTER_STUB";
  description: string;
  envKey: string;
  guideUrl: string;
}

const INTEGRATIONS: IntegrationItem[] = [
  { id: "unsplash", name: "Unsplash Photos", category: "Media & Assets", status: "WORKING", description: "Search and attach millions of free editorial and commercial stock images directly in the composer.", envKey: "UNSPLASH_ACCESS_KEY", guideUrl: "https://unsplash.com/developers" },
  { id: "local-upload", name: "Local Disk Media", category: "Media & Assets", status: "WORKING", description: "Drag and drop images, video files, and graphics with automatic format validation and storage.", envKey: "UPLOAD_DIR", guideUrl: "" },
  { id: "google-drive", name: "Google Drive", category: "Cloud Storage", status: "ADAPTER_STUB", description: "Import campaign assets and video files directly from your personal or shared Google Drive folders.", envKey: "GOOGLE_DRIVE_CLIENT_ID", guideUrl: "https://console.cloud.google.com" },
  { id: "dropbox", name: "Dropbox", category: "Cloud Storage", status: "ADAPTER_STUB", description: "Seamlessly access your brand media libraries and high-res photography stored in Dropbox.", envKey: "DROPBOX_APP_KEY", guideUrl: "https://www.dropbox.com/developers" },
  { id: "onedrive", name: "Microsoft OneDrive", category: "Cloud Storage", status: "ADAPTER_STUB", description: "Select company marketing collateral and presentation slides directly from Microsoft 365.", envKey: "MICROSOFT_GRAPH_CLIENT_ID", guideUrl: "https://portal.azure.com" },
  { id: "google-photos", name: "Google Photos", category: "Cloud Storage", status: "ADAPTER_STUB", description: "Access personal albums and mobile photography directly inside the Postinger composer.", envKey: "GOOGLE_PHOTOS_CLIENT_ID", guideUrl: "https://console.cloud.google.com" },
  { id: "canva", name: "Canva Design Button", category: "Media & Assets", status: "ADAPTER_STUB", description: "Design visual graphics in Canva and export them straight to your Postinger scheduled queue.", envKey: "CANVA_API_KEY", guideUrl: "https://www.canva.com/developers" },
  { id: "zapier", name: "Zapier", category: "Automation", status: "ADAPTER_STUB", description: "Connect Postinger with 5,000+ business applications using our incoming and outgoing webhooks.", envKey: "POSTINGER_API_KEY", guideUrl: "https://zapier.com" },
];

export default function IntegrationsPage() {
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationItem | null>(null);

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      {/* Header */}
      <header className="border-b border-zinc-100 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <PostlyLogo size="md" />
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-xs font-bold text-zinc-700 hover:text-zinc-900 px-3 py-2">
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Integration Ecosystem
        </span>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900">
          Connect Your Favorite Creative Tools
        </h1>
        <p className="text-base text-zinc-600 max-w-2xl mx-auto">
          Import media from cloud storage, search royalty-free photos, and automate publishing workflows across all your apps.
        </p>
      </section>

      {/* Integrations Grid */}
      <section className="py-12 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INTEGRATIONS.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-3xl border border-zinc-200 bg-white shadow-xs hover:border-zinc-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    {item.category}
                  </span>
                  {item.status === "WORKING" ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      Live & Ready
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-bold">
                      Adapter Ready
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-lg text-zinc-900">{item.name}</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">{item.description}</p>
              </div>

              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedIntegration(item)}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  View integration details →
                </button>
                {item.guideUrl && (
                  <a
                    href={item.guideUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-zinc-700"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal Guide */}
      {selectedIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-base text-zinc-900">{selectedIntegration.name} Integration</h3>
              <button onClick={() => setSelectedIntegration(null)} className="p-1 rounded-md text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">{selectedIntegration.description}</p>

            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs space-y-2">
              <span className="font-bold text-zinc-800 block">Configuration Parameter:</span>
              <code className="text-xs font-mono text-blue-700 bg-white p-2 rounded-lg border border-zinc-200 block">
                {selectedIntegration.envKey}
              </code>
              <p className="text-[11px] text-zinc-500">
                {selectedIntegration.status === "WORKING"
                  ? "This adapter is fully active in Postinger."
                  : "Clean adapter stub implemented behind MediaSourceAdapter interface. Add this key in your .env.local to activate production API calls."}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedIntegration(null)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
