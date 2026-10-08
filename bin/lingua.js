#!/usr/bin/env node

import { translatePrompt } from "../dist/index.js";

async function main() {
  const args = process.argv.slice(2);
  const input = args.join(" ").trim();

  if (!input) {
    console.log("Usage: lingua <Chinese prompt>");
    console.log('Example: lingua "帮我检查当前所有的pi插件"');
    process.exit(1);
  }

  const result = await translatePrompt(input);
  if (!result) {
    console.error("Translation failed or input contains no Chinese characters.");
    process.exit(1);
  }

  console.log(result.annotated);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
