"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Lightbulb,
  Clock,
  MessageSquare,
  BarChart2,
  Plus,
  Settings,
  ChevronDown,
  LogOut,
  Sprout,
  Users,
  Key,
  CreditCard,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  ExternalLink,
  PenSquare,
  Smartphone,
  ChevronRight,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils/helpers";
import { PostingerLogo } from "@/components/brand/PostingerLogo";
import { ConnectChannelModal } from "@/components/channels/ConnectChannelModal";

interface SocialAccountItem {
  id: string;
  platform: string;
  handle: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  needsReconnect?: boolean;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNewDropdown, setShowNewDropdown] = useState(false);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [dismissProgressCard, setDismissProgressCard] = useState(false);

  const [workspace, setWorkspace] = useState<{ id: string; name: string; slug: string; plan?: string } | null>(null);
  const [accounts, setAccounts] = useState<SocialAccountItem[]>([]);
  const [scheduledCount, setScheduledCount] = useState(0);

  // Rehydrate collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("postinger_sidebar_collapsed");
    if (saved === "true") setIsCollapsed(true);
    const cardDismissed = localStorage.getItem("postinger_channel_card_dismissed");
    if (cardDismissed === "true") setDismissProgressCard(true);
  }, []);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("postinger_sidebar_collapsed", String(next));
  };

  // Fetch workspace and connected channels
  useEffect(() => {
    async function loadData() {
      try {
        const wsRes = await fetch("/api/workspaces");
        const wsJson = await wsRes.json();
        if (wsJson.success && wsJson.data?.[0]) {
          const ws = wsJson.data[0];
          setWorkspace(ws);

          // Fetch accounts
          const accRes = await fetch(`/api/accounts?workspaceId=${ws.id}`);
          const accJson = await accRes.json();
          if (accJson.success && Array.isArray(accJson.data)) {
            setAccounts(accJson.data);
          }

          // Fetch scheduled posts count
          const postsRes = await fetch(`/api/posts?workspaceId=${ws.id}&status=SCHEDULED&limit=1`);
          const postsJson = await postsRes.json();
          if (postsJson.success) {
            setScheduledCount(postsJson.data?.total ?? 0);
          }
        }
      } catch (err) {
        console.error("Failed to load sidebar workspace data", err);
      }
    }
    loadData();
  }, [pathname]);

  const navItems = [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/ideas", label: "Create", icon: Lightbulb },
    { href: "/queue", label: "Publish", icon: Clock, count: scheduledCount },
    { href: "/community", label: "Community", icon: MessageSquare },
    { href: "/history", label: "Insights", icon: BarChart2 },
  ];

  const channelLimit = 3;
  const connectedCount = accounts.length;

  return (
    <>
      <aside
        className={cn(
          "flex flex-col h-screen bg-[#111317] text-white flex-shrink-0 fixed left-0 top-0 z-30 transition-all duration-200 border-r border-white/5 font-sans select-none",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Top Header: Logo + Plant Icon */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/5 flex-shrink-0">
          {!isCollapsed ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-2">
                <PostingerLogo size="sm" light />
              </Link>
              <Link
                href="/guide"
                title="Product Guide & Docs"
                className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 flex items-center justify-center transition-colors"
              >
                <Sprout className="w-4 h-4" />
              </Link>
            </>
          ) : (
            <div className="w-full flex justify-center">
              <Link href="/dashboard">
                <PostingerLogo size="sm" light showWordmark={false} />
              </Link>
            </div>
          )}
        </div>

        {/* Primary Action Button: Large Green + New */}
        <div className="p-3 flex-shrink-0 relative">
          <div className="relative">
            <button
              onClick={() => setShowNewDropdown(!showNewDropdown)}
              className={cn(
                "w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2",
                isCollapsed ? "h-11 w-11 mx-auto" : "py-3 px-4 text-sm"
              )}
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              {!isCollapsed && <span>New</span>}
              {!isCollapsed && <ChevronDown className="w-4 h-4 opacity-75 ml-auto" />}
            </button>

            {/* Dropdown Menu */}
            {showNewDropdown && (
              <div
                className="absolute left-0 mt-2 w-52 bg-[#1C1F26] border border-white/10 rounded-2xl shadow-2xl p-1.5 z-50 text-xs font-semibold animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowNewDropdown(false)}
              >
                <Link
                  href="/compose"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/5 transition-colors text-white"
                >
                  <PenSquare className="w-4 h-4 text-emerald-400" />
                  <span>New Post</span>
                </Link>
                <Link
                  href="/ideas"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/5 transition-colors text-white"
                >
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>New Idea</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-2 space-y-1 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative group",
                  isActive
                    ? "bg-white/10 text-white font-bold"
                    : "text-zinc-400 hover:text-white hover:bg-white/5",
                  isCollapsed && "justify-center px-0"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-emerald-500" />
                )}
                <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-emerald-400" : "text-current")} />
                {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
                {!isCollapsed && item.count !== undefined && item.count > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-white/10 text-zinc-300">
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Connect Channels Section */}
        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2 border-t border-white/5 mt-2">
            <div className="flex items-center justify-between px-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              <span>Channels</span>
              <div className="flex items-center gap-1">
                <Link
                  href="/accounts"
                  title="Channel settings"
                  className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => setShowConnectModal(true)}
                  title="Connect channel"
                  className="p-1 rounded-md text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Channels List */}
            <div className="space-y-1">
              {accounts.map((acc) => (
                <Link
                  key={acc.id}
                  href={`/queue?channel=${acc.id}`}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 text-zinc-300 hover:text-white text-xs transition-colors group"
                >
                  <div className="w-6 h-6 rounded-lg bg-zinc-800 text-[10px] font-bold flex items-center justify-center text-white flex-shrink-0 relative">
                    {acc.platform.slice(0, 1)}
                    {acc.needsReconnect && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 absolute -top-0.5 -right-0.5 ring-2 ring-[#111317]" />
                    )}
                  </div>
                  <span className="truncate flex-1 font-medium">@{acc.handle}</span>
                  <span className="text-[9px] px-1 rounded bg-white/5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Queue
                  </span>
                </Link>
              ))}

              {/* + Tile */}
              <button
                onClick={() => setShowConnectModal(true)}
                className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-emerald-400 text-xs font-semibold transition-colors"
              >
                <div className="w-6 h-6 rounded-lg border border-dashed border-zinc-700 flex items-center justify-center text-zinc-400">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <span>Connect channel</span>
              </button>
            </div>
          </div>
        )}

        {/* Progress Card (0/3 channels connected) */}
        {!isCollapsed && !dismissProgressCard && connectedCount < channelLimit && (
          <div className="p-3 mx-3 mb-2 rounded-2xl bg-white/5 border border-white/5 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-[11px]">
                {connectedCount}/{channelLimit} channels connected
              </span>
              <button
                onClick={() => {
                  setDismissProgressCard(true);
                  localStorage.setItem("postinger_channel_card_dismissed", "true");
                }}
                className="text-zinc-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Segmented bar */}
            <div className="grid grid-cols-3 gap-1.5 h-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-full transition-all",
                    i < connectedCount ? "bg-emerald-500" : "bg-white/10"
                  )}
                />
              ))}
            </div>

            <button
              onClick={() => setShowConnectModal(true)}
              className="text-[11px] font-bold text-emerald-400 hover:underline block pt-1"
            >
              + Connect more to fill slots
            </button>
          </div>
        )}

        {/* Bottom Org Switcher & User Profile */}
        <div className="p-3 border-t border-white/5 flex-shrink-0 relative">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setShowOrgDropdown(!showOrgDropdown)}
              className={cn(
                "flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/5 text-left transition-colors flex-1 min-w-0",
                isCollapsed && "justify-center p-0"
              )}
            >
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                {workspace?.name ? workspace.name.slice(0, 1).toUpperCase() : "P"}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate leading-none mb-1">
                    {workspace?.name || "My Organization"}
                  </div>
                  <div className="text-[10px] text-zinc-400 flex items-center gap-1 font-medium">
                    <span className="px-1.5 py-0.2 rounded bg-white/10 text-[9px] font-bold text-emerald-400">
                      {workspace?.plan || "Free Plan"}
                    </span>
                  </div>
                </div>
              )}
            </button>

            {!isCollapsed && (
              <button
                onClick={toggleCollapse}
                title="Collapse sidebar"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Org Switcher Dropdown */}
          {showOrgDropdown && (
            <div
              className="absolute bottom-16 left-3 w-56 bg-[#1C1F26] border border-white/10 rounded-2xl shadow-2xl p-1.5 z-50 text-xs font-semibold animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setShowOrgDropdown(false)}
            >
              <div className="px-3 py-2 border-b border-white/5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Organization & Account
              </div>
              <Link
                href="/settings/profile"
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 text-zinc-300 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4 text-zinc-400" />
                <span>Account Settings</span>
              </Link>
              <Link
                href="/settings/billing"
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 text-zinc-300 hover:text-white transition-colors"
              >
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Plans & Billing</span>
              </Link>
              <Link
                href="/team"
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 text-zinc-300 hover:text-white transition-colors"
              >
                <Users className="w-4 h-4 text-blue-400" />
                <span>Team & Roles</span>
              </Link>
              <Link
                href="/settings/api-keys"
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 text-zinc-300 hover:text-white transition-colors"
              >
                <Key className="w-4 h-4 text-amber-400" />
                <span>API Keys & MCP</span>
              </Link>
              <div className="border-t border-white/5 my-1" />
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>

        {/* Collapsed expand button */}
        {isCollapsed && (
          <div className="p-3 border-t border-white/5 flex justify-center">
            <button
              onClick={toggleCollapse}
              title="Expand sidebar"
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>

      {/* Floating Modals & Drawers */}
      <ConnectChannelModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        workspaceId={workspace?.id || ""}
      />

    </>
  );
}
