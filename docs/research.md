# Problem, prior art and counterarguments

Checked: 2026-10-24. These notes distinguish public reports, documentation, synthetic experiments and unverified hypotheses. No interviews or external adoption are claimed.

## Problem evidence

| Source                                                                                                                                                       | Observation and limit                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [GitHub required-check documentation](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks) | Successful required checks can include skipped or neutral conclusions. A project's own “review must run” policy needs an explicit mapping. This is documented behavior, not a vulnerability claim. |
| [open-code-review issue 1454](https://github.com/alibaba/open-code-review/issues/1454)                                                                       | A historical reporter described zero selected items and a successful exit. The issue was closed on 2026-10-09. It illustrates a past failure mode; current behavior was not reproduced.            |
| [alls-green explanation](https://github.com/re-actors/alls-green)                                                                                            | An aggregator job can itself be skipped when dependencies fail; the project explains using an always-running gate and inspecting dependency results. Existing solutions already address this.      |

These are evidence of possible integration mistakes, not evidence that users need this exact lab. Whether the exercises improve learning or prevent mistakes is still a hypothesis.

## Closest alternatives

Primary documentation and repository descriptions were read. Alternative implementations were not installed or executed. Three software approaches and a manual workflow are relevant; unrelated products were not added to fill a quota.

| Alternative                                                      | Target and existing capability                                                                                                      | This lab's limited difference / possible benefit                                                                                                                       | Conditions and burden                                                                                                                          | Evidence and unknowns                                                                                                                                                                |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [EvidenceGate](https://github.com/TheDarkniteFalls/evidencegate) | Maintainers verifying AI-assisted review receipts, claims/checks and Git scope. Includes a conformance corpus and Node replication. | A separate bilingual walkthrough that names simple causal mutations and shows a consistent forgery. Executable examples and Node are **already present in prior art**. | Existing Python CLI requires Python; its Node replication is another option. This lab uses Node built-ins and an incompatible teaching format. | Repository documentation and linked corpus/replication inspected. No claim that EvidenceGate lacks any of these invariants; a case-by-case execution comparison remains unperformed. |
| [alls-green](https://github.com/re-actors/alls-green)            | GitHub Actions maintainers aggregating dependency-job results, with configurable allowed outcomes.                                  | Local exercises include byte mismatches and missing review artifacts outside job-status aggregation. The lab does not replace its actual Actions integration.          | Existing tool runs inside Actions and needs correct job wiring. Lab is local and requires separate adaptation.                                 | Repository usage/explanation inspected. No live workflow comparison performed.                                                                                                       |
| [in-toto](https://in-toto.io/docs/what-is-in-toto/)              | Supply-chain owners describing intended actors/steps and checking integrity/provenance.                                             | Small unsigned records illustrate basic consistency before learning stronger attestation mechanisms. This sacrifices authenticity and scope guarantees.                | Real attestation requires an appropriate trust model and integration. The lab has no signing infrastructure.                                   | Official introduction inspected. No equivalence, compatibility or stronger protection is claimed.                                                                                    |
| Manual review of logs, diff and files                            | Maintainers can check completeness, revision, timestamps and outputs with existing tools.                                           | One command repeats a fixed set of consistency questions; reduced effort is plausible but unmeasured.                                                                  | Manual work needs attention and domain knowledge. Automation adds format upkeep and can conceal false assumptions.                             | Baseline is an ordinary possible workflow, not an observed interview. No timing or error-rate study performed.                                                                       |

## Candidate choices and exclusions

This was a bounded resource-building round, not a completed eight-candidate flagship selection. Existing skill research had already placed the following directions under review:

| Direction                             | Decision and reason                                                                                                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Another README command runner         | Do not build as a flagship: established execution tools overlap and no distinct user capability was verified.                                                                  |
| Permission onboarding assistant       | Hold: target-user evidence and safe environment reproduction are insufficient.                                                                                                 |
| Full review-receipt product           | Do not recommend as original: EvidenceGate has substantial direct overlap, including corpus and Node code.                                                                     |
| Small educational counterexample pack | Publish as a provisional learning resource. Code behavior can be tested within the time/budget limit; external usefulness and distinctive educational value remain unverified. |

There is no confirmed original flagship in this round. The practical next question is whether a reader can reproduce and explain one failure, not whether a new brand makes an existing approach novel.

## Adversarial review of the originality claim

1. **Does an existing implementation offer the same core mechanism?** Yes. Receipt checking and executable conformance cases already exist. This defeats a broad invention claim.
2. **Can configuration of an existing tool yield the same result?** Likely for multiple cases; exact per-case coverage was not executed. Prefer existing production integrations where appropriate.
3. **Is this known under another name?** Evidence verification, stale attestations, required-check gating and fail-closed validation are established ideas.
4. **Is the difference important to users?** Bilingual causal exercises may help some learners, but no independent learning evidence exists yet.
5. **Does the new format add burden?** Yes. A separate receipt format needs maintenance and is unsuitable as a new standard merely because it exists.
6. **What would withdraw the distinctiveness hypothesis?** Finding an equally accessible pack covering the same lessons, or readers finding no extra learning value. Contribute missing examples upstream rather than expanding a redundant product.

Decision: **practical differentiation hypothesis; external validation pending**. The checker working does not establish originality. Its strongest negative case is intentionally accepted: a forged producer can provide matching evidence bytes.

## Search record and limitations

Languages: English and Korean. Queries included:

- `"code review" "skipped" "success" receipt evidence github`
- `"review receipt" "sha256" stale`
- `코드 리뷰 실행 실패 성공 처리 검토 근거 누락`
- `"required checks" "skipped" "success" github actions`

Scope: web search, GitHub repository documentation and a public issue, official GitHub and in-toto documentation. Search summaries were discovery aids; central claims above come from the linked primary materials. Historical/archived implementations were part of the intended search scope, but no exhaustive archival or package-registry survey was completed. No paid services were required. Some code paths and product configuration possibilities remain unverified. This limited search cannot establish worldwide absence of a similar resource.

## Contribution pattern and next decisions

Official Stars profiles such as [Rob Bos](https://stars.github.com/profiles/rajbos), [Barbara Forbes](https://stars.github.com/profiles/ba4bes) and [Ruth Ikegah](https://stars.github.com/profiles/ruth-ikegah) illustrate combining technical work with teaching and lowering participation barriers. The applied pattern is a runnable lesson, readable explanations and a small contribution path. No product feature was selected by copying a Star's project, and no official selection probability is inferred.

The author's existing automation and Node experience lowers implementation cost. This public resource deliberately contains fresh synthetic fixtures, not private automation or portfolio material. The chain is: documented integration problem → overlapping alternatives acknowledged → small teaching hypothesis → actual offline execution → external learning/adoption still unconfirmed.

Within the next weekly six-hour ceiling, at most three tasks are appropriate:

1. Reproduce the published lab on the CI matrix and resolve any platform failures (up to 60 minutes).
2. Compare one case against an existing project's documented behavior; contribute there if duplication is confirmed (up to 90 minutes).
3. If independent feedback arrives, improve one confusing exercise and record the actual evidence (up to 90 minutes). No fabricated feedback or unsolicited outreach.

Continue only if the explanations add useful understanding. Modify or contribute upstream if the mechanism is already better served; hold if needed evidence is unavailable; stop expanding if setup and maintenance exceed the benefit. Preserve contrary evidence and rejected ideas to avoid renaming the same duplicate.
