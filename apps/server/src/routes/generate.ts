import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { loadEnv } from "../lib/env.js";
import { generateCode } from "../services/deepseek.js";
import { buildGenerateProjectPrompt } from "../prompts/generate-project.js";
import {
  createProjectId,
  copyTemplateToWorkspace,
  writeGeneratedFiles,
} from "../services/workspace.js";

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

      const { prompt } = parsed.data;

      // Check DeepSeek API key
      const env = loadEnv();
      if (!env.DEEPSEEK_API_KEY || env.DEEPSEEK_API_KEY === "vseek-p0-placeholder") {
        return reply.status(400).send({
          error: "DEEPSEEK_API_KEY is not configured",
        });
      }

      // Generate projectId
      const projectId = parsed.data.projectId ?? createProjectId();

      app.log.info({ projectId, prompt: prompt.slice(0, 120) }, "Starting generation");

      // Step 1: Call DeepSeek
      let generationResult;
      try {
        generationResult = await generateCode({
          prompt,
          systemPrompt: buildGenerateProjectPrompt(),
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        app.log.error({ err: message }, "DeepSeek generation failed");

        if (message.includes("DEEPSEEK_API_KEY")) {
          return reply.status(400).send({ error: message });
        }
        if (message.includes("invalid JSON") || message.includes("validation failed")) {
          return reply.status(502).send({
            error: "DeepSeek returned invalid output",
            detail: message.slice(0, 500),
          });
        }
        return reply.status(500).send({
          error: "Generation failed",
          detail: message,
        });
      }

      app.log.info(
        {
          projectId,
          fileCount: generationResult.files.length,
          projectName: generationResult.projectName,
        },
        "DeepSeek generation succeeded"
      );

      // Step 2: Create workspace and copy template
      try {
        await copyTemplateToWorkspace(projectId);
      } catch (err) {
        app.log.warn({ err }, "Failed to copy template, continuing with generated files only");
      }

      // Step 3: Write generated files (overwrites template files)
      try {
        await writeGeneratedFiles(projectId, generationResult.files);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        app.log.error({ err: message }, "Failed to write generated files");
        return reply.status(500).send({
          error: "Failed to write generated files",
          detail: message,
        });
      }

      app.log.info({ projectId }, "Project files written successfully");

      // Step 4: Return result
      return {
        projectId,
        projectName: generationResult.projectName,
        description: generationResult.description,
        files: generationResult.files,
        dependencies: generationResult.dependencies,
        devDependencies: generationResult.devDependencies,
      };
    },
  });
}
