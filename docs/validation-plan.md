# Validation plan, fixed before implementation

Date: 2026-10-24. Additional budget: zero. Existing Node.js only.

The deliverable is an educational counterexample pack, not a claim to have invented review receipts. Existing projects already verify evidence and Git changes. The intended users are maintainers and learners who need small, inspectable cases for testing how their own integrations treat incomplete evidence.

## Scope and budget

- Research and prior-art review: at most 45 minutes.
- Implementation and adversarial examples: at most 120 minutes.
- Tests and documentation: at most 60 minutes.
- GitHub publication and verification: at most 30 minutes, excluding human login delays.
- Remaining weekly time stays available for maintenance; total ceiling is 360 minutes.

No paid model or API is required by the published resource. No portfolio, private repository content, personal logs, credential or real user submission enters the public fixture set.

## Core hypothesis

A reader can replay named examples of incomplete or stale review records with one offline command and see the precise failed invariant. The reference checker distinguishes record consistency from review quality.

Inputs are synthetic and fixed. The deliberately permissive comparison is a one-line teaching example that trusts a summary field; it is **not** a benchmark of GitHub, EvidenceGate, or any production tool. Each faulty fixture changes one declared condition. A valid control must remain accepted.

## Success, failure and stopping

Success: every published fixture gives its declared finding code, the valid control passes, identical runs give identical results at the fixture clock, file verification reads actual local bytes, and malformed/path-escaping inputs fail visibly. The CLI must return a nonzero exit for inconsistent records without hiding failures in a successful summary.

Failure: a bad fixture passes, a valid control fails, the wrong condition explains rejection, a receipt can substitute for the actual material/policy, or an output claims semantic review/user impact. Fix the cause and preserve a regression test before publication.

If prior art already supplies the same learning pack with the same usable exercises, narrow this resource to a useful contribution to that project rather than calling a duplicate an innovation. If the reader needs signatures, Git-scope attestation, real command execution or merge authorization, point them to the appropriate existing tool.

Local execution verifies this pack's behavior only. Independent reproduction, beginner learning gains, maintainer adoption and external impact remain unconfirmed until someone actually provides that evidence.
