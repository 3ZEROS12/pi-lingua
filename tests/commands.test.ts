import { test } from "node:test";
import assert from "node:assert/strict";
import extensionFactory from "../dist/extension.js";
import { formatStatusReport, resolveLabelsForLang } from "../src/presets.js";
import { LingualLruCache } from "../src/cache.js";

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

  // Standalone intuitive developer commands
  assert.ok(registeredCommands["lang"], "Must register standalone /lang");
  assert.ok(registeredCommands["slots"], "Must register standalone /slots");
  assert.ok(registeredCommands["compact"], "Must register standalone /compact");
  assert.ok(registeredCommands["status"], "Must register standalone /status");
  assert.ok(registeredCommands["last"], "Must register standalone /last");
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

test("extension /lingual-compact - toggles capsule and tree layout with notification", async () => {
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
  await registeredCommands["lingual-compact"].handler("", mockCtx);
  assert.ok(notifications.length > 0);
  assert.ok(
    notifications[notifications.length - 1].includes("胶囊") ||
    notifications[notifications.length - 1].includes("Capsule") ||
    notifications[notifications.length - 1].includes("カプセル")
  );

  // Toggle off
  await registeredCommands["lingual-compact"].handler("", mockCtx);
  assert.ok(notifications.length > 1);
  assert.ok(
    notifications[notifications.length - 1].includes("树状") ||
    notifications[notifications.length - 1].includes("tree") ||
    notifications[notifications.length - 1].includes("ツリー")
  );
});

test("standalone /lang and language normalization - switches languages and handles pairs & aliases", async () => {
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

  // 1. Direct /lang ja
  await registeredCommands["lang"].handler("ja", mockCtx);
  assert.ok(notifications[notifications.length - 1].includes("ja"));

  // 2. Natural language alias: /lang japanese
  await registeredCommands["lang"].handler("japanese", mockCtx);
  assert.ok(notifications[notifications.length - 1].includes("ja"));

  // 3. CJK alias: /lang 日语
  await registeredCommands["lang"].handler("日语", mockCtx);
  assert.ok(notifications[notifications.length - 1].includes("ja"));

  // 4. Language pair: /lang zh ja
  await registeredCommands["lang"].handler("zh ja", mockCtx);
  assert.ok(notifications[notifications.length - 1].includes("zh ⇄ ja"));

  // 5. Standalone /compact command
  await registeredCommands["compact"].handler("", mockCtx);
  assert.ok(
    notifications[notifications.length - 1].includes("胶囊") ||
    notifications[notifications.length - 1].includes("Capsule") ||
    notifications[notifications.length - 1].includes("capsule") ||
    notifications[notifications.length - 1].includes("カプセル")
  );

  // Teardown: Restore to zh ➔ en and tree layout
  await registeredCommands["lang"].handler("zh", mockCtx);
  await registeredCommands["compact"].handler("", mockCtx);
});

test("master command dispatcher - routes subcommands in /lingual smoothly", async () => {
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

  // 1. Subcommand: /lingual lang ja
  await registeredCommands["lingual"].handler("lang ja", mockCtx);
  assert.ok(notifications[notifications.length - 1].includes("ja"));

  // 2. Subcommand: /lingual lang zh
  await registeredCommands["lingual"].handler("lang zh", mockCtx);
  assert.ok(notifications[notifications.length - 1].includes("zh"));

  // 3. Direct language code: /lingual ja
  await registeredCommands["lingual"].handler("ja", mockCtx);
  assert.ok(notifications[notifications.length - 1].includes("ja"));

  // 4. Subcommand: /lingual compact
  await registeredCommands["lingual"].handler("compact", mockCtx);
  assert.ok(
    notifications[notifications.length - 1].includes("胶囊") ||
    notifications[notifications.length - 1].includes("Capsule") ||
    notifications[notifications.length - 1].includes("カプセル")
  );

  // 5. Subcommand: /lingual compact (toggle back)
  await registeredCommands["lingual"].handler("compact", mockCtx);
  assert.ok(
    notifications[notifications.length - 1].includes("树状") ||
    notifications[notifications.length - 1].includes("tree") ||
    notifications[notifications.length - 1].includes("ツリー")
  );

  // 6. Subcommand: /lingual status
  await registeredCommands["lingual"].handler("status", mockCtx);
  assert.ok(
    notifications[notifications.length - 1].includes("报告") ||
    notifications[notifications.length - 1].includes("Status") ||
    notifications[notifications.length - 1].includes("ステータス")
  );

  // Teardown: Restore to zh
  await registeredCommands["lingual"].handler("lang zh", mockCtx);
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

test("extension paging - non-translating inputs fully clear pagination pool to prevent ghost resurrection", async () => {
  let registeredInputHandler: any = null;
  const registeredShortcuts: Record<string, any> = {};

  const mockPi: any = {
    on(event: string, handler: any) {
      if (event === "input") registeredInputHandler = handler;
    },
    registerCommand() {},
    registerShortcut(key: string, def: any) {
      registeredShortcuts[key] = def;
    },
  };

  let activeWidget: any = undefined;
  const mockCtx: any = {
    hasUI: true,
    ui: {
      setWidget(_key: string, content: any) {
        activeWidget = content;
      },
      setStatus() {},
      notify() {},
      theme: { fg: (_c: string, t: string) => t },
    },
  };

  extensionFactory(mockPi);

  // Send a non-translating command (e.g. CLI command)
  await registeredInputHandler({ type: "input", text: "git status", source: "interactive" }, mockCtx);
  assert.equal(activeWidget, undefined, "Widget must be dismissed on non-translating inputs");

  // Pressing Alt+. after dismissal must NOT resurrect previous companion card
  if (registeredShortcuts["alt+."]) {
    await registeredShortcuts["alt+."].handler(mockCtx);
    assert.equal(activeWidget, undefined, "Ghost companion card must NOT resurrect after dismissal");
  }
});
