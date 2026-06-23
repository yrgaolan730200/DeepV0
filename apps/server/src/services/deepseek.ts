import OpenAI from "openai";
import { loadEnv } from "../lib/env.js";
import { logger } from "../lib/logger.js";
import { DeepSeekOutputSchema, type GeneratedFile } from "@vseek/shared";

// DeepSeek is fully OpenAI-compatible — just change baseURL
let _client: OpenAI | null = null;

export function getDeepSeekClient(): OpenAI {
  const env = loadEnv();

  if (!env.DEEPSEEK_API_KEY || env.DEEPSEEK_API_KEY === "vseek-p0-placeholder") {
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }

  if (!_client) {
    _client = new OpenAI({
      baseURL: env.DEEPSEEK_BASE_URL,
      apiKey: env.DEEPSEEK_API_KEY,
      defaultHeaders: { "Content-Type": "application/json" },
    });
    logger.info(`DeepSeek client initialized: ${env.DEEPSEEK_BASE_URL} model=${env.DEEPSEEK_MODEL}`);
  }
  return _client;
}

export function getDeepSeekConfig(): {
  model: string;
  fastModel: string;
} {
  const env = loadEnv();
  return {
    model: env.DEEPSEEK_MODEL,
    fastModel: env.DEEPSEEK_FAST_MODEL,
  };
}

export interface GenerateCodeResult {
  projectName: string;
  description: string;
  files: GeneratedFile[];
  dependencies: string[];
  devDependencies: string[];
}

export async function generateCode(params: {
  prompt: string;
  systemPrompt: string;
}): Promise<GenerateCodeResult> {
  const env = loadEnv();

  // Check API key before making the call
  if (!env.DEEPSEEK_API_KEY || env.DEEPSEEK_API_KEY === "vseek-p0-placeholder") {
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }

  const client = getDeepSeekClient();
  const config = getDeepSeekConfig();

  logger.info({ model: config.model, prompt: params.prompt.slice(0, 120) }, "Calling DeepSeek API");

  const response = await client.chat.completions.create({
    model: config.model,
    messages: [
      { role: "system", content: params.systemPrompt },
      { role: "user", content: params.prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 8192,
  });

  const rawContent = response.choices[0]?.message?.content;
  if (!rawContent) {
    throw new Error("DeepSeek returned empty response");
  }

  logger.info({ length: rawContent.length }, "DeepSeek response received");

  // Parse JSON from DeepSeek response
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawContent);
  } catch (err) {
    logger.error({ rawContent: rawContent.slice(0, 500) }, "Failed to parse DeepSeek JSON");
    throw new Error("DeepSeek returned invalid JSON");
  }

  // Validate against our schema
  const result = DeepSeekOutputSchema.safeParse(parsed);
  if (!result.success) {
    logger.error({ issues: result.error.issues }, "DeepSeek output failed schema validation");
    throw new Error(
      `DeepSeek output validation failed: ${result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`
    );
  }

  // Validate file paths (no absolute paths, no .. traversal)
  for (const file of result.data.files) {
    if (file.path.startsWith("/") || file.path.includes("..")) {
      throw new Error(`Invalid file path from DeepSeek: "${file.path}"`);
    }
  }

  return result.data;
}
