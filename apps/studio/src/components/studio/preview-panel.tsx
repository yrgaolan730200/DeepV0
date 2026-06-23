"use client";

import { Monitor, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// P0: mock preview — shows a placeholder iframe
export function PreviewPanel() {
  return (
    <aside className="flex w-1/2 flex-col border-l border-zinc-800 bg-zinc-950 min-w-0">
      <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-2">
        <Monitor className="h-4 w-4 text-zinc-400" />
        <span className="text-xs font-medium text-zinc-300">Preview</span>
        <span className="ml-auto text-xs text-zinc-600">P0 mock</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-zinc-500 hover:text-zinc-300"
          disabled
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="flex-1 flex items-center justify-center bg-zinc-900/50">
        <div className="text-center space-y-3">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800/50 border border-zinc-700/50">
            <Monitor className="h-8 w-8 text-zinc-500" />
          </div>
          <div>
            <p className="text-zinc-400 text-sm font-medium">Preview Unavailable</p>
            <p className="text-zinc-600 text-xs mt-1 max-w-[280px]">
              Live preview will be available in P2 when the sandbox rendering engine is implemented.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
