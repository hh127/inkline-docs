---
title: "ZSMD.GlodonCleaner"
description: "导出表清洗流水线：9 个开关、纯函数 cleanGrid 与原地应用。"
---

# ZSMD.GlodonCleaner

## 职责

把计价软件导出的报表拍平为可落库的二维表：

- `cleanGrid(matrix, opts)`：纯函数，输入二维数组，输出 `{data,keyCol,headerStartRow,headerBottomRow,dataStartRow,stats}`；
- `applyToSheet(ws, opts)` / `applyToActiveSheet(opts)`：宿主侧应用（读矩阵 → 清洗 → 写回）；
- `defaultOpts`：默认开关。

## 9 个开关

| 开关 | 默认 | 作用 |
| --- | --- | --- |
| `rename` | 开 | 表名去首尾空格/连字符/点 |
| `delXiaoJi` | 开 | 删除「小计」行 |
| `delHeJi` | 开 | 删除「合计/总合计/总计」行 |
| `unmerge` | 开 | 解除纵向合并并前向填充（A/B 列） |
| `delGldTitle` | 关 | 删除题头行（构件工程量表/工程名称） |
| `dropEmptyKey` | 开 | 删除特征列为空的行 |
| `dropBlankRows` | 关 | 删除全空行（在 unmerge 之后判定） |
| `lockhead` | 开 | 冻结表头 |
| `delButtons` | 关 | 删除旧版悬浮按钮 |

## 边界

- 找不到特征列关键词时兜底 `C` 列、表头按第 1 行；
- 前向填充是启发式（序号列被合并也会被填），必要时人工修正；
- 原地修改当前表，执行前备份原文件。

## 调用关系

`main.js`（`glodonCleanSheet` 入口）、`Host`（矩阵读写/冻结/删形状）。

## 测试覆盖

`test/glodon.test.js`（53 断言）。

## 源码

[`js/lib/glodon.js`](https://github.com/hh127/SmartQuant-InkLine/blob/main/wps-js-plugin/js/lib/glodon.js)
