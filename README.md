# Review Evidence Lab

[한국어](README.ko.md) · [Walkthrough](docs/walkthrough.md) · [Prior art](docs/research.md)

**Replay the difference between “success” and evidence that actually matches the work.**

An offline teaching lab for maintainers building review and CI integrations. Seventeen synthetic cases show what happens when a required review is skipped, inspects zero items, references an older change, or loses its evidence files. Each case names the invariant that failed. One deliberately forged but internally consistent record demonstrates the boundary: matching hashes do not prove that a review happened.

**[Open the interactive playground](https://proofnova.github.io/review-evidence-lab/)** to change examples, inspect findings, check local UTF-8 files and download a result. Chosen files stay in your browser. The browser and Node adapters share the same rule engine.

## Try it

Node.js 22 or later. No dependencies, account, API key or model call.

```sh
git clone https://github.com/proofnova/review-evidence-lab.git
cd review-evidence-lab
node src/lab.mjs
node --test
```

For a local browser preview, run `node scripts/serve.mjs` and open `http://127.0.0.1:4173`. Direct `file://` opening is unsupported because the app loads JavaScript modules and fixtures. After changing the source corpus, run `node scripts/build-browser-fixtures.mjs`; a test detects a stale browser fixture cache.

The lab prints 17 case results and exits successfully when all expected outcomes match. Fifteen incomplete or inconsistent records are rejected; a healthy control and a fabricated-but-consistent record are accepted. Acceptance means **receipt consistency**, never review authenticity or code correctness.

Create synthetic files and verify their actual bytes:

```sh
node examples/make-example.mjs
node src/verify.mjs --receipt reports/demo/receipt.json --material reports/demo/material.txt --policy reports/demo/policy.json --artifacts reports/demo/artifacts
```

Change `reports/demo/material.txt`, repeat the second command, and look for `MATERIAL_MISMATCH` and exit code 1. The example generator refuses to overwrite an existing demo directory. The walkthrough explains how to make a new experiment safely.

## What you can learn

| Failure family                             | Question to ask your integration                        |
| ------------------------------------------ | ------------------------------------------------------- |
| Missing, skipped, unknown or failed checks | Did every required check explicitly pass?               |
| Zero selected items                        | Did the record declare any inspected work?              |
| Changed material or policy                 | Does the evidence refer to these exact bytes?           |
| Missing, changed or empty artifacts        | Are the referenced files present and consistent?        |
| Stale, future or wrong-scope records       | Is this evidence valid for the current scope and time?  |
| Duplicate check identities                 | Could one check accidentally stand in for another?      |
| Consistently fabricated record             | Who can produce records, and why should you trust them? |

The `summary_only_demo` column is an intentionally permissive teaching baseline. It is not a benchmark of any existing product.

## Use the resource

- Start with the [walkthrough](docs/walkthrough.md), then inspect [the case catalog](cases/catalog.json) and [the small reference checker](src/evidence.mjs).
- Reuse the synthetic cases when designing an adapter. This JSON format is local to the lab; it is not an interoperability or conformance standard.
- Read the [trust boundary](docs/trust-boundary.md) before relying on any result.
- Add a case using the [contribution guide](CONTRIBUTING.md). Reproducible failures and corrections are useful contributions.

## Why this exists

[GitHub documents](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks) that successful required status checks can include `success`, `skipped`, and `neutral`. That behavior is intentional; integrations need to distinguish a permissible skip from work their own policy requires. A [historical review-tool issue](https://github.com/alibaba/open-code-review/issues/1454) also describes a successful exit after zero items were selected. That issue is closed; this lab does not claim the current tool still has that bug.

Existing tools already cover important parts of this problem. [EvidenceGate](https://github.com/TheDarkniteFalls/evidencegate) includes review receipts, a conformance corpus and a Node replication; [alls-green](https://github.com/re-actors/alls-green) handles dependency-job gating; [in-toto](https://in-toto.io/docs/what-is-in-toto/) addresses supply-chain integrity. This lab contributes an independently written, bilingual set of small explanatory counterexamples. Its originality and learning benefit remain unproven. See the [dated comparison and counterarguments](docs/research.md).

## Evidence and next work

The fixtures are synthetic. The [validation plan](docs/validation-plan.md) separates implementation, execution and external usefulness. The [reference run](reports/reference-run.json) records the deterministic lab results; [local validation](reports/local-validation.md) records the actual test environment and its limitation. CI repeats the tests on Linux and Windows.

External adoption and learning outcomes have not been verified. Useful next steps are to reproduce a case independently, identify a missing invariant, or explain where an existing tool already provides a better exercise. No nomination or GitHub Stars selection outcome is implied.

MIT licensed. See [LICENSE](LICENSE).
