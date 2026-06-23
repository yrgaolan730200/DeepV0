import type { FastifyInstance } from "fastify";
import { listProjectFiles, getProjectName } from "../services/workspace.js";

export async function projectRoutes(app: FastifyInstance) {
  // GET /api/projects — list all projects
  app.get("/api/projects", {
    handler: async (_request, _reply) => {
      app.log.info("GET /api/projects (stub)");
      return { projects: [] };
    },
  });

  // GET /api/projects/:id — get project detail
  app.get("/api/projects/:id", {
    handler: async (request, _reply) => {
      const { id } = request.params as { id: string };
      app.log.info({ projectId: id }, "GET /api/projects/:id (stub)");

      const files = await listProjectFiles(id);
      const name = await getProjectName(id);

      return {
        id,
        name,
        files,
        createdAt: new Date().toISOString(),
      };
    },
  });

  // GET /api/projects/:id/files — list project files
  app.get("/api/projects/:id/files", {
    handler: async (request, _reply) => {
      const { id } = request.params as { id: string };
      app.log.info({ projectId: id }, "GET /api/projects/:id/files (stub)");

      const files = await listProjectFiles(id);
      return { files };
    },
  });
}
