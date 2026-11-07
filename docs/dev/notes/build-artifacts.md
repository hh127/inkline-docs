---
title: "构建产物双份入库"
description: "dist 与 addon 为什么各有一份 bundle，如何避免两边漂移。"
---

# 构建产物双份入库

## 症状

- 改了源码、`node build.js` 也跑了，但 WPS 里行为没变；
- 或者提交后 `git status` 里总有一份 bundle 是脏的；
- 对比 `dist/zsmd-all.js` 与 `addon/zsmd-all.js`，内容/大小不一致。

## 根因

这套加载项有**两个消费方**，各要一份 bundle：

| 路径 | 谁在用 |
| --- | --- |
| `wps-js-plugin/dist/zsmd-all.js` | 构建产物目录（历史约定、发布/归档） |
| `wps-js-plugin/addon/zsmd-all.js` | **WPS 实际加载的那份**（静态服务根目录） |

`build.js` 在拼接完成后会同时写这两处。只要有人：

- 只手工改了一份；
- 只提交了一份；
- 或跳过 `build.js` 直接改 `addon/`；

就会出现漂移。而 WPS 加载的是 `addon/`，所以"改了源码没效果"最常见的原因是 **addon 里还是旧 bundle**。

## 方案

1. **只改源码，产物一律由 `node build.js` 生成**；不要手改 `dist/` 或 `addon/` 里的 bundle；
2. 源码与两份产物放进**同一条提交**（`AGENTS.md` 已把它列为硬要求）；
3. `build.js` 内置一致性检查：比对 `js/lib/calc.js` 与 `addon/js/functions.js` 的求值实现，不一致直接报错；
4. 分发/部署前检查两份文件大小一致；
5. 建议给仓库加 CI 门禁：

```yaml
- run: cd wps-js-plugin && npm test
- run: cd wps-js-plugin && node build.js && git diff --exit-code dist/ addon/zsmd-all.js
```

最后一行能直接拦住"源码改了、产物忘了同步"。

## 验证

```bash
node build.js
Get-FileHash dist/zsmd-all.js, addon/zsmd-all.js -Algorithm MD5   # 两份哈希应一致
git status --short                                                # 应为空
```

然后完全退出 WPS 重启，确认行为更新。

## 补充：产物与单元函数

`addon/js/functions.js` 是**独立文件**（不经 bundle），但共享求值逻辑；改 `calc.js` 时 `build.js` 的一致性检查就是防止两套实现算出不同结果。

## 你也遇到了？

- ☐ `dist` 与 `addon` 两份是否一致（哈希对比）
- ☐ 是否只提交了一份产物
- ☐ 是否忘了重启静态服务与 WPS
- ☐ 参考[构建与测试](/dev/build-test.html)与[升级与回滚](/deploy/upgrade.html)
