import { evaluateReceipt } from "../src/engine.mjs";

const encoder = new TextEncoder();
export const asBytes = (value) =>
  typeof value === "string" ? encoder.encode(value) : value;

export async function verifyInBrowser(receipt, context) {
  const artifacts = context.artifacts ?? {};
  const values = [
    context.materialBytes,
    context.policyBytes,
    ...Object.values(artifacts),
  ];
  const hashes = new Map();
  for (const value of values) {
    if (!(typeof value === "string" || value instanceof Uint8Array)) continue;
    const digest = await crypto.subtle.digest("SHA-256", asBytes(value));
    hashes.set(
      value,
      Array.from(new Uint8Array(digest), (byte) =>
        byte.toString(16).padStart(2, "0"),
      ).join(""),
    );
  }
  return evaluateReceipt(receipt, {
    ...context,
    artifacts,
    sha256(value) {
      if (!hashes.has(value)) throw new Error("Input bytes were not hashed.");
      return hashes.get(value);
    },
  });
}
