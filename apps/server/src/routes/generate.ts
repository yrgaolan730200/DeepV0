import type { FastifyInstance } from "fastify";

export async function generateRoutes(app: FastifyInstance) {
  app.post("/api/generate", {
    handler: async (request, _reply) => {
      const { prompt, projectId: _projectId } = request.body as {
        prompt: string;
        projectId?: string;
      };

      // P0: stub — returns mock data, no actual DeepSeek call
      const projectId = _projectId ?? `proj_${Date.now().toString(36)}`;

      app.log.info({ projectId, prompt: prompt.slice(0, 80) }, "POST /api/generate (stub)");

      return {
        projectId,
        files: [
          {
            path: "src/app/page.tsx",
            content: `// P0 stub: Generated page for "${prompt.slice(0, 30)}..."\nexport default function Page() {\n  return <div>Hello vSeek!</div>;\n}`,
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
