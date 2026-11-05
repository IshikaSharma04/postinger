"use client";

import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { SocialAccountItem, PLATFORMS } from "./types";

interface SocialAccountCardProps {
  acc: SocialAccountItem;
  onDisconnect: (id: string, handle: string) => void;
  isDisconnecting: boolean;
}

export function SocialAccountCard({
  acc,
  onDisconnect,
  isDisconnecting,
}: SocialAccountCardProps) {
  const platform = PLATFORMS.find((p) => p.value === acc.platform);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-gray-300 hover:shadow-xs transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-xs"
              style={{ backgroundColor: platform?.color ?? "#121212" }}
            >
              {platform?.icon ?? "?"}
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900">@{acc.handle}</p>
              <p className="text-xs text-zinc-400 font-medium">{platform?.label ?? acc.platform}</p>
            </div>
          </div>
          <Badge variant={acc.isConnected ? "success" : "error"} dot>
            {acc.isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Badge variant="default" size="sm">
            Simulated
          </Badge>
          <span className="text-[11px] text-zinc-400 truncate">
            Publishing is simulated — no real OAuth token stored
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
        <span className="text-[11px] text-zinc-400 font-mono">
          ID: {acc.id.slice(0, 8)}…
        </span>
        <button
          onClick={() => onDisconnect(acc.id, acc.handle)}
          disabled={isDisconnecting}
          className="text-xs font-semibold text-zinc-400 hover:text-red-600 transition-colors flex items-center gap-1 p-1"
          title="Disconnect account"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Disconnect
        </button>
      </div>
    </div>
  );
}
