---
title: "宿主适配层"
description: "ZSMD.Host 为什么是唯一接触 wps/Application 的通道，API 分组与已知例外。"
---

# 宿主适配层

## 一句话

`js/zsmd.js` 里的 `ZSMD.Host` 是核心服务访问宿主（`wps` / `Application`）的**唯一通道**。
服务层只调用 `NS.Host.xxx()`，不直接写 `wps.xxx`——这样核心逻辑可以在 Node 里用 stub 完整测试。

## 为什么值得单独一层

| 问题 | 没有 Host 时 | 有 Host 时 |
| --- | --- | --- |
| WPS 与 Excel 宿主差异 | 散落在 10 个模块里 | 只改一处 |
| Node 测试 | 必须模拟整个全局对象 | 注入一个 stub |
| 宿主版本差异 | 到处 feature-detect | 在 Host 内探测并降级 |
| 安全边界 | 不知道哪些代码碰宿主 | 例外清单可审计 |

## Host 从哪里找宿主对象

```js
function wpsHost()  { return NS.G.wps || globalThis.wps || null }
function appHost()  { return NS.G.Application || globalThis.Application || null }
```

官方加载项里宿主是 `wps`；个别版本可能只暴露 `Application` 或 `wps.Application`，Host 会依次探测。**不要在业务代码里重复这段判断。**

## API 分组（按用途）

| 分组 | 代表方法 |
| --- | --- |
| 工作簿/工作表 | `activeWorkbook`、`workbooks`、`workbookByName`、`sheetsOf`、`sheetByName`、`sheetName`、`workbookOfSheet`、`renameSheet`、`deleteSheet` |
| 单元格/区域 | `sheetCell`、`cellValue`、`setCellValue`、`cellFormula`、`setCellFormula`、`cellAddress`、`usedRangeRect`、`readMatrix`、`writeMatrixRow`、`readRangeArray`、`cellCount`、`cellKey`、`forEachCell`、`cellHasFormula`、`isMerged` |
| 范围判定 | `rangeIntersect`、`isAddrInRange`、`parseCellAddr`、`colLetter2Num`、`colNum2Letter` |
| 样式 | `cellInteriorColor`、`setCellInteriorColor`、`resetCellFont`、`setFontRun` |
| 批注 | `cellCommentText`、`setCellComment`、`deleteCellComment`、`makeCommentInvisible`、`restoreCommentVisible` |
| 事件/环境 | `registerApiEvent`、`enableEvents`、`eventsEnabled`、`undo`、`screenUpdating`、`statusBar`、`userName`、`filterMode` |
| 配置/开关 | `isWorkbookEnabled`（工作簿启用状态判定） |
| 其他 | `pasteColumnWidths`、`freezePanes`、`deleteFile`、`selectCell`、`deleteSheetShapes` |

> 完整签名以 [`js/zsmd.js`](https://github.com/hh127/SmartQuant-InkLine/blob/main/wps-js-plugin/js/zsmd.js) 为准；上表只列常用入口。

## 已知例外（不经过 Host 的模块）

这些模块因为需要更细的宿主交互，直接触碰宿主对象，**其真机路径无法在 Node 单测中覆盖**，改动时要格外小心：

| 模块 | 直接做了什么 | 风险 |
| --- | --- | --- |
| `js/lib/security.js` | `ws.Copy` / `Unprotect` / `Protect` / `Cells` | 加密/解密只能在真机验证 |
| `js/lib/import.js` | 文件对话框、`Workbooks.Open`、`DisplayAlerts` | 导入流程需真机 |
| `js/lib/audit-tools.js` | `ws.Comments` / 批注删除 | 批注样式恢复尽力而为 |
| `js/lib/export.js` | 全局 `wps`（另存/打开副本） | 导出路径需真机 |
| `js/main.js` | `wps` / `ribbonUI` | 入口与 Ribbon 回调 |

## 新增一个宿主调用的正确姿势

1. 在 `zsmd.js` 的 `Host` 对象上新增方法，内部做 feature-detect + try/catch；
2. 服务层调用 `NS.Host.newThing(...)`，不在服务里写 `wps`；
3. 在 `test/` 的 stub 里补一个实现，保证纯逻辑可测；
4. 若宿主不支持，返回安全默认值（例如 `false`），调用方降级，不要抛异常打断流程。

## 性能约定

- **禁止逐格 COM**：批量读写用 `readMatrix` / `writeMatrixRow`；`forEachCell` 仅用于边界明确的场景；
- 大区域操作前先关 `screenUpdating`、必要时关 `enableEvents`，并在 `finally` 恢复；
- `cellCount` 用于批量保护（`SheetChange` 超过 5000 格直接跳过）；
- 读取整表配置用一次批量读，而不是循环 `find`（历史上有过 8 万次 COM 导致启动冻结的教训）。

## 踩坑备忘

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| `Columns` / `Rows` 当作函数调用报错 | 在 WPS 宿主里是属性不是方法 | 用 Host 封装，按宿主动态判断 |
| 事件关闭后没恢复 | 异常路径遗漏 | `finally` 恢复（`enableEvents` / `screenUpdating`） |
| 关闭事件后系统写入被拦 | 事件拦截逻辑误伤内部写入 | `Config.isSystemWriting()` 标记内部写入 |
| 颜色写入被筛选吞掉 | 宿主刷新行为 | 见变色页「筛选态」说明 |

## 相关

- [JS 架构](/dev/architecture-js.html)
- [事件桥与表结构同步](/dev/events.html)
- 源码：[`js/zsmd.js`](https://github.com/hh127/SmartQuant-InkLine/blob/main/wps-js-plugin/js/zsmd.js)
