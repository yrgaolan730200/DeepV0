import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { loadEnv } from "../lib/env.js";

const GenerateBodySchema = z.object({
  prompt: z.string().min(1, "prompt is required"),
  projectId: z.string().optional(),
});

export async function generateRoutes(app: FastifyInstance) {
  app.post("/api/generate", {
    handler: async (request, reply) => {
      // Validate request body
      const parsed = GenerateBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: "Invalid request body",
          issues: parsed.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        });
      }

      const { prompt, projectId: _projectId } = parsed.data;

      // Check DeepSeek API key (stub for P0.5 — will be enforced in P1)
      const env = loadEnv();
      if (env.DEEPSEEK_API_KEY === "vseek-p0-placeholder") {
        app.log.info("DEEPSEEK_API_KEY not configured — returning stub response");
      }

      // P0.5: stub — returns mock data, no actual DeepSeek call
      const projectId = _projectId ?? `proj_${Date.now().toString(36)}`;

      app.log.info({ projectId, prompt: prompt.slice(0, 80) }, "POST /api/generate (stub)");

      return {
        projectId,
        files: [
          {
            path: "src/app/page.tsx",
            content: `// P0.5 stub: Generated page for "${prompt.slice(0, 30)}..."\nexport default function Page() {\n  return <div>Hello vSeek!</div>;\n}`,
          },
          {
            path: "src/app/layout.tsx",
            content: `export default function RootLayout({ children }: { children: React.ReactNode }) {\n  return <html><body>{children}</body></html>;\n}`,
          },
        ],
      };
    },
  });
}
