# vSeek Architecture

## Overview

vSeek is a local lightweight frontend generation system — a private v0.dev alternative. The primary interface is a **browser-based Studio workbench**, not a CLI tool.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (localhost:3000)                                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  vSeek Studio (Next.js 16)                            │  │
│  │                                                        │  │
│  │  ┌──────────┬──────────────────┬──────────────────┐  │  │
│  │  │ Chat     │ File Explorer +  │ Preview          │  │  │
│  │  │ Panel    │ Code Editor      │ Panel            │  │  │
│  │  └──────────┴──────────────────┴──────────────────┘  │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │ Build Log                                       │  │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │ HTTP (fetch)                     │
└───────────────────────────┼─────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│  vSeek Server (Fastify, localhost:3001)                     │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Routes                                              │    │
│  │  GET  /health              Health check              │    │
│  │  POST /api/generate        Generate from prompt      │    │
│  │  GET  /api/projects        List projects             │    │
│  │  GET  /api/projects/:id    Get project detail        │    │
│  │  GET  /api/projects/:id/files  List project files    │    │
│  │  POST /api/projects/:id/revise  Revise project       │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Services                                            │    │
│  │  deepseek.ts   OpenAI SDK → DeepSeek API             │    │
│  │  workspace.ts  File read/write in workspaces/        │    │
│  │  compiler.ts   execa → tsc --noEmit (P2)            │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                 │
│                ┌───────────┴───────────┐                    │
│                ▼                       ▼                    │
│  ┌─────────────────────┐  ┌──────────────────────┐         │
│  │  DeepSeek API        │  │  workspaces/          │         │
│  │  api.deepseek.com    │  │  {projectId}/current/ │         │
│  └─────────────────────┘  └──────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Packages

| Package | Description | Tech |
|---------|-------------|------|
| `apps/studio` | Browser Studio workbench | Next.js 16, shadcn/ui, Tailwind v4 |
| `apps/server` | API & DeepSeek integration | Fastify 5, openai SDK, execa |
| `apps/cli` | CLI helper (P0 skip) | commander, chalk |
| `packages/shared` | Types & zod schemas | TypeScript, zod |

## Data Flow

1. User types a prompt in **ChatPanel**
2. Studio POSTs to server `/api/generate`
3. Server calls **DeepSeek API** with system prompt + user prompt
4. DeepSeek returns JSON with `{ files: [...] }` via `response_format: { type: "json_object" }`
5. Server writes files to `workspaces/{projectId}/current/`
6. Server returns `{ projectId, files }` to Studio
7. Studio's **CodeEditor** and **FileExplorer** update
8. Build check runs on server via `execa` → results in **BuildLogPanel**
9. **PreviewPanel** renders the generated app in an iframe (P2+)

## DeepSeek Integration

- API: OpenAI SDK with `baseURL: https://api.deepseek.com`
- Default model: `deepseek-v4-pro`
- Fast model: `deepseek-v4-flash`
- Output protocol: `response_format: { type: "json_object" }`
- Expected JSON shape validates against `DeepSeekOutputSchema` (zod)

## Workspace Structure

```
workspaces/
└── {projectId}/
    └── current/         # Latest generated code
        ├── src/
        │   └── app/
        │       ├── layout.tsx
        │       └── page.tsx
        ├── components/
        │   └── ui/
        ├── package.json
        └── tsconfig.json
```

## Development

```bash
pnpm install        # Install all dependencies
pnpm dev            # Start studio (3000) + server (3001) concurrently
```

- Studio: http://localhost:3000
- Server health: http://localhost:3001/health
