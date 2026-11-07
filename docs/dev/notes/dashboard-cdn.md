---
title: "大屏的 CDN 依赖"
description: "统计大屏为什么断网就白屏，以及内网环境可以怎么缓解。"
---

# 大屏的 CDN 依赖

## 症状

- 有网时统计大屏正常出图；
- 内网/断网时打开大屏，**图表区域一片空白**，但卡片数字、表格都正常；
- 控制台可能看到 ECharts 脚本加载失败或 `echarts is not defined`。

## 根因

大屏 HTML 是通过字符串拼接生成的，里面直接写死了外部脚本：

```html
<script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>
```

对应位置：

- WPS JS 版：`wps-js-plugin/js/lib/statistics.js`（大屏渲染函数内）
- VBA 版：`src/.../UI_DashboardRenderer.vb`

断网时脚本加载失败 → 图表初始化直接抛错 → iframe 里只剩布局和数字，图表空白。**页面没有降级提示**，容易被误判为"大屏坏了"。

## 方案

### 短期（不改代码）

| 环境 | 做法 |
| --- | --- |
| 能联网 | 直接使用 |
| 内网隔离 | 放行 `cdn.jsdelivr.net`；或由 IT 提供内网镜像域名 |
| 临时演示 | 提前在有网环境生成大屏并保持页面打开（不刷新） |

### 中期（推荐，需真机验证）

1. 把 `echarts.min.js`（5.5.0）下载到 `addon/vendor/` 随加载项发布；
2. 把 `getEChartsJS` 里的 script 地址改为相对路径（或按配置选择 CDN/本地）；
3. 内网部署时无需放行外网。

> 注意：加载项静态服务有发布白名单（`server.js` 的 `PUBLISH_FILES`），新增 vendor 文件要同步加白名单，否则 404。

### 长期

把大屏改为**全离线依赖**，并在无图表库时显示"图表不可用，请检查网络"的降级提示。

## 验证

- 断网打开大屏：确认只有图表空白，其余功能正常（当前行为）；
- 修改后：断网也能出图，且内置文件随版本分发；
- 控制台 Network 面板确认 ECharts 请求状态（200/CDN 失败）。

## 你也遇到了？

- ☐ 先确认是不是只有图表空白（其他功能正常 = CDN 问题）
- ☐ 打开开发者工具看 `echarts` 是否加载成功
- ☐ 内网环境确认域名白名单
- ☐ 参考[统计大屏](/features/dashboard.html)与[已知限制](/dev/known-issues.html)
