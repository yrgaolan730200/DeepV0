"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, CheckCircle, Info, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// P0: mock build log entries
const MOCK_LOGS = [
  { type: "success" as const, message: "TypeScript compilation: no errors (tsc --noEmit)" },
  { type: "info" as const, message: "3 files generated in project proj_mock" },
  { type: "info" as const, message: "Output written to workspaces/proj_mock/current/" },
];

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

export function BuildLogPanel() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="border-t border-zinc-800 bg-zinc-950 shrink-0">
      <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-1.5">
        <span className="text-xs font-medium text-zinc-300">Build Log</span>
        <span className="text-xs text-zinc-600">P0 mock</span>
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
        <div className={`overflow-y-auto px-4 py-2 ${collapsed ? "h-0" : "h-12"}`}>
          {MOCK_LOGS.map((entry, i) => {
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
