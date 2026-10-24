import fs from "node:fs";
import { catalog } from "../src/lab.mjs";
import { controlFixture, mutateFixture } from "../src/fixtures.mjs";

export function browserFixtures() {
  return catalog.cases.map((item) => {
    const fixture = mutateFixture(controlFixture(), item.mutation);
    return {
      ...item,
      receipt: fixture.receipt,
      material: fixture.materialBytes.toString("utf8"),
      policy: fixture.policyBytes.toString("utf8"),
      artifacts: Object.fromEntries(
        Object.entries(fixture.artifacts).map(([name, bytes]) => [
          name,
          bytes.toString("utf8"),
        ]),
      ),
      now: fixture.now,
    };
  });
}

if (process.argv[1]?.endsWith("build-browser-fixtures.mjs")) {
  fs.writeFileSync(
    new URL("../web/fixtures.json", import.meta.url),
    `${JSON.stringify(browserFixtures(), null, 2)}\n`,
  );
  console.log(
    "Wrote synthetic browser fixtures. Re-run after changing the corpus.",
  );
}
