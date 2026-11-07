---
title: "广联达表清洗"
description: "把广联达导出的工程报表拍平成可落库的二维表：9 个可配置清洗步骤。"
---

# 广联达表清洗

::: tip 适用形态
WPS JS 加载项 4.67 ✅ ｜ Excel VBA 4.66 ❌（未迁移）
:::

## 它解决什么问题

从计价软件导出的工程量报表通常带合并单元格、小计/合计行、标题行、空特征行，无法直接做数据匹配或落库。
广联达清洗把这些"报表格式"拍平成规整的二维表：一行一条清单，表头锁定、特征列补齐、汇总行删除。

## 清洗步骤（9 个开关）

对**当前活动工作表**执行，按开关逐项处理：

| 开关 | 默认 | 动作 |
| --- | --- | --- |
| `rename` | 开 | 工作表名去掉首尾空格、连字符、点 |
| `delXiaoJi` | 开 | 删除含「小计」的行 |
| `delHeJi` | 开 | 删除含「合计 / 合计: / 总合计 / 总计」的行 |
| `unmerge` | 开 | 解除纵向合并，A/B 列等按"上一非空值"前向填充 |
| `delGldTitle` | **关** | 删除「构件工程量表 / 工程名称：」题头行 |
| `dropEmptyKey` | 开 | 删除特征列（清单编码/项目名称）为空的行 |
| `dropBlankRows` | **关** | 删除完全空白行（在 unmerge 之后仍全空才算） |
| `lockhead` | 开 | 冻结表头（选中表头末行后冻结窗格） |
| `delButtons` | **关** | 删除旧版悬浮按钮（AuditFloatBtn / ReadFloatBtn） |

## 操作步骤

1. 打开从计价软件导出的报表，**建议先复制一份备份**（清洗是原地修改）；
2. 激活目标工作表；
3. 点击「智算墨斗 → 数据清洗 → 广联达清洗」（或配置表宏 `FormatGlodonSheet`）；
4. 清洗完成会提示处理行数、填充次数、各类删除行数；
5. 检查表头、特征列与数据行是否符合预期；不满意可用备份还原。

## 开发者调用（纯函数）

```js
const res = ZSMD.GlodonCleaner.cleanGrid(matrix, {
  rename: true, delXiaoJi: true, delHeJi: true,
  unmerge: true, dropEmptyKey: true, lockhead: true,
});
// res.data       清洗后的二维数组
// res.keyCol     识别到的特征列
// res.headerStartRow / headerBottomRow / dataStartRow
// res.stats      { originalRows, cleanRows, fillCount, droppedXiaoJi, droppedHeJi,
//                  droppedSubtotal, droppedGldTitle, droppedEmpty, droppedBlank }
```

`cleanGrid` 是纯函数：输入二维数组，输出结果与统计，不触碰宿主，Node 下可完整测试（53 条断言）。

## 参数与边界

| 场景 | 行为 |
| --- | --- |
| 表里找不到「清单编码 / 项目名称」关键词 | 特征列兜底 `C` 列，表头按第 1 行处理 |
| 纵向合并的 A 列序号 | 会被前向填充（启发式，必要时手工修正） |
| `dropBlankRows` | 必须在 `unmerge` 之后判定；被前向填过的行不算空行 |
| 表名重命名 | 只去首尾空格/连字符/点，不会误删中文 |
| 巨大表 | 逐行处理，耗时随行数增长；建议先在小样本上验证开关组合 |
| 非广联达格式 | 不保证效果，请先备份再试 |

## 结果与判定

- 每行都是一条有效清单，特征列无空值 → 成功；
- 小计/合计行消失、表头冻结 → 成功；
- 统计里的 `cleanRows` 与手工抽查行数一致 → 成功。

## 注意事项

- **原地修改**：执行前务必保留原始导出文件；
- 合并单元格的"前向填充"是启发式，序号列被合并时也会被填充，必要时人工修正；
- 只处理当前表，不会批量清洗多个工作表；
- `delGldTitle`、`dropBlankRows`、`delButtons` 默认关闭，避免误删，按实际导出模板再打开。

## 相关源码与测试

- 实现：[`js/lib/glodon.js`](https://github.com/hh127/SmartQuant-InkLine/blob/main/wps-js-plugin/js/lib/glodon.js)
- 测试：`wps-js-plugin/test/glodon.test.js`（53 断言）
