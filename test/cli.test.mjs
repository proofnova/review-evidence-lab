import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { controlFixture } from "../src/fixtures.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
function setup(t) {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "review-evidence-lab-"),
  );
  t.after(() => {
    assert.equal(path.dirname(directory), fs.realpathSync(os.tmpdir()));
    fs.rmSync(directory, { recursive: true, force: true });
  });
  const input = controlFixture();
  input.receipt.created_at = new Date().toISOString();
  fs.writeFileSync(
    path.join(directory, "receipt.json"),
    JSON.stringify(input.receipt),
  );
  fs.writeFileSync(path.join(directory, "material.txt"), input.materialBytes);
  fs.writeFileSync(path.join(directory, "policy.json"), input.policyBytes);
  fs.mkdirSync(path.join(directory, "artifacts"));
  for (const [name, bytes] of Object.entries(input.artifacts))
    fs.writeFileSync(path.join(directory, "artifacts", name), bytes);
  const run = (extra) =>
    spawnSync(
      process.execPath,
      [
        path.join(root, "src/verify.mjs"),
        "--receipt",
        path.join(directory, "receipt.json"),
        "--material",
        path.join(directory, "material.txt"),
        "--policy",
        path.join(directory, "policy.json"),
        "--artifacts",
        path.join(directory, "artifacts"),
        ...(extra ?? []),
      ],
      { encoding: "utf8", windowsHide: true },
    );
  return { directory, input, run };
}
test("CLI verifies actual files and rejects an overwritten material file", (t) => {
  const fixture = setup(t);
  assert.equal(fixture.run().status, 0);
  fs.writeFileSync(
    path.join(fixture.directory, "material.txt"),
    "changed bytes",
  );
  const result = fixture.run();
  assert.equal(result.status, 1);
  assert.ok(
    JSON.parse(result.stdout).findings.some(
      (item) => item.code === "MATERIAL_MISMATCH",
    ),
  );
});
test("CLI rejects missing evidence without converting it to success", (t) => {
  const fixture = setup(t);
  fs.unlinkSync(path.join(fixture.directory, "artifacts/review.txt"));
  const result = fixture.run();
  assert.equal(result.status, 1);
  assert.ok(
    JSON.parse(result.stdout).findings.some(
      (item) => item.code === "ARTIFACT_MISSING",
    ),
  );
});
test("CLI rejects path traversal and malformed JSON", (t) => {
  const fixture = setup(t);
  fixture.input.receipt.checks[0].evidence[0].artifact_id = "../material.txt";
  fs.writeFileSync(
    path.join(fixture.directory, "receipt.json"),
    JSON.stringify(fixture.input.receipt),
  );
  assert.equal(fixture.run().status, 2);
  fs.writeFileSync(path.join(fixture.directory, "receipt.json"), "{broken");
  assert.equal(fixture.run().status, 2);
});
test("CLI rejects duplicate options instead of changing the trusted material", (t) => {
  const fixture = setup(t);
  assert.equal(
    fixture.run(["--material", path.join(fixture.directory, "policy.json")])
      .status,
    2,
  );
});
test("artifact symlinks may not escape their supplied directory", (t) => {
  const fixture = setup(t);
  const artifact = path.join(fixture.directory, "artifacts/review.txt");
  fs.unlinkSync(artifact);
  try {
    fs.symlinkSync(
      path.join(fixture.directory, "material.txt"),
      artifact,
      "file",
    );
  } catch (error) {
    if (["EPERM", "EACCES"].includes(error.code)) {
      t.skip("Host does not permit file symlink creation");
      return;
    }
    throw error;
  }
  assert.equal(fixture.run().status, 2);
});
test("CLI report cannot overwrite source files", () => {
  const target = path.join(root, "src/evidence.mjs");
  const before = fs.readFileSync(target);
  const run = spawnSync(
    process.execPath,
    [path.join(root, "src/lab.mjs"), "--out", target],
    { encoding: "utf8", windowsHide: true },
  );
  assert.equal(run.status, 2);
  assert.deepEqual(fs.readFileSync(target), before);
});
