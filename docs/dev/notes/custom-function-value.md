---
title: "=Z.JS() 报 #VALUE! 的根因"
description: "从 #NAME? 到 #VALUE!：自定义函数注册成功之后，返回值契约为什么还会失败。"
---

# `=Z.JS()` 报 `#VALUE!` 的根因

## 症状

按步骤装好加载项，单元格输入 `=Z.JS("3.5*2")`：

1. 一开始显示 **`#NAME?`** —— 函数根本没被识别；
2. 继续排查、让注册打印成功后，变成了 **`#VALUE!`** —— 函数被调用了，但结果不对。

很多人到这一步会以为"还是没装好"，其实方向已经完全变了。

## 根因

WPS 的计算宿主是 C++，它通过 `GetJSReturnValue` 把 JS 返回值桥接成单元格值。
如果 `functions.json` 里声明：

```json
{ "result": { "type": "number" } }
```

而 JS 实际返回的是**字符串或对象**（例如 `String(7)`、二维数组），C++ 侧强转失败 → `#VALUE!`。

同一类根因还有：

- Range 参数没有解包，函数拿到二维数组直接参与运算；
- 函数内部抛异常，没有被 try-catch 捕获；
- `manifest.xml` 的 `<Namespace>` 与 `AddCustomFunction` 首参不一致，函数注册到了别的命名空间。

## 方案

| 改动 | 位置 |
| --- | --- |
| `result.type` 改为 **`any`** | `addon/functions.json` |
| 统一 `String()` 后返回，异常也返回可读文本 | `addon/js/functions.js` |
| Range 参数递归解包成标量/一维 | `addon/js/functions.js` |
| 单例注册，防重复加载冲突 | `addon/js/functions.js` |
| 命名空间三处一致：注册首参 / manifest / 用户前缀 | 三个文件 |
| 改完重启服务 + **完全退出** WPS | 部署动作 |

## 验证

| 用例 | 期望 |
| --- | --- |
| `=Z.JS("3.5*2")` | `7` |
| `=Z.JS("钢筋 5.5*2")` | `11`（中文清洗） |
| `=Z.JS("3.5*(2+1)-【损耗】5%")` | `10.45` |
| `=Z.JS(A1)`（A1 有算式） | 对应结果 |
| 非法算式 | `#错误:[清洗后文本]`，不弹窗 |

日志：WPS 开发者工具 → JS 控制台，前缀 `[智算墨斗][函数]`；注册成功应有命名空间与函数名输出。

## 你也遇到了？

- ☐ 先确认是 `#NAME?` 还是 `#VALUE!`（两者处置完全不同）
- ☐ 检查 `functions.json` 的 `result.type` 是否为 `any`
- ☐ 检查 JS 是否 `String()` 返回、异常是否被捕获
- ☐ 确认改完已重启本地服务，并完全退出所有 WPS 进程
- ☐ 参考[自定义函数开发](/dev/custom-function-dev.html)与[单元格函数](/features/custom-function.html)
