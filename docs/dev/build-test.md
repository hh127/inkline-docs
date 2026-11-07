---
title: "构建与测试"
description: "16 文件构建顺序、19 套件/1034 断言的测试体系、提交规范与版本同步。"
---

# 构建与测试

## 常用命令

```bash
cd wps-js-plugin
node build.js                     # 构建：拼接 dist/zsmd-all.js 并同步 addon/
npm test                          # node --test：19 套件 / 1034 断言（约 2.5s）
node test/smoke.js                # 单跑宿主模拟：73 断言
node scripts/commit-msg.mjs --range origin/main..HEAD   # 检查提交信息
```

## 构建做了什么

`build.js` 按固定 `ORDER` 拼接 16 个文件，输出 `dist/zsmd-all.js`，并同步一份到 `addon/zsmd-all.js`：

```text
js/zsmd.js
js/core/colors.js
js/core/config.js
js/core/bridge.js
js/lib/highlight.js
js/lib/audit.js
js/lib/diff.js
js/lib/calc.js
js/lib/security.js
js/lib/import.js
js/lib/audit-tools.js
js/lib/glodon.js
js/lib/export.js
js/lib/statistics.js
js/core/events.js
js/main.js
```

::: danger ORDER 是唯一权威
模块之间有隐式依赖（后面的文件依赖前面的命名空间），**不要随意调整顺序**；新增模块必须同时改 `ORDER` 与测试的注入列表。
:::

额外校验：`build.js` 会比对 `js/lib/calc.js` 与 `addon/js/functions.js` 里的求值实现是否一致，防止单元格函数与主引擎算出两个结果。

## 测试体系

| 层次 | 内容 |
| --- | --- |
| 纯函数单测 | 变色 run 区间、批注文本、差异 LCS、算式清洗/求值、广联达清洗、配置继承、统计聚合 |
| 模块集成 | 审计链路、隐私批量、导入导出、清除标记、事件路由、Ribbon 动作、配置锁定 |
| 宿主模拟 | `test/smoke.js`：模块加载顺序、变色、批注、事件路由、undo/redo、主题色 |
| 真机验证 | 需要 WPS 的路径不在单测覆盖内，见各模块「已知例外」 |

19 个套件覆盖（节选）：

`business-modules`、`calc`、`clear-audit-marks`、`config-lock`、`control-logic`、`export-savecopy`、`functions-engine-sync`、`glodon`、`host-adapter`、`import`、`master-switch`、`privacy-batch`、`reading-pills`、`ribbon-action`、`sheet-registry-sync`、`smoke`、`statistics`、`template-colors`、`workbook-context`。

## 提交规范（有钩子强制）

本仓库对提交信息要求严格（见 `CONTRIBUTING.md` 与 `AGENTS.md`）：

- 格式：`<type>(<scope>): <subject>`；`type`/`scope` 有白名单；
- 主题 ≤ 72 字符，结尾不加句号；
- 主题与正文之间空一行；正文写"为什么 + 怎么验证"，不罗列文件；
- **一个提交只做一件事**；源码 + 测试 + 构建产物放同一条提交；
- 启用钩子（每台机器一次）：

```bash
git config core.hooksPath githooks
git config commit.template .gitmessage
```

## 版本同步

发版时需要同步**四处**：

1. `wps-js-plugin/package.json` 的 `version`；
2. 根 `README.md` 徽章；
3. git tag（`vX.Y.Z`）；
4. 文档站首页与 `/changelog/` 的 `version`（`npm run docs:check` 会校验）。

::: warning 制品与源码版本不同步
`releases/` 只有 v4.66 的 xlsm；4.67 目前只有源码。发布说明里必须写清这一点。
:::

## 持续集成

仓库当前以**本地测试 + 提交钩子**为主；文档站独立仓库已有 GitHub Actions（构建 + 内容自检 + Pages）。
若给 `wps-js-plugin` 加 CI，建议最小集合：

```yaml
- run: cd wps-js-plugin && npm test
- run: cd wps-js-plugin && node build.js && git diff --exit-code dist/ addon/zsmd-all.js
```

第二条能防止"改了源码忘了同步产物"。

## 常见构建问题

| 现象 | 原因 | 处置 |
| --- | --- | --- |
| `addon/zsmd-all.js` 与 `dist/` 不一致 | 只跑了构建的一半/手工改过 | 重新 `node build.js` |
| 构建通过但运行时缺模块 | 新文件没加进 `ORDER` | 补 ORDER + 测试注入列表 |
| 测试偶发失败 | 依赖真实时间/时区 | 用固定日期，避免 `new Date()` 直接断言 |
| 提交被钩子拒绝 | 信息格式不符 | 按 `commit-msg.mjs` 报错改信息，不要 `--no-verify` |

## 相关

- [JS 架构](/dev/architecture-js.html)
- [贡献指南](/dev/contributing.html)
- 源码：`wps-js-plugin/build.js`、`wps-js-plugin/test/`
