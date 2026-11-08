---
title: "相关链接"
description: "源码仓库、文档仓库、问题反馈与关联资料。"
---

# 相关链接

## 官方入口

| 入口 | 地址 | 用途 |
| --- | --- | --- |
| 源码仓库 | [hh127/SmartQuant-InkLine](https://github.com/hh127/SmartQuant-InkLine) | 插件源码、发布制品（`releases/`）、提交历史 |
| 文档仓库 | [hh127/inkline-docs](https://github.com/hh127/inkline-docs) | 本站源码，欢迎提 PR 修正文档 |
| 在线文档 | [hh127.github.io/inkline-docs](https://hh127.github.io/inkline-docs/) | 本站发布地址 |
| 问题反馈（产品） | [Issues](https://github.com/hh127/SmartQuant-InkLine/issues) | 功能缺陷、安装部署问题 |
| 问题反馈（文档） | [Issues](https://github.com/hh127/inkline-docs/issues) | 失效链接、内容与源码不一致 |

## 反馈前请先自查

1. 用[排障手册](/deploy/troubleshooting.html)按「症状 → 原因 → 处置」过一遍；
2. 确认版本口径：`wps-js-plugin/package.json` 为 **4.67.0**，`releases/` 只有 **4.66** 制品（见[版本更新](/changelog/)）；
3. 附上：WPS/Excel 版本、加载项形态、操作步骤、日志前缀（如 `[智算墨斗][函数]`），并**脱敏**表内数据。

## 关联资料

| 资料 | 说明 |
| --- | --- |
| [踩坑专栏](/dev/notes/) | 平台事件、表结构同步、自定义函数、构建产物等 6 篇复盘 |
| [开发日志](https://github.com/hh127/SmartQuant-InkLine/blob/main/wps-js-plugin/开发日志.md) | 按日期记录的完整开发过程（仓库内） |
| [VuePress 官方文档](https://v2.vuepress.vuejs.org/) | 本站使用的文档框架 |
| [ECharts 官方文档](https://echarts.apache.org/) | 统计大屏图表库 |

## 获取与安装

- **WPS 形态**：无安装包，按[安装（WPS）](/guide/install-wps.html)源码构建后本地或内网部署；
- **Excel VBA 形态**：从 `releases/` 取 `智算墨斗v4.66.xlsm`，按[Excel VBA 分发](/deploy/vba-xlsm.html)配置宏信任。
