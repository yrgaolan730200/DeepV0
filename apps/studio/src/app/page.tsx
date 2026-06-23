import { HeaderBar } from "@/components/studio/header-bar";
import { ChatPanel } from "@/components/studio/chat-panel";
import { FileExplorer } from "@/components/studio/file-explorer";
import { CodeEditor } from "@/components/studio/code-editor";
import { PreviewPanel } from "@/components/studio/preview-panel";
import { BuildLogPanel } from "@/components/studio/build-log-panel";

export default function StudioPage() {
  return (
    <div className="flex h-full flex-col">
      {/* Top: Header bar with server status */}
      <HeaderBar />

      {/* Middle: 3-column workspace */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: Chat panel (fixed width) */}
        <ChatPanel />

        {/* Center: File explorer + Code editor (flex-1) */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden border-r border-zinc-800">
          <FileExplorer />
          <CodeEditor />
        </div>

        {/* Right: Preview panel */}
        <PreviewPanel />
      </div>

      {/* Bottom: Build log (collapsible) */}
      <BuildLogPanel />
    </div>
  );
}
