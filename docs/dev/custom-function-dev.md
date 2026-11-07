---
title: "自定义函数开发"
description: "wps.AddCustomFunction + manifest + functions.json：命名空间、返回值契约与 #VALUE! 根因。"
---

# 自定义函数开发

::: tip 适用范围
仅 **WPS 官方 JS 加载项** 支持工作表自定义函数；Excel VBA 版用的是 `JS()` UDF，机制不同。普通使用见[单元格函数 =Z.JS()](/features/custom-function.html)。
:::

## 三个文件的分工

| 文件 | 作用 | 关键点 |
| --- | --- | --- |
| `addon/js/functions.js` | 函数实现与注册 | `@customfunction` 标注；`wps.AddCustomFunction("Z", "JS", JS)` 单例注册；Range 二维数组解包；全 try-catch；`String()` 返回 |
| `addon/manifest.xml` | 声明函数命名空间 | `<Functions><Uri>/functions.json</Uri><Namespace>Z</Namespace></Functions>`，与注册首参一致 |
| `addon/functions.json` | 官方函数描述 | **`result.type` 必须是 `any`**；可选参数标 `"optional": true` |
| `addon/index.html` | 引入脚本 | `<script src="./js/functions.js">` |

## 返回值契约（#VALUE! 的根因）

WPS 的计算宿主是 C++，它通过 `GetJSReturnValue` 桥接 JS 返回值。如果 `functions.json` 里声明 `result.type = "number"`，而 JS 返回的是字符串/对象，强转失败就会显示 **`#VALUE!`**。

因此约定：

1. `result.type` 固定为 `any`；
2. JS 侧统一 `String()` 后返回；
3. 内部异常全部捕获，返回可读文本而不是抛出。

::: tip #NAME? → #VALUE! 是进步
`#NAME?` 表示函数根本没被识别（加载项未生效）；`#VALUE!` 表示函数已注册并被调用，只剩返回值契约问题。排错方向完全不同。
:::

## 命名空间为什么是 `Z`

- WPS 机制要求 `=命名空间.函数名(...)`，纯 `=JS(...)` 不可用（已实测）；
- 4 字符的 `Z` 已是最短命名空间，单元格里输入成本最低；
- 命名空间在三个地方必须一致：`AddCustomFunction` 首参、`manifest.xml` 的 `<Namespace>`、用户输入的前缀。

## 注册是单例的

```js
// 简化示意
if (!globalThis.__zsmdFnRegistered) {
  wps.AddCustomFunction("Z", "JS", JS);
  globalThis.__zsmdFnRegistered = true;
}
```

加载项可能被重复加载（热重载/多次注入），**不防重复会报注册冲突**。改完 `functions.js` 后必须：

1. 重启本地静态服务；
2. **完全退出**所有 WPS 进程再打开（进程级缓存）；
3. 单元格输入 `=Z.JS("3.5*2")` 验证返回 `7`。

## 开发流程

1. 改 `addon/js/functions.js`（或它依赖的 `js/lib/calc.js`）；
2. 若改了参数/描述，同步 `functions.json` 与 `manifest.xml`；
3. `node build.js` 会校验 `calc.js` 与 `functions.js` 的求值实现是否一致（不一致直接报错，防止两套结果）；
4. 重启服务 + 重启 WPS；
5. 用 `=Z.JS("3.5*2")`、`=Z.JS(A1)`、非法算式三类用例回归；
6. 看日志：WPS 开发者工具 → JS 控制台，前缀 `[智算墨斗][函数]`；注册成功会打印命名空间与函数名。

## 调试对照表

| 现象 | 含义 | 处置 |
| --- | --- | --- |
| `#NAME?` | 函数未注册/加载项未生效 | 检查菜单是否出现、`wps.AddCustomFunction` 是否执行、是否完全重启 |
| `#VALUE!` | 已调用但返回值转换失败 | 检查 `result.type` 是否 `any`、是否 `String()` 返回、是否 Range 解包异常 |
| 引用的单元格无结果 | 引用为空或内容非算式 | 先确认 A1 有内容 |
| 改了没生效 | 服务/WPS 缓存 | 重启服务 + 结束全部 WPS 进程 |
| 注册冲突 | 重复加载 | 用单例标记防重复 |

## 边界

- 只支持**官方加载项**形态；WPS 的 JS 宏编辑器（`Application` 宿主）不提供单元格 UDF；
- 参数中的 Range 由 `functions.js` 解包（二维数组递归处理），求值本身交给 `ZSMD.Calc`；
- 函数随加载项存活：加载项停用后，已有公式可能显示错误；
- 自定义函数不参与 VBA 线，VBA 用 `JS()` UDF。

## 相关源码与测试

- [`addon/js/functions.js`](https://github.com/hh127/SmartQuant-InkLine/blob/main/wps-js-plugin/addon/js/functions.js)
- [`addon/functions.json`](https://github.com/hh127/SmartQuant-InkLine/blob/main/wps-js-plugin/addon/functions.json)
- [`addon/manifest.xml`](https://github.com/hh127/SmartQuant-InkLine/blob/main/wps-js-plugin/addon/manifest.xml)
- 测试：`test/functions-engine-sync.test.js`、`calc.test.js`
