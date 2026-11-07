---
title: "ZSMD.Audit"
description: "审计服务：批注审计链组装、截断铁律、变更处理与快照栈。"
---

# ZSMD.Audit

## 职责

- 捕获改动前值（批量矩阵读，失败回退逐格）；
- 组装/截断审计批注（基准点铁律、保留最近 N 条、保留用户批注）；
- 处理单格/多格变更，写回批注与审计底色；
- 维护撤销栈与快照（`getSnapshot` / `resetStacks`）；
- 记录选区前值缓存（上限 500，防内存滞留）。

## 导出 API

| API | 说明 | 关键约束 |
| --- | --- | --- |
| `buildCommentText(oldText, oldValueDisp, logEntry, auditLogLimit)` | 生成/追加审计批注 | 基准点与分隔行永不截断；`--- 用户批注 ---` 后内容保留 |
| `truncateComment(text, keepCount)` | 只截断历史节点 | 无机器日志时原样返回 |
| `processChange(cell, oldValueDisp, newValueDisp)` | 处理一次变更 | 写入时间/修改人/原值/新值 |
| `onSheetChange(sheet, target)` | 事件入口 | 支持单格与多格区域 |
| `onSelectionChange(...)` | 选区变化缓存 | — |
| `captureBefore` / `_recordedBefore` | 改动前值捕获 | 批量优先，逐格回退 |
| `undo()` | 撤销（快照栈） | 重做入口在 `main.js` |
| `getSnapshot()` / `resetStacks()` | 快照/清栈 | 面板刷新与启用切换 |
| `toggleEnabled()` / `enabledState()` | 审计开关状态 | — |

## 批注格式

```text
【未审计前原值】: <基准值>
=================================
--- 修改于 yyyy-mm-dd hh:mm:ss
修改人: <用户名>
原值: ...
新值: ...
--- 用户批注 ---
（手工内容）
```

## 调用关系

`Events`（路由 A）、`Colors`/`Config`（配置）、`Host`（读写）；被 `Diff` 解析（时间线）、`Statistics` 聚合。

## 测试覆盖

`test/business-modules.test.js`、`test/control-logic.test.js`、`test/clear-audit-marks.test.js`。

## 源码

[`js/lib/audit.js`](https://github.com/hh127/SmartQuant-InkLine/blob/main/wps-js-plugin/js/lib/audit.js)
