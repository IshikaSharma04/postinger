"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Smartphone,
  Plus,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Share2,
  Palette,
  Link as LinkIcon,
  Eye,
  ArrowUpRight,
} from "lucide-react";
import {
  TwitterXIcon,
  LinkedInIcon,
  InstagramIcon,
  TikTokIcon,
} from "@/components/icons/SocialBrandIcons";
import { Button } from "@/components/ui/Button";
import { PageHeader, Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toaster";

interface BioLink {
  id: string;
  title: string;
  url: string;
  badge?: string;
  clicks: number;
}

export default function StartPageBuilder() {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  // Profile state
  const [name, setName] = useState("Alex Demo");
  const [handle, setHandle] = useState("alexdemo");
  const [bio, setBio] = useState("Tech founder, open-source enthusiast & social strategist. Building Postinger 🚀");
  const [avatar, setAvatar] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80");
  const [theme, setTheme] = useState<"MINIMAL" | "MIDNIGHT" | "SUNSET" | "COBALT">("MINIMAL");

  // Links state
  const [links, setLinks] = useState<BioLink[]>([
    {
      id: "1",
      title: "🚀 Try Postinger Free (Social Management)",
      url: "https://postinger.app",
      badge: "HOT",
      clicks: 342,
    },
    {
      id: "2",
      title: "📺 Watch: Three.js 3D Constellation Tutorial",
      url: "https://youtube.com",
      badge: "NEW",
      clicks: 189,
    },
    {
      id: "3",
      title: "📝 Read: The Redis & BullMQ Idempotency Guide",
      url: "https://medium.com",
      clicks: 512,
    },
    {
      id: "4",
      title: "☕ Buy Me a Coffee / Sponsor Open Source",
      url: "https://buymeacoffee.com",
      clicks: 94,
    },
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newBadge, setNewBadge] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [appHost, setAppHost] = useState("localhost:3000");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setAppHost(window.location.host);
    }
  }, []);

  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/p/${handle}` : `http://localhost:3000/p/${handle}`;

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(publicUrl);
    }
    setCopied(true);
    toast.success(`Copied! ${publicUrl}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    const link: BioLink = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      url: newUrl.trim().startsWith("http") ? newUrl.trim() : `https://${newUrl.trim()}`,
      badge: newBadge.trim() || undefined,
      clicks: 0,
    };

    setLinks([...links, link]);
    setNewTitle("");
    setNewUrl("");
    setNewBadge("");
    setShowAddModal(false);
    toast.success("New link added to your Start Page!");
  };

  const handleDeleteLink = (id: string) => {
    setLinks(links.filter((l) => l.id !== id));
    toast.success("Link removed");
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSavePage = async () => {
    setIsSaving(true);
    try {
      // Find workspace
      const wsRes = await fetch("/api/workspaces");
      const wsJson = await wsRes.json();
      const workspaceId = wsJson.data?.[0]?.id;
      if (!workspaceId) throw new Error("No active workspace found");

      const res = await fetch("/api/start-page", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          handle,
          title: name,
          bio,
          avatarUrl: avatar,
          theme,
          isPublished: true,
          blocks: links.map((l, idx) => ({
            type: "link",
            title: l.title,
            url: l.url,
            order: idx,
            isActive: true,
          })),
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to save");
      toast.success("Start Page saved and published!");
    } catch (err: any) {
      toast.error("Save failed", err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-6xl space-y-6">
      <PageHeader
        title="Postinger Start Page — Link-in-Bio"
        description="Create and publish a responsive, branded link-in-bio website for your Instagram, TikTok, and Twitter profiles in seconds"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={handleSavePage}
              disabled={isSaving}
              className="btn-buffer-lime px-3.5 py-1.5 text-xs font-extrabold shadow-sm hover:shadow"
            >
              {isSaving ? "Saving..." : "Save & Publish"}
            </button>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-xs font-semibold hover:bg-zinc-50 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy URL"}
            </button>
            <Link
              href={`/p/${handle}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold transition-all shadow-md"
            >
              <Eye className="w-3.5 h-3.5 text-[#C4F279]" />
              Live Preview
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Editor controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-zinc-900 border-b border-zinc-100 pb-2">
              Profile & Branding
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  Unique Handle
                </label>
                <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5">
                  <span className="text-xs text-zinc-400 font-mono">{appHost}/p/</span>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="flex-1 text-xs bg-transparent text-zinc-900 font-mono focus:outline-none ml-1"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Bio Description
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              />
            </div>

            {/* Theme Picker */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-2">
                Color Palette & Theme
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { key: "MINIMAL", label: "Studio Clean", style: "bg-white border-zinc-300 text-zinc-900" },
                  { key: "MIDNIGHT", label: "Midnight", style: "bg-zinc-900 border-zinc-800 text-white" },
                  { key: "SUNSET", label: "Sunset", style: "bg-gradient-to-r from-orange-400 to-pink-500 border-transparent text-white" },
                  { key: "COBALT", label: "Cobalt", style: "bg-blue-600 border-blue-500 text-white" },
                ].map((th) => (
                  <button
                    key={th.key}
                    type="button"
                    onClick={() => setTheme(th.key as any)}
                    className={`p-2.5 rounded-xl border text-[11px] font-bold text-center transition-all ${th.style} ${
                      theme === th.key ? "ring-2 ring-offset-2 ring-blue-600 scale-[1.02]" : "opacity-80"
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Links Management */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <div>
                <h3 className="font-bold text-sm text-zinc-900">Custom Links ({links.length})</h3>
                <p className="text-[11px] text-zinc-400">Buttons displayed on your public page</p>
              </div>

              <Button
                size="sm"
                variant="primary"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Link
              </Button>
            </div>

            <div className="space-y-2.5">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-white hover:border-zinc-300 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <LinkIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-zinc-900 truncate">
                          {link.title}
                        </span>
                        {link.badge && (
                          <span className="text-[9px] font-bold text-white bg-blue-600 px-1.5 py-0.5 rounded-md">
                            {link.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono truncate block">
                        {link.url}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {link.clicks} clicks
                    </span>
                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-opacity p-1"
                      title="Remove Link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Simulated Smartphone Frame (Buffer Style) */}
        <div className="lg:col-span-5 flex justify-center sticky top-20">
          <div className="w-[300px] sm:w-[320px] rounded-[42px] border-[8px] border-zinc-900 bg-zinc-900 p-3 shadow-2xl shadow-zinc-900/30">
            {/* Phone speaker notch */}
            <div className="w-24 h-4 bg-zinc-900 rounded-b-xl mx-auto -mt-3 mb-2 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-zinc-800" />
            </div>

            {/* Screen Content Container */}
            <div
              className={`rounded-[32px] p-5 min-h-[520px] flex flex-col justify-between transition-all duration-300 ${
                theme === "MINIMAL"
                  ? "bg-[#FAFAF9] text-zinc-900"
                  : theme === "MIDNIGHT"
                  ? "bg-[#090A0E] text-white"
                  : theme === "SUNSET"
                  ? "bg-gradient-to-b from-orange-500 via-pink-500 to-purple-600 text-white"
                  : "bg-blue-600 text-white"
              }`}
            >
              <div>
                {/* Avatar & Header */}
                <div className="text-center mb-5">
                  <img
                    src={avatar}
                    alt={name}
                    className="w-16 h-16 rounded-full object-cover mx-auto mb-2.5 border-2 border-white/60 shadow-md"
                  />
                  <h4 className="font-extrabold text-sm">{name}</h4>
                  <p className="text-[10px] font-mono opacity-60">@{handle}</p>
                  <p className="text-xs mt-2 px-2 leading-relaxed opacity-85">
                    {bio}
                  </p>
                </div>

                {/* Social icons row */}
                <div className="flex items-center justify-center gap-3 mb-5">
                  <div className="p-1.5 rounded-full bg-black/10 hover:bg-black/20 cursor-pointer">
                    <TwitterXIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-1.5 rounded-full bg-black/10 hover:bg-black/20 cursor-pointer">
                    <LinkedInIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-1.5 rounded-full bg-black/10 hover:bg-black/20 cursor-pointer">
                    <InstagramIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-1.5 rounded-full bg-black/10 hover:bg-black/20 cursor-pointer">
                    <TikTokIcon className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Custom Links List */}
                <div className="space-y-2.5">
                  {links.map((l) => (
                    <a
                      key={l.id}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block w-full py-2.5 px-3 rounded-2xl text-xs font-bold text-center transition-transform hover:scale-[1.02] shadow-sm relative ${
                        theme === "MINIMAL"
                          ? "bg-white text-zinc-900 border border-zinc-200"
                          : "bg-white/20 backdrop-blur-md text-white border border-white/30"
                      }`}
                    >
                      {l.title}
                      {l.badge && (
                        <span className="absolute -top-1.5 -right-1 text-[8px] font-extrabold bg-red-500 text-white px-1.5 py-0.2 rounded-full uppercase shadow-xs">
                          {l.badge}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              </div>

              {/* Phone Footer Branding */}
              <div className="text-center pt-4 opacity-50 text-[10px]">
                Powered by <strong>Postinger</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Link Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-bold text-base text-zinc-900 mb-1">
              Add a New Link
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Enter the title and destination URL for your link-in-bio button.
            </p>

            <form onSubmit={handleAddLink} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  Link Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. 🎧 Listen to our latest podcast episode"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  Destination URL
                </label>
                <input
                  type="text"
                  placeholder="https://spotify.com/..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  Badge Tag (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. NEW or 20% OFF"
                  value={newBadge}
                  onChange={(e) => setNewBadge(e.target.value)}
                  className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Add to Page
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
