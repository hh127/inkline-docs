---
title: "ZSMD.Security"
description: "隐私金库：加密/解密流程、批量处理与安全边界（非密码学加密）。"
---

# ZSMD.Security

## 职责

- `encryptSheet` / `decryptSheet`：单表隐私加解密；
- 批量：列出候选表、按状态决策、一次密码、汇总报告；
- 维护配置表「隐私遮蔽模式」状态回写；
- 加解密期间关闭事件/屏幕刷新/计算模式，`finally` 恢复。

::: danger 安全边界
本模块是「隐藏金库 + 掩码 + 工作表密码」，**不是密码学加密**；不能抵御专业工具还原。
详见[隐私模式与金库](/features/privacy.html)。
:::

## 导出 API

| API | 说明 |
| --- | --- |
| `encryptSheet(ws, pwd)` | 复制为 `Vault_<表名>`（VeryHidden）→ 清原表批注 → 逐格掩码（跳过公式/合并非左上）→ Protect |
| `decryptSheet(ws, pwd)` | 解除保护 → 金库回填 → 恢复列宽（可降级）→ 删除金库 |
| `batchPrivacy(mode)` | 批量入口（加密/解密/当前表切换） |
| `batchEncryptAll()` / `batchDecryptAll()` | 批量加/解密全部候选表 |
| `privacyCandidates(wb)` | 候选表清单（业务表 + 当前状态） |
| `privacyStatusOf(wb, name)` / `privacyStatusText(bool)` | 状态读取/展示（`[已加密]`/`[正常]`） |
| `buildPrivacyCatalog(rows)` | 面板清单数据 |
| `decidePrivacyAction` / `planPrivacyBatch` | 跳过已符合状态的表、生成执行计划 |
| `summarizePrivacyBatch` / `privacyBatchReport` | 统计与汇总文案 |
| `isSystemSheetForPrivacy(name)` | 排除 `Admin_Config` / `Log_Audit` / `Vault_*` |
| `perfCalcOff` / `perfCalcRestore` / `XL_CALC_MANUAL` | 计算模式闸门 |
| `setMessenger(fn)` | 注入提示通道 |

## 关键实现细节

- 掩码逐格写入而非整块数组赋值——工程量表有合并单元格，整块赋值会抛"无法更改合并单元格"并中断；
- 原表批注会被清除（防审计痕迹泄露）；
- 失败时仍恢复事件/屏幕/计算并 `reload` 配置。

## 调用关系

`main.js`（Ribbon/侧边栏入口）、`Config`（状态回写/开关）、`Export`（外部版剥离加密表）、`Diff`/`Statistics`（隐私表无数据）。

## 测试覆盖

`test/privacy-batch.test.js`。

## 源码

[`js/lib/security.js`](https://github.com/hh127/SmartQuant-InkLine/blob/main/wps-js-plugin/js/lib/security.js)
