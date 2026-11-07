---
title: "ZSMD.Bridge"
description: "插件桥：目标工作簿解析、启用判定、配置表注入/停用与 Ribbon 动作。"
---

# ZSMD.Bridge

## 职责

- 解析事件上下文中的目标工作簿（事件优先，回退 `ActiveWorkbook`）；
- 判定工作簿是否启用（存在 `Admin_Config` 即视为启用）；
- 注入/删除配置表（生成、启用、停用、删除）；
- 承接 Ribbon 动作的薄封装。

## 导出 API

| API | 说明 |
| --- | --- |
| `targetWorkbook()` | 当前目标工作簿 |
| `workbookOfSheet(sheet)` | 由工作表反查工作簿 |
| `isWorkbookEnabled(wb)` | 是否含配置表（启用态） |
| `isActiveWorkbookEnabled()` | 活动工作簿是否启用 |
| `generateWorkbook()` | 生成配置表 |
| `enableWorkbook()` / `disableWorkbook()` | 启用/停用当前文件 |
| `removeWorkbook()` | 删除配置表 |
| `toggleWorkbook()` | 切换启用状态 |

## 调用关系

`Events`（路由前判定）、`main.js`（Ribbon 动作 → Bridge）、`Config`（生成模板）。

## 测试覆盖

`test/workbook-context.test.js`、`test/master-switch.test.js`。

## 源码

[`js/core/bridge.js`](https://github.com/hh127/SmartQuant-InkLine/blob/main/wps-js-plugin/js/core/bridge.js)
