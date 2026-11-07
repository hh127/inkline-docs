---
title: "双实现能力矩阵"
description: "Excel VBA 与 WPS JS 的能力对照、机制差异与有意取舍，避免照着旧文档操作新形态。"
---

# 双实现能力矩阵

智算墨斗有两套实现：**Excel VBA（4.66，冻结）** 与 **WPS JS 官方加载项（4.67，主线）**。
本页回答三个问题：哪些能力两边都有、哪些是机制不同、哪些是**有意不做**。

## 版本线

| | Excel VBA | WPS JS 加载项 |
| --- | --- | --- |
| 版本 | 4.66（最后制品） | **4.67.0（主线）** |
| 状态 | 冻结（2026-08-21 后不再迭代） | 活跃开发 |
| 获取 | `releases/智算墨斗v4.66.xlsm` | 源码部署（无安装包） |
| 宿主 | Excel（`Application`） | WPS 表格（`wps` + `wps.ApiEvent`） |
| 代码位置 | `src/`（阅读）、`src-xlsm-v4.67/`（基线） | `wps-js-plugin/` |

## 功能可用性

| 能力 | VBA | WPS JS | 备注 |
| --- | --- | --- | --- |
| 实时审计 + 时间线 | ✅ | ✅ | VBA 走 `ThisWorkbook` 事件 |
| 变色 / 括号层级 | ✅ | ✅ | |
| 字符级差异 / 算量变化量 | ✅ | ✅ | LCS 两版各自实现 |
| 沉浸阅读 | ✅ | ✅ | VBA 为 UserForm WebBrowser；JS 为任务窗格 |
| 算式求值 | ✅ `Application.Evaluate` | ✅ 自研纯 JS 求值器 | JS 不依赖宿主 Eval |
| 单元格函数 | ✅ `JS()` UDF | ✅ `=Z.JS()` | 命名空间机制不同 |
| 统计大屏 | ✅ 可落盘 HTML | ✅ 任务窗格渲染 | 两版都依赖 ECharts CDN |
| 隐私金库 | ✅ | ✅ | 均非密码学加密 |
| 导出审查版 / 交付版 | ✅ | ✅ | 均副本清洗 |
| 一键导入旧表 | ✅ 多选窗体 | ✅ 编号多选 | 功能等价 |
| 清除审计标记 | ✅ | ✅ | |
| 广联达表清洗 | ⚠️ 真机基线无；`src/` 有实现 | ✅ | 以 JS 版为准 |
| 表内悬浮按钮 / 快捷键 | ✅ | ❌ 有意不做 | Ribbon + 侧边栏替代 |
| 大屏落盘 | ✅ | ❌ 有意不做 | 任务窗格内渲染 |

## 机制差异（容易踩的）

| 主题 | VBA | WPS JS |
| --- | --- | --- |
| 事件注册 | `Workbook_SheetChange` 等 | `wps.ApiEvent.AddApiEventListener(...)` |
| 表结构同步 | 工作簿事件 | 原生事件 + 计数快道 + 轮询兜底 |
| 弹窗/多选 | UserForm（ListBox 多选） | `prompt` 编号多选（`*` 全选） |
| UI 载体 | 用户窗体 + WebBrowser | Ribbon + 任务窗格/侧边栏 HTML |
| 求值 | `Application.Evaluate` | 自研 tokenizer/求值器 |
| 单元格函数注册 | VBA Function | `wps.AddCustomFunction("Z","JS",fn)` |
| 颜色/字体写入 | Range 属性 | `Host` 适配层封装，支持 run 级字体 |
| 文件对话框 | `Application.FileDialog` | 宿主文件 API（`Host` 封装） |

## 行为对齐细节（JS 版有意比 VBA 宽/稳）

| 点 | VBA | JS 版 | 原因 |
| --- | --- | --- | --- |
| 开关真值判定 | 有限写法 | `TRUE / 开启 / 1 / 是` 均判真 | 兼容用户手填，已被测试锁定 |
| 解密列宽回填 | 复制列宽 | `PasteSpecial xlPasteColumnWidths`，不支持则降级 | 宿主能力差异 |
| 变色时筛选态 | — | 保持屏幕刷新，防宿主吞色 | 真机实测 |
| 表结构同步 | 事件 | 原生事件（毫秒级）为主，轮询 5s/10s 兜底 | 事件能力尚待真机确认 |

::: warning 关于事件能力的待验证项
部分 WPS 版本可能只开放单元格级事件，`WorkbookNewSheet` / `SheetBeforeDelete` / `SheetActivate` 是否触发仍需真机复测；
若都不触发，表结构同步只剩轮询兜底（功能仍可用，但有延迟）。见[事件桥与表结构同步](/dev/events.html)。
:::

## 文档怎么读

- 页面顶部有「适用形态」标记（`WPS JS 4.67 ✅ ｜ Excel VBA 4.66 ✅/❌`）；
- 标 ❌ 的是有意不做或未迁移，不是 bug；
- 涉及界面按钮的步骤按 **WPS 主线** 写；VBA 版按钮位置不同但流程一致。

## 相关

- [JS 架构](/dev/architecture-js.html) / [VBA 架构](/dev/architecture-vba.html)
- [版本更新](/changelog/)：版本口径与制品说明
- [安装（WPS）](/guide/install-wps.html) / [安装（VBA）](/guide/install-vba.html)
