// ---- Code Generation ----

/** A single generated file with its path and content */
export interface GeneratedFile {
  path: string;
  content: string;
}

/** A single TypeScript compilation error */
export interface CompileError {
  file: string;
  line: number;
  column: number;
  code: string;
  message: string;
}

// ---- API Contracts ----

/** GET /health response */
export interface ServerHealth {
  ok: true;
  uptime: number;
  version: string;
}

/** Project summary returned by GET /api/projects */
export interface ProjectSummary {
  id: string;
  name: string;
  createdAt: string;
}

/** Project detail returned by GET /api/projects/:id */
export interface ProjectDetail {
  id: string;
  name: string;
  files: GeneratedFile[];
  createdAt: string;
}

/** POST /api/generate request */
export interface GenerateRequest {
  prompt: string;
  projectId?: string;
}

/** POST /api/generate response */
export interface GenerateResponse {
  projectId: string;
  files: GeneratedFile[];
}

/** POST /api/projects/:id/revise request */
export interface ReviseRequest {
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  currentFiles?: GeneratedFile[];
}

/** POST /api/projects/:id/revise response */
export interface ReviseResponse {
  files: GeneratedFile[];
}

// ---- Config ----

/** DeepSeek model configuration */
export interface DeepSeekConfig {
  model: string;
  fastModel: string;
  temperature: number;
  maxTokens: number;
  maxRetries: number;
  baseURL: string;
}

/** Full vSeek project configuration */
export interface VSeekConfig {
  deepseek: DeepSeekConfig;
  server: {
    port: number;
    host: string;
  };
  studio: {
    port: number;
    host: string;
  };
  workspaces: {
    dir: string;
  };
  components: {
    preInstalled: string[];
    importAlias: string;
  };
}
