import test from "node:test";
import assert from "node:assert/strict";
import { evaluateReceipt, sha256 } from "../src/evidence.mjs";
import {
  controlFixture,
  mutateFixture,
  FIXTURE_CLOCK,
} from "../src/fixtures.mjs";
import { catalog, runLab } from "../src/lab.mjs";

test("hash uses the standard SHA-256 byte digest", () => {
  assert.equal(
    sha256("abc"),
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  );
});
for (const example of catalog.cases) {
  test(`corpus: ${example.id}`, () => {
    const input = mutateFixture(controlFixture(), example.mutation);
    const result = evaluateReceipt(input.receipt, input);
    assert.equal(result.consistent, example.consistent);
    if (example.expected_code)
      assert.ok(
        result.findings.some(
          (finding) => finding.code === example.expected_code,
        ),
      );
    assert.equal(result.semantically_validated, false);
  });
}
test("age bounds include exactly the declared boundary", () => {
  const input = controlFixture();
  input.receipt.created_at = new Date(FIXTURE_CLOCK - 3600000).toISOString();
  assert.equal(evaluateReceipt(input.receipt, input).consistent, true);
  input.receipt.created_at = new Date(FIXTURE_CLOCK - 3600001).toISOString();
  assert.ok(
    evaluateReceipt(input.receipt, input).findings.some(
      (item) => item.code === "STALE_RECEIPT",
    ),
  );
});
test("changing even whitespace in actual policy bytes requires a new receipt", () => {
  const input = controlFixture();
  input.policyBytes = Buffer.concat([input.policyBytes, Buffer.from("\n")]);
  assert.ok(
    evaluateReceipt(input.receipt, input).findings.some(
      (item) => item.code === "POLICY_MISMATCH",
    ),
  );
});
test("an invalid policy cannot weaken required checks", () => {
  const input = controlFixture();
  input.policyBytes = Buffer.from(
    JSON.stringify({ required_checks: [], min_inspected_items: 0 }),
  );
  const result = evaluateReceipt(input.receipt, input);
  assert.equal(result.consistent, false);
  assert.equal(result.findings[0].code, "POLICY_INVALID");
});
test("malformed receipts and check fields produce explicit findings", () => {
  const input = controlFixture();
  for (const receipt of [null, [], "reviewed", { schema_version: 9 }])
    assert.equal(evaluateReceipt(receipt, input).consistent, false);
  input.receipt.checks = [
    null,
    { id: "review", status: "magic", inspected_items: "1", evidence: null },
  ];
  const codes = evaluateReceipt(input.receipt, input).findings.map(
    (item) => item.code,
  );
  for (const code of [
    "CHECK_INVALID",
    "CHECK_STATE_INVALID",
    "INSUFFICIENT_INSPECTION",
    "EVIDENCE_MISSING",
  ])
    assert.ok(codes.includes(code));
});
test("fabricated but internally consistent evidence remains outside the trust boundary", () => {
  const input = mutateFixture(controlFixture(), "forged-but-consistent");
  const result = evaluateReceipt(input.receipt, input);
  assert.equal(result.consistent, true);
  assert.equal(result.semantically_validated, false);
  assert.match(result.trust_boundary, /not fabricated reviews/);
});
test("fixture replay is deterministic and has explicit control and limitation cases", () => {
  assert.deepEqual(runLab(), runLab());
  const report = runLab();
  assert.equal(report.expectations_met, report.cases);
  assert.equal(report.results.filter((item) => !item.consistent).length, 15);
  assert.equal(
    report.results.filter((item) => item.role === "limitation").length,
    1,
  );
});
