import Fastify from "fastify";
import cors from "@fastify/cors";
import { healthRoutes } from "./routes/health.js";
import { generateRoutes } from "./routes/generate.js";
import { projectRoutes } from "./routes/projects.js";
import { reviseRoutes } from "./routes/revise.js";
import { loadEnv } from "./lib/env.js";

export async function buildApp() {
  const env = loadEnv();

  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport:
        env.NODE_ENV === "development"
          ? { target: "pino-pretty", options: { colorize: true } }
          : undefined,
    },
    disableRequestLogging: false,
  });

  // CORS — allow studio (localhost:3000) to call server (localhost:3001)
  await app.register(cors, {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  });

  // Register routes
  await app.register(healthRoutes);
  await app.register(generateRoutes);
  await app.register(projectRoutes);
  await app.register(reviseRoutes);

  // Global error handler
  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);
    reply.status(error.statusCode ?? 500).send({
      error: error.message,
      statusCode: error.statusCode ?? 500,
    });
  });

  return app;
}
