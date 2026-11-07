---
title: "ZSMD.Host"
description: "宿主适配层 API：工作簿/表/单元格/范围/样式/批注/事件/环境，核心服务访问宿主的唯一通道。"
---

# ZSMD.Host

## 职责

封装对 `wps` / `Application` 的全部访问，向上提供稳定的方法名，向下处理宿主差异与降级。
核心服务（config/audit/diff/highlight/statistics…）只依赖本模块，因此可在 Node 用 stub 完整测试。

设计说明见[宿主适配层](/dev/host-adapter.html)。

## 导出 API（按域）

| 域 | 方法 |
| --- | --- |
| 工作簿 / 表 | `applicationAvailable`、`app`、`activeWorkbook`、`workbooks`、`workbookByName`、`activeSheet`、`sheetsOf`、`sheetByName`、`sheetName`、`workbookOfSheet`、`renameSheet`、`deleteSheetShapes`、`selectCell` |
| 单元格 / 区域 | `sheetCell`、`cellValue`、`setCellValue`、`cellFormula`、`setCellFormula`、`cellAddress`、`usedRangeRect`、`readMatrix`、`writeMatrixRow`、`readRangeArray`、`cellCount`、`cellKey`、`forEachCell`、`cellHasFormula`、`isMerged` |
| 范围判定 | `rangeIntersect`、`isAddrInRange`、`parseCellAddr`、`colLetter2Num`、`colNum2Letter` |
| 样式 | `cellInteriorColor`、`setCellInteriorColor`、`resetCellFont`、`setFontRun` |
| 批注 | `cellCommentText`、`setCellComment`、`deleteCellComment`、`makeCommentInvisible`、`restoreCommentVisible` |
| 事件 / 环境 | `apiEventHost`、`registerApiEvent`、`removeApiEvent`、`enableEvents`、`eventsEnabled`、`undo`、`screenUpdating`、`statusBar`、`userName`、`filterMode`、`diag` |
| 其他 | `pasteColumnWidths`、`freezePanes`、`deleteFile`、`isWorkbookEnabled` |

> 签名以 [`js/zsmd.js`](https://github.com/hh127/SmartQuant-InkLine/blob/main/wps-js-plugin/js/zsmd.js) 源码为准。

## 调用关系

`Config` / `Colors` / `Events` / `Audit` / `Diff` / `Highlight` / `Security` / `Import` / `Export` / `GlodonCleaner` / `Statistics` / `AuditTools` 全部通过本模块访问宿主。
已知直接触碰宿主的例外：`security.js`、`import.js`、`audit-tools.js`、`export.js`、`main.js`。

## 测试覆盖

`test/host-adapter.test.js`、`test/smoke.js`（宿主模拟注入）。

## 源码

[`js/zsmd.js`](https://github.com/hh127/SmartQuant-InkLine/blob/main/wps-js-plugin/js/zsmd.js)
