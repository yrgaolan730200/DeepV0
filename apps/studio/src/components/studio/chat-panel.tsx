"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  isGenerating: boolean;
  onSend: (prompt: string) => void;
}

const PLACEHOLDER_MESSAGES: ChatMessage[] = [
  {
    role: "assistant",
    content: "👋 Hi! I'm vSeek. Describe the UI you want, and I'll generate a Next.js + shadcn/ui project for you.",
  },
];

export function ChatPanel({ messages, isGenerating, onSend }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const displayMessages = messages.length > 0 ? messages : PLACEHOLDER_MESSAGES;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayMessages, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isGenerating) return;
    onSend(trimmed);
    setInput("");
  };

  return (
    <aside className="flex w-80 flex-col border-r border-zinc-800 bg-zinc-950 shrink-0">
      <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
        <Bot className="h-4 w-4 text-zinc-400" />
        <span className="text-sm font-medium text-zinc-200">Chat</span>
        {isGenerating && (
          <span className="ml-auto flex items-center gap-1 text-xs text-amber-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            Generating...
          </span>
        )}
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 py-4"
        ref={scrollRef}
      >
        <div className="flex flex-col gap-4">
          {displayMessages.map((msg, i) => (
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
                className={`rounded-lg px-3 py-2 text-sm leading-relaxed max-w-[240px] whitespace-pre-wrap ${
                  msg.role === "assistant"
                    ? "bg-zinc-800/60 text-zinc-200"
                    : "bg-zinc-700/50 text-zinc-100"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isGenerating && (
            <div className="flex items-center gap-2 px-2 py-1">
              <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
              <span className="text-xs text-zinc-500">Calling DeepSeek...</span>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-zinc-800 p-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your UI..."
            className="h-9 bg-zinc-800 border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-500"
            disabled={isGenerating}
          />
          <Button
            size="icon"
            variant="outline"
            className="h-9 w-9 shrink-0 border-zinc-700"
            disabled={isGenerating || !input.trim()}
            type="submit"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </aside>
  );
}
