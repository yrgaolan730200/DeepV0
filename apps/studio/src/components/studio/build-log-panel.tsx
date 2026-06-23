"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, CheckCircle, Info, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BuildLogEntry {
  type: "success" | "info" | "warning" | "error";
  message: string;
}

interface BuildLogPanelProps {
  entries?: BuildLogEntry[];
}

const iconMap = {
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
};

const colorMap = {
  success: "text-emerald-400",
  info: "text-blue-400",
  warning: "text-amber-400",
  error: "text-red-400",
};

const PLACEHOLDER_ENTRIES: BuildLogEntry[] = [
  { type: "success" as const, message: "TypeScript compilation: no errors" },
  { type: "info" as const, message: "Ready. Type a prompt in the Chat panel to generate a project." },
];

export function BuildLogPanel({ entries }: BuildLogPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const displayEntries = entries && entries.length > 0 ? entries : PLACEHOLDER_ENTRIES;

  return (
    <div className="border-t border-zinc-800 bg-zinc-950 shrink-0">
      <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-1.5">
        <span className="text-xs font-medium text-zinc-300">Build Log</span>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto h-5 w-5 text-zinc-500 hover:text-zinc-300"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
      {!collapsed && (
        <div className="overflow-y-auto px-4 py-2 h-12">
          {displayEntries.slice(-5).map((entry, i) => {
            const Icon = iconMap[entry.type];
            return (
              <div key={i} className="flex items-center gap-2 py-0.5">
                <Icon className={`h-3.5 w-3.5 shrink-0 ${colorMap[entry.type]}`} />
                <span className="text-xs text-zinc-400 font-mono">{entry.message}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
