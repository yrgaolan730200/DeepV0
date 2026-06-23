const SERVER_BASE_URL = "http://localhost:3001";

export interface ServerHealth {
  ok: boolean;
  uptime: number;
  version: string;
}

export async function fetchHealth(): Promise<ServerHealth> {
  const res = await fetch(`${SERVER_BASE_URL}/health`);
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status}`);
  }
  return res.json();
}

export async function fetchProjects() {
  const res = await fetch(`${SERVER_BASE_URL}/api/projects`);
  return res.json();
}

export async function fetchProject(id: string) {
  const res = await fetch(`${SERVER_BASE_URL}/api/projects/${id}`);
  return res.json();
}

export async function fetchProjectFiles(id: string) {
  const res = await fetch(`${SERVER_BASE_URL}/api/projects/${id}/files`);
  return res.json();
}
