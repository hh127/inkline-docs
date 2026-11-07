---
title: "版本更新"
description: "智算墨斗的版本口径、变更记录与历史版本对照。"
version: "4.67.0"
---

# 版本更新

## 版本口径（先读这段）

| 项目 | 当前值 | 说明 |
| --- | --- | --- |
| 文档对应版本 | **WPS JS 4.67.0** | 来源：`wps-js-plugin/package.json` |
| 主线形态 | WPS 官方 JS 加载项 | 活跃开发中 |
| 另一形态 | Excel VBA 4.66 | 已冻结，仅维护文档 |
| 发布制品 | 仅 `releases/智算墨斗v4.66.xlsm` | **尚无 4.67 制品**，源码部署见[安装（WPS）](/guide/install-wps.html) |

::: warning 常见误解
`package.json` 是 4.67.0，但 `releases/` 里只有 4.66 的 xlsm —— 这不是笔误，
4.67 目前只以源码 + 本地部署方式提供。下载页看到 4.66 时请回到本表核对。
:::

## 版本列表

- [4.67（WPS JS 主线）](/changelog/v4.67.html) — 当前主线，变更记录整理中
- [4.66（VBA 冻结版）](/changelog/v4.66.html) — 最后一个 VBA 制品版本
- [历史版本对照](/changelog/archive.html) — 标签、制品与文档口径对照

## 维护规则

站点的版本号与产品侧保持同步，任何一处不一致都会让 `npm run docs:check` 失败；
发版时请同步更新本页与首页的 `version` 字段。
