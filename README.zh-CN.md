# Review Evidence Lab

<a href="README.md"><kbd>English</kbd></a> <a href="README.ko.md"><kbd>한국어</kbd></a> <a href="README.ja.md"><kbd>日本語</kbd></a> <a href="README.zh-CN.md"><kbd><strong>简体中文</strong></kbd></a>

通过实际运行，理解“成功”总结与真正对应当前工作的证据之间的区别。本实验面向审查和 CI 集成开发者，提供 17 个关于跳过审查、检查对象为零、材料过期和证据缺失的合成案例。

## 在浏览器中运行

https://proofnova.github.io/review-evidence-lab/

可修改示例、查看结果、检查自己的 UTF-8 文件并保存结果 JSON。所选文件留在浏览器中，Node 与浏览器使用相同的规则引擎。

## 运行方法

需要 Node.js 22 或更高版本，无需其他依赖、账户、API 密钥或模型调用。

```sh
git clone https://github.com/proofnova/review-evidence-lab.git
cd review-evidence-lab
node src/lab.mjs
node --test
```

本地预览请运行 `node scripts/serve.mjs`，然后打开 `http://127.0.0.1:4173`，不支持通过文件地址直接运行。修改案例后，请执行 `node scripts/build-browser-fixtures.mjs` 更新浏览器数据；测试会检测过期缓存。

## 预期结果

全部 17 个案例符合预期时，实验成功退出。15 条不完整或不一致的记录会被拒绝；正常对照记录和相互一致的伪造记录会被接受。接受仅表示记录一致，不证明审查真实发生或代码正确。

## 可以检查的约束

- 必需检查是否明确成功，不能将缺失、跳过、未知或失败等同于成功。
- 如何处理检查对象为零的记录。
- 证据是否对应当前材料和策略的精确字节。
- 证据文件是否存在、非空且内容一致。
- 检查时间和范围是否对应当前工作。
- 重复检查名称是否错误替代了独立检查。
- 为什么相互一致的伪造记录仍然不能被信任。

## 使用真实文件尝试

```sh
node examples/make-example.mjs
node src/verify.mjs --receipt reports/demo/receipt.json --material reports/demo/material.txt --policy reports/demo/policy.json --artifacts reports/demo/artifacts
```

生成示例后，修改材料文件并再次验证，可观察到 `MATERIAL_MISMATCH` 和退出码 1。示例生成器不会覆盖已存在的输出文件夹，请参阅操作指南创建新实验。

## 证据与限制

哈希只能验证字节一致，不能认证审查实际发生。仅相信总结的比较列是刻意宽松的教学基准，并不是任何已有产品的性能测试。记录格式仅用于本实验，不是互操作标准或一致性认证。

## 已有方案与贡献

EvidenceGate、alls-green 和 in-toto 已提供相关功能。GitHub 必需状态检查在某些情况下会有意将跳过或中立状态视为成功，因此集成方必须区分自己的策略真正要求的工作。调研中引用的历史问题已经关闭，本项目不声称该问题目前仍然存在。独创性、学习收益和外部使用效果均未验证。欢迎提供可复现的小型失败案例、缺失的约束，或已有工具更加合适的反例。

- [操作指南](docs/walkthrough.md)
- [案例目录](cases/catalog.json)
- [信任边界](docs/trust-boundary.md)
- [带日期的调研与反证](docs/research.md)
- [验证计划](docs/validation-plan.md)
- [贡献指南](CONTRIBUTING.md)

采用 MIT 许可证，不代表已获官方 GitHub Stars 资格或任何遴选结果。
