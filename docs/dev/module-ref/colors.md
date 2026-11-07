---
title: "ZSMD.Colors"
description: "主题色与括号配色：从 Admin_Config 的 G/H 列读取，带兜底默认值。"
---

# ZSMD.Colors

## 职责

- 从配置表读颜色参数（键名 G 列、颜色盒 H 列）；
- 无配置/读取失败时回退默认色；
- 提供 `rgb()` 生成 Excel 长整型（BGR，与 VBA `RGB()` 语义一致）；
- 惰性加载 + 可注入配置源，Node 可测。

## 默认配色

| 参数 | 默认值 |
| --- | --- |
| 默认字体颜色 | `rgb(0,0,0)` |
| 变色高亮颜色 | `rgb(255,0,0)` |
| 审计背景颜色 | `rgb(135,206,235)` |
| 括号 1～5 层 | 蓝 `rgb(0,0,255)` / 绿 `rgb(0,176,80)` / 橙 `rgb(255,100,0)` / 紫 `rgb(128,0,128)` / 深红 `rgb(192,0,0)` |

## 导出 API

| API | 说明 |
| --- | --- |
| `reload()` | 失效缓存并重新读取 |
| `defaultFontColor()` / `highlightColor()` / `auditBgColor()` | 三个单色 |
| `bracketColor(depth)` | 第 N 层括号颜色（1～10，超出循环/截断） |
| `rgb(r,g,b)` | RGB → Excel 长整型 |
| `_state` / `_defaults` / `_configSheet` | 测试注入与默认值 |

## 性能说明

早期实现逐格 `findInG`（约 8 万次 COM，启动冻结数秒）；现改为一次 `readMatrix(G3:H40)` 批量读取，
只对命中的色块读一次 `Interior.Color`。

## 调用关系

`Highlight`（着色）、`Audit`（审计底色）、`Export`/`AuditTools`（底色判定）。

## 测试覆盖

`test/template-colors.test.js`、`test/smoke.js`。

## 源码

[`js/core/colors.js`](https://github.com/hh127/SmartQuant-InkLine/blob/main/wps-js-plugin/js/core/colors.js)
