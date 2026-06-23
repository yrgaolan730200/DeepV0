#!/usr/bin/env node

/**
 * Validates that commit messages use Chinese plain language,
 * NOT English Conventional Commit prefixes.
 *
 * Usage: node scripts/validate-commit-message.js <commit-msg-file-path>
 */

const fs = require("node:fs");
const path = require("node:path");

const msgFilePath = process.argv[2];

if (!msgFilePath) {
  console.error("Usage: node scripts/validate-commit-message.js <commit-msg-file>");
  process.exit(1);
}

let raw;
try {
  raw = fs.readFileSync(msgFilePath, "utf-8");
} catch {
  console.error(`Cannot read commit message file: ${msgFilePath}`);
  process.exit(1);
}

const firstLine = raw.trim().split("\n")[0]?.trim() ?? "";

if (!firstLine) {
  console.error("❌ Commit message cannot be empty.");
  process.exit(1);
}

// Allow merge commits
if (firstLine.startsWith("Merge") || firstLine.startsWith("合并")) {
  console.log("✅ Merge commit — skipping validation.");
  process.exit(0);
}

// Block English Conventional Commit prefixes
const FORBIDDEN_PREFIXES = [
  "chore:",
  "feat:",
  "fix:",
  "docs:",
  "refactor:",
  "test:",
  "build:",
  "ci:",
  "style:",
  "perf:",
  "revert:",
  "wip:",
];

const lowerLine = firstLine.toLowerCase();
for (const prefix of FORBIDDEN_PREFIXES) {
  if (lowerLine.startsWith(prefix)) {
    console.error(`❌ 不要使用英文 Conventional Commit 前缀 "${prefix}"。`);
    console.error("   请用中文大白话写 commit message。");
    console.error("   示例: 接入 DeepSeek，生成项目文件");
    console.error("   详见 docs/GIT_CONVENTIONS.md");
    process.exit(1);
  }
}

// Require at least one Chinese character
const hasChinese = /[一-鿿㐀-䶿]/.test(firstLine);
if (!hasChinese) {
  console.error("❌ Commit message 第一行必须包含中文字符。");
  console.error(`   当前内容: "${firstLine}"`);
  console.error("   请用中文大白话描述这次改动。");
  console.error("   示例: 接入 DeepSeek，生成项目文件");
  console.error("   详见 docs/GIT_CONVENTIONS.md");
  process.exit(1);
}

console.log("✅ Commit message 通过中文规范检查。");
process.exit(0);
