#!/usr/bin/env node

import { translatePrompt } from "../dist/index.js";

const VERSION = "0.1.2";

async function main() {
  const args = process.argv.slice(2);
  const input = args.join(" ").trim();

  if (!input || input === "--help" || input === "-h") {
    console.log(`pi-lingual (v${VERSION}) 🌐 - Developer Translator & Bilingual Companion`);
    console.log("\nUsage:");
    console.log("  lingua <prompt>           Translate prompt and display spoken/written registers");
    console.log("  lingual <prompt>          Alias for lingua");
    console.log("  translate <prompt>        Alias for lingua");
    console.log("  2 <prompt>                Fast CLI alias");
    console.log("\nOptions:");
    console.log("  -h, --help                Show this help message");
    console.log("  -v, --version             Show version number");
    console.log("\nExample:");
    console.log('  lingua "这个方案有点过度设计了，不如直接用标准库实现"');
    console.log('  2 "吃什么？"');
    console.log("\nZero-Config Notice:");
    console.log("  Inside Pi Coding Agent, pi-lingual uses your active session model automatically (Zero Config).");
    console.log("  For standalone CLI outside Pi, configure ~/.pi/agent/lingua.json or LINGUA_ENDPOINT environment variable.");
    process.exit(input ? 0 : 1);
  }

  if (input === "--version" || input === "-v") {
    console.log(`v${VERSION}`);
    process.exit(0);
  }

  const result = await translatePrompt(input);
  if (!result) {
    console.error("Translation skipped. (Input may be non-natural-language, or no endpoint/model is configured for standalone CLI).");
    console.error("💡 Tip: In Pi Coding Agent, it works out-of-the-box via session models. For CLI, configure ~/.pi/agent/lingua.json.");
    process.exit(1);
  }

  console.log(result.annotated);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
