---
title: "关于"
description: "项目定位、授权方式与协作入口，以及本站的维护说明。"
---

# 关于

本栏目回答「这是什么、怎么授权、去哪反馈」三件事。产品能力见[功能详解](/features/)，源码细节见[架构开发](/dev/)。

## 栏目说明

- 你在评估是否采用：先看[许可证](/about/license.html)，再看[相关链接](/about/links.html)里的源码仓库；
- 你要反馈问题：到[相关链接](/about/links.html)的 Issues 入口，按模板附环境信息；
- 你想参与贡献：先读[贡献规范](/dev/contributing.html)。

## 页面清单

| 页面 | 内容 |
| --- | --- |
| [许可证](/about/license.html) | 代码与文档的授权方式、第三方依赖许可、使用边界与免责声明 |
| [相关链接](/about/links.html) | 源码仓库、文档仓库、问题反馈、关联资料与获取方式 |

## 项目一句话

智算墨斗（SmartQuant InkLine）是面向工程造价与结算审计的 Excel / WPS 双形态工具：
实时审计留痕、字符级差异、算式可读化、隐私金库与交付清洗。当前主线为 **WPS 官方 JS 加载项 4.67.0**，
Excel VBA 4.66 为冻结基线。两版差异见[双实现能力矩阵](/dev/parity.html)。

## 维护方式

- 文档与产品同步维护：发版时更新[版本更新](/changelog/)与首页版本号，`npm run docs:check` 会校验版本一致性；
- 本站内容以源码为准，页面中标注了源码路径；发现与代码不一致请提 issue；
- 文档站本身在[文档仓库](https://github.com/hh127/inkline-docs)开源。
