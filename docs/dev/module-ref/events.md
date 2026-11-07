---
title: "ZSMD.Events"
description: "事件总线：五类事件注册、SheetChange 路由、表结构快道与轮询兜底。"
---

# ZSMD.Events

## 职责

- 注册/注销宿主事件（`SheetChange`、`SheetSelectionChange`、`WorkbookNewSheet`、`SheetBeforeDelete`、`SheetActivate`）；
- 实现 `SheetChange` 的过滤与路由（配置表 → 系统表 → 隐私 → 批量 → 审计/变色）；
- 表结构同步：原生事件 + Count 快道 + 名字快道 + 轮询兜底；
- 选区变化防抖与面板跟随。

## 导出 API

| API | 说明 |
| --- | --- |
| `registerEvents()` / `unregisterEvents()` | 注册/注销全部事件，返回绑定结果 |
| `onSheetChange(sheet, target)` | 核心路由入口 |
| `onSelectionChange(...)` | 选区变化（防抖后刷新面板/预案） |
| `onSheetActivate` / `onWorkbookNewSheet` / `onSheetBeforeDelete` | 表结构相关事件 |
| `inRange(target, rangeStr, sheet)` | 区域命中判断 |
| `startSheetMonitor()` / `stopSheetMonitor()` | 轮询兜底启停 |
| `_monitorTick` / `_countFastPath` / `_nameFastPath` | 轮询、数量快道、名字快道（内部） |
| `_setSelectionDebounce` / `_flushSelection` / `_timersActive` / `_registered` | 防抖与状态 |

## 关键常量（源码内）

| 参数 | 值 | 作用 |
| --- | --- | --- |
| 批量拦截阈值 | 5000 单元格 | 单次改动超过则跳过 |
| 轮询间隔 | 5000 ms | 只读 Count |
| 改名全名枚举 | 每 2 次轮询（≈10s） | 兜底原地改名 |
| 删除重试 | 10 次 × 50ms | 等待删除完成 |

## 调用关系

被 `main.js` 在加载时注册；路由调用 `Bridge`（启用）、`Config`（开关/范围）、`Audit`、`Highlight`。

## 测试覆盖

`test/sheet-registry-sync.test.js`、`test/control-logic.test.js`、`test/smoke.js`。

## 源码

[`js/core/events.js`](https://github.com/hh127/SmartQuant-InkLine/blob/main/wps-js-plugin/js/core/events.js)
