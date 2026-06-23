import { z } from "zod";

// ---- Code Generation ----
export const GeneratedFileSchema = z.object({
  path: z.string().min(1),
  content: z.string(),
});

export const CompileErrorSchema = z.object({
  file: z.string(),
  line: z.number().int().positive(),
  column: z.number().int().positive(),
  code: z.string(),
  message: z.string(),
});

// ---- API Contracts ----
export const ServerHealthSchema = z.object({
  ok: z.literal(true),
  uptime: z.number(),
  version: z.string(),
});

export const ProjectSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
});

export const ProjectDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  files: z.array(GeneratedFileSchema),
  createdAt: z.string(),
});

export const GenerateRequestSchema = z.object({
  prompt: z.string().min(1),
  projectId: z.string().optional(),
});

export const GenerateResponseSchema = z.object({
  projectId: z.string(),
  projectName: z.string(),
  description: z.string(),
  files: z.array(GeneratedFileSchema),
  dependencies: z.array(z.string()),
  devDependencies: z.array(z.string()),
});

export const ReviseRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
  currentFiles: z.array(GeneratedFileSchema).optional(),
});

export const ReviseResponseSchema = z.object({
  files: z.array(GeneratedFileSchema),
});

// ---- DeepSeek Output ----
/** JSON schema that DeepSeek must follow when response_format: { type: "json_object" } */
export const DeepSeekOutputSchema = z.object({
  projectName: z.string().min(1, "projectName is required"),
  description: z.string().default(""),
  files: z.array(GeneratedFileSchema).min(1, "at least one file is required"),
  dependencies: z.array(z.string()).default([]),
  devDependencies: z.array(z.string()).default([]),
});

// ---- Config ----
export const VSeekConfigSchema = z.object({
  deepseek: z.object({
    model: z.string().default("deepseek-v4-pro"),
    fastModel: z.string().default("deepseek-v4-flash"),
    temperature: z.number().min(0).max(2).default(0.3),
    maxTokens: z.number().int().min(1).max(65536).default(4096),
    maxRetries: z.number().int().min(0).max(10).default(3),
    baseURL: z.string().url().default("https://api.deepseek.com"),
  }),
  server: z.object({
    port: z.number().int().default(3001),
    host: z.string().default("0.0.0.0"),
  }),
  studio: z.object({
    port: z.number().int().default(3000),
    host: z.string().default("localhost"),
  }),
  workspaces: z.object({
    dir: z.string().default("./workspaces"),
  }),
  components: z.object({
    preInstalled: z.array(z.string()).default([]),
    importAlias: z.string().default("@/components/ui"),
  }),
});

export const DEFAULT_CONFIG = VSeekConfigSchema.parse({});
