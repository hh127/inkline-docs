---
title: "部署运维"
description: "个人本机、团队内网与 Excel VBA 三种部署形态的选择与操作入口。"
---

# 部署运维

智算墨斗有两种运行形态、三种部署场景。先按场景选路径，再进入对应页面。

## 先选场景

| 场景 | 典型用户 | 推荐方式 | 详见 |
| --- | --- | --- | --- |
| 个人本机试用 | 造价/审计人员自己电脑 | WPS 加载项本地模式（`127.0.0.1:3888`） | [安装（WPS）](/guide/install-wps.html) |
| 小团队内网共用 | 3～20 人，同一局域网 | 一台常开机器托管 `addon/` + 每台客户端写 `publish.xml` | [WPS 加载项部署](/deploy/wps-addin.html) |
| 继续用 Excel | 单位以 Excel 为主 | v4.66 xlsm 分发 + 宏信任配置 | [Excel VBA 分发](/deploy/vba-xlsm.html) |
| 对外正式分发 | 跨单位/公网用户 | 托管到可公网访问的 HTTPS 静态站点（建议走 WPS 官方发行渠道） | 本文 §「分发边界」 |

## 部署拓扑（WPS 形态）

```text
┌─────────────┐      HTTP       ┌──────────────────────┐
│  WPS 表格    │ ──────────────▶ │ 静态服务（addon/ 目录） │
│ (客户端)     │                 │ index.html / ribbon.xml│
└─────────────┘                 │ zsmd-all.js / shell.js │
       ▲                        └──────────────────────┘
       │ 启动时读取
┌──────────────────────────────────────┐
│ %APPDATA%\Kingsoft\wps\jsaddons\      │
│ publish.xml（注册加载项 URL）          │
└──────────────────────────────────────┘
```

关键点：**`publish.xml` 只记录 URL**，真正的代码与功能区定义都由这个静态目录提供。所以「换版本」= 换目录里的文件，不必逐台重装。

## 日常运维清单

- **升级**：构建新 `dist/zsmd-all.js` → 覆盖 `addon/` → 重启服务 → 客户端完全退出 WPS 再打开；
- **回滚**：保留上一版 `addon/` 目录副本，替换回去并重启（`publish.xml` 不用改）；
- **多人排障**：先确认服务端可访问（`curl http://<host>:3888/`），再看客户端 `publish.xml` 与服务 URL 是否一致；
- **日志**：`addon/access.log` 只用于排障，**不要提交进仓库**，也不要在工单里贴完整路径与内网地址。

## 分发边界（重要）

- 当前 `publish.xml` 机制使用 `enable="enable_dev"`（开发者模式），适合**本机与内网受控环境**；
- 跨单位正式分发建议走 WPS 官方加载项发行渠道，并改为 HTTPS；
- 不要把 `3888` 端口直接暴露到公网；
- 内网服务建议固定 IP 或使用内网域名，避免客户端 `publish.xml` 失效。

## 页面导航

- [WPS 加载项部署](/deploy/wps-addin.html) — 本机/内网部署、更新、回滚
- [Excel VBA 分发](/deploy/vba-xlsm.html) — xlsm 分发与宏安全
- [升级与回滚](/deploy/upgrade.html) — 版本检查与回滚步骤
- [排障手册](/deploy/troubleshooting.html) — 症状 / 原因 / 处置
