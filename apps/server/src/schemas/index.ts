import { z } from "zod";

// POST /api/generate
export const GenerateRequestSchema = z.object({
  prompt: z.string().min(1),
  projectId: z.string().optional(),
});

export const GenerateResponseSchema = z.object({
  projectId: z.string(),
  files: z.array(
    z.object({
      path: z.string(),
      content: z.string(),
    })
  ),
});

// GET /api/projects
export const ProjectSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
});

export const ProjectListResponseSchema = z.object({
  projects: z.array(ProjectSummarySchema),
});

// GET /api/projects/:id
export const ProjectDetailResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  files: z.array(
    z.object({
      path: z.string(),
      content: z.string(),
    })
  ),
  createdAt: z.string(),
});

// GET /api/projects/:id/files
export const ProjectFilesResponseSchema = z.object({
  files: z.array(
    z.object({
      path: z.string(),
      content: z.string(),
    })
  ),
});

// POST /api/projects/:id/revise
export const ReviseRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
  currentFiles: z
    .array(
      z.object({
        path: z.string(),
        content: z.string(),
      })
    )
    .optional(),
});

export const ReviseResponseSchema = z.object({
  files: z.array(
    z.object({
      path: z.string(),
      content: z.string(),
    })
  ),
});

// Health
export const HealthResponseSchema = z.object({
  ok: z.literal(true),
  uptime: z.number(),
  version: z.string(),
});

// Type exports
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;
export type GenerateResponse = z.infer<typeof GenerateResponseSchema>;
export type ProjectSummary = z.infer<typeof ProjectSummarySchema>;
export type ProjectDetail = z.infer<typeof ProjectDetailResponseSchema>;
export type ReviseRequest = z.infer<typeof ReviseRequestSchema>;
export type ReviseResponse = z.infer<typeof ReviseResponseSchema>;
