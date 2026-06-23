"use client";

import { useServerHealth } from "@/hooks/use-server-health";
import { Activity, Server } from "lucide-react";

export function HeaderBar() {
  const { status, health } = useServerHealth();

  const statusConfig = {
    connected: {
      dot: "bg-emerald-400",
      text: "Connected to server",
      textColor: "text-emerald-400",
      pulse: "shadow-emerald-400/50",
    },
    disconnected: {
      dot: "bg-red-400",
      text: "Server disconnected",
      textColor: "text-red-400",
      pulse: "shadow-red-400/50",
    },
    checking: {
      dot: "bg-amber-400 animate-pulse",
      text: "Checking...",
      textColor: "text-amber-400",
      pulse: "shadow-amber-400/50",
    },
  };

  const cfg = statusConfig[status];

  return (
    <header className="flex h-12 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-zinc-400" />
          <span className="font-semibold text-sm text-zinc-100">vSeek Studio</span>
        </div>
        <span className="text-zinc-700 text-xs px-1.5 py-0.5 rounded bg-zinc-800 font-mono">
          v0.1.0
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex h-2 w-2 rounded-full ${cfg.dot} shadow-[0_0_6px] ${cfg.pulse}`} />
          <span className={`text-xs ${cfg.textColor}`}>{cfg.text}</span>
          {health && (
            <span className="text-xs text-zinc-600">
              · uptime {Math.floor(health.uptime)}s
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Activity className="h-3.5 w-3.5 text-zinc-500" />
        <span className="text-xs text-zinc-500">P0 Skeleton</span>
      </div>
    </header>
  );
}
