import { test } from "node:test";
import assert from "node:assert/strict";
import extensionFactory from "../dist/extension.js";
import { formatStatusReport, resolveLabelsForLang } from "../src/presets.js";
import { LinguaLruCache } from "../src/cache.js";

test("extension command matrix - registers standardized lingual command suite", () => {
  const registeredCommands: Record<string, any> = {};

  const mockPi: any = {
    on() {},
    registerCommand(name: string, def: any) {
      registeredCommands[name] = def;
    },
    registerShortcut() {},
  };

  extensionFactory(mockPi);

  // Standardized lingual suite
  assert.ok(registeredCommands["lingual"], "Must register /lingual");
  assert.ok(registeredCommands["lingual-mode"], "Must register /lingual-mode");
  assert.ok(registeredCommands["lingual-lang"], "Must register /lingual-lang");
  assert.ok(registeredCommands["lingual-compact"], "Must register /lingual-compact");
  assert.ok(registeredCommands["lingual-model"], "Must register /lingual-model");
  assert.ok(registeredCommands["lingual-status"], "Must register /lingual-status");
  assert.ok(registeredCommands["lingual-last"], "Must register /lingual-last");
  assert.ok(registeredCommands["lingual-agent"], "Must register /lingual-agent");

  // Compatibility aliases
  assert.ok(registeredCommands["lingua"], "Must retain /lingua alias");
  assert.ok(registeredCommands["2"], "Must retain /2 alias");
  assert.ok(registeredCommands["2-lang"], "Must retain /2-lang alias");
  assert.ok(registeredCommands["2-compact"], "Must retain /2-compact alias");
});

test("extension /lingual - supports explicit mode arguments and cycle fallback", async () => {
  const registeredCommands: Record<string, any> = {};
  const mockPi: any = {
    on() {},
    registerCommand(name: string, def: any) {
      registeredCommands[name] = def;
    },
    registerShortcut() {},
  };

  extensionFactory(mockPi);

  const notifications: string[] = [];
  const mockCtx: any = {
    ui: {
      notify(msg: string) {
        notifications.push(msg);
      },
      setStatus() {},
      setWidget() {},
    },
  };

  // 1. Explicitly switch to English mode
  await registeredCommands["lingual"].handler("english", mockCtx);
  assert.ok(notifications[notifications.length - 1].includes("英文") || notifications[notifications.length - 1].includes("English"));

  // 2. Explicitly switch to Off mode
  await registeredCommands["lingual-mode"].handler("off", mockCtx);
  assert.ok(notifications[notifications.length - 1].includes("关闭") || notifications[notifications.length - 1].includes("disabled") || notifications[notifications.length - 1].includes("off"));

  // 3. Explicitly switch to Original mode
  await registeredCommands["lingual"].handler("original", mockCtx);
  assert.ok(notifications[notifications.length - 1].includes("原文") || notifications[notifications.length - 1].includes("Original"));

  // 4. Cycle without arguments: original -> english
  await registeredCommands["lingual"].handler("", mockCtx);
  assert.ok(notifications[notifications.length - 1].includes("英文") || notifications[notifications.length - 1].includes("English"));

  // Teardown: back to original
  await registeredCommands["lingual"].handler("original", mockCtx);
});

test("extension /lingua-compact - toggles capsule and tree layout with notification", async () => {
  const registeredCommands: Record<string, any> = {};
  const mockPi: any = {
    on() {},
    registerCommand(name: string, def: any) {
      registeredCommands[name] = def;
    },
    registerShortcut() {},
  };

  extensionFactory(mockPi);

  const notifications: string[] = [];
  const mockCtx: any = {
    ui: {
      notify(msg: string) {
        notifications.push(msg);
      },
      setStatus() {},
    },
  };

  // Toggle on
  await registeredCommands["lingua-compact"].handler("", mockCtx);
  assert.ok(notifications.length > 0);
  assert.ok(notifications[notifications.length - 1].includes("胶囊") || notifications[notifications.length - 1].includes("Capsule"));

  // Toggle off
  await registeredCommands["2-compact"].handler("", mockCtx);
  assert.ok(notifications.length > 1);
  assert.ok(notifications[notifications.length - 1].includes("树状") || notifications[notifications.length - 1].includes("tree"));
});

test("extension /lingua-lang - switches native language and notifies in target language", async () => {
  const registeredCommands: Record<string, any> = {};
  const mockPi: any = {
    on() {},
    registerCommand(name: string, def: any) {
      registeredCommands[name] = def;
    },
    registerShortcut() {},
  };

  extensionFactory(mockPi);

  const notifications: string[] = [];
  const mockCtx: any = {
    ui: {
      notify(msg: string) {
        notifications.push(msg);
      },
      setStatus() {},
    },
  };

  // 1. Switch to Japanese
  await registeredCommands["lingua-lang"].handler("ja", mockCtx);
  assert.ok(notifications.length > 0);
  assert.ok(notifications[notifications.length - 1].includes("ja"));

  // 2. Invalid language code triggers warning
  await registeredCommands["lingua-lang"].handler("xx", mockCtx);
  assert.ok(notifications.length > 1);

  // 3. No argument displays available languages
  await registeredCommands["lingua-lang"].handler("", mockCtx);
  assert.ok(notifications[notifications.length - 1].includes("zh"));
  assert.ok(notifications[notifications.length - 1].includes("ja"));

  // 4. Teardown: Restore state back to Chinese for subsequent test isolation
  await registeredCommands["lingua-lang"].handler("zh", mockCtx);
});

test("formatStatusReport - includes in-memory cache statistics and hit rate", () => {
  const labels = resolveLabelsForLang("zh");
  const report = formatStatusReport(labels, {
    mode: "original",
    sourceLang: "zh",
    targetLang: "en",
    activeModel: "auto (session)",
    cacheStats: {
      hits: 8,
      misses: 2,
      size: 5,
      capacity: 50,
    },
  });

  assert.ok(report.includes("会话缓存"), "Must include localized cache header");
  assert.ok(report.includes("8 hits / 10 total"), "Must include hit ratio");
  assert.ok(report.includes("80% hit rate"), "Must include percentage");
  assert.ok(report.includes("5/50 items"), "Must include capacity info");
});
