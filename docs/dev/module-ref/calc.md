---
title: "ZSMD.Calc"
description: "纯 JS 求值器：算式清洗、tokenize、求值、结果舍入，不依赖宿主 Eval。"
---

# ZSMD.Calc

## 职责

- 清洗算式文本（跳过标记、中文/【】、全角括号、换行、首尾乘除号）；
- 自研求值（四则、一元正负、幂左结合、百分号、嵌套括号）；
- 结果舍入与缓存；
- 失败返回 `#错误:[清洗后文本]`，不抛异常；
- 供 `=Z.JS()`、差异算量、阅读 tooltip、统计核增核减复用。

## 导出 API

| API | 说明 |
| --- | --- |
| `JS(expr)` | 清洗 + 求值（主入口） |
| `evalExpr(expr)` | 纯求值（假定已清洗） |
| `cleanMathExpression(text)` | 只清洗不求值 |
| `roundResult(n)` | 结果舍入（两位小数口径） |
| `_evalOnce` / `_cacheSize` / `_clearCache` | 内部求值与缓存控制 |

## 语义要点

| 点 | 行为 |
| --- | --- |
| 幂 | 左结合（`2^3^2 = 64`，对齐 Excel/VBA） |
| 百分号 | 后缀（`200*10% = 20`） |
| 非法字符 | 替换为空格，让 `3 *4 1` 这类错误暴露 |
| 失败 | 返回 `#错误:[清洗后文本]`，不抛异常 |
| 依赖 | 无宿主依赖；`build.js` 会校验其与 `addon/js/functions.js` 的实现一致 |

## 调用关系

`Diff`（算量）、`Statistics`（核增核减）、`main.js`、`addon/js/functions.js`（`=Z.JS()`）。

## 测试覆盖

`test/calc.test.js`、`test/functions-engine-sync.test.js`。

## 源码

[`js/lib/calc.js`](https://github.com/hh127/SmartQuant-InkLine/blob/main/wps-js-plugin/js/lib/calc.js)
