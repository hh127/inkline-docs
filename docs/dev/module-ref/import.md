---
title: "ZSMD.Import"
description: "一键导入旧表：候选表、编号多选、整表复制、按钮清理与配置继承。"
---

# ZSMD.Import

## 职责

- 列出源工作簿可导入表（排除系统表与 `Vault_*`）；
- 生成编号多选提示（WPS 无模态窗体，`*` 全选）；
- 逐表整表复制到目标簿末尾，用目标簿真实新表名校验；
- 清理旧版悬浮按钮残留；
- 合并旧配置（`mergeLegacyConfig`，纯函数）。

## 导出 API

| API | 说明 |
| --- | --- |
| `isImportableSheetName(name)` / `listImportableSheets(names)` | 候选表过滤 |
| `buildCatalogText` / `buildImportPrompt` / `buildImportCatalogHTML` | 选择界面文案/HTML |
| `parseSheetSelection(input, names)` | 解析 `1,3,5` / `*` |
| `mergeLegacyConfig(oldRows, newRows, opts)` | 配置合并（纯函数，返回 `{rows, stats}`） |
| `normalizeSheetSwitch` / `normalizeParamValue` / `parseOldColor` | 值归一化 |
| `pickDataFile` / `openWorkbook` / `closeWorkbook` | 文件对话框与打开/关闭（宿主绑定） |
| `copySheets(targetWB, dataWB, names)` | 逐表复制，返回真实新表名与失败表 |
| `cleanLegacyFloatButtons(targetWB, names)` | 清理 `AuditFloatBtn` / `ReadFloatBtn` |
| `importFromDialog(ctx)` | 完整流程入口 |
| `SYSTEM_SHEET_NAMES` / `FLOAT_BUTTONS` / `CONFIG_START_ROW` | 常量 |

## 配置合并语义

- **A:F（按表名）**：B/C 非空才覆盖；D/E 无条件归一回写；F 非空才归一写回；匹配不上的旧行跳过；
- **G:H（按参数名）**：旧值为空单元格跳过；颜色类写底色并清文本；其余归一布尔/数值。

重名表由宿主自动改名为「原名 (2)」，复制结果以**目标簿真实新表名**为准，避免误清同名原表。

## 调用关系

`main.js`（导入入口）、`Config`（配置表结构/合并目标）、`Host`（文件与复制）。

## 测试覆盖

`test/import.test.js`、`test/sheet-registry-sync.test.js`。

## 源码

[`js/lib/import.js`](https://github.com/hh127/SmartQuant-InkLine/blob/main/wps-js-plugin/js/lib/import.js)
