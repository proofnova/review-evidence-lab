#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateReceipt } from "./evidence.mjs";

const MAX_FILE_BYTES = 512 * 1024;
const MAX_TOTAL_BYTES = 8 * 1024 * 1024;

function readBounded(file) {
  const stat = fs.statSync(file);
  if (!stat.isFile() || stat.size > MAX_FILE_BYTES)
    throw new Error("Inputs must be regular files of at most 512 KiB.");
  return fs.readFileSync(file);
}

export function loadVerificationInput({
  receiptFile,
  materialFile,
  policyFile,
  artifactsDirectory,
}) {
  const receipt = JSON.parse(readBounded(receiptFile).toString("utf8"));
  const materialBytes = readBounded(materialFile);
  const policyBytes = readBounded(policyFile);
  const root = fs.realpathSync(artifactsDirectory);
  if (!fs.statSync(root).isDirectory())
    throw new Error("Artifacts must be supplied as a directory.");
  const artifacts = Object.create(null);
  const references = Array.isArray(receipt?.checks)
    ? receipt.checks.flatMap((check) =>
        Array.isArray(check?.evidence) ? check.evidence : [],
      )
    : [];
  if (references.length > 1000)
    throw new Error("Too many evidence references.");
  let totalBytes = materialBytes.length + policyBytes.length;
  for (const reference of references) {
    const name = reference?.artifact_id;
    if (typeof name !== "string") continue; // The evaluator reports malformed fields.
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,100}$/.test(name))
      throw new Error(
        "Artifact IDs must be plain filenames without directory segments.",
      );
    if (Object.hasOwn(artifacts, name)) continue;
    const candidate = path.join(root, name);
    let actual;
    try {
      actual = fs.realpathSync(candidate);
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }
    const relative = path.relative(root, actual);
    if (
      relative === ".." ||
      relative.startsWith(`..${path.sep}`) ||
      path.isAbsolute(relative)
    )
      throw new Error("Artifact resolves outside the supplied directory.");
    const bytes = readBounded(actual);
    totalBytes += bytes.length;
    if (totalBytes > MAX_TOTAL_BYTES)
      throw new Error("Combined input exceeds 8 MiB.");
    artifacts[name] = bytes;
  }
  return { receipt, materialBytes, policyBytes, artifacts };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === "--help") {
    console.log(
      "node src/verify.mjs --receipt receipt.json --material material.txt --policy policy.json --artifacts artifacts/",
    );
    console.log(
      "Exit 0: consistent record; 1: inconsistent; 2: invalid/unreadable input. No commands or network requests are executed.",
    );
    return;
  }
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    if (
      !["--receipt", "--material", "--policy", "--artifacts"].includes(
        args[i],
      ) ||
      !args[i + 1] ||
      args[i + 1].startsWith("--") ||
      Object.hasOwn(options, args[i])
    )
      throw new Error(
        "Supply each of --receipt, --material, --policy and --artifacts exactly once.",
      );
    options[args[i]] = args[i + 1];
  }
  if (Object.keys(options).length !== 4)
    throw new Error("Missing required input. Use --help.");
  const input = loadVerificationInput({
    receiptFile: options["--receipt"],
    materialFile: options["--material"],
    policyFile: options["--policy"],
    artifactsDirectory: options["--artifacts"],
  });
  const result = evaluateReceipt(input.receipt, input);
  console.log(JSON.stringify(result, null, 2));
  if (!result.consistent) process.exitCode = 1;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    main();
  } catch (error) {
    console.log(
      JSON.stringify(
        {
          consistent: false,
          status: "input-error",
          semantically_validated: false,
          findings: [{ code: "INPUT_ERROR", message: error.message }],
        },
        null,
        2,
      ),
    );
    process.exitCode = 2;
  }
}
