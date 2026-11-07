---
title: "WPS 加载项部署"
description: "本机与内网多人部署：静态目录托管、publish.xml 注册、更新与回滚。"
---

# WPS 加载项部署

适用于 **团队/内网共用一个智算墨斗版本** 的场景。个人本机试用只需要[安装（WPS）](/guide/install-wps.html)。

## 机制回顾

WPS 启动时读取 `%APPDATA%\Kingsoft\wps\jsaddons\publish.xml`，其中每条记录只包含一个 **URL**：

```xml
<jspluginonline url="http://<服务地址>:3888/" name="智算墨斗" type="et" enable="enable_dev" install="null" />
```

WPS 会从这个 URL 的根目录拉取 `index.html`、`ribbon.xml` 以及 bundle。因此：

- **客户端不用装代码**，只需要一条 `publish.xml` 记录；
- **升级只换服务端目录**，客户端重启 WPS 即生效；
- 服务必须是 http(s)，**不能用 `file://`**。

## 服务端准备

### 1. 构建并整理发布目录

```bash
cd SmartQuant-InkLine/wps-js-plugin
node build.js
```

发布目录需要包含（对应内置服务器的白名单）：

```text
publish/                      # 任意路径，例如 D:\inkline-addon
├── index.html                # 加载项入口
├── ribbon.xml                # 功能区定义（必需，缺了只有"已加载"没有菜单）
├── zsmd-all.js               # 构建产物
├── shell.js                  # OnAddinLoad / OnAction 回调
├── manifest.xml              # 加载项声明 + Functions 命名空间
├── functions.json            # 单元格函数描述
├── js/functions.js           # =Z.JS() 实现
└── ui/index.html             # 侧边栏/审计面板（从 wps-js-plugin/ui/ 复制过来）
```

注意最后一条：内置服务器会把 `ui/index.html` 映射到 `../ui/index.html`；如果自己用 Nginx 托管，需要把 `ui/index.html` 放到发布目录的 `ui/` 子目录下，否则审计面板/大屏会 404。

### 2. 选择服务方式

| 方式 | 适用 | 说明 |
| --- | --- | --- |
| 内置 `node addon/server.js 3888` | 本机、单人 | **只监听 `127.0.0.1`**，局域网其他机器连不上 |
| 修改监听地址后运行 | 小团队临时共用 | 把 `server.listen(PORT, "127.0.0.1")` 改为 `"0.0.0.0"`，并放行防火墙 |
| Nginx / IIS 等静态服务器 | 正式内网部署 | 推荐；可做 HTTPS、访问控制、缓存策略 |

内置服务器只发布白名单文件（`index.html`、`ribbon.xml`、`zsmd-all.js`、`shell.js`、`manifest.xml`、`functions.json`、`js/functions.js`），并把请求日志写入 `addon/access.log`。这个日志不要提交到仓库，也不要外发。

### 3. 启动并验证

```powershell
# 内置服务器（本机）
node addon/server.js 3888

# 局域网访问测试（在另一台机器上）
curl http://<服务端IP>:3888/ribbon.xml
```

服务端建议固定 IP 或内网域名，否则客户端 `publish.xml` 里的 URL 会失效。

## 客户端注册

在每台客户端机器上：

1. 备份 `%APPDATA%\Kingsoft\wps\jsaddons\publish.xml`；
2. 追加一条记录，把 URL 换成服务端地址：

```xml
<jspluginonline url="http://192.168.1.20:3888/" name="智算墨斗" type="et" enable="enable_dev" install="null" />
```

3. **完全退出** WPS（含 `wpscloudsvr.exe`）后重新打开；
4. 看到「智算墨斗」选项卡即为成功。

也可以在内网分发一个小脚本，自动写入 `publish.xml`（逻辑参考 `addon/install-publish.js`，实际使用时把 URL 换成内网地址）。

## 升级与回滚

| 操作 | 步骤 |
| --- | --- |
| 升级 | 服务端重新 `node build.js` → 覆盖发布目录文件 → 重启静态服务 → 客户端完全退出 WPS 再打开 |
| 回滚 | 保留上一版发布目录副本，整体替换回去 → 重启服务 → 客户端重启 WPS（`publish.xml` 不变） |
| 停用 | 从客户端 `publish.xml` 删除「智算墨斗」条目，或恢复备份文件 |

建议按版本号保留目录（如 `publish/4.67.0/`），用软链/反向代理切换当前版本，回滚时只改指向。

## 安全与边界

- `enable="enable_dev"` 是开发者模式，适合受控环境；跨单位正式分发建议走 WPS 官方加载项发行渠道并启用 HTTPS。
- 服务端是普通 HTTP 静态服务：**不要暴露到公网**，内网也建议加访问控制。
- 不要在共享目录里放真实项目文件；发布目录只放加载项代码。
- 服务端与客户端时钟差异过大可能影响审计时间戳，内网机器请保持时间同步。

## 排障

| 现象 | 先查 |
| --- | --- |
| 客户端没有选项卡 | `publish.xml` 是否有条目、URL 是否可达、WPS 是否完全退出 |
| 有选项卡但面板空白 | `ui/index.html` 是否随发布目录发布 |
| 点击按钮无响应 | 服务端日志是否有对应请求（`access.log`） |
| 局域网其他机器打不开 | 服务是否只监听 `127.0.0.1`、防火墙是否放行 |

更多见[排障手册](/deploy/troubleshooting.html)。
