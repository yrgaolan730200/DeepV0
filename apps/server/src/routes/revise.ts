import type { FastifyInstance } from "fastify";
import { z } from "zod";

const ReviseBodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .min(1, "messages array must not be empty"),
  currentFiles: z
    .array(
      z.object({
        path: z.string(),
        content: z.string(),
      })
    )
    .optional(),
});

const ReviseParamsSchema = z.object({
  id: z.string().min(1),
});

export async function reviseRoutes(app: FastifyInstance) {
  app.post("/api/projects/:id/revise", {
    handler: async (request, reply) => {
      // Validate params
      const paramsParsed = ReviseParamsSchema.safeParse(request.params);
      if (!paramsParsed.success) {
        return reply.status(400).send({
          error: "Invalid request parameters",
          issues: paramsParsed.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        });
      }

      const { id } = paramsParsed.data;

      // Validate body
      const bodyParsed = ReviseBodySchema.safeParse(request.body);
      if (!bodyParsed.success) {
        return reply.status(400).send({
          error: "Invalid request body",
          issues: bodyParsed.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        });
      }

      const { messages } = bodyParsed.data;

      app.log.info(
        { projectId: id, msgCount: messages.length },
        "POST /api/projects/:id/revise (stub)"
      );

      return {
        files: [
          {
            path: "src/app/page.tsx",
            content:
              "// P0.5 stub: Revised page\nexport default function Page() {\n  return <div>Revised content!</div>;\n}",
          },
        ],
      };
    },
  });
}
