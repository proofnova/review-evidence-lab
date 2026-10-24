# Local execution record

Executed on 2026-10-24 using Node.js v24.13.1 on Windows. All published examples are synthetic. This record was written after running the commands below.

After extracting a shared platform-independent engine and adding the Web Crypto adapter, `node --test` was run again: 32 tests, 31 passed, 0 failed, the same Windows symlink test skipped. The additional checks compare all 17 cases between the Node and Web Crypto adapters and check that the browser fixture cache exactly matches the source generator. These are adapter checks, not a weak-model productivity experiment.

| Command                                                                                                                                                             | Observed outcome                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `node --test`                                                                                                                                                       | Exit 0; 30 tests, 29 passed, 0 failed, 1 skipped.                         |
| `node src/lab.mjs --out reports/reference-run.json`                                                                                                                 | Exit 0; all 17 declared case outcomes matched.                            |
| `node examples/make-example.mjs`                                                                                                                                    | Exit 0; created a new synthetic example directory.                        |
| `node src/verify.mjs --receipt reports/demo/receipt.json --material reports/demo/material.txt --policy reports/demo/policy.json --artifacts reports/demo/artifacts` | Exit 0; receipt-consistent, synthetic true, semantically_validated false. |

The skipped test attempts to create an artifact symlink escaping its directory. This Windows host denied creation of file symlinks. That path was therefore **not exercised locally**; it was not counted as a pass. The CI matrix includes Linux so it can exercise the same test where symlink creation is available. Refer to actual workflow runs for remote outcomes rather than assuming they passed.

The CLI tests actually spawn the verifier, modify material bytes, remove an artifact, supply malformed JSON and attempt path traversal. They verify nonzero exits for these inputs. The corpus includes a consistent forgery that intentionally passes: hashes do not authenticate a review.

The reference run uses a fixed fixture clock, not the execution date. Its catalog SHA-256 identifies the exact case definitions. Re-run it locally to reproduce the report. Runtime demo files and scratch reports are ignored by Git.

No production alternative was executed as part of this run. No independent user, adoption count, learning outcome or GitHub Stars selection result has been observed.

## Actual browser exercise

The browser app was opened from the local preview on 2026-10-24. The valid control loaded successfully. Selecting `required-check-skipped` produced `CHECK_NOT_PASSED`; selecting `forged-but-consistent` showed a consistent receipt with authenticity unverified. Switching to Korean changed the interface labels. Editing the material and running the checks produced `MATERIAL_MISMATCH` and check-scope findings. Supplying malformed receipt JSON produced an input error. These interactions exercised the real browser interface, not a mocked DOM.
