"use client";

import { useState, useMemo } from "react";
import { File, Folder, FolderOpen, ChevronRight, ChevronDown } from "lucide-react";
import type { GeneratedFile } from "@/lib/api";

interface FileExplorerProps {
  files: GeneratedFile[];
  projectName: string | null;
  activeFilePath: string | null;
  onSelectFile: (path: string) => void;
}

interface FileTreeNode {
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileTreeNode[];
}

function buildFileTree(files: GeneratedFile[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];

  for (const file of files) {
    const parts = file.path.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!;
      const isLast = i === parts.length - 1;

      if (isLast) {
        current.push({
          name: part,
          type: "file",
          path: file.path,
        });
      } else {
        let folder = current.find((n) => n.name === part && n.type === "folder") as
          | FileTreeNode
          | undefined;
        if (!folder) {
          folder = {
            name: part,
            type: "folder",
            path: parts.slice(0, i + 1).join("/") + "/",
            children: [],
          };
          current.push(folder);
        }
        current = folder.children!;
      }
    }
  }

  return root;
}

function sortNodes(nodes: FileTreeNode[]): FileTreeNode[] {
  return [...nodes].sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

function FileTreeItem({
  node,
  depth,
  activeFilePath,
  onSelectFile,
}: {
  node: FileTreeNode;
  depth: number;
  activeFilePath: string | null;
  onSelectFile: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  if (node.type === "folder" && node.children) {
    const sorted = sortNodes(node.children);
    return (
      <div>
        <button
          className="flex w-full items-center gap-1 py-1 pr-2 text-xs hover:bg-zinc-800/50 rounded"
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
          <span className="text-zinc-300">{node.name}</span>
        </button>
        {expanded &&
          sorted.map((child) => (
            <FileTreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              activeFilePath={activeFilePath}
              onSelectFile={onSelectFile}
            />
          ))}
      </div>
    );
  }

  return (
    <button
      className={`flex w-full items-center gap-1 py-1 pr-2 text-xs rounded cursor-pointer hover:bg-zinc-800/50 text-left ${
        activeFilePath === node.path ? "bg-zinc-800 text-zinc-100" : "text-zinc-400"
      }`}
      style={{ paddingLeft: `${8 + depth * 16 + 16}px` }}
      onClick={() => onSelectFile(node.path)}
    >
      <File className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{node.name}</span>
    </button>
  );
}

export function FileExplorer({
  files,
  projectName,
  activeFilePath,
  onSelectFile,
}: FileExplorerProps) {
  const tree = useMemo(() => sortNodes(buildFileTree(files)), [files]);

  return (
    <div className="flex flex-col border-b border-zinc-800">
      <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2">
        <Folder className="h-4 w-4 text-zinc-400" />
        <span className="text-xs font-medium text-zinc-300">Files</span>
        {projectName && (
          <span className="text-xs text-zinc-600">· {projectName}</span>
        )}
        <span className="ml-auto text-xs text-zinc-600">
          {files.length > 0 ? `${files.length} files` : "empty"}
        </span>
      </div>
      <div className="py-1">
        {tree.length > 0 ? (
          tree.map((node) => (
            <FileTreeItem
              key={node.path}
              node={node}
              depth={0}
              activeFilePath={activeFilePath}
              onSelectFile={onSelectFile}
            />
          ))
        ) : (
          <p className="px-4 py-3 text-xs text-zinc-600">
            {files.length === 0
              ? "No files yet — generate a project from the Chat panel"
              : "Loading..."}
          </p>
        )}
      </div>
    </div>
  );
}
