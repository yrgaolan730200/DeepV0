"use client";

import { File, Folder, FolderOpen, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";

// P0: mock file tree
interface FileTreeItemData {
  name: string;
  type: "file" | "folder";
  active?: boolean;
  children?: FileTreeItemData[];
}

const MOCK_FILES: FileTreeItemData[] = [
  {
    name: "app",
    type: "folder",
    children: [
      { name: "globals.css", type: "file" },
      { name: "layout.tsx", type: "file" },
      { name: "page.tsx", type: "file", active: true },
    ],
  },
  {
    name: "components",
    type: "folder",
    children: [
      { name: "ui", type: "folder", children: [
        { name: "button.tsx", type: "file" },
        { name: "card.tsx", type: "file" },
        { name: "badge.tsx", type: "file" },
        { name: "input.tsx", type: "file" },
      ]},
    ],
  },
  {
    name: "lib",
    type: "folder",
    children: [
      { name: "utils.ts", type: "file" },
    ],
  },
];

function FileTreeItem({ item, depth = 0 }: { item: FileTreeItemData; depth?: number }) {
  const [expanded, setExpanded] = useState(true);

  if (item.type === "folder" && item.children) {
    return (
      <div>
        <button
          className={`flex w-full items-center gap-1 py-1 pr-2 text-xs hover:bg-zinc-800/50 rounded`}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <ChevronDown className="h-3 w-3 text-zinc-500 shrink-0" />
          ) : (
            <ChevronRight className="h-3 w-3 text-zinc-500 shrink-0" />
          )}
          {expanded ? (
            <FolderOpen className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          ) : (
            <Folder className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          )}
          <span className="text-zinc-300">{item.name}</span>
        </button>
        {expanded && item.children.map((child, i) => (
          <FileTreeItem key={i} item={child} depth={depth + 1} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-1 py-1 pr-2 text-xs rounded cursor-pointer hover:bg-zinc-800/50 ${
        "active" in item && item.active ? "bg-zinc-800 text-zinc-100" : "text-zinc-400"
      }`}
      style={{ paddingLeft: `${8 + depth * 16 + 16}px` }}
    >
      <File className="h-3.5 w-3.5 shrink-0" />
      <span>{item.name}</span>
    </div>
  );
}

export function FileExplorer() {
  return (
    <div className="flex flex-col border-b border-zinc-800">
      <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2">
        <Folder className="h-4 w-4 text-zinc-400" />
        <span className="text-xs font-medium text-zinc-300">Files</span>
        <span className="ml-auto text-xs text-zinc-600">proj_mock</span>
      </div>
      <div className="py-1">
        {MOCK_FILES.map((item, i) => (
          <FileTreeItem key={i} item={item} />
        ))}
      </div>
    </div>
  );
}
