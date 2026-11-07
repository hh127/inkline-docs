---
title: "事件桥与表结构同步"
description: "五类事件、SheetChange 路由、表结构快道与轮询兜底，以及仍然待真机确认的风险。"
---

# 事件桥与表结构同步

## 注册的 5 类事件

| 事件 | 用途 |
| --- | --- |
| `SheetChange` | 单元格/区域改动 → 审计与变色（唯一写路径入口） |
| `SheetSelectionChange` | 选区变化 → 悬浮/面板跟随、当前格差异 |
| `WorkbookNewSheet` | 新建工作表 → 配置表即时同步 |
| `SheetBeforeDelete` | 删除工作表 → 删除后同步（带重试） |
| `SheetActivate` | 切换工作表 → 走"便宜快道"同步 |

注册方式统一走 `Host.registerApiEvent(name, fn)`，内部调用 `wps.ApiEvent.AddApiEventListener`，便于测试替换与失败降级。

## SheetChange 路由（按源码顺序）

```text
SheetChange(sheet, target)
 1. 工作簿存在且已「启用」            ← 否则忽略
 2. 若是 Admin_Config：
      内部写入 → 忽略
      受保护开关 → 拦回 + 重载
      否则 → reload 配置
 3. 若是 Log_Audit → 忽略
 4. 该表处于隐私模式 → 撤销本次修改（undo + 恢复事件状态）
 5. cellCount(target) > 5000 → 跳过并提示"超大批量修改"
 6. 读该表审计/变色开关：
      都关闭 → 忽略
 7. 路由 A：审计范围命中 → Audit.onSheetChange
    路由 B：变色范围命中 → Highlight 处理器
```

几个容易忽略的细节：

- **防重入**：`_handlingChange` 守卫，避免处理过程中再次触发；
- **系统内部写入**：开关回写、配置生成等由 `Config.isSystemWriting()` 标记，事件层不得拦截，否则会把系统写入回滚；
- **隐私表**：不是"跳过"，而是**撤销用户的改动**——隐私表只允许解密后编辑；
- **关闭事件**：撤销/写入时会临时 `enableEvents(false)`，必须在 `finally` 恢复，否则后续事件全丢。

## 表结构同步的三条路径

| 路径 | 成本 | 触发条件 |
| --- | --- | --- |
| 原生事件 | 低 | `WorkbookNewSheet` / `SheetBeforeDelete` / `SheetActivate`（若宿主支持） |
| 数量快道 | 1 次 COM | `SheetChange` 时只读 `Sheets.Count`，数量变化 = 增/删，立即同步 |
| 名字快道 | 0 次 COM | 当前表名不在内存注册表 → 新增或原地改名，立即同步 |
| 轮询兜底 | 5s 一次 Count；每 2 次（≈10s）一次全名枚举 | 兜底改名/漏事件 |

删除表还有专门的等待策略：最多 10 次 × 50ms 重试，等删除动作完成后再全量同步。

## 为什么会有轮询（性能演进史）

真机反馈推动了三次修正，理解这段能避免"优化回去"：

1. 最初：每次 `SheetChange` 都枚举全部表名 → 改一个单元格也卡；
2. 改为事件驱动后仍卡：加载时频繁全表名枚举；
3. 最终：原生事件 + 数量快道（1 COM）+ 名字快道（0 COM），轮询只做便宜的 Count 兜底——才有现在的流畅度。

## 待真机确认的风险

::: warning 事件能力可能因 WPS 版本而异
开发日志记录：个别 WPS 版本可能只开放单元格级事件，`WorkbookNewSheet` / `SheetBeforeDelete` / `SheetActivate` 均不触发。
若属实，表结构同步只剩轮询兜底：**新建/删除表后需要等待最多约 10 秒**才会出现在配置表里。
功能不受影响，但文档与 FAQ 已按"可能延迟"描述。
:::

## 调试方法

| 想看什么 | 去哪看 |
| --- | --- |
| 事件是否注册成功 | WPS 开发者工具 → JS 控制台，看 `[智算墨斗]` 前缀 |
| 事件是否触发 | 在回调入口临时打日志（注意提交前移除） |
| 表结构是否同步 | 配置表「工作表名称」列是否出现新表 |
| 是否被批量拦截 | 状态栏提示"检测到超大批量修改" |

## 相关源码与测试

- 事件桥：[`js/core/events.js`](https://github.com/hh127/SmartQuant-InkLine/blob/main/wps-js-plugin/js/core/events.js)
- 测试：`wps-js-plugin/test/sheet-registry-sync.test.js`、`workbook-context.test.js`、`master-switch.test.js`
- 踩坑记录：[表结构同步与轮询兜底](/dev/notes/sheet-sync.html)
