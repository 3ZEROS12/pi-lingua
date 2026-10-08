import { test } from "node:test";
import assert from "node:assert/strict";
import extensionFactory from "../dist/extension.js";
import { formatStatusReport, resolveLabelsForLang } from "../src/presets.js";
import { LinguaLruCache } from "../src/cache.js";

test("extension command matrix - registers lingua-lang, lingual-lang, and 2-lang commands", () => {
  const registeredCommands: Record<string, any> = {};

  const mockPi: any = {
    on() {},
    registerCommand(name: string, def: any) {
      registeredCommands[name] = def;
    },
    registerShortcut() {},
  };

  extensionFactory(mockPi);

  assert.ok(registeredCommands["lingua-lang"], "Must register /lingua-lang");
  assert.ok(registeredCommands["lingual-lang"], "Must register /lingual-lang");
  assert.ok(registeredCommands["2-lang"], "Must register /2-lang");
  assert.ok(registeredCommands["lingua-compact"], "Must register /lingua-compact");
  assert.ok(registeredCommands["lingual-compact"], "Must register /lingual-compact");
  assert.ok(registeredCommands["2-compact"], "Must register /2-compact");
  assert.ok(registeredCommands["lingua-status"], "Must register /lingua-status");
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
