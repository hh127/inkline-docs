---
title: "安装 · WPS 加载项"
description: "用源码把智算墨斗 4.67 官方 JS 加载项部署到本机 WPS 表格，并验证功能区与事件桥生效。"
---

# 安装 · WPS 加载项

适用于 **WPS 表格（ET）**。这是当前主线形态（4.67.0），装好后功能区会出现「智算墨斗」选项卡。

::: tip 预计时间
10～15 分钟，其中大部分时间花在「完全退出 WPS 再重启」上。
:::

## 前置条件

| 项目 | 要求 | 检查方式 |
| --- | --- | --- |
| 操作系统 | Windows（加载项与本地服务均按 Windows 路径编写） | — |
| WPS | 较新版本 WPS 表格，支持 JS 加载项 | 能安装/使用其他 JS 加载项即可 |
| Node.js | ≥ 20（仅部署与构建需要，日常使用不依赖 Node） | `node -v` |
| 端口 | 本地静态服务默认 `3888`，需未被占用 | `netstat -ano \| findstr 3888` |

::: warning 没有 4.67 安装包
仓库 `releases/` 目前只有 4.66 的 xlsm 制品，4.67 的 WPS 加载项**只能按本文用源码部署**。
:::

## 步骤 1：获取源码

```bash
git clone https://github.com/hh127/SmartQuant-InkLine.git
cd SmartQuant-InkLine/wps-js-plugin
```

没有 Git 时，在 GitHub 页面下载源码压缩包解压，进入 `wps-js-plugin` 目录即可。

## 步骤 2：构建 bundle

```bash
node build.js
```

作用：把 `js/` 下 16 个模块按固定 `ORDER` 拼接成 `dist/zsmd-all.js`，并同步一份到 `addon/zsmd-all.js`。
成功标志：两个文件时间戳更新，大小一致。

## 步骤 3：注册加载项（写 `publish.xml`）

先**手动备份**现有配置（脚本不会自动备份）：

```powershell
Copy-Item "$env:APPDATA\Kingsoft\wps\jsaddons\publish.xml" "$env:APPDATA\Kingsoft\wps\jsaddons\publish.xml.bak-manual"
```

再执行注册：

```bash
node addon/install-publish.js
```

脚本会向 `%APPDATA%\Kingsoft\wps\jsaddons\publish.xml` 追加一条：

```xml
<jspluginonline url="http://127.0.0.1:3888/" name="智算墨斗" type="et" enable="enable_dev" install="null" />
```

- `url` 指向本地静态服务（WPS 不支持 `file://`，必须是 http）；
- `type="et"` 表示 WPS 表格；
- `enable="enable_dev"` 是开发者模式加载。

可选参数：`node addon/install-publish.js 3890` 换端口；`node addon/install-publish.js 3888 "D:\path\publish.xml"` 显式指定文件。

::: tip 重复安装会被跳过
脚本检测到 `publish.xml` 已存在「智算墨斗」条目会直接退出；要更新条目，请先手动删除旧条目再执行。
:::

## 步骤 4：启动本地静态服务

```bash
node addon/server.js 3888
```

保持这个窗口**持续运行**（关掉窗口 = 加载项失效，WPS 会加载不到 `ribbon.xml` 与 bundle）。

验证服务：

```powershell
curl http://127.0.0.1:3888/
```

应返回加载项入口 HTML；同时 `http://127.0.0.1:3888/ribbon.xml` 可访问。

## 步骤 5：完全退出并重启 WPS

::: danger 必须完全退出所有 WPS 进程
只关闭窗口不够，WPS 有进程级缓存。请在任务管理器确认 `wps.exe`、`wpscloudsvr.exe` 都已结束，或执行：

```powershell
Get-Process wps,wpscloudsvr -ErrorAction SilentlyContinue | Stop-Process -Force
```

再重新打开 WPS 表格。
:::

## 步骤 6：验证

重启后应看到顶部「智算墨斗」选项卡，包含：

| 分组 | 按钮 |
| --- | --- |
| 配置管理 | 生成配置表 / 删除配置表、启用、停用 |
| 视图与审查 | 审计面板、沉浸阅读 |
| 状态控制 | 全局变色、全局审计（开关态按钮） |
| 数据清洗 | 广联达清洗 |
| 交付与安全 | 隐私加密、密码解密、导出审查版、外部交付版 |

然后按[快速开始](/guide/quickstart.html)走一遍。

### 单元格函数 `=Z.JS()`

加载项还会注册工作表函数（命名空间固定为 `Z`）：

```
=Z.JS("3.5*2")              → 7
=Z.JS("钢筋 5.5*2")         → 11
=Z.JS("3.5*(2+1)-【损耗】5%") → 10.45
```

若结果显示 `#NAME?` 或 `#VALUE!`，分别见[常见问题](/guide/faq.html)与[自定义函数开发](/dev/custom-function-dev.html)（报错不一定是安装失败，多数是函数契约问题）。

## 更新 / 卸载

**更新**（改了源码或拉取新版本后）：

1. `node build.js` 重新构建
2. 重启本地服务（`Ctrl+C` 后重新 `node addon/server.js 3888`）
3. 完全退出 WPS 再打开

**卸载**：退出 WPS → 从 `publish.xml` 删除「智算墨斗」条目（或恢复备份文件）→ 停止本地服务 → 重启 WPS。

## 常见安装问题

| 现象 | 原因 | 处置 |
| --- | --- | --- |
| 重启后没有「智算墨斗」 | `publish.xml` 未写入 / WPS 未完全退出 / 服务没启动 | 按[排障手册](/deploy/troubleshooting.html)逐项检查 |
| 有选项卡但按钮无反应 | 服务已停 / `ribbon.xml` 未发布 | 确认 `curl http://127.0.0.1:3888/ribbon.xml` 可访问 |
| 重启后其他加载项消失 | `publish.xml` 被覆盖 | 用 `publish.xml.bak-*.xml` 恢复，再重新追加条目 |
| 端口 3888 被占用 | 其他工具占用 | 换端口：`node addon/server.js 3890` + 安装脚本同端口 |
| 部分 WPS 版本需手动开启 | 未开启「加载 JS 加载项」 | 文件 → 选项 → 常规与保存 / 开发工具里开启后重启 |

## 下一步

- 单人本机使用：本文完成即可 → [快速开始](/guide/quickstart.html)
- 团队/内网使用：继续看[WPS 加载项部署](/deploy/wps-addin.html)
