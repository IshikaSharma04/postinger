"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { HelpModal } from "@/components/layout/HelpModal";
import { HelpCircle } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="flex h-screen bg-[#F9F9FB] overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pl-64 transition-all duration-200">
        <div className="max-w-6xl mx-auto px-6 py-7">{children}</div>
      </main>

      {/* Floating Circular Help Button (Bottom Right) */}
      <button
        onClick={() => setShowHelp(true)}
        title="Help & Support (Search guides, shortcuts, contact)"
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-zinc-900 text-white shadow-xl hover:bg-black hover:scale-105 transition-all flex items-center justify-center border-2 border-white/20"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}
