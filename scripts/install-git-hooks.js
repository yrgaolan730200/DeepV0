#!/usr/bin/env node

/**
 * Installs a commit-msg hook that validates Chinese commit message conventions.
 * No external dependencies — uses only Node.js built-in modules.
 */

const fs = require("node:fs");
const path = require("node:path");

const HOOKS_DIR = path.resolve(__dirname, "..", ".git", "hooks");
const HOOK_FILE = path.join(HOOKS_DIR, "commit-msg");

const HOOK_CONTENT = `#!/bin/sh
# vSeek commit-msg hook — validates Chinese commit message conventions
node scripts/validate-commit-message.js "$1"
`;

// Ensure hooks directory exists
if (!fs.existsSync(HOOKS_DIR)) {
  fs.mkdirSync(HOOKS_DIR, { recursive: true });
}

// Write hook file
fs.writeFileSync(HOOK_FILE, HOOK_CONTENT, { mode: 0o755 });

console.log("✅ Git commit-msg hook installed at .git/hooks/commit-msg");
console.log("   以后每次 git commit 都会校验中文提交规范。");
