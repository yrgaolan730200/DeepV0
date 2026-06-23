import { mkdir, writeFile, readFile, readdir, copyFile, stat } from "node:fs/promises";
import path from "node:path";
import { logger } from "../lib/logger.js";

const WORKSPACES_ROOT = path.resolve(process.cwd(), "../../workspaces");
const TEMPLATES_ROOT = path.resolve(process.cwd(), "../../templates/next-shadcn");

// ---- Path safety helpers ----

const PROJECT_ID_RE = /^[a-zA-Z0-9_-]{1,64}$/;

function isValidPathComponent(segment: string): boolean {
  if (!segment || segment.length === 0) return false;
  if (segment === "." || segment === "..") return false;
  if (segment.includes("/") || segment.includes("\\")) return false;
  return true;
}

export function validateProjectId(projectId: string): boolean {
  return PROJECT_ID_RE.test(projectId) && isValidPathComponent(projectId);
}

export function validateFilePath(filePath: string): boolean {
  if (!filePath || filePath.length === 0) return false;
  if (path.isAbsolute(filePath)) return false;
  if (filePath.includes("..")) return false;
  const segments = filePath.replace(/\\/g, "/").split("/");
  return segments.every(isValidPathComponent);
}

// ---- Project ID generation ----

let _counter = 0;

export function createProjectId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 6);
  _counter++;
  return `proj_${timestamp}${random}${_counter.toString(36)}`;
}

// ---- Workspace operations ----

export async function ensureWorkspaceDir(projectId: string): Promise<string> {
  if (!validateProjectId(projectId)) {
    throw new Error(`Invalid projectId: "${projectId}". Must be alphanumeric (max 64 chars).`);
  }
  const dir = path.join(WORKSPACES_ROOT, projectId, "current");
  const resolved = path.resolve(dir);
  if (!resolved.startsWith(WORKSPACES_ROOT)) {
    throw new Error(`Path traversal detected: "${projectId}"`);
  }
  await mkdir(resolved, { recursive: true });
  return resolved;
}

export async function projectExists(projectId: string): Promise<boolean> {
  try {
    const dir = path.join(WORKSPACES_ROOT, projectId, "current");
    const s = await stat(dir);
    return s.isDirectory();
  } catch {
    return false;
  }
}

// ---- Template copy ----

async function copyDir(src: string, dest: string): Promise<void> {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory() && entry.name !== "node_modules") {
      await copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      await copyFile(srcPath, destPath);
    }
  }
}

export async function copyTemplateToWorkspace(projectId: string): Promise<string> {
  const baseDir = await ensureWorkspaceDir(projectId);

  try {
    await copyDir(TEMPLATES_ROOT, baseDir);
    logger.info(`Template copied to ${baseDir}`);
  } catch (err) {
    logger.warn({ err }, "Failed to copy template, creating empty workspace");
  }

  return baseDir;
}

// ---- File writing with safety checks ----

const FORBIDDEN_FILE_NAMES = new Set([
  ".env", ".env.local", ".env.development", ".env.production",
  ".env.test", "secrets.json", "credentials.json", ".npmrc",
]);

function isForbiddenFile(filePath: string): boolean {
  const fileName = path.basename(filePath);
  if (FORBIDDEN_FILE_NAMES.has(fileName)) return true;

  // Check for any file containing secret/key/token in the name
  const lower = fileName.toLowerCase();
  if (lower.includes("secret") || lower.includes("token") || lower.includes("api_key")) {
    return true;
  }

  return false;
}

export async function writeGeneratedFiles(
  projectId: string,
  files: Array<{ path: string; content: string }>
): Promise<string> {
  const baseDir = await ensureWorkspaceDir(projectId);
  const resolvedBase = path.resolve(baseDir);

  for (const file of files) {
    // Validate path
    if (!validateFilePath(file.path)) {
      throw new Error(
        `Invalid file path: "${file.path}". Must be relative, no "..", no absolute paths.`
      );
    }
    if (isForbiddenFile(file.path)) {
      throw new Error(`Forbidden file path: "${file.path}". Env and secret files cannot be generated.`);
    }

    const filePath = path.resolve(resolvedBase, file.path);
    // Final safety: must be within workspace
    if (!filePath.startsWith(resolvedBase)) {
      throw new Error(`Path traversal detected in file: "${file.path}"`);
    }

    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, file.content, "utf-8");
    logger.debug(`Wrote: ${filePath}`);
  }

  return baseDir;
}

// ---- Project listing ----

export async function listWorkspaceProjects(): Promise<
  Array<{ id: string; name: string; createdAt: string }>
> {
  const projects: Array<{ id: string; name: string; createdAt: string }> = [];

  try {
    const entries = await readdir(WORKSPACES_ROOT, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const projectId = entry.name;

      try {
        const currentDir = path.join(WORKSPACES_ROOT, projectId, "current");
        const s = await stat(currentDir);

        // Try to get project name from package.json
        let name = `Project ${projectId.slice(0, 8)}`;
        try {
          const pkgPath = path.join(currentDir, "package.json");
          const pkgRaw = await readFile(pkgPath, "utf-8");
          const pkg = JSON.parse(pkgRaw);
          if (pkg.name) name = pkg.name;
        } catch {
          // Use default name
        }

        projects.push({
          id: projectId,
          name,
          createdAt: s.birthtime.toISOString(),
        });
      } catch {
        // Skip invalid project dirs
      }
    }
  } catch {
    // No workspaces yet
  }

  return projects.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// ---- Project files ----

const SKIP_DIRS = new Set(["node_modules", ".next", "dist", "build", ".git", ".turbo"]);

export async function listProjectFiles(
  projectId: string
): Promise<Array<{ path: string; content: string }>> {
  const baseDir = path.join(WORKSPACES_ROOT, projectId, "current");
  const files: Array<{ path: string; content: string }> = [];

  async function walk(dir: string, prefix: string = "") {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.isDirectory() && !SKIP_DIRS.has(entry.name) && !entry.name.startsWith(".")) {
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

  // Sort: config files first, then src/, then components/
  return files.sort((a, b) => {
    const order = (p: string) => {
      if (p === "package.json") return 0;
      if (p.startsWith("src/app/layout")) return 1;
      if (p.startsWith("src/app/page")) return 2;
      if (p.startsWith("src/app/")) return 3;
      if (p.startsWith("src/components/")) return 4;
      if (p.startsWith("src/lib/")) return 5;
      if (p.startsWith("src/")) return 6;
      return 7;
    };
    return order(a.path) - order(b.path);
  });
}

export async function readProjectFile(
  projectId: string,
  filePath: string
): Promise<string | null> {
  if (!validateFilePath(filePath)) return null;

  const baseDir = path.join(WORKSPACES_ROOT, projectId, "current");
  const fullPath = path.resolve(baseDir, filePath);

  if (!fullPath.startsWith(path.resolve(baseDir))) return null;

  try {
    return await readFile(fullPath, "utf-8");
  } catch {
    return null;
  }
}

export async function getProjectName(projectId: string): Promise<string> {
  try {
    const pkgPath = path.join(WORKSPACES_ROOT, projectId, "current", "package.json");
    const pkgRaw = await readFile(pkgPath, "utf-8");
    const pkg = JSON.parse(pkgRaw);
    return pkg.name ?? `Project ${projectId.slice(0, 8)}`;
  } catch {
    return `Project ${projectId.slice(0, 8)}`;
  }
}
