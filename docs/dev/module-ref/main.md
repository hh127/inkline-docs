---
title: "main.js 全局入口"
description: "加载生命周期、Ribbon 动作、面板通知与配置表按钮宏。"
---

# main.js 全局入口

## 职责

- 加载时组装各模块、注册 Ribbon 全局回调与事件桥；
- 暴露全局函数供 `ribbon.xml` 的 `tag` 与配置表按钮宏调用（`bindGlobal`）；
- 维护面板通知通道（`setPanelNotifier`）与消息出口；
- 读取当前格差异、刷新阅读面板、生成大屏等编排逻辑。

## 全局函数（按用途）

| 分组 | 函数 |
| --- | --- |
| 生命周期 | `onPluginLoad`、`setPanelNotifier` |
| 审计 | `toggleAudit`、`auditUndo`、`auditRedo`、`onOpenPanel`、`getAuditSnapshot` |
| 配置/启用 | `generateWorkbook`、`enableWorkbook`、`disableWorkbook`、`toggleWorkbook`、`removeWorkbook` |
| 开关 | `toggleHighlight`、`toggleAuditGlobal` |
| 视图/阅读 | `showReadingMode`、`showReadingModeForText`、`refreshReadingPanel`、`updateActiveCellDiffReport`、`revertActiveCell` |
| 数据清洗 | `glodonCleanSheet`、`runHighlightAllSheets` |
| 交付/安全 | `encryptCurrentSheet`、`decryptCurrentSheet`、`encryptAllSheets`、`decryptAllSheets`、`exportInternal`、`exportExternal`、`clearAllAuditMarks` |
| 其他 | `importDataSheets`、`generateDashboard`、`JS`（自定义函数同步用） |

## Ribbon 映射

`addon/ribbon.xml` 的按钮 `tag` 与上表函数名一一对应；`shell.js` 的 `OnAction(param)` 按 `param.Tag` 白名单分发（tag 不是代码，不能直接执行）。

## 宿主 direct 访问

本文件直接触碰 `wps` / `ribbonUI` / 面板通道，属于**不可单测的薄入口**；业务逻辑一律下沉到 `js/lib/*` 与 `js/core/*`。

## 调用关系

`Bridge`、`Config`、`Events`、`Audit`、`Diff`、`Security`、`Import`、`Export`、`GlodonCleaner`、`Statistics`、`AuditTools`、`Host`。

## 测试覆盖

`test/ribbon-action.test.js`、`test/control-logic.test.js`（可测部分通过注入宿主模拟）。

## 源码

[`js/main.js`](https://github.com/hh127/SmartQuant-InkLine/blob/main/wps-js-plugin/js/main.js)
