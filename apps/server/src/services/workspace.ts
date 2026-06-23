import { mkdir, writeFile, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { logger } from "../lib/logger.js";

const WORKSPACES_ROOT = path.resolve(process.cwd(), "../../workspaces");

/**
 * Validate that a path component does not attempt directory traversal.
 * Rejects: "..", ".", empty strings, and any string containing path separators.
 */
function isValidPathComponent(segment: string): boolean {
  if (!segment || segment.length === 0) return false;
  if (segment === "." || segment === "..") return false;
  if (segment.includes("/") || segment.includes("\\")) return false;
  return true;
}

/**
 * Sanitize a projectId: must be a single safe directory name.
 * Pattern: alphanumeric + underscore + hyphen, max 64 chars.
 */
export function validateProjectId(projectId: string): boolean {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(projectId) && isValidPathComponent(projectId);
}

/**
 * Sanitize a file path: each segment must be safe, no absolute paths,
 * no directory traversal.
 */
export function validateFilePath(filePath: string): boolean {
  if (!filePath || filePath.length === 0) return false;
  if (path.isAbsolute(filePath)) return false;
  // Split on both forward and backslash, check each segment
  const segments = filePath.replace(/\\/g, "/").split("/");
  return segments.every(isValidPathComponent);
}

export async function ensureWorkspaceDir(projectId: string): Promise<string> {
  if (!validateProjectId(projectId)) {
    throw new Error(`Invalid projectId: "${projectId}". Must be alphanumeric (max 64 chars).`);
  }
  const dir = path.join(WORKSPACES_ROOT, projectId, "current");
  const resolved = path.resolve(dir);
  // Safety: resolved path must still be within WORKSPACES_ROOT
  if (!resolved.startsWith(WORKSPACES_ROOT)) {
    throw new Error(`Path traversal detected: "${projectId}"`);
  }
  await mkdir(resolved, { recursive: true });
  return resolved;
}

export async function writeProjectFiles(
  projectId: string,
  files: Array<{ path: string; content: string }>
): Promise<string> {
  const baseDir = await ensureWorkspaceDir(projectId);

  for (const file of files) {
    if (!validateFilePath(file.path)) {
      throw new Error(
        `Invalid file path: "${file.path}". Directory traversal or invalid characters detected.`
      );
    }
    const filePath = path.resolve(baseDir, file.path);
    // Safety: file must be within the project workspace
    if (!filePath.startsWith(baseDir)) {
      throw new Error(`Path traversal detected in file: "${file.path}"`);
    }
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, file.content, "utf-8");
    logger.debug(`Wrote: ${filePath}`);
  }

  return baseDir;
}

export async function listProjectFiles(
  projectId: string
): Promise<Array<{ path: string; content: string }>> {
  const baseDir = path.join(WORKSPACES_ROOT, projectId, "current");
  const files: Array<{ path: string; content: string }> = [];

  async function walk(dir: string, prefix: string = "") {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name !== "node_modules") {
        await walk(path.join(dir, entry.name), `${prefix}${entry.name}/`);
      } else if (entry.isFile()) {
        const content = await readFile(path.join(dir, entry.name), "utf-8");
        files.push({ path: `${prefix}${entry.name}`, content });
      }
    }
  }

  try {
    await walk(baseDir);
  } catch {
    // Workspace doesn't exist yet — return empty
  }

  return files;
}

export async function getProjectName(projectId: string): Promise<string> {
  // P0.5: derive name from projectId
  return `Project ${projectId.slice(0, 8)}`;
}
