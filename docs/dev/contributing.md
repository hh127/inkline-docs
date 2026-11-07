---
title: "贡献指南"
description: "提交信息格式、type/scope 白名单、原子提交、钩子与文档贡献流程。"
---

# 贡献指南

本页是 `CONTRIBUTING.md`（人）与 `AGENTS.md`（AI 助手）的摘要版。完整规则以仓库根目录两份文件为准。

## 一条铁律

```text
<type>(<scope>)<!>: <subject>
```

- 主题 ≤ 72 字符（建议 ≤ 50），结尾不加句号/标点；
- 有正文时，主题与正文之间**空一行**；
- 正文写「为什么改 + 怎么验证」，不罗列文件（`git show --stat` 已有）；
- **一个提交只做一件事**：人类一次提出多件事，拆成多条可独立回滚的提交；
- 源码 + 测试 + 构建产物放同一条提交；纯格式改动单独一条 `style`。

## type 白名单

| type | 用途 |
| --- | --- |
| `feat` | 新功能 |
| `fix` | 修 bug |
| `docs` | 只改文档 |
| `style` | 不影响语义的格式 |
| `refactor` | 重构，外部行为不变 |
| `perf` | 性能优化 |
| `test` | 只改测试 |
| `build` | 构建与依赖 |
| `ci` | CI 配置 |
| `chore` | 杂项（.gitignore、归档等） |
| `revert` | 回滚某次提交 |

## scope 白名单（可选，写了必须在名单内）

| scope | 对应路径 |
| --- | --- |
| `vba` | `src/`、`src-xlsm-v4.67/` |
| `js` | `wps-js-plugin/js/` |
| `addon` | `wps-js-plugin/addon/` |
| `test` | `wps-js-plugin/test/`、`scripts/test/` |
| `build` | `build.js`、`dist/` |
| `docs` | README、`docs/` 等 |
| `repo` | 仓库级配置（.gitignore、CONTRIBUTING、githooks 等） |

跨多条线时**省略 scope**（`fix: …`），不要写 `fix(js,vba): …`。

不兼容改动：type/scope 后加 `!`，并在 footer 写 `BREAKING CHANGE: <说明与迁移办法>`。

## 提交前自检

```bash
cd wps-js-plugin
npm test                                              # 必须全绿（19 套件 / 1034 断言）
node scripts/commit-msg.mjs --range origin/main..HEAD # 检查提交信息
git log -1                                            # 贴出来让人一眼看到信息
```

启用钩子（每台机器一次）：

```bash
git config core.hooksPath githooks
git config commit.template .gitmessage
```

::: danger 不要绕过钩子
钩子报错说明信息写得不对——改信息，不要 `git commit --no-verify`。
也不要为了迁就自己的提交信息去改 `COMMIT_TYPES`/白名单；要改规则，文档 + 脚本 + 测试三处一起改。
:::

## 分支与历史

- 主干保持可构建、测试全绿；
- 功能/修复用短分支，合并前 rebase 整理自己的提交；
- **不重写已推送的历史**（`rebase -i` / `filter-repo` / 改旧提交信息）；只有未推送的本地提交可以整理。

## 版本与发布

发版同步四处：

1. `wps-js-plugin/package.json` 的 `version`；
2. 根 `README.md` 徽章；
3. git tag（`vX.Y.Z`）；
4. 文档站首页与 `/changelog/` 的 `version`。

## 改代码时注意

- 日常改动集中在 `wps-js-plugin/`（当前主线）；
- 改 `src/` 或 `src-xlsm-v4.67/` 前先说明理由（历史线）；
- 改宿主调用先看[宿主适配层](/dev/host-adapter.html)，新增 `Host` 方法并补测试桩；
- 构建产物 `dist/zsmd-all.js` 与 `addon/zsmd-all.js` 必须与源码同一条提交；
- 提交前清理运行时产物（`access.log`、`diag.log`）与 CRLF 噪声。

## 文档贡献（本站）

本站是独立仓库（`inkline-docs`），贡献流程更轻：

```bash
npm run docs:dev      # 本地预览
npm run docs:check    # 死链 / frontmatter / 敏感词 / 版本一致性
```

- 每页必须有 `title` 与 `description` frontmatter（首页、404 除外）；
- 功能页开头标「适用形态（WPS JS / VBA）」；
- 不写内部信息：内部评审目录、内部验收清单、竞品名称、本机路径、日志文件；
- 截图先脱敏（项目名、金额、人名、水印）；
- 涉及用户可见行为的 PR，请在描述里勾选「已同步文档」。

## 相关

- `CONTRIBUTING.md`、`AGENTS.md`、`.gitmessage`
- [构建与测试](/dev/build-test.html)
