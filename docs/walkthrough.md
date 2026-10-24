# A ten-minute experiment

Use Node.js 22 or later. Commands are identical in PowerShell and a POSIX shell. Everything runs locally with synthetic data.

## 1. Predict, then run

Open `cases/catalog.json`. Before running the lab, predict whether `required-check-skipped`, `material-changed`, and `forged-but-consistent` should be accepted. Run:

```sh
node src/lab.mjs
```

The deliberately weak baseline sees `summary: success` in every case. The reference checker rejects the first two cases. It accepts the last one because a consistent self-report cannot establish its own authenticity. All expected results must match, including that limitation.

To write the machine-readable output:

```sh
node src/lab.mjs --out reports/local-report.json
```

The fixture clock is fixed at `2026-01-01T12:00:00.000Z`. This makes stale/future examples reproducible; it is not the date a real review ran. The file CLI uses the actual current clock.

## 2. Work with actual files

```sh
node examples/make-example.mjs
node src/verify.mjs --receipt reports/demo/receipt.json --material reports/demo/material.txt --policy reports/demo/policy.json --artifacts reports/demo/artifacts
```

The generator writes a synthetic receipt, material, policy and two artifact files. It uses the current timestamp so the example can be checked immediately. The policy gives a one-hour validity window. The generator refuses to overwrite an existing `reports/demo` directory; for a fresh run, move your previous generated directory to a different location first.

Edit `reports/demo/material.txt` with any text editor and repeat the verification command. The receipt still describes the old bytes, so expect `MATERIAL_MISMATCH`. In PowerShell inspect `$LASTEXITCODE`; in a POSIX shell inspect `$?` immediately after the command.

| Exit code | Meaning                                                   |
| --------- | --------------------------------------------------------- |
| 0         | Record is internally consistent under the supplied policy |
| 1         | One or more consistency checks failed                     |
| 2         | Invocation or input could not be read safely              |

Try restoring the material, then changing a byte in an artifact. Expect `ARTIFACT_MISMATCH`. Removing that artifact should yield `ARTIFACT_MISSING`. These experiments compare actual files against declared digests rather than accepting a digest supplied as proof of its own correctness.

## 3. Inspect the policy

`required_checks` names the checks that must explicitly pass. `min_inspected_items` constrains the **declared** count; it does not prove any item was inspected. `max_age_seconds` and `future_tolerance_seconds` set time bounds. Exact policy bytes are hashed: changing whitespace also changes the policy digest.

Every supplied check must be listed in `required_checks`; undeclared checks are rejected. Skipped/unknown/failed/not-run states never satisfy a required check in this small format. That strict local rule is not a statement that every skipped CI job should fail in every project.

## 4. Adapt the question, not the assertion

The lab does not fetch GitHub job states, run tests, call a reviewer, sign evidence, or authorize a merge. An adapter would need to bind real outputs to a trustworthy execution boundary. Before writing one, compare existing tools in [the research notes](research.md).

For a new failure case, make one mutation, name its expected finding, keep the healthy control, and include a counterexample to any stronger claim. Submit synthetic reproductions only. The [contribution guide](../CONTRIBUTING.md) describes what evidence to include.

## 한국어 실습 요약

먼저 `required-check-skipped`, `material-changed`, `forged-but-consistent`의 결과를 예상해 보세요. 실습을 실행하면 앞의 두 사례는 거부되지만 조작된 일치 기록은 통과합니다. 해시는 바이트의 일치 여부를 확인할 뿐, 검토 주체나 수행 사실을 증명하지 않기 때문입니다.

예제 생성 후 자료 파일을 수정하고 같은 검증 명령을 실행하면 종료 코드 1과 실패 이유를 볼 수 있습니다. 검사한 항목 수는 기록된 주장일 뿐 실제 검토의 증거와 구분해야 합니다. 자신의 CI나 검토 연동에 적용하기 전에는 신뢰할 실행 주체와 실제 출력 연결 방법을 별도로 정해야 합니다.
