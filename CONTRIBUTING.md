# Contributing a useful counterexample

Run `node --test` and `node src/lab.mjs` with Node.js 22 or later. No install step is needed.

A case should teach one specific failure or limitation. Add its description to `cases/catalog.json`, its mutation to `src/fixtures.mjs`, and a regression assertion where needed. Preserve the healthy control and the fabricated-but-consistent limitation. Use independently written, synthetic content without secrets, personal logs or private code.

In an issue or pull request, include:

1. The invariant and intended user task.
2. The smallest input and exact command to reproduce it.
3. Node version, operating system, expected and actual finding/exit code.
4. Why the closest existing case does not explain it.
5. Any counterexample or trust-boundary limitation.

If you reproduce the lab independently, report what you actually ran and learned. A model's review is not a user study. If an existing project already offers a better implementation or exercise, link the primary source; correcting duplication is welcome.

Do not upload actual private review artifacts to demonstrate a case. A synthetic reproduction is enough. For a local input-handling defect, describe the behavior with synthetic files and avoid claiming a production security guarantee this lab does not make.

한국어 이슈와 설명도 환영합니다. 실행 명령, 환경, 예상·실제 결과를 함께 남겨 주세요. 실제 사용자 반응이나 실행하지 않은 결과를 만들어 기록하지 마세요.
