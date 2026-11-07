---
title: "ZSMD.Diff"
description: "差异与阅读渲染：字符级 LCS、算量变化量、审计时间线、沉浸阅读胶囊。"
---

# ZSMD.Diff

## 职责

- `getInlineDiff`：字符级 LCS，输出红/绿 HTML 片段；
- `calcQuantity`：复用 `Calc.JS` 计算原值/新值算量与净变化；
- `generateDiffReport`：把审计批注解析成完整时间线 HTML（全局总览 / 历史节点 / 基准点）；
- `renderReadingModeHTML`：沉浸阅读视图（胶囊 + 模块解构 + 注释透视 + tooltip）；
- 纯逻辑，不触碰宿主。

## 导出 API

| API | 说明 |
| --- | --- |
| `htmlEncode(s)` | HTML 转义（防止算式里的 `<`/`&` 破坏渲染） |
| `getInlineDiff(oldStr, newStr)` | 返回 `{ oldHtml, newHtml }` |
| `calcQuantity(oldStr, newStr)` | 算量差异（数值才参与） |
| `generateDiffReport(...)` | 时间线 HTML |
| `renderReadingModeHTML(rawFormula, resultVal, opts)` | 阅读视图；`snapshot` 标记历史版本 |
| `renderPills(raw, evalFn)` / `buildReadingBlocks(raw, evalFn)` / `renderReadingBlocksHTML(blocks)` | 胶囊/模块渲染 |
| `evalExprText` / `matchCloseParen` / `normFullWidthOps` / `formatReadingValue` | 表达式解析与格式化工具 |

## 行为约定

- 每个历史节点的「解析/恢复」作用于**该节点的新值**（与 VBA 一致）；
- 阅读结果纯数值定点两位；错误串原样透出；
- 历史快照带红色徽标，面板固定不跟随当前格。

## 调用关系

`main.js`（面板入口/刷新）、`Audit`（批注解析）、`Calc`（求值）、`Statistics`（间接复用）。

## 测试覆盖

`test/business-modules.test.js`、`test/reading-pills.test.js`。

## 源码

[`js/lib/diff.js`](https://github.com/hh127/SmartQuant-InkLine/blob/main/wps-js-plugin/js/lib/diff.js)
