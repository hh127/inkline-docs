---
title: "功能详解"
description: "12 项能力总览、双形态可用性矩阵与按场景的阅读顺序。"
---

# 功能详解

智算墨斗围绕三件事展开：**算量核对**（看算式）、**结算审计**（留痕与追溯）、**交付安全**（隐私与导出）。下面是全部功能与两种形态的可用性。

## 功能地图

| 能力 | 一句话 | WPS JS 4.67 | Excel VBA 4.66 |
| --- | --- | --- | --- |
| [实时审计与时间线](/features/audit.html) | 每次改动自动留痕，可回溯、可恢复 | ✅ | ✅ |
| [变色与括号层级](/features/highlight.html) | 按括号层级与中文注释给算式着色 | ✅ | ✅ |
| [差异比对与恢复](/features/diff.html) | 字符级红绿差异 + 算量变化量 | ✅ | ✅ |
| [沉浸阅读](/features/reading.html) | 把复杂算式拆成可读的胶囊结构 | ✅ | ✅ |
| [计算引擎](/features/calc.html) | 清洗中文/全角括号后安全求值 | ✅ | ✅ |
| [单元格函数 =Z.JS()](/features/custom-function.html) | 在单元格里直接对算式字符串求值 | ✅ | ⚠️ 以 `JS()` UDF 形式 |
| [统计大屏](/features/dashboard.html) | 聚合批注，生成项目偏离度与作者画像 | ✅ | ✅ |
| [广联达表清洗](/features/glodon.html) | 把导出报表拍平成可落库的二维表 | ✅ | ❌ 未迁移 |
| [隐私模式与金库](/features/privacy.html) | 隐藏金库 + 掩码 + 密码保护 | ✅ | ✅ |
| [导出审查版/交付版](/features/export.html) | 副本另存后清洗，原表零改动 | ✅ | ✅ |
| [一键导入旧表](/features/import.html) | 从旧工作簿继承数据与配置 | ✅ | ✅ |
| [清除审计标记](/features/audit-tools.html) | 删除机器日志批注、保留用户批注 | ✅ | ✅ |

> 标记说明：✅ 完整可用；⚠️ 机制不同（见[双实现能力矩阵](/dev/parity.html)）；❌ 有意不做或未迁移。
> **有意取舍**：表内悬浮按钮、快捷键体系、大屏落盘在 WPS JS 版不提供，由 Ribbon + 侧边栏替代。

## 按场景读

| 你想做的事 | 建议顺序 |
| --- | --- |
| 第一次上手 | [快速开始](/guide/quickstart.html) → [实时审计](/features/audit.html) → [变色](/features/highlight.html) |
| 复核别人的量 | [差异比对](/features/diff.html) → [沉浸阅读](/features/reading.html) → [统计大屏](/features/dashboard.html) |
| 结算审计归档 | [隐私模式](/features/privacy.html) → [导出审查版](/features/export.html) → [清除审计标记](/features/audit-tools.html) |
| 处理广联达导出表 | [广联达表清洗](/features/glodon.html) |
| 在单元格里算算式 | [单元格函数](/features/custom-function.html) |

## 每个功能页包含什么

- **适用形态**：WPS / VBA 是否支持
- **它解决什么问题**：使用场景，不堆术语
- **前置条件**：配置表、开关、宿主要求
- **操作步骤**：按界面实际按钮编写
- **参数与开关**：配置表里对应的键与默认值
- **结果与判定**：怎么算"成功"
- **边界与注意事项**：性能限制、不可逆操作、平台差异
- **相关源码与测试**：方便二次开发对照

::: tip 内容状态
功能页正在按 P0 → P1 顺序补齐，未完成的页面会显示占位提示；已完成的页面可放心按步骤操作。
:::
