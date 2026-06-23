# P1 — DeepSeek Generation Protocol

## JSON Output Schema

DeepSeek is called with `response_format: { type: "json_object" }`. The expected output is validated against `DeepSeekOutputSchema` (zod):

```typescript
{
  projectName: string,         // kebab-case (e.g., "my-saas-landing")
  description: string,         // one-sentence summary
  files: Array<{
    path: string,              // relative path (e.g., "src/app/page.tsx")
    content: string            // file source code
  }>,
  dependencies: string[],      // npm dependency names with versions
  devDependencies: string[]    // npm devDependency names with versions
}
```

### File requirements

- Must include `package.json`, `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`
- All paths must be relative (no leading `/`)
- No `..` path traversal
- No absolute paths

### System prompt

Located at `apps/server/src/prompts/generate-project.ts`. Enforces:
- shadcn/ui components only (`@/components/ui/*` imports)
- Tailwind CSS v4 with oklch color space
- lucide-react for icons
- TypeScript strict mode
- No markdown, no explanations — only JSON

## Path Safety Strategy

All file paths go through validation before writing:

1. `validateProjectId()` — rejects non-alphanumeric, `..`, path separators, empty strings
2. `validateFilePath()` — rejects absolute paths, `..`, invalid segment names
3. `isForbiddenFile()` — blocks `.env`, `.env.local`, secrets, credentials
4. `path.resolve()` + prefix check — final safety net ensuring resolved path stays within workspace

## Workspace Write Strategy

1. `createProjectId()` generates a unique ID: `proj_{timestamp}{random}{counter}`
2. `copyTemplateToWorkspace(projectId)` copies `templates/next-shadcn/` to `workspaces/{projectId}/current/`
3. `writeGeneratedFiles(projectId, files)` writes DeepSeek-generated files, overwriting template files where paths match
4. All writes are verified to be within `workspaces/{projectId}/current/`

## P1 Boundaries

### Implemented
- Real DeepSeek API call with structured JSON output
- Project file generation into workspaces/
- Studio ChatPanel wired to generate
- FileExplorer and CodeEditor show real generated files
- Project listing from workspace directories

### Not Implemented (P2+)
- Live preview / iframe rendering
- TypeScript compilation check (tsc --noEmit)
- Automatic error correction loop
- Multi-turn conversation (revise)
- Project history / git snapshots
- ZIP export
- Docker
- CLI tool
- Claude escalation
