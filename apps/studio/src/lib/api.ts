const SERVER_BASE_URL = "http://localhost:3001";

export interface ServerHealth {
  ok: boolean;
  uptime: number;
  version: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface GenerateResult {
  projectId: string;
  projectName: string;
  description: string;
  files: GeneratedFile[];
  dependencies: string[];
  devDependencies: string[];
}

export interface ProjectSummary {
  id: string;
  name: string;
  createdAt: string;
}

export interface ProjectDetail {
  id: string;
  name: string;
  files: GeneratedFile[];
  createdAt: string;
}

// ---- Health ----

export async function fetchHealth(): Promise<ServerHealth> {
  const res = await fetch(`${SERVER_BASE_URL}/health`);
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status}`);
  }
  return res.json();
}

// ---- Generate ----

export async function generateProject(prompt: string): Promise<GenerateResult> {
  const res = await fetch(`${SERVER_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? body.detail ?? `Generation failed: ${res.status}`);
  }

  return res.json();
}

// ---- Projects ----

export async function fetchProjects(): Promise<{ projects: ProjectSummary[] }> {
  const res = await fetch(`${SERVER_BASE_URL}/api/projects`);
  return res.json();
}

export async function fetchProject(id: string): Promise<ProjectDetail> {
  const res = await fetch(`${SERVER_BASE_URL}/api/projects/${id}`);
  return res.json();
}

export async function fetchProjectFiles(id: string): Promise<{ files: GeneratedFile[] }> {
  const res = await fetch(`${SERVER_BASE_URL}/api/projects/${id}/files`);
  return res.json();
}
