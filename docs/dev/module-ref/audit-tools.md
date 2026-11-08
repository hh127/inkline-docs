---
title: "ZSMD.AuditTools"
description: "交付前清场：批注分级清理、审计底色清除与安全阀。"
---

# ZSMD.AuditTools

## 职责

- `cleanAuditComment(text)`：判定批注去向（纯机器日志删除 / 机器+用户保留手工部分 / 纯手工不动）；
- `clearAuditComments(ws)`：倒序遍历批注执行清理；
- `clearAuditFill(ws, sheetName, targetColor)`：在「审计范围 ∩ UsedRange」内逐格比对颜色并清除；
- `clearAllAuditMarks(ctx)`：完整流程（确认 → 逐表清理 → 汇总），跳过系统表。

## 导出 API

| API | 说明 |
| --- | --- |
| `cleanAuditComment(text)` | 返回 `{isAudit, keep, keptUser, text}` |
| `isSystemSheetName(name)` | 排除 `Admin_Config` / `Log_Audit` / `Vault_*` |
| `auditBgColor()` | 取审计背景色 |
| `addrToRect` / `intersectRect` / `targetRect` / `rectCells` | 区域计算 |
| `clearAuditComments(ws)` / `clearAuditFill(...)` | 分步清理 |
| `clearAllAuditMarks(ctx)` | 主流程，返回逐表统计与总计 |
| `MARK_MACHINE` / `MARK_USER` / `XL_NONE` / `DEFAULT_AUDIT_BG` / `MAX_FILL_SCAN_CELLS` | 常量 |

## 安全阀

底色清除不用 `FindFormat`（宿主支持不确定），改为范围内逐格比对，并设 `MAX_FILL_SCAN_CELLS` 上限；超限只清审计范围并提示。

## 调用关系

`main.js`（`clearAllAuditMarks` 入口）、`Config`（审计范围/底色）、`Host`（批注/颜色）。

## 测试覆盖

`test/clear-audit-marks.test.js`。

## 源码

[`js/lib/audit-tools.js`](https://github.com/hh127/SmartQuant-InkLine/blob/main/wps-js-plugin/js/lib/audit-tools.js)
