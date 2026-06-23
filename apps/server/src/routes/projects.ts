import type { FastifyInstance } from "fastify";
import {
  listWorkspaceProjects,
  listProjectFiles,
  getProjectName,
} from "../services/workspace.js";

export async function projectRoutes(app: FastifyInstance) {
  // GET /api/projects — list all workspace projects
  app.get("/api/projects", {
    handler: async (_request, _reply) => {
      const projects = await listWorkspaceProjects();
      return { projects };
    },
  });

  // GET /api/projects/:id — get project detail with files
  app.get("/api/projects/:id", {
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };

      const files = await listProjectFiles(id);
      if (files.length === 0) {
        // Check if project directory exists at all
        const projects = await listWorkspaceProjects();
        const found = projects.find((p) => p.id === id);
        if (!found) {
          return reply.status(404).send({ error: "Project not found" });
        }
      }

      const name = await getProjectName(id);

      return {
        id,
        name,
        files,
        createdAt:
          (await listWorkspaceProjects()).find((p) => p.id === id)?.createdAt ??
          new Date().toISOString(),
      };
    },
  });

  // GET /api/projects/:id/files — list project files
  app.get("/api/projects/:id/files", {
    handler: async (request, _reply) => {
      const { id } = request.params as { id: string };
      const files = await listProjectFiles(id);
      return { files };
    },
  });
}
