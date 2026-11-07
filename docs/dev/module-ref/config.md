---
title: "ZSMD.Config"
description: "配置引擎：参数树、配置表模板、按表开关、锁定与重载。"
---

# ZSMD.Config

## 职责

- 读取/缓存 `Admin_Config` 的全局参数与按表配置（惰性加载）；
- 生成配置表模板（`generateTemplate`），维护参数树与工作表清单表头；
- 提供开关/范围/阈值/颜色的 getter；
- 保护锁定开关（`enforceProtectedSwitch`）与重载（`reload`）；
- 工作表注册表同步（`syncSheetRegistry`）。

## 导出 API

| API | 说明 |
| --- | --- |
| `SHEET_NAME` / `PARAM_TREE` / `SHEET_HEADER` | 配置表名、参数树、按表清单表头 |
| `reload` / `onReload` / `_configSheet` | 重载配置、变更回调、当前配置表引用 |
| `setWorkbookContext` / `sheetCache` / `sheetConfig` | 工作簿上下文与按表缓存 |
| `isZsmdEnabled` / `isEnabled` / `hasUsableConfig` | 总开关与可用性 |
| `isHighlightEnabled` / `isAuditEnabled` | 全局开关 |
| `isAuditBtnEnabled` / `isReadBtnEnabled` | 悬浮按钮开关（VBA 特性） |
| `isSheetAuditEnabled` / `isSheetHighlightEnabled` / `isSheetPrivacyEnabled` | 按表开关 |
| `getSheetAuditRange` / `getSheetHighlightRange` | 按表范围 |
| `skipHighlightSymbol` / `auditLogLimit` | 跳过标记、保留批注数 |
| `defaultFontName` / `defaultFontSize` / `bracketFontName` / `maxDepth` / `minFontSize` / `maxFontSize` | 字体与括号渲染参数 |
| `projectName` / `leadAuditor` / `targetDevRate` / `targetAbsDiff` | 大屏项目信息与异常靶点阈值 |
| `generateTemplate` | 生成 `Admin_Config` 模板 |
| `setGlobalParam` / `setMasterSwitch` / `toggleGlobal` | 写参数/切开关（内部会打标） |
| `enforceProtectedSwitch` | 拦截对锁定键的手工写入 |
| `isSystemWriting` | 系统内部写入标记（用于事件层放行） |
| `syncSheetRegistry` / `syncSheetRegistryIfChanged` / `resetRegistrySnap` | 工作表清单同步 |
| `_scanCapRow` / `_findInColumn` / `_isTrueVal` / `_global` | 内部工具与全局值缓存 |

## 锁定键

`是否启用智算墨斗`、`全局变色总开关`、`全局审计总开关`、`显示看历史悬浮按钮`、`显示阅读模式悬浮按钮`。

## 调用关系

`Events`（路由与重载）、`Bridge`（启用判定/生成/停用）、`Colors`（颜色读取）、`Audit`/`Highlight`/`Statistics`（参数）。

## 测试覆盖

`test/config-lock.test.js`、`test/master-switch.test.js`、`test/template-colors.test.js`、`test/workbook-context.test.js`。

## 源码

[`js/core/config.js`](https://github.com/hh127/SmartQuant-InkLine/blob/main/wps-js-plugin/js/core/config.js)
