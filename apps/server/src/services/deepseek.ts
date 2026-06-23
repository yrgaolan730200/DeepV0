import OpenAI from "openai";
import { loadEnv } from "../lib/env.js";
import { logger } from "../lib/logger.js";

// DeepSeek is fully OpenAI-compatible — just change baseURL
let _client: OpenAI | null = null;

export function getDeepSeekClient(): OpenAI {
  if (!_client) {
    const env = loadEnv();
    _client = new OpenAI({
      baseURL: env.DEEPSEEK_BASE_URL,
      apiKey: env.DEEPSEEK_API_KEY,
      defaultHeaders: { "Content-Type": "application/json" },
    });
    logger.info(`DeepSeek client initialized: ${env.DEEPSEEK_BASE_URL}`);
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

// P0: skeleton only — does not actually call the API
export async function generateCode(_params: {
  prompt: string;
  systemPrompt: string;
}): Promise<{ files: Array<{ path: string; content: string }> }> {
  // TODO: P1 — implement actual DeepSeek API call with response_format: { type: "json_object" }
  logger.info("generateCode called (stub)", { prompt: _params.prompt.slice(0, 100) });
  return { files: [] };
}
