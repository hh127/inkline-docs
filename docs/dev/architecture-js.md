---
title: "JS 架构"
description: "ZSMD 命名空间、16 文件加载顺序、构建期漂移守卫与宿主边界。"
---

# JS 架构

WPS JS 版的运行形态与 VBA 完全不同：**没有 ES module、没有工程引用**，加载项 webview 只加载一个入口脚本。
所以整个系统用「全局命名空间 + 固定顺序拼接」来模拟模块系统，再由 `build.js` 把 16 个文件焊成单文件产物。

## 运行形态

```text
index.html (加载项入口)
  └─ shell.js        Ribbon 动作分发
  └─ zsmd-all.js     ← build.js 产物：16 个源文件按 ORDER 拼接
       └─ ZSMD.*     所有模块挂在同一命名空间
```

- 宿主是 WPS 表格（`wps` 全局对象），入口脚本由 `publish.xml` 指向的静态目录提供；
- 单文件产物同时存在于 `dist/` 与 `addon/`，两处必须一致（构建脚本自动同步）；
- Node 测试不跑构建产物，而是按同样的 `ORDER` 用 `vm` 逐个加载源文件，注入宿主 stub。

## 模块加载顺序（16 个文件）

`build.js` 的 `ORDER` 是唯一权威顺序，改顺序等于改依赖关系：

| # | 文件 | 层 | 职责 |
| --- | --- | --- | --- |
| 1 | `js/zsmd.js` | 宿主 | 命名空间 `ZSMD` + Host 适配层（唯一接触 `wps` 的对象） |
| 2 | `js/core/colors.js` | 核心 | 主题色与括号配色（从配置表读，带默认值） |
| 3 | `js/core/config.js` | 核心 | 配置表读写、注册表同步、模板生成 |
| 4 | `js/core/bridge.js` | 核心 | 任务窗格/面板与宿主桥 |
| 5 | `js/lib/highlight.js` | 业务 | 富文本变色引擎 |
| 6 | `js/lib/audit.js` | 业务 | 审计链、批注格式、快照 |
| 7 | `js/lib/diff.js` | 业务 | LCS 差异、时间线、沉浸阅读渲染 |
| 8 | `js/lib/calc.js` | 业务 | 算式清洗与求值引擎 |
| 9 | `js/lib/security.js` | 业务 | 隐私金库加解密与批处理 |
| 10 | `js/lib/import.js` | 业务 | 旧表导入与配置继承 |
| 11 | `js/lib/audit-tools.js` | 业务 | 清除审计标记 |
| 12 | `js/lib/glodon.js` | 业务 | 导出表清洗流水线 |
| 13 | `js/lib/export.js` | 业务 | 审查版/交付版导出 |
| 14 | `js/lib/statistics.js` | 业务 | 批注聚合与大屏渲染 |
| 15 | `js/core/events.js` | 核心 | 事件注册、基线捕获、表结构同步 |
| 16 | `js/main.js` | 入口 | 加载生命周期、Ribbon 动作、面板通知 |

> `events.js` 排在业务层之后，是因为它要调用 `Highlight` / `Audit` / `Config`；
> `main.js` 最后加载，负责把所有模块接线成对宿主可见的全局函数。

## 构建流程

```bash
cd wps-js-plugin
node build.js
```

1. **漂移守卫（前置钩子）**：逐名比对 `js/lib/calc.js` 与 `addon/js/functions.js` 的 `OPS`、
   `cleanMathExpression` / `isPureNumeric` / `roundResult` / `evalOnce` 与 `Parser` 方法体，
   剥离注释与空白后指纹比对；任一处不一致直接 `exit(1)` 终止构建；
2. **按 `ORDER` 拼接**：每个文件前插入 `/* ====== 路径 ====== */` 分节注释；
3. **写产物**：输出 `dist/zsmd-all.js`，并同步复制到 `addon/zsmd-all.js`。

::: warning 为什么要有漂移守卫
单元格函数 `=Z.JS()` 在 bundle 未加载的隔离上下文里由 `addon/js/functions.js` 的 `calcInternal` 接管求值。
两份引擎一旦只改一处（负指数、幂结合律、全角清洗等），同一算式在不同加载状态下结果就会脱节。
守卫把「漏跑测试就打包」这条破防路径焊死。
:::

## 可测性设计

- `ZSMD.Host` 是核心服务访问宿主的**唯一通道**，核心逻辑只依赖它的窄接口；
- Node 测试注入同形 stub（`NS.G = { wps, Application, ActiveWorkbook, ActiveSheet }`），
  因此 `highlight` / `audit` / `config` / `diff` / `calc` 等纯逻辑层可完整测试；
- 已知例外：`security.js`、`import.js`、`audit-tools.js`、`export.js`、`main.js` 直接触碰宿主，
  真机路径不可单测，只能靠 stub 覆盖分支 + 手工验证；
- 宿主探测做了多形态兜底（web 加载项的 `wps`、JS 宏的 `Application`、直接全局），
  见[Host 适配层](/dev/host-adapter.html)。

## 与 VBA 分层的对照

| VBA（4.66） | WPS JS（4.67） | 说明 |
| --- | --- | --- |
| `ThisWorkbook` 事件总线 | `js/core/events.js` | 事件注册换成 `wps.ApiEvent`，表结构同步加轮询兜底 |
| `Class_AppConfig` / `Class_AppColor` | `js/core/config.js` / `colors.js` | 状态对象改为命名空间下的单例 + 惰性缓存 |
| `Service_*` 服务层 | `js/lib/*.js` | 一一对应，纯函数层抽出便于测试 |
| `UI_HtmlRenderer` / `UI_DashboardRenderer` | `js/lib/diff.js` / `statistics.js` | 渲染改为返回 HTML 字符串，由任务窗格承载 |
| `UI_FloatingController` | `js/main.js` + `core/bridge.js` | 悬浮按钮体系移除，改 Ribbon + 任务窗格 |
| 用户窗体（`frm*`） | 任务窗格 HTML + `prompt` 多选 | 无模态窗体，交互降级为编号多选 |

## 相关

- [VBA 架构](/dev/architecture-vba.html) — 冻结基线怎么分层
- [Host 适配层](/dev/host-adapter.html) — COM 差异唯一出口
- [事件桥与表结构同步](/dev/events.html) — 事件注册与轮询兜底
- [构建与测试](/dev/build-test.html) — 命令、测试基线与提交规范
