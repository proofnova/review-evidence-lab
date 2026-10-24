#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateReceipt, sha256 } from "./evidence.mjs";
import { controlFixture, mutateFixture, FIXTURE_CLOCK } from "./fixtures.mjs";

const catalogBytes = fs.readFileSync(
  new URL("../cases/catalog.json", import.meta.url),
);
export const catalog = JSON.parse(catalogBytes);

export function runLab() {
  const results = catalog.cases.map((testCase) => {
    const fixture = mutateFixture(controlFixture(), testCase.mutation);
    const actual = evaluateReceipt(fixture.receipt, fixture);
    const matched =
      actual.consistent === testCase.consistent &&
      (testCase.expected_code === null ||
        actual.findings.some(
          (finding) => finding.code === testCase.expected_code,
        ));
    return {
      id: testCase.id,
      role: testCase.role ?? "invariant",
      summary_only_demo: fixture.receipt.summary === "success",
      consistent: actual.consistent,
      expected_code: testCase.expected_code,
      actual_codes: actual.findings.map((finding) => finding.code),
      expectation_matched: matched,
      lesson: testCase.lesson,
    };
  });
  return {
    schema_version: 1,
    synthetic: true,
    evaluation_clock: new Date(FIXTURE_CLOCK).toISOString(),
    catalog_sha256: sha256(catalogBytes),
    cases: results.length,
    expectations_met: results.filter((result) => result.expectation_matched)
      .length,
    results,
    limitations: [
      "Deterministic teaching fixtures, not production-tool benchmarks.",
      "Record consistency does not authenticate claims, prove review quality or demonstrate external user impact.",
    ],
  };
}

function main() {
  const args = process.argv.slice(2);
  if (!(
    args.length === 0 ||
    (args.length === 2 &&
      args[0] === "--out" &&
      args[1] &&
      !args[1].startsWith("--"))
  ))
    throw new Error("Usage: node src/lab.mjs [--out REPORT.json]");
  const report = runLab();
  if (args.length) {
    const target = path.resolve(args[1]);
    const root = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "..",
    );
    // Report output cannot silently replace any source/catalog/document in this repo.
    const allowed = path.join(root, "reports");
    const relative = path.relative(allowed, target);
    if (
      relative.startsWith("..") ||
      path.isAbsolute(relative) ||
      !relative ||
      !target.endsWith(".json")
    )
      throw new Error("Report output must be a JSON file inside reports/.");
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, `${JSON.stringify(report, null, 2)}\n`);
  }
  console.table(
    report.results.map((result) => ({
      case: result.id,
      summary_only_demo: result.summary_only_demo ? "accept" : "reject",
      reference: result.consistent ? "consistent" : "reject",
      expected_code: result.expected_code ?? result.role.toUpperCase(),
      matched: result.expectation_matched,
    })),
  );
  console.log(
    `Synthetic expectations met: ${report.expectations_met}/${report.cases}. No semantic-review or adoption claim.`,
  );
  if (report.expectations_met !== report.cases) process.exitCode = 1;
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
  }
}
