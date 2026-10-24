const decodeText = (value) =>
  typeof value === "string" ? value : new TextDecoder().decode(value);

const object = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const text = (value) => typeof value === "string" && value.trim().length > 0;
const digest = (value) =>
  typeof value === "string" && /^[0-9a-f]{64}$/.test(value);
const CHECK_STATES = new Set([
  "passed",
  "failed",
  "skipped",
  "unknown",
  "not-run",
]);
// Material and policy use exact file bytes, not a reserialized JSON object.
export function evaluateReceipt(
  receipt,
  { materialBytes, policyBytes, artifacts = {}, now = Date.now(), sha256 },
) {
  const findings = [];
  const add = (code, message, check_id = null) =>
    findings.push({ code, message, check_id });
  const result = () => ({
    schema_version: 1,
    consistent: findings.length === 0,
    status: findings.length ? "inconsistent" : "receipt-consistent",
    synthetic: receipt?.synthetic === true,
    semantically_validated: false,
    findings,
    trust_boundary:
      "Self-reported records; hashes detect mismatches, not fabricated reviews or maliciously rewritten receipts.",
  });
  let policy;
  try {
    policy = JSON.parse(new TextDecoder().decode(policyBytes));
  } catch {
    add("POLICY_INVALID", "Policy must be valid JSON.");
    return result();
  }
  if (
    !object(policy) ||
    !Array.isArray(policy.required_checks) ||
    policy.required_checks.length === 0 ||
    policy.required_checks.length > 100 ||
    !policy.required_checks.every(text) ||
    new Set(policy.required_checks).size !== policy.required_checks.length ||
    !Number.isSafeInteger(policy.min_inspected_items) ||
    policy.min_inspected_items < 1 ||
    !Number.isSafeInteger(policy.max_age_seconds) ||
    policy.max_age_seconds < 1 ||
    !Number.isSafeInteger(policy.future_tolerance_seconds) ||
    policy.future_tolerance_seconds < 0
  ) {
    add(
      "POLICY_INVALID",
      "Policy needs distinct required checks, positive count/age bounds and a nonnegative future tolerance.",
    );
    return result();
  }
  if (!object(receipt) || receipt.schema_version !== 1) {
    add("RECEIPT_INVALID", "Expected a receipt object with schema_version 1.");
    return result();
  }
  if (receipt.material_sha256 !== sha256(materialBytes))
    add(
      "MATERIAL_MISMATCH",
      "Receipt does not describe the actual material bytes.",
    );
  if (receipt.policy_sha256 !== sha256(policyBytes))
    add("POLICY_MISMATCH", "Receipt was written for a different policy.");
  const created =
    typeof receipt.created_at === "string"
      ? Date.parse(receipt.created_at)
      : NaN;
  if (!Number.isFinite(created) || !Number.isFinite(now))
    add(
      "TIME_INVALID",
      "Receipt creation time and evaluation clock must be valid.",
    );
  else {
    if (created > now + policy.future_tolerance_seconds * 1000)
      add("FUTURE_RECEIPT", "Creation time exceeds allowed clock skew.");
    if (now - created > policy.max_age_seconds * 1000)
      add("STALE_RECEIPT", "Receipt exceeds the policy age bound.");
  }
  if (!Array.isArray(receipt.checks) || receipt.checks.length > 1000) {
    add("CHECKS_INVALID", "Checks must be a bounded array.");
    return result();
  }
  const seen = new Set();
  for (const check of receipt.checks) {
    if (!object(check) || !text(check.id)) {
      add("CHECK_INVALID", "Each check needs an ID.");
      continue;
    }
    if (seen.has(check.id))
      add(
        "DUPLICATE_CHECK",
        "Duplicate check IDs cannot substitute for missing checks.",
        check.id,
      );
    seen.add(check.id);
    if (!policy.required_checks.includes(check.id))
      add(
        "UNDECLARED_CHECK",
        "Check is outside the supplied policy.",
        check.id,
      );
    if (!CHECK_STATES.has(check.status))
      add("CHECK_STATE_INVALID", "Check has an unknown state.", check.id);
    else if (check.status !== "passed")
      add(
        "CHECK_NOT_PASSED",
        `Recorded check state is ${check.status}.`,
        check.id,
      );
    if (check.material_sha256 !== sha256(materialBytes))
      add(
        "CHECK_SCOPE_MISMATCH",
        "Check is not bound to the supplied material.",
        check.id,
      );
    if (
      !Number.isSafeInteger(check.inspected_items) ||
      check.inspected_items < policy.min_inspected_items
    )
      add(
        "INSUFFICIENT_INSPECTION",
        "Reported inspected-item count is below the policy minimum.",
        check.id,
      );
    if (
      !Array.isArray(check.evidence) ||
      check.evidence.length === 0 ||
      check.evidence.length > 100
    ) {
      add(
        "EVIDENCE_MISSING",
        "Check needs at least one bounded evidence reference.",
        check.id,
      );
      continue;
    }
    const evidenceIds = new Set();
    for (const evidence of check.evidence) {
      if (
        !object(evidence) ||
        !text(evidence.artifact_id) ||
        !digest(evidence.sha256)
      ) {
        add(
          "EVIDENCE_INVALID",
          "Evidence needs an artifact ID and SHA-256.",
          check.id,
        );
        continue;
      }
      if (evidenceIds.has(evidence.artifact_id))
        add(
          "DUPLICATE_EVIDENCE",
          "Repeated evidence does not add coverage.",
          check.id,
        );
      evidenceIds.add(evidence.artifact_id);
      if (!Object.hasOwn(artifacts, evidence.artifact_id)) {
        add(
          "ARTIFACT_MISSING",
          "Referenced artifact was not supplied.",
          check.id,
        );
        continue;
      }
      const bytes = artifacts[evidence.artifact_id];
      if (!(typeof bytes === "string" || bytes instanceof Uint8Array)) {
        add(
          "ARTIFACT_INVALID",
          "Artifact must contain bytes or text.",
          check.id,
        );
        continue;
      }
      if (decodeText(bytes).trim().length === 0)
        add(
          "ARTIFACT_EMPTY",
          "An empty artifact is not review evidence.",
          check.id,
        );
      if (sha256(bytes) !== evidence.sha256)
        add(
          "ARTIFACT_MISMATCH",
          "Artifact bytes do not match the recorded hash.",
          check.id,
        );
    }
  }
  for (const required of policy.required_checks)
    if (!seen.has(required))
      add("REQUIRED_CHECK_MISSING", "Required check is absent.", required);
  return result();
}
