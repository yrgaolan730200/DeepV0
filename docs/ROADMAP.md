# vSeek Roadmap

## P0 — Stable Skeleton (current)

- [x] pnpm workspace monorepo
- [x] apps/studio UI skeleton (Chat + FileExplorer + CodeEditor + Preview + BuildLog)
- [x] apps/server API skeleton (Fastify + CORS + /health + stub routes)
- [x] packages/shared types and zod schemas
- [x] templates/next-shadcn base template
- [x] workspaces/ directory structure
- [x] docs/ARCHITECTURE.md and ROADMAP.md
- [ ] Verify: pnpm install + pnpm dev + health check + UI visible

## P1 — Core Generation Loop

- [ ] System prompt engineering for DeepSeek
- [ ] `response_format: { type: "json_object" }` integration
- [ ] POST /api/generate → actual DeepSeek call
- [ ] POST /api/projects/:id/revise → multi-turn refinement
- [ ] Workspace file persistence
- [ ] Code validator (import checks, basic lint)
- [ ] Three-tier retry loop (generate → validate → fix)
- [ ] ChatPanel wired to real generation

## P2 — Live Preview & Compilation

- [ ] Sandbox preview iframe (renders generated app)
- [ ] TypeScript compilation check via execa in server
- [ ] BuildLogPanel wired to real compilation output
- [ ] Error feedback loop: compile errors → DeepSeek fix
- [ ] Hot reload on file changes
- [ ] File explorer reflects actual project structure

## P3 — Project Management & CLI

- [ ] Project list / management in Studio
- [ ] Project history (git snapshots on each revision)
- [ ] Export project as ZIP
- [ ] vseek CLI helper (init, dev, build)
- [ ] Claude escalation (claude-fix-prompt.md generation)

## P4 — Production Polish

- [ ] Authentication / API key management UI
- [ ] Dark/light theme toggle in Studio
- [ ] Undo/redo generation
- [ ] Multiple project templates
- [ ] Component variant previews
- [ ] Performance optimization (caching, streaming)
- [ ] Docker deployment
- [ ] Comprehensive error boundaries
