import type { FastifyInstance } from "fastify";

export async function reviseRoutes(app: FastifyInstance) {
  app.post("/api/projects/:id/revise", {
    handler: async (request, _reply) => {
      const { id } = request.params as { id: string };
      const { messages } = request.body as {
        messages: Array<{ role: string; content: string }>;
      };

      app.log.info({ projectId: id, msgCount: messages?.length ?? 0 }, "POST /api/projects/:id/revise (stub)");

      return {
        files: [
          {
            path: "src/app/page.tsx",
            content: "// P0 stub: Revised page\nexport default function Page() {\n  return <div>Revised content!</div>;\n}",
          },
        ],
      };
    },
  });
}
