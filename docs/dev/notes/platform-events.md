---
title: "平台事件能力差异"
description: "为什么 VBA 版能实时同步表结构，JS 加载项早期却不行；以及最终怎么绕过去。"
---

# 平台事件能力差异

## 症状

VBA 版里新建、删除、重命名工作表，配置表的「工作表名称」列立刻跟着变；
换到 WPS JS 加载项后，同样的操作，配置表纹丝不动——等很久也不变，必须手动切表或重启加载项。

## 根因

不是 diff 逻辑写错了，而是**平台给的事件不一样**：

| 能力 | VBA（Excel） | WPS 官方 JS 加载项 |
| --- | --- | --- |
| 单元格变更 | `Workbook_SheetChange` | `wps.ApiEvent` 的 `SheetChange` ✅ |
| 选区变更 | `Workbook_SheetSelectionChange` | `SheetSelectionChange` ✅ |
| 新建工作表 | `Workbook_NewSheet` | `WorkbookNewSheet`（**是否触发随版本**） |
| 删除工作表 | `Workbook_SheetBeforeDelete` | `SheetBeforeDelete`（**是否触发随版本**） |
| 切换工作表 | `Workbook_SheetActivate` | `SheetActivate`（**是否触发随版本**） |

在部分 WPS 版本中，加载项只开放**单元格级**事件；表结构事件注册成功也不回调。
同步逻辑挂在事件上，事件不来，自然就"不同步"。

## 方案

不能只赌事件，所以做成「三条路径 + 一条兜底」：

1. **原生事件**：`WorkbookNewSheet` / `SheetBeforeDelete` / `SheetActivate` 能触发就毫秒级同步；
2. **数量快道**：`SheetChange` 时只读一次 `Sheets.Count`（1 次 COM），数量变化 = 增/删，立即同步；
3. **名字快道**：当前表名不在内存注册表里（0 次 COM）→ 新增或原地改名，立即同步；
4. **轮询兜底**：每 5 秒读一次 Count；每 2 次（约 10 秒）做一次全名枚举，兜住漏网事件与原地改名；
5. 删除表额外等待：最多 10 次 × 50ms 重试，等删除动作真正完成再全量同步。

## 验证

| 操作 | 预期 |
| --- | --- |
| 新建工作表 | 若原生事件可用：立即出现在配置表；否则 ≤ 约 10 秒 |
| 删除工作表 | 同上，且配置表不残留已删表 |
| 原地改名 | 名字快道或轮询兜底生效，≤ 约 10 秒 |
| 修改单元格 | 不应触发全表名枚举（性能验收点） |

## 你也遇到了？

- ☐ 确认 WPS 版本是否需要开启「加载 JS 加载项」
- ☐ 观察等待 10 秒后是否同步（能同步 = 事件未触发，走的是兜底）
- ☐ 在 JS 控制台确认 `WorkbookNewSheet` 等事件是否有回调日志
- ☐ 参考[事件桥与表结构同步](/dev/events.html)与[已知限制](/dev/known-issues.html)
