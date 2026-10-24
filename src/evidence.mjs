import { createHash } from "node:crypto";
import { evaluateReceipt as evaluate } from "./engine.mjs";

export const sha256 = (bytes) =>
  createHash("sha256").update(bytes).digest("hex");
export function evaluateReceipt(receipt, context) {
  return evaluate(receipt, { ...context, sha256 });
}
