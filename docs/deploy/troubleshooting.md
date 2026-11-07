---
title: "排障手册"
description: "按症状定位：加载项、功能区、事件、单元格函数、性能与回滚。"
---

# 排障手册

排障原则：**先确认加载链条，再怀疑业务逻辑**。WPS 加载项的链条只有四段：

```text
publish.xml（有没有这条记录）
   → URL 静态服务（能不能访问 index.html / ribbon.xml）
   → WPS 进程（是否完全重启、是否开启 JS 加载项）
   → 业务代码（事件桥、配置表、开关）
```

## 第一步：确认服务与注册

```powershell
# 1) 服务是否活着（返回 HTML 即正常）
curl http://127.0.0.1:3888/

# 2) 功能区定义是否发布（返回 XML 即正常）
curl http://127.0.0.1:3888/ribbon.xml

# 3) 注册记录是否存在
Select-String -Path "$env:APPDATA\Kingsoft\wps\jsaddons\publish.xml" -Pattern "智算墨斗"

# 4) 是否还有残留 WPS 进程（必须先全部结束）
Get-Process wps,wpscloudsvr -ErrorAction SilentlyContinue
```

四项都正常仍无菜单，检查 WPS 版本是否开启了「加载 JS 加载项」相关选项（不同版本位置不同：开发工具 / 常规与保存）。

## 症状对照表

| 症状 | 最可能原因 | 处置 |
| --- | --- | --- |
| 完全没有「智算墨斗」选项卡 | 注册/服务/进程缓存 | 按上面 4 步检查；必要时删除条目重新 `node addon/install-publish.js` |
| 选项卡出现但按钮点了没反应 | `ribbon.xml` 未发布 / 服务已停 | 确认 `curl .../ribbon.xml`；保持服务窗口运行 |
| 重启后其他 WPS 加载项消失 | `publish.xml` 被覆盖 | 用同目录的 `publish.xml.bak-*.xml` 恢复，然后重新追加条目 |
| 生成配置表失败 | 工作簿受保护 / 只读 / 宏与事件被禁用 | 取消工作表保护、另存到可写位置、确认不是受保护视图 |
| 改单元格没有审计记录 | 未启用 / 按表开关关闭 / 超出范围 / 批量过大 | 见[常见问题 #5](/guide/faq.html) |
| 表结构变化后配置表不同步 | 平台事件未触发，轮询未到 | 等待 5～10 秒；切表触发同步；仍异常记录 WPS 版本反馈 |
| 变色不生效 | 开关 / 跳过标记 / 保护 / 筛选 | 见[变色与括号层级](/features/highlight.html)「边界」 |
| 统计大屏空白 | ECharts CDN 不可达 | 有网环境重试；内网配置镜像，见[大屏的 CDN 依赖](/dev/notes/dashboard-cdn.html) |
| `=Z.JS()` 显示 `#NAME?` | 函数未注册（加载项未真正加载） | 重装/重启，检查 `wps.AddCustomFunction` 是否执行 |
| `=Z.JS()` 显示 `#VALUE!` | 返回值契约问题 | 见[自定义函数开发](/dev/custom-function-dev.html) |
| 改了代码但行为没变 | WPS 进程缓存 | `node build.js` → 重启服务 → **完全退出** WPS |
| 文件大时卡顿 | 大数据量扫描 | 缩小审计/变色范围；分批处理；见[常见问题 #12](/guide/faq.html) |

## 看日志

| 日志 | 位置 | 看什么 |
| --- | --- | --- |
| 加载项请求日志 | 服务端 `addon/access.log` | WPS 是否真的请求了 `index.html` / `ribbon.xml` / `zsmd-all.js` |
| WPS JS 控制台 | WPS 开发者工具 → JS 调试 | `[智算墨斗]` 前缀日志、异常堆栈 |
| 单元格函数日志 | 同上 | `[智算墨斗][函数]`，注册成功会打印命名空间与函数名 |

::: warning 日志不要外发
`access.log` 含本机路径、内网地址与 UA，仅限排障使用；提交 issue 时请删减或打码。
:::

## 回滚

1. 服务端恢复上一版发布目录（见[WPS 加载项部署](/deploy/wps-addin.html)）；
2. 重启静态服务；
3. 客户端完全退出 WPS 后重新打开；
4. 若怀疑 `publish.xml` 被破坏，恢复备份并重新注册。

## 仍然无法定位？

到 [GitHub Issues](https://github.com/hh127/SmartQuant-InkLine/issues) 提问，附：

- WPS 版本与 Windows 版本；
- 复现步骤；
- 上面 4 条检查命令的输出（脱敏后）；
- 相关日志片段（`[智算墨斗]` 前缀）。
