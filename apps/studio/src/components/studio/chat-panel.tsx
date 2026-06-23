"use client";

import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

// P0: mock messages — static placeholder content
const MOCK_MESSAGES = [
  { role: "assistant", content: "👋 Hi! I'm vSeek. Describe the UI you want me to build. I'll generate clean shadcn/ui + Tailwind code for you." },
  { role: "user", content: "Build me a pricing page with 3 tiers — Free, Pro ($10/mo), and Enterprise ($30/mo)." },
  { role: "assistant", content: "I've generated a 3-tier pricing page with:\n\n- **Free**: Basic features, no credit card\n- **Pro**: Advanced analytics, priority support\n- **Enterprise**: SSO, custom integrations, SLA\n\nCheck the Preview panel →" },
];

export function ChatPanel() {
  return (
    <aside className="flex w-80 flex-col border-r border-zinc-800 bg-zinc-950 shrink-0">
      <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
        <Bot className="h-4 w-4 text-zinc-400" />
        <span className="text-sm font-medium text-zinc-200">Chat</span>
        <span className="ml-auto text-xs text-zinc-600">P0 mock</span>
      </div>

      <ScrollArea className="flex-1 px-4 py-4">
        <div className="flex flex-col gap-4">
          {MOCK_MESSAGES.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  msg.role === "assistant"
                    ? "bg-zinc-700 text-zinc-200"
                    : "bg-zinc-600 text-zinc-200"
                }`}
              >
                {msg.role === "assistant" ? (
                  <Bot className="h-3.5 w-3.5" />
                ) : (
                  <User className="h-3.5 w-3.5" />
                )}
              </div>
              <div
                className={`rounded-lg px-3 py-2 text-sm leading-relaxed max-w-[240px] ${
                  msg.role === "assistant"
                    ? "bg-zinc-800/60 text-zinc-200"
                    : "bg-zinc-700/50 text-zinc-100"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t border-zinc-800 p-3">
        <div className="flex gap-2">
          <Input
            placeholder="Describe your UI..."
            className="h-9 bg-zinc-800 border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-500"
            disabled
          />
          <Button size="icon" variant="outline" className="h-9 w-9 shrink-0 border-zinc-700" disabled>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-center text-xs text-zinc-600">
          DeepSeek generation — P1
        </p>
      </div>
    </aside>
  );
}
