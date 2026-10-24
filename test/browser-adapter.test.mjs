import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { browserFixtures } from "../scripts/build-browser-fixtures.mjs";
import { asBytes, verifyInBrowser } from "../web/verify.mjs";
import { evaluateReceipt } from "../src/evidence.mjs";

test("Web Crypto adapter agrees with Node on every published fixture", async () => {
  for (const fixture of browserFixtures()) {
    const context = {
      materialBytes: asBytes(fixture.material),
      policyBytes: asBytes(fixture.policy),
      artifacts: fixture.artifacts,
      now: fixture.now,
    };
    assert.deepEqual(
      await verifyInBrowser(fixture.receipt, context),
      evaluateReceipt(fixture.receipt, context),
      fixture.id,
    );
  }
});

test("browser fixture cache is exactly generated from the source corpus", () => {
  const actual = JSON.parse(
    fs.readFileSync(new URL("../web/fixtures.json", import.meta.url), "utf8"),
  );
  assert.deepEqual(actual, browserFixtures());
});
