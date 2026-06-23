import { buildApp } from "./app.js";
import { loadEnv } from "./lib/env.js";
import { logger } from "./lib/logger.js";

async function main() {
  const env = loadEnv();

  const app = await buildApp();

  try {
    await app.listen({ port: env.SERVER_PORT, host: env.SERVER_HOST });
    logger.info(`🚀 vSeek Server running at http://${env.SERVER_HOST}:${env.SERVER_PORT}`);
    logger.info(`   Health check: http://localhost:${env.SERVER_PORT}/health`);
  } catch (err) {
    logger.error(err, "Failed to start server");
    process.exit(1);
  }
}

main();
