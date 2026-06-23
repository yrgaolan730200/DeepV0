# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install          # Install all workspace dependencies
pnpm dev              # Start studio (3000) + server (3001) concurrently
pnpm dev:studio       # Start only the Studio Next.js app
pnpm dev:server       # Start only the Fastify API server
pnpm typecheck        # Run tsc --noEmit across all packages
pnpm build            # Build all packages (tsup/tsc/next build)
pnpm lint             # Run lint across all packages
```

## Architecture

vSeek is a local v0.dev alternative. **The primary interface is the browser-based Studio workbench**, not the CLI. The monorepo has four packages:

| Package | Role |
|---------|------|
| `apps/studio` | Browser Studio UI (Next.js 16 + shadcn/ui + Tailwind v4). 6-panel layout: HeaderBar, ChatPanel, FileExplorer, CodeEditor, PreviewPanel, BuildLogPanel |
| `apps/server` | Backend API (Fastify 5). Routes: `/health`, `/api/generate`, `/api/projects`, `/api/projects/:id`, `/api/projects/:id/files`, `/api/projects/:id/revise` |
| `apps/cli` | Placeholder skeleton — CLI tool deferred to P3 |
| `packages/shared` | TypeScript types + zod schemas shared between studio and server |

The Studio calls the Server over HTTP (`localhost:3000` → `localhost:3001`). The server is responsible for calling DeepSeek, managing workspaces, and running build checks.

## DeepSeek Integration (P1+)

- Uses the `openai` SDK pointed at `https://api.deepseek.com` (DeepSeek is OpenAI-compatible)
- Default model: `deepseek-v4-pro`; fast model: `deepseek-v4-flash`
- Output protocol: `response_format: { type: "json_object" }`, validated against `DeepSeekOutputSchema` in `packages/shared/src/schemas.ts`
- Generated files are written to `workspaces/{projectId}/current/` — only `.gitkeep` is tracked in git

## Key Patterns

### Route validation (server)

Do **not** pass Zod schemas directly to Fastify's `schema` option — this causes serialization errors. Instead, use `safeParse` manually in the handler body:

```typescript
const parsed = SomeSchema.safeParse(request.body);
if (!parsed.success) {
  return reply.status(400).send({
    error: "Invalid request body",
    issues: parsed.error.issues.map(i => ({ path: i.path.join("."), message: i.message })),
  });
}
```

See `apps/server/src/routes/generate.ts` for the canonical example.

### Environment variables

`apps/server/src/lib/env.ts` — uses zod to parse and default env vars. `DEEPSEEK_API_KEY` defaults to `"vseek-p0-placeholder"` so the server can start without a real key during development. Before P1 generates, this default should be checked and a proper error returned if the key is still the placeholder.

### Workspace path safety

`apps/server/src/services/workspace.ts` — `validateProjectId()` and `validateFilePath()` guard against directory traversal. All workspace writes resolve paths and verify they stay within `workspaces/`. Any new file system operations in the workspace should follow this pattern.

### Studio panels (P0 mock strategy)

All 6 studio panels in `apps/studio/src/components/studio/` are currently mock placeholders. They are self-contained `"use client"` components with static data. In P1, panels should be wired to real server API calls — the `useServerHealth` hook in `apps/studio/src/hooks/use-server-health.ts` is the reference pattern for polling the server.

## Current Phase

P0.5 (stable skeleton) is complete and merged to `main`. All generation routes return stubs. No real DeepSeek calls, no compilation checks, no live preview. The next phase is P1 — see `docs/ROADMAP.md` for the full plan.
