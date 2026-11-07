---
title: "升级与回滚"
description: "WPS 加载项与 VBA 两种形态的升级步骤、回滚策略与升级后验证清单。"
---

# 升级与回滚

## 先确认版本

| 来源 | 当前值 | 说明 |
| --- | --- | --- |
| 源码 | `wps-js-plugin/package.json` → `4.67.0` | 唯一权威 |
| 站点 | 首页与[版本更新](/changelog/)的 `version` | 与源码保持同步（CI 校验） |
| 制品 | `releases/` 只有 v4.66 | 制品 ≠ 源码版本 |
| git tag | `vX.Y.Z` | 发布标签 |

::: warning 常见误解
看到 `package.json` 是 4.67.0、`releases/` 是 4.66，不是笔误：**4.67 目前只以源码 + 本地部署方式提供**。
:::

## WPS 加载项升级

### 升级前

1. 记录当前版本（`package.json` / 站点 `version`）；
2. 备份服务端发布目录（整目录复制，命名带版本，如 `publish.bak-4.67.0`）；
3. 备份每台客户端的 `publish.xml`；
4. 通知使用者保存并关闭工作簿。

### 升级

```bash
cd SmartQuant-InkLine/wps-js-plugin
git pull                     # 或解压新版源码
node build.js                # 重新构建 dist/zsmd-all.js 并同步 addon/
# 覆盖服务端发布目录中的：zsmd-all.js / shell.js / index.html / ribbon.xml / js/functions.js / manifest.xml / functions.json / ui/index.html
```

然后：

1. 重启静态服务（`Ctrl+C` 后重新启动，确保新文件被加载）；
2. 客户端**完全退出**所有 WPS 进程后重新打开；
3. 按下方清单验证。

### 回滚

1. 停服务；
2. 用备份目录整体替换当前发布目录；
3. 启动服务；
4. 客户端完全退出 WPS 后重新打开。

`publish.xml` 不需要改（URL 不变）。

## Excel VBA 升级

VBA 线已冻结，无功能升级。若必须替换：

1. 使用者保存并关闭项目文件；
2. 备份旧模板与项目文件（项目文件含审计链，不能丢）；
3. 只替换**模板文件**，已生成的项目文件保持不动；
4. 回滚 = 恢复旧模板。

## 升级后验证清单

- [ ] 功能区出现「智算墨斗」，分组与按钮齐全
- [ ] 打开一个测试工作簿 →「生成配置表」成功
- [ ] 启用后修改一个单元格 → 批注出现审计链、底色变化
- [ ] 审计面板能打开并显示时间线
- [ ] 变色重新计算正常（可改一次算式验证）
- [ ] 单元格输入 `=Z.JS("3.5*2")` 返回 `7`（WPS 形态）
- [ ] 统计大屏能生成（需可访问 ECharts CDN）
- [ ] 侧边栏/任务窗格可打开（确认 `ui/index.html` 已发布）

任一失败：先查[排障手册](/deploy/troubleshooting.html)，没有改善就回滚。

## 升级失败常见原因

| 现象 | 原因 | 处置 |
| --- | --- | --- |
| 行为还是旧的 | 服务没重启 / WPS 没完全退出 | 重启服务 + 结束全部 WPS 进程 |
| 按钮消失 | 发布目录缺 `ribbon.xml` / `index.html` | 核对发布目录文件清单 |
| 审计面板空白 | 缺 `ui/index.html` | 从 `wps-js-plugin/ui/` 复制到发布目录 `ui/` |
| `=Z.JS()` 报错 | `functions.json` / `manifest.xml` 未更新 | 一起覆盖这三个文件并重启 |
| 大屏空白 | CDN 不可达 | 见[大屏的 CDN 依赖](/dev/notes/dashboard-cdn.html) |
| 其他加载项消失 | `publish.xml` 被覆盖 | 用备份恢复后再追加条目 |

## 版本一致性（维护者）

站点的版本号会与首页/版本页做一致性校验：

```bash
npm run docs:check
```

发版时同步四处：`wps-js-plugin/package.json`、根 README 徽章、git tag、文档站首页与版本页的 `version`。
