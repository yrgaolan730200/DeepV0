"use client";

import { Code, File as FileIcon } from "lucide-react";

interface CodeEditorProps {
  filePath: string | null;
  content: string | null;
}

export function CodeEditor({ filePath, content }: CodeEditorProps) {
  if (!filePath || content === null) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2">
          <Code className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-medium text-zinc-300">Editor</span>
        </div>
        <div className="flex-1 flex items-center justify-center bg-zinc-950">
          <div className="text-center space-y-2">
            <FileIcon className="h-8 w-8 text-zinc-600 mx-auto" />
            <p className="text-sm text-zinc-500">Select a file to view its content</p>
            <p className="text-xs text-zinc-600">Generated files appear in the explorer above</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2">
        <Code className="h-4 w-4 text-zinc-400" />
        <span className="text-xs font-medium text-zinc-300">Editor</span>
        <span className="text-xs text-zinc-500 ml-2 font-mono">{filePath}</span>
        <span className="ml-auto text-xs text-zinc-600">
          {content.split("\n").length} lines
        </span>
      </div>
      <div className="flex-1 overflow-auto bg-zinc-950 p-4">
        <pre className="text-xs font-mono text-zinc-300 leading-relaxed whitespace-pre">
          <code>{content}</code>
        </pre>
      </div>
    </div>
  );
}
