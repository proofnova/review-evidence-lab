# Review Evidence Lab

[English](README.md) · [실습 안내](docs/walkthrough.md) · [기존 대안 조사](docs/research.md)

**“성공”이라는 요약과 실제 작업에 맞는 검토 증거의 차이를 실행으로 확인합니다.**

검토·CI 연동을 만드는 개발자를 위한 오프라인 실습 자료입니다. 필수 검토 건너뛰기, 검사 대상 0개, 변경 전 자료에 대한 검토, 증거 파일 누락 등을 합성 사례 17개로 재현합니다. 각 사례는 위반한 조건을 표시합니다. 기록과 해시를 함께 조작한 사례도 포함하여, 해시가 일치해도 검토가 실제 수행됐다는 증명이 되지 않음을 보여 줍니다.

## 실행

Node.js 22 이상이 필요합니다. 추가 패키지 설치, 계정, API 키, 모델 호출은 필요 없습니다.

```sh
git clone https://github.com/proofnova/review-evidence-lab.git
cd review-evidence-lab
node src/lab.mjs
node --test
```

예상 결과와 일치한 사례가 17개이면 실습 명령이 성공합니다. 불완전하거나 모순된 기록 15개를 거부하고, 정상 대조군과 내부적으로 일치하는 조작 기록을 통과시킵니다. **통과는 기록의 일관성만 뜻합니다. 검토 수행 사실이나 코드의 정확성을 보증하지 않습니다.**

실제 파일 바이트를 읽는 예제:

```sh
node examples/make-example.mjs
node src/verify.mjs --receipt reports/demo/receipt.json --material reports/demo/material.txt --policy reports/demo/policy.json --artifacts reports/demo/artifacts
```

`reports/demo/material.txt`를 수정한 뒤 두 번째 명령을 반복하면 `MATERIAL_MISMATCH`와 종료 코드 1을 확인할 수 있습니다. 예제 생성기는 기존 폴더를 덮어쓰지 않습니다.

## 활용

| 확인할 조건      | 실습에서 던지는 질문                                               |
| ---------------- | ------------------------------------------------------------------ |
| 필수 검토의 상태 | 누락·건너뛰기·실패를 성공으로 취급하지 않는가?                     |
| 실제 검사 범위   | 검사 대상 수가 0인데 통과시키지 않는가? 이 수치를 누가 기록하는가? |
| 자료·정책의 해시 | 지금 검토하는 정확한 바이트에 대한 기록인가?                       |
| 증거 파일        | 누락·변경·빈 파일을 발견하는가?                                    |
| 시점·범위·중복   | 오래된 결과나 다른 작업의 검토가 섞이지 않는가?                    |
| 조작된 일치 기록 | 기록을 작성하는 주체를 어떻게 신뢰하는가?                          |

`summary_only_demo`는 성공 요약만 믿는 단순한 교육용 비교 대상입니다. 실제 제품의 성능을 비교한 수치가 아닙니다.

[단계별 실습](docs/walkthrough.md), [사례 목록](cases/catalog.json), [검사 코드](src/evidence.mjs), [신뢰 경계](docs/trust-boundary.md)를 함께 보세요. 자체 연동을 설계할 때 사례를 재사용할 수 있습니다. 이 JSON 형식은 실습 전용이며 표준이나 다른 도구의 호환 형식이 아닙니다.

## 기존 도구와의 관계

[EvidenceGate](https://github.com/TheDarkniteFalls/evidencegate)에는 이미 검토 기록, 적합성 사례와 Node 구현이 있습니다. [alls-green](https://github.com/re-actors/alls-green)은 의존 작업의 결과 집계를, [in-toto](https://in-toto.io/docs/what-is-in-toto/)는 공급망 무결성을 다룹니다. 이 자료는 실패 이유와 한계를 작게 재현하고 설명하는 독립 작성 교육 자료입니다. 세계 최초나 독창성이 검증된 대표 프로젝트로 주장하지 않습니다.

[기존 대안·문제 근거·반박 기록](docs/research.md)에 조사 날짜와 미확인 사항을 남겼습니다. [검증 계획](docs/validation-plan.md), [실제 실행 결과](reports/reference-run.json), [로컬 테스트 기록](reports/local-validation.md)도 공개합니다. 외부 사용이나 교육 효과는 아직 확인하지 않았습니다.

사례 재현, 빠진 조건, 설명 오류, 더 적합한 기존 도구를 발견했다면 [기여 안내](CONTRIBUTING.md)를 참고해 주세요. MIT 라이선스로 사용할 수 있습니다.
