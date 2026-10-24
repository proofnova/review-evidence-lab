import { sha256 } from "./evidence.mjs";

export const FIXTURE_CLOCK = Date.parse("2026-01-01T12:00:00.000Z");

export function controlFixture() {
  const materialBytes = Buffer.from(
    "Synthetic change: handle an empty input.\n",
  );
  const policyBytes = Buffer.from(
    JSON.stringify({
      required_checks: ["review", "tests"],
      min_inspected_items: 1,
      max_age_seconds: 3600,
      future_tolerance_seconds: 60,
    }),
  );
  const artifacts = {
    "review.txt": Buffer.from(
      "Synthetic review notes; no person performed this review.\n",
    ),
    "tests.txt": Buffer.from(
      "Synthetic test output; the fixture is not a real external test run.\n",
    ),
  };
  const materialHash = sha256(materialBytes);
  const receipt = {
    schema_version: 1,
    synthetic: true,
    summary: "success",
    created_at: new Date(FIXTURE_CLOCK).toISOString(),
    material_sha256: materialHash,
    policy_sha256: sha256(policyBytes),
    checks: ["review", "tests"].map((id) => ({
      id,
      status: "passed",
      material_sha256: materialHash,
      inspected_items: 1,
      evidence: [
        { artifact_id: `${id}.txt`, sha256: sha256(artifacts[`${id}.txt`]) },
      ],
    })),
  };
  return { receipt, materialBytes, policyBytes, artifacts, now: FIXTURE_CLOCK };
}

export function mutateFixture(fixture, mutation) {
  const { receipt, artifacts } = fixture;
  switch (mutation) {
    case "none":
      break;
    case "missing-checks":
      receipt.checks = [];
      break;
    case "required-check-skipped":
      receipt.checks[0].status = "skipped";
      break;
    case "unknown-review-state":
      receipt.checks[0].status = "unknown";
      break;
    case "failure-behind-summary":
      receipt.checks[0].status = "failed";
      break;
    case "zero-selected-items":
      receipt.checks[0].inspected_items = 0;
      break;
    case "duplicate-check-id":
      receipt.checks.push(structuredClone(receipt.checks[0]));
      break;
    case "material-changed":
      fixture.materialBytes = Buffer.from(
        "Synthetic change: a different behavior.\n",
      );
      break;
    case "policy-changed":
      fixture.policyBytes = Buffer.from(
        JSON.stringify({
          ...JSON.parse(fixture.policyBytes),
          min_inspected_items: 2,
        }),
      );
      break;
    case "artifact-absent":
      delete artifacts["review.txt"];
      break;
    case "artifact-changed":
      artifacts["review.txt"] = Buffer.from("Overwritten log.\n");
      break;
    case "artifact-empty":
      artifacts["review.txt"] = Buffer.alloc(0);
      receipt.checks[0].evidence[0].sha256 = sha256(artifacts["review.txt"]);
      break;
    case "receipt-too-old":
      receipt.created_at = new Date(FIXTURE_CLOCK - 3600001).toISOString();
      break;
    case "receipt-in-future":
      receipt.created_at = new Date(FIXTURE_CLOCK + 60001).toISOString();
      break;
    case "one-check-omitted":
      receipt.checks.pop();
      break;
    case "check-for-other-scope":
      receipt.checks[0].material_sha256 = sha256("a different subject");
      break;
    case "forged-but-consistent":
      artifacts["review.txt"] = Buffer.from(
        "A fabricated review statement, still internally consistent.",
      );
      receipt.checks[0].evidence[0].sha256 = sha256(artifacts["review.txt"]);
      break;
    default:
      throw new Error(`Unknown fixture mutation: ${mutation}`);
  }
  return fixture;
}
