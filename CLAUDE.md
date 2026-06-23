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

## Git 提交规范

本项目所有 git commit message 必须使用中文大白话，不使用英文 Conventional Commit。

正确示例：
- 搭好 P0 的前后端骨架
- 接入 DeepSeek，生成项目文件
- 让 Studio 显示真实文件树和代码

错误示例：
- chore: establish P0 skeleton
- feat: implement DeepSeek generation

规则：
- commit message 短、清楚、像人话，优先说明"这次做了什么"
- 不要使用 chore/feat/fix/docs/refactor/test 等英文前缀
- 分支名和 tag 名可以继续用英文，但二者不要完全相同（避免 git push refspec 歧义）
- 提交前运行 `pnpm typecheck && pnpm build` 确保通过

详见 `docs/GIT_CONVENTIONS.md`。

## Current Phase

P1 (DeepSeek generation) is complete on branch `p1-deepseek-generation`. Studio can generate real projects via DeepSeek API and display file trees + code. No live preview yet. See `docs/ROADMAP.md` for the full plan.
