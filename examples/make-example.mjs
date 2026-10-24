#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { controlFixture } from "../src/fixtures.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.join(root, "reports", "demo");
if (process.argv.length > 2) {
  console.error(
    "Usage: node examples/make-example.mjs (creates reports/demo; refuses to overwrite it)",
  );
  process.exitCode = 2;
} else {
  try {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.mkdirSync(target); // Deliberately refuse to overwrite an existing example.
    const fixture = controlFixture();
    fixture.receipt.created_at = new Date().toISOString();
    fs.writeFileSync(path.join(target, "material.txt"), fixture.materialBytes);
    fs.writeFileSync(path.join(target, "policy.json"), fixture.policyBytes);
    fs.writeFileSync(
      path.join(target, "receipt.json"),
      `${JSON.stringify(fixture.receipt, null, 2)}\n`,
    );
    fs.mkdirSync(path.join(target, "artifacts"));
    for (const [name, content] of Object.entries(fixture.artifacts))
      fs.writeFileSync(path.join(target, "artifacts", name), content);
    console.log("Created a synthetic example, not an actual review.");
    console.log(
      "node src/verify.mjs --receipt reports/demo/receipt.json --material reports/demo/material.txt --policy reports/demo/policy.json --artifacts reports/demo/artifacts",
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
  }
}
