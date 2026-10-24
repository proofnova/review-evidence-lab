# Review Evidence Lab

<a href="README.md"><kbd>English</kbd></a> <a href="README.ko.md"><kbd>한국어</kbd></a> <a href="README.ja.md"><kbd><strong>日本語</strong></kbd></a> <a href="README.zh-CN.md"><kbd>简体中文</kbd></a>

「成功」という要約と、実際の作業に一致する証拠の違いを実行して学ぶ実習です。検討やCI連携をつくる開発者向けに、検討の省略、対象ゼロ、古い資料、欠落した証拠などを扱う合成例17個を収録しています。

## ブラウザーで実行

https://proofnova.github.io/review-evidence-lab/

例を変更し、結果を確認し、自分のUTF-8ファイルを検査して結果JSONを保存できます。選択したファイルはブラウザー内に留まり、Nodeとブラウザーは同じ規則エンジンを使います。

## 実行方法

Node.js 22以上が必要です。追加依存、アカウント、APIキー、モデル呼び出しは不要です。

```sh
git clone https://github.com/proofnova/review-evidence-lab.git
cd review-evidence-lab
node src/lab.mjs
node --test
```

ローカル画面は `node scripts/serve.mjs` を実行し、`http://127.0.0.1:4173` で開きます。ファイルURLからの直接実行は未対応です。ケースを変更したら `node scripts/build-browser-fixtures.mjs` でブラウザー用データを更新してください。テストは古いデータを検出します。

## 期待結果

17個すべての期待結果が一致した場合に実習が成功終了します。不完全・不整合な15記録は拒否され、正常な対照例と相互に整合する偽造記録は受け入れられます。「受け入れ」は記録の整合性だけを意味し、実際の検討やコードの正しさを証明しません。

## 確認できる不変条件

- 必須検査が明示的に成功したか。欠落・省略・不明・失敗を成功と混同しない。
- 検査対象がゼロの記録をどのように扱うか。
- 現在の資料と方針の正確なバイトに対応しているか。
- 証拠ファイルが存在し、空でなく、内容が一致するか。
- 検査の時刻と対象範囲は現在の作業に適合しているか。
- 重複した検査名が独立した検査の代わりになっていないか。
- 整合する偽造記録を、なぜ信頼できないのか。

## 実際のファイルで試す

```sh
node examples/make-example.mjs
node src/verify.mjs --receipt reports/demo/receipt.json --material reports/demo/material.txt --policy reports/demo/policy.json --artifacts reports/demo/artifacts
```

例の生成後に資料ファイルを変更して再検査すると、`MATERIAL_MISMATCH` と終了コード1を確認できます。例の生成器は既存の出力フォルダーを上書きしません。新しい実験方法は手順書をご覧ください。

## 根拠と限界

ハッシュはバイトの一致を確認するだけで、検討の実施を認証しません。要約だけを信頼する比較列は意図的に弱い教材用の基準であり、既存製品のベンチマークではありません。記録形式はこの実習独自のもので、相互運用標準や適合性認証ではありません。

## 既存手段と貢献

EvidenceGate、alls-green、in-totoなどには関連する機能があります。GitHubの必須ステータス検査では意図的な省略や中立状態を成功として扱う場合があるため、連携側は自分の方針が求める作業を区別する必要があります。調査に挙げた過去の不具合は閉じられており、現在も残っているとは主張しません。独創性・学習効果・外部利用は未確認です。小さな再現例、足りない不変条件、既存手段の方が優れているという指摘も歓迎します。

- [実習手順](docs/walkthrough.md)
- [ケース一覧](cases/catalog.json)
- [信頼の境界](docs/trust-boundary.md)
- [日付付き調査と反証](docs/research.md)
- [検証計画](docs/validation-plan.md)
- [貢献案内](CONTRIBUTING.md)

MITライセンス。公式GitHub Starsの選出結果を示すものではありません。
