import test from "node:test";
import assert from "node:assert/strict";
import { shouldShieldBypass } from "../src/shield.js";

test("shouldShieldBypass - 0ms bypass for pure CLI commands", () => {
  assert.equal(shouldShieldBypass("git status"), true);
  assert.equal(shouldShieldBypass("git diff HEAD~1"), true);
  assert.equal(shouldShieldBypass("npm run build"), true);
  assert.equal(shouldShieldBypass("cargo build --release"), true);
  assert.equal(shouldShieldBypass("docker ps -a"), true);
  assert.equal(shouldShieldBypass("cd ../project"), true);
  assert.equal(shouldShieldBypass("ls -la"), true);
  assert.equal(shouldShieldBypass("python3 main.py"), true);
  assert.equal(shouldShieldBypass("curl -fsSL https://example.com"), true);
  assert.equal(shouldShieldBypass("git commit -m 'feat: add cache'"), true);
});

test("shouldShieldBypass - 0ms bypass for code blocks and data structures", () => {
  assert.equal(shouldShieldBypass("```typescript\nconst a = 1;\n```"), true);
  assert.equal(shouldShieldBypass("{\n  \"name\": \"pi-lingual\",\n  \"version\": \"0.1.4\"\n}"), true);
  assert.equal(shouldShieldBypass("[1, 2, 3, 4]"), true);
  assert.equal(shouldShieldBypass("SELECT * FROM users WHERE id = 1;"), true);
  assert.equal(shouldShieldBypass("const express = require('express');"), true);
  assert.equal(shouldShieldBypass("function calculateTotal(items) {"), true);
});

test("shouldShieldBypass - does NOT bypass natural language prompts with tech terms", () => {
  assert.equal(shouldShieldBypass("认同，开始吧"), false);
  assert.equal(shouldShieldBypass("这个方案有点过度设计了，不如直接用标准库实现"), false);
  assert.equal(shouldShieldBypass("继续"), false);
  assert.equal(shouldShieldBypass("吃什么？"), false);
  assert.equal(shouldShieldBypass("git status 为什么会报错？"), false);
  assert.equal(shouldShieldBypass("賛成です、進めましょう"), false);
  assert.equal(shouldShieldBypass("De acuerdo, empecemos"), false);
});
