import { test } from "node:test";
import assert from "node:assert/strict";
import { sanitizePromptForTranslation } from "../src/sanitizer.js";

test("sanitizePromptForTranslation - collapses Node.js stack traces while preserving error summary and natural question", () => {
  const input = `
运行 npm test 报错了：
Error: Cannot find module '@earendil-works/pi-ai'
    at Function.Module._resolveFilename (node:internal/modules/cjs/loader:1144:15)
    at Function.Module._load (node:internal/modules/cjs/loader:985:27)
    at Module.require (node:internal/modules/cjs/loader:1235:19)
    at require (node:internal/modules/helpers:176:18)
帮我看看是不是依赖漏装了？
`;

  const res = sanitizePromptForTranslation(input);
  assert.equal(res.hasNaturalLanguage, true, "Must detect user's natural question");
  assert.equal(res.hasCollapsedContent, true, "Must flag collapsed stack trace");
  assert.ok(res.distilledText.includes("运行 npm test 报错了："), "Must keep user context");
  assert.ok(res.distilledText.includes("Error: Cannot find module"), "Must keep root error summary");
  assert.ok(res.distilledText.includes("帮我看看是不是依赖漏装了？"), "Must keep trailing question");
  assert.ok(res.distilledText.includes("[... stack trace ...]"), "Must replace multi-line frames with placeholder");
  assert.ok(!res.distilledText.includes("loader:1144:15"), "Must strip verbose frame details");
});

test("sanitizePromptForTranslation - collapses Python Tracebacks cleanly", () => {
  const input = `
Traceback (most recent call last):
  File "train.py", line 42, in <module>
    loss = model(inputs)
  File "torch/nn/modules/module.py", line 1501, in _call_impl
    return forward_call(*args, **kwargs)
RuntimeError: CUDA out of memory.
这个显存爆了要怎么调参数？
`;

  const res = sanitizePromptForTranslation(input);
  assert.equal(res.hasNaturalLanguage, true);
  assert.ok(res.distilledText.includes("RuntimeError: CUDA out of memory."));
  assert.ok(res.distilledText.includes("这个显存爆了要怎么调参数？"));
  assert.ok(!res.distilledText.includes("line 1501"));
});

test("sanitizePromptForTranslation - collapses Markdown code fences into [code ...]", () => {
  const input = `
看下这段代码：
\`\`\`typescript
interface User {
  id: string;
  name: string;
  age: number;
}
function validate(u: User) {
  return u.age > 18;
}
\`\`\`
把这个校验改成异步的
`;

  const res = sanitizePromptForTranslation(input);
  assert.equal(res.hasNaturalLanguage, true);
  assert.ok(res.distilledText.includes("看下这段代码："));
  assert.ok(res.distilledText.includes("[code ...]"));
  assert.ok(res.distilledText.includes("把这个校验改成异步的"));
});

test("sanitizePromptForTranslation - strips clipboard image path prefixes", () => {
  const input = "C:\\Users\\Jason\\AppData\\Local\\Temp\\pi-clipboard-2ad05868-7d8c-4cea-841f-23c1c675a52a.png 还有，这次对话运行这么长时间了，到底什么原因？";

  const res = sanitizePromptForTranslation(input);
  assert.equal(res.hasNaturalLanguage, true);
  assert.ok(!res.distilledText.includes("pi-clipboard"));
  assert.ok(res.distilledText.startsWith("还有，这次对话运行这么长时间了"));
});

test("sanitizePromptForTranslation - identifies pure stack trace with zero natural language", () => {
  const input = `
Error: ENOENT: no such file or directory
    at Object.openSync (node:fs:596:3)
    at Object.readFileSync (node:fs:464:35)
    at parseConfig (/app/dist/index.js:42:10)
`;

  const res = sanitizePromptForTranslation(input);
  assert.equal(res.hasNaturalLanguage, false, "Pure stack trace should have no natural intent");
});

test("sanitizePromptForTranslation - strictly preserves CLI command verbatim", () => {
  const input = "用 git cherry-pick 把那个 commit 捡过来，注意别把冲突提交上去";

  const res = sanitizePromptForTranslation(input);
  assert.equal(res.hasNaturalLanguage, true);
  assert.ok(res.distilledText.includes("git cherry-pick"), "Command prototype must remain 100% intact");
  assert.ok(res.distilledText.includes("commit"), "Technical keyword must remain 100% intact");
});

test("sanitizePromptForTranslation - extracts rawPayload for hybrid intent grafting", () => {
  const input = `
看下这段代码报错了：
\`\`\`typescript
const a: number = "string";
\`\`\`
帮我修复一下
`;

  const res = sanitizePromptForTranslation(input);
  assert.equal(res.hasCollapsedContent, true);
  assert.ok(res.rawPayload, "Must extract raw code payload");
  assert.ok(res.rawPayload.includes("const a: number"), "Payload must contain original code for AI context");
});
