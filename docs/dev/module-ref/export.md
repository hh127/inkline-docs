---
title: "ZSMD.Export"
description: "审查版/交付版导出：副本另存、批注与底色清洗、公式静态化、加密表剥离。"
---

# ZSMD.Export

## 职责

- `exportCleanVersion(isExternal)`：副本另存 → 打开副本 → 清洗 → 另存 xlsx → 关闭 → 删临时文件；
- `cleanWorkbookForExport`：遍历业务表执行清洗（纯函数，可注入工作簿）；
- 表单级清洗 `cleanSheetForExport`：
  - 清审计底色；
  - 外部版剥离机器批注（保留用户手工批注），内部版恢复批注可见并保留最近 N 条；
  - 公式静态化（`=Z.JS(...)` → 内联数学式或计算值，失败标红）；
- `stripEncryptedSheets`：外部版物理剥离加密表与 `Vault_*`；
- 跳过系统表（`Admin_Config` / `Log_Audit` / `Vault_*`）。

## 导出 API

| API | 说明 |
| --- | --- |
| `exportCleanVersion(isExternal, keepLogCount)` | 完整导出流程（原表零改动） |
| `cleanWorkbookForExport(wb, isExternal, keepLogCount)` | 工作簿级清洗，返回 `{done, stat}` |
| `cleanSheetForExport(ws, isExternal, skipSymbol, stat, keepLogCount)` | 单表清洗 |
| `stripEncryptedSheets(sourceWb, newWb)` | 剥离加密表/金库，返回剔除表数 |

## 关键行为

- 宿主根对象探测：`app` / `wps` / `wps.Application` 三个别名兜底；
- 公式静态化在清底色之后执行，避免失败标红被清掉；
- 任何失败/取消都走 `finally`：关副本、删临时文件、恢复事件与计算模式。

## 调用关系

`main.js`（导出入口）、`Audit`（截断/批注保留规则）、`Calc`（静态化求值）、`Config`（跳过标记）、`Security`（隐私上下文）。

## 测试覆盖

`test/export-savecopy.test.js`。

## 源码

[`js/lib/export.js`](https://github.com/hh127/SmartQuant-InkLine/blob/main/wps-js-plugin/js/lib/export.js)
