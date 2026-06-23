"use client";

import { useState, useCallback } from "react";
import { HeaderBar } from "@/components/studio/header-bar";
import { ChatPanel } from "@/components/studio/chat-panel";
import { FileExplorer } from "@/components/studio/file-explorer";
import { CodeEditor } from "@/components/studio/code-editor";
import { PreviewPanel } from "@/components/studio/preview-panel";
import { BuildLogPanel } from "@/components/studio/build-log-panel";
import { generateProject, type GeneratedFile } from "@/lib/api";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface BuildLogEntry {
  type: "success" | "info" | "warning" | "error";
  message: string;
}

export default function StudioPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [activeFileContent, setActiveFileContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [buildLog, setBuildLog] = useState<BuildLogEntry[]>([]);

  const handleSend = useCallback(
    async (prompt: string) => {
      // Add user message immediately
      const userMsg: ChatMessage = { role: "user", content: prompt };
      setChatMessages((prev) => [...prev, userMsg]);
      setIsGenerating(true);
      setBuildLog((prev) => [...prev, { type: "info", message: `Generating: "${prompt.slice(0, 80)}${prompt.length > 80 ? "..." : ""}"` }]);

      try {
        const result = await generateProject(prompt);

        // Success
        setProjectId(result.projectId);
        setProjectName(result.projectName);
        setFiles(result.files);

        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: `Generated "${result.projectName}" — ${result.files.length} files ready.`,
        };
        setChatMessages((prev) => [...prev, assistantMsg]);

        setBuildLog((prev) => [
          ...prev,
          { type: "success", message: `Project "${result.projectName}" (${result.projectId}) generated with ${result.files.length} files` },
          { type: "info", message: `Dependencies: ${result.dependencies.join(", ")}` },
          { type: "info", message: `DevDependencies: ${result.devDependencies.join(", ")}` },
        ]);

        // Auto-select the main page
        const mainPage = result.files.find((f) => f.path === "src/app/page.tsx");
        if (mainPage) {
          setActiveFilePath(mainPage.path);
          setActiveFileContent(mainPage.content);
        } else if (result.files.length > 0) {
          setActiveFilePath(result.files[0].path);
          setActiveFileContent(result.files[0].content);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        const errorMsg: ChatMessage = {
          role: "assistant",
          content: `❌ ${message}`,
        };
        setChatMessages((prev) => [...prev, errorMsg]);
        setBuildLog((prev) => [...prev, { type: "error", message }]);
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  const handleSelectFile = useCallback(
    (filePath: string) => {
      setActiveFilePath(filePath);
      const file = files.find((f) => f.path === filePath);
      setActiveFileContent(file?.content ?? null);
    },
    [files]
  );

  return (
    <div className="flex h-full flex-col">
      <HeaderBar />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <ChatPanel
          messages={chatMessages}
          isGenerating={isGenerating}
          onSend={handleSend}
        />

        <div className="flex flex-1 flex-col min-w-0 overflow-hidden border-r border-zinc-800">
          <FileExplorer
            files={files}
            projectName={projectName}
            activeFilePath={activeFilePath}
            onSelectFile={handleSelectFile}
          />
          <CodeEditor
            filePath={activeFilePath}
            content={activeFileContent}
          />
        </div>

        <PreviewPanel />
      </div>

      <BuildLogPanel entries={buildLog} />
    </div>
  );
}
