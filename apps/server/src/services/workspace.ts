import { mkdir, writeFile, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { logger } from "../lib/logger.js";

const WORKSPACES_ROOT = path.resolve(process.cwd(), "../../workspaces");

export async function ensureWorkspaceDir(projectId: string): Promise<string> {
  const dir = path.join(WORKSPACES_ROOT, projectId, "current");
  await mkdir(dir, { recursive: true });
  return dir;
}

export async function writeProjectFiles(
  projectId: string,
  files: Array<{ path: string; content: string }>
): Promise<string> {
  const baseDir = await ensureWorkspaceDir(projectId);

  for (const file of files) {
    const filePath = path.join(baseDir, file.path);
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
  // P0: derive name from projectId
  return `Project ${projectId.slice(0, 8)}`;
}
