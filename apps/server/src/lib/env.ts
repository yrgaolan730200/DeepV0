import { z } from "zod";

export const envSchema = z.object({
  // P0: API key optional (generation routes are stubs); required for P1+
  DEEPSEEK_API_KEY: z.string().default("vseek-p0-placeholder"),
  DEEPSEEK_BASE_URL: z.string().url().default("https://api.deepseek.com"),
  DEEPSEEK_MODEL: z.string().default("deepseek-v4-pro"),
  DEEPSEEK_FAST_MODEL: z.string().default("deepseek-v4-flash"),
  SERVER_PORT: z.coerce.number().int().default(3001),
  SERVER_HOST: z.string().default("0.0.0.0"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    console.error(result.error.format());
    process.exit(1);
  }
  return result.data;
}
