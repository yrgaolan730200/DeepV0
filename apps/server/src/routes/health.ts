import type { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", {
    handler: async (_request, _reply) => {
      return {
        ok: true as const,
        uptime: process.uptime(),
        version: "0.1.0",
      };
    },
  });
}
