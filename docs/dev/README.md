---
title: "架构开发"
description: "两条技术线、模块地图与二次开发入口：从读代码到改代码的路线图。"
---

# 架构开发

本栏目面向**要读代码、改代码或做二次开发**的读者。产品使用说明在[使用指南](/guide/)，部署与运维在[部署运维](/deploy/)。

## 先确定你读哪条线

| 你的目标 | 读哪条线 | 入口 |
| --- | --- | --- |
| 参与主线开发 | WPS JS 加载项（4.67.0） | [JS 架构](/dev/architecture-js.html) → [Host 适配层](/dev/host-adapter.html) → [事件桥](/dev/events.html) |
| 对照旧实现 / 维护 VBA | Excel VBA（4.66，冻结） | [VBA 架构](/dev/architecture-vba.html) |
| 判断某能力在哪一版有 | 两版对照 | [双实现能力矩阵](/dev/parity.html) → [技术选型与取舍](/dev/decision.html) |
| 跑构建、写测试 | 工程实践 | [构建与测试](/dev/build-test.html) → [贡献规范](/dev/contributing.html) |
| 排查线上怪现象 | 踩坑复盘 | [踩坑专栏](/dev/notes/) |
| 查某个模块的 API | 模块参考 | [模块参考索引](/dev/module-ref/) |

## 推荐阅读顺序

1. **读代码前**：先看 [JS 架构](/dev/architecture-js.html)，弄清 `zsmd.js` 定义命名空间、16 个文件按固定 `ORDER` 拼接成单文件的构建方式；
2. **动手改前**：看 [构建与测试](/dev/build-test.html)，记住 `node build.js` 与 `npm test` 两道闸门；
3. **改宿主相关逻辑前**：看 [Host 适配层](/dev/host-adapter.html)，所有 COM 差异都收敛在这一层；
4. **改事件或配置前**：看 [事件桥与表结构同步](/dev/events.html) 与[踩坑：配置表开关锁定](/dev/notes/config-lock.html)；
5. **提交前**：看 [贡献规范](/dev/contributing.html)，提交信息格式与三处版本号同步是硬要求。

## 页面清单

### 架构

| 页面 | 内容 |
| --- | --- |
| [VBA 架构](/dev/architecture-vba.html) | N 层架构、模块分层与事件总线（冻结基线） |
| [JS 架构](/dev/architecture-js.html) | 单文件打包、命名空间 `ZSMD`、16 文件 `ORDER` |
| [Host 适配层](/dev/host-adapter.html) | COM 差异唯一出口与常用 API |
| [事件桥与表结构同步](/dev/events.html) | 事件注册、基线捕获、计数快道与轮询兜底 |

### 迁移与取舍

| 页面 | 内容 |
| --- | --- |
| [双实现能力矩阵](/dev/parity.html) | 两版能力、机制差异与有意不做 |
| [技术选型与取舍](/dev/decision.html) | 为什么这样分层、为什么放弃某些能力 |

### 工程实践

| 页面 | 内容 |
| --- | --- |
| [构建与测试](/dev/build-test.html) | 构建顺序、19 套件 / 1034 断言、提交与版本同步 |
| [自定义函数开发](/dev/custom-function-dev.html) | `=Z.JS()` 的注册、契约与调试 |
| [贡献规范](/dev/contributing.html) | 提交信息、标签与目录约定 |
| [已知限制](/dev/known-issues.html) | 平台边界与未覆盖场景 |

### 踩坑专栏与模块参考

| 栏目 | 内容 |
| --- | --- |
| [踩坑专栏](/dev/notes/) | 6 篇「症状 → 根因 → 方案 → 验证」复盘 |
| [模块参考索引](/dev/module-ref/) | 16 个模块的职责、导出 API 与调用关系 |

## 模块地图（JS 主线）

| 层 | 文件 | 职责 |
| --- | --- | --- |
| 宿主适配 | `js/zsmd.js` | 命名空间 `ZSMD` + Host 适配层（COM 差异唯一出口） |
| 核心 | `js/core/colors.js` | 主题色与括号配色 |
| 核心 | `js/core/config.js` | 配置表读写、注册表同步、模板生成 |
| 核心 | `js/core/events.js` | 事件注册、基线捕获、表结构同步 |
| 核心 | `js/core/bridge.js` | 任务窗格/面板与宿主桥 |
| 业务 | `js/lib/*.js` | highlight / audit / diff / calc / security / import / export / glodon / statistics / audit-tools |
| 入口 | `js/main.js` | 加载生命周期、Ribbon 动作、面板通知 |

## 写作与维护约定

- 文档只写源码里能验证的事实；API 以源码为准，页面给出文件路径；
- 不记录内部评审材料、本机路径与人名；
- 与源码不一致时以源码为准，并欢迎在[文档仓库](https://github.com/hh127/inkline-docs/issues)提 issue。
