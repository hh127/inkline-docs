---
title: "ZSMD.Highlight"
description: "富文本变色引擎：字符属性位图、括号层级着色与最小属性集写回。"
---

# ZSMD.Highlight

## 职责

- 单元格富文本正则渲染：中文/英文词高亮 + 方头括号【】整段高亮 + 多级圆括号嵌套配色；
- 纯逻辑层 `computeRuns()` 只算「字符区间 → 样式」，不碰宿主，Node 可测；
- 落盘层 `processCell()` / `processRange()` 通过 `Host.setFontRun` 写到真实单元格；
- 跳过公式格、空值格与带豁免符号（默认 `##`）的格子；
- 合并单元格只处理左上角。

## 导出 API

| API | 说明 |
| --- | --- |
| `computeRuns(text, ctx)` | 纯函数：返回 `[{start,len,color,name,size,bold}]`；字符属性位图 + 连通合并，天然无区间重叠 |
| `coalesceRuns(runs)` | 合并相邻且属性完全相同的 run，减少跨进程调用次数（视觉不变） |
| `processCell(cell, config)` | 单格：重置字体 → 计算 runs → 只写与默认不同的属性；返回着色 run 数 |
| `processRange(target, config)` | 区域入口：离散多选区按 `Areas` 递归；多格先批量读值/公式，空白与纯数字零 COM 跳过；返回处理格数 |

`ctx` 关键字段：`highlightColor`、`defaultFontSize`、`defaultFontName`、`bracketFontName`、`maxDepth`、`minFontSize`、`maxFontSize`、`bracketColors[]`。
无 `config` 时的兜底值：字号 9 / 字体「微软雅黑」/ 括号字体「黑体」/ 最多 5 层 / 最小字号 6 / 豁免符号 `##`。

## 渲染规则

| 规则 | 行为 |
| --- | --- |
| 中英文词 | 变色（取 `Colors.highlightColor()`） |
| 方头括号【…】 | 整段（含括号）标记高亮色，括号字符再单独覆盖 |
| 圆括号嵌套 | 第 N 层取 `Colors.bracketColor(N)`，字体换括号字体，字号逐层递减并加粗 |
| 公式 / 空值 / 含豁免符号 | 直接跳过，0 次 COM |
| 离散多选区 | 按 `Areas` 逐区递归处理 |

## 性能要点

1. **字符属性位图 + 连通合并**：每类样式只覆盖自身字符，相邻同属性合并为一个 run，取代旧版「各类样式各自追加 run」造成的区间重叠与 COM 异常；
2. **批量初筛零 COM**：多格区域一次 `readRangeArray` 读值与公式，空白/纯数字/公式在内存里排除，只有真正需要染色的文本格才触碰 `Characters`；
3. **最小属性集写回**：`resetCellFont` 先把整格置回默认，每个 run 只写与默认不同的属性（中英文高亮段 1 次赋值，深括号 run 才写颜色+字体+字号+加粗）；
4. **筛选态防护**：工作表处于筛选态时保持屏幕刷新开启（宿主会吞掉本批染色渲染），非筛选态才关刷新；
5. **大区域分块**：全表批量变色按 5 万格阈值按列分块，避免单次超大区域把宿主卡死。

## 调用关系

- `events.js`：单元格改动落定后对目标区域调用 `processRange`；
- `main.js` `runHighlightAllSheets()`：遍历非系统表，范围 ∩ UsedRange 后分块调用 `processRange`；
- `Colors` 提供高亮色与括号色，`Config` 提供字体/层数/豁免符号，`Host` 提供 `setFontRun` / `resetCellFont` / `readRangeArray`。

## 测试覆盖

- `test/smoke.js`：`computeRuns` 的中英文、方头括号、嵌套括号与 `coalesceRuns` 断言；
- `test/business-modules.test.js`：全表批量变色（仅启用表被调用、范围求交、配置透传、汇总文案、单表异常不中断）。

## 源码

[`js/lib/highlight.js`](https://github.com/hh127/SmartQuant-InkLine/blob/main/wps-js-plugin/js/lib/highlight.js)
