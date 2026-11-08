---
title: "ZSMD.Statistics"
description: "批注聚合与 ECharts 大屏：指标 DTO、图表拼装、格式化。"
---

# ZSMD.Statistics

## 职责

- `collectStatisticsData(comments, opts)`：纯函数聚合，输出大屏 DTO（总审计数、有效争议、核增/核减、按表统计、作者、时间轴、异常靶点）；
- `parseAuditComment(text)`：解析单条审计批注（无 `--- 修改于` 返回 null）；
- `buildDashboardHTML(dto)`：拼接完整大屏 HTML（含 ECharts 脚本）；
- 工具：`round2`、`fmtMoney`、`fmtPercent`、`htmlEncode`、`_calcJS`。

## 指标口径

| 指标 | 口径 |
| --- | --- |
| 已审计单元格 | 含机器日志的批注数 |
| 有效争议 | 基准算量与当前算量均为数值且不相等 |
| 核增/核减 | 逐格净变化，正入核增、负入核减 |
| 异常靶点 | 偏离度 ≥ 0.05 或绝对量差 ≥ 500（可配置） |
| 作者/趋势 | 按日志作者、日期计数 |

## DTO 主要字段

`totalAudited`、`validControversy`、`totalModActions`、`globalIncreaseSum`、`globalDecreaseSum`、`sheetStats`（含每表 total/valid/mod/inc/dec/minDay/maxDay）、`authors`、`timeline`、`targets`、`projectName`、`leadAuditor`。

## 已知依赖

大屏 HTML 引用外部 ECharts（`cdn.jsdelivr.net`），断网图表空白。见[大屏的 CDN 依赖](/dev/notes/dashboard-cdn.html)。

## 调用关系

`main.js`（`generateDashboard`）、`Audit`（批注格式）、`Calc`（算量）、`Config`（项目信息/阈值）。

## 测试覆盖

`test/statistics.test.js`。

## 源码

[`js/lib/statistics.js`](https://github.com/hh127/SmartQuant-InkLine/blob/main/wps-js-plugin/js/lib/statistics.js)
