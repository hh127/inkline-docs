---
title: "单元格函数 =Z.JS()"
description: "在 WPS 单元格里直接对算式字符串求值：命名空间 Z、中文清洗、Range 引用与返回值契约。"
---

# 单元格函数 `=Z.JS()`

::: tip 适用形态
WPS JS 加载项 4.67 ✅（需官方加载项）｜ Excel VBA 4.66 使用 `JS()` UDF，机制不同
:::

## 它解决什么问题

手算量底稿里的算式经常是"文本"（如 `(5.51+0.1)*2+【损耗】5%`），需要人工按计算器核对。
`=Z.JS()` 让它像普通公式一样直接出结果，且自动清洗中文材料名、【】、全角括号等干扰字符。

## 用法

在单元格里直接输入（命名空间 `Z` **必须带**）：

```
=Z.JS("3.5*2")                       → 7
=Z.JS("钢筋 5.5*2")                  → 11        （中文材料名自动清洗）
=Z.JS("3.5*(2+1)-【损耗】5%")        → 10.45     （【】/全角括号/百分号）
=Z.JS("2^3^2")                       → 64        （幂左结合）
=Z.JS(A1)                            → 对 A1 内容求值（支持单元格引用）
```

支撑的运算与清洗：

- 四则 `+ - * /`、一元正负、幂 `^`、后缀百分号 `%`、嵌套括号；
- 剥离跳过标记（默认 `##`）、去【】/中文/字母、全角括号转半角、清换行、截断首尾乘除号；
- 求值失败返回 `#错误:[清洗后文本]`，不会抛出 JS 异常。

## 前置条件

1. 已按[安装（WPS）](/guide/install-wps.html)部署**官方加载项**（JS 宏编辑器形态不支持单元格 UDF）；
2. 加载项已注册自定义函数（`wps.AddCustomFunction("Z", "JS", JS)` 执行成功）；
3. 改动后**完全退出所有 WPS 进程**再打开（有缓存）。

## 实现与契约（开发者）

| 文件 | 作用 |
| --- | --- |
| `addon/js/functions.js` | `@customfunction` 标注的 `JS()` 实现：Range 二维数组解包、复用 `ZSMD.Calc.JS` 求值、`String()` 返回、全局挂载 |
| `addon/manifest.xml` | `<Functions><Namespace>Z</Namespace></Functions>`，与注册首参一致 |
| `addon/functions.json` | 官方函数描述；**`result.type` 必须是 `any`**（写 `number` 会因 C++ 宿主强转而报 `#VALUE!`）；可选参数 `skipSymbol` 标 `"optional": true` |
| `addon/index.html` | 引入 `./js/functions.js` |

详细开发与踩坑见[自定义函数开发](/dev/custom-function-dev.html)。

## 常见错误

| 结果 | 含义 | 处置 |
| --- | --- | --- |
| `#NAME?` | 函数没被识别 | 加载项未真正加载；或没带 `Z.` 前缀；或未重启 WPS |
| `#VALUE!` | 函数被调用但返回值转换失败 | 检查 `functions.json` 的 `result.type` 是否为 `any`；查看 `[智算墨斗][函数]` 日志 |
| `#错误:[文本]` | 清洗后仍无法求值 | 检查算式；看返回文本里清洗后的内容定位非法字符 |
| 引用单元格为空 | 引用内容为空或非算式 | 确认引用格有内容 |

> `#NAME? → #VALUE!` 是**进步信号**：说明函数已注册，只剩返回值契约问题。

## 结果与判定

- 输入 `=Z.JS("3.5*2")` 返回 `7` → 安装与注册成功；
- 中文/【】/全角括号示例返回预期值 → 清洗逻辑生效；
- 非法算式返回 `#错误:` 而非弹窗 → 异常处理生效。

## 边界与注意事项

- 仅 **WPS 官方加载项**形态支持；WPS 的 JS 宏编辑器（`Application` 宿主）不支持单元格 UDF，已实测确认；
- 函数名固定为 `JS`、命名空间固定为 `Z`（WPS 机制限制，4 字符已是最短命名空间）；
- 依赖加载项常驻：加载项被停用/服务关闭后，已有公式可能显示错误；
- 计算仍受工作簿计算模式影响（手动计算时需触发重算）。

## 相关源码与测试

- [`addon/js/functions.js`](https://github.com/hh127/SmartQuant-InkLine/blob/main/wps-js-plugin/addon/js/functions.js)
- [`addon/functions.json`](https://github.com/hh127/SmartQuant-InkLine/blob/main/wps-js-plugin/addon/functions.json)
- 求值引擎：[`js/lib/calc.js`](https://github.com/hh127/SmartQuant-InkLine/blob/main/wps-js-plugin/js/lib/calc.js)
- 测试：`wps-js-plugin/test/functions-engine-sync.test.js`、`calc.test.js`
