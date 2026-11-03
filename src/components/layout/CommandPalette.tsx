"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  PenSquare,
  Clock,
  Calendar,
  Lightbulb,
  MessageSquare,
  BarChart2,
  Smartphone,
  Link2,
  Users,
  Settings,
  HelpCircle,
  PlusCircle,
  FileText,
  X,
} from "lucide-react";

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "Quick Actions" | "Settings";
  icon: any;
  href?: string;
  action?: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenConnectModal?: () => void;
}

export function CommandPalette({ isOpen, onClose, onOpenConnectModal }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const items: CommandItem[] = [
    { id: "compose", title: "New Post (Open Composer)", category: "Quick Actions", icon: PenSquare, href: "/compose" },
    { id: "connect", title: "Connect a Social Channel (Sandbox / OAuth)", category: "Quick Actions", icon: PlusCircle, action: () => { onClose(); onOpenConnectModal?.(); } },
    { id: "home", title: "Home / Overview Dashboard", category: "Navigation", icon: FileText, href: "/dashboard" },
    { id: "queue", title: "Publish Queue & Weekly Slots", category: "Navigation", icon: Clock, href: "/queue" },
    { id: "calendar", title: "Calendar (Week & Month)", category: "Navigation", icon: Calendar, href: "/calendar" },
    { id: "ideas", title: "Idea Bank (Kanban & Templates)", category: "Navigation", icon: Lightbulb, href: "/ideas" },
    { id: "community", title: "Community Inbox & Comment Score", category: "Navigation", icon: MessageSquare, href: "/community" },
    { id: "analytics", title: "Analytics, Heatmap & Takeaways", category: "Navigation", icon: BarChart2, href: "/history" },
    { id: "start-page", title: "Start Page (Link-in-bio Builder)", category: "Navigation", icon: Smartphone, href: "/start-page" },
    { id: "channels", title: "Manage Channels & Schedules", category: "Navigation", icon: Link2, href: "/accounts" },
    { id: "team", title: "Team Members & Permissions", category: "Navigation", icon: Users, href: "/team" },
    { id: "settings", title: "Account & Organization Settings", category: "Settings", icon: Settings, href: "/settings/profile" },
  ];

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Global keyboard shortcut listener for Cmd+K and Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
      if (isOpen && filtered.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filtered.length);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
        } else if (e.key === "Enter") {
          e.preventDefault();
          const selected = filtered[selectedIndex];
          if (selected) {
            handleSelect(selected);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex]);

  const handleSelect = (item: CommandItem) => {
    onClose();
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-100 font-sans">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-zinc-200 overflow-hidden flex flex-col">
        {/* Search bar */}
        <div className="p-4 border-b border-zinc-100 flex items-center gap-3">
          <Search className="w-4 h-4 text-zinc-400 flex-shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search pages (e.g. compose, queue, settings)..."
            className="flex-1 text-xs bg-transparent text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-400">No matching commands found.</div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors ${
                    isSelected ? "bg-blue-50 text-blue-900 font-semibold" : "text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isSelected ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs truncate">{item.title}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono flex-shrink-0 ml-2">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer hints */}
        <div className="p-2.5 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
          <div className="flex items-center gap-2">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>esc to dismiss</span>
          </div>
          <span>Postinger Palette</span>
        </div>
      </div>
    </div>
  );
}
