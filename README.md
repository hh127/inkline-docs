# 智算墨斗 · 文档站（docs site）

智算墨斗（SmartQuant InkLine）的官方文档网站，独立仓库，基于 **VuePress 2** 构建，部署到 GitHub Pages。

- 产品主仓库：[`hh127/SmartQuant-InkLine`](https://github.com/hh127/SmartQuant-InkLine)
- 在线站点：<https://hh127.github.io/inkline-docs/>
- 站点结构：产品介绍 / 快速开始 / 使用指南 / 功能详解 / 部署运维 / 架构开发 / 版本更新 / 关于
- 当前状态：**v1.0 内容完成**（70 页全站正文、导航侧栏、搜索、Mermaid、内容自检与 Pages 流水线）

## 本地开发

```bash
npm install
npm run docs:dev      # 本地预览 http://localhost:8080
npm run docs:build    # 构建产物 docs/.vuepress/dist
npm run docs:check    # 内容自检：死链 / frontmatter / 图片体积 / 敏感词 / 版本一致性
```

依赖版本固定为 VuePress 2 rc 系列（`vuepress@2.0.0-rc.31` + 插件 `2.0.0-rc.13x`），
升级时请整组同步，不要混用。

## 站点结构

```text
docs/
├── .vuepress/            # 站点配置、品牌样式、静态资源
├── README.md             # 首页
├── guide/                # 快速开始与使用指南（8 篇）
├── features/             # 功能详解（13 篇）
├── deploy/               # 部署与排障（5 篇）
├── dev/                  # 架构与开发（35 篇：导览 5、踩坑 7、模块参考 17 等）
├── changelog/            # 版本更新与版本口径（4 篇）
└── about/                # 关于 / 许可证 / 外链（3 篇）
```

内容已按规划的页面清单补齐（P0 → P1 → P2 全部完成），每页含 `title` / `description`，
功能页标注「适用形态」，开发者页给出源码路径。后续维护：

- 产品发版时同步更新首页 `version` 与 `changelog/`，`npm run docs:check` 会校验版本一致性；
- 新增或改名的页面同步更新 `docs/.vuepress/config.ts` 的侧边栏；
- 发现内容与源码漂移时，以源码为准并提 issue/PR。

## 部署（GitHub Pages）

`.github/workflows/docs.yml` 已就绪：

- push 到 `main` → 构建 + 内容自检 → 部署 Pages
- PR → 只做构建与自检，不部署
- `base` 通过 `DOCS_BASE` 环境变量跟随仓库名，**仓库改名无需改代码**
- 首次使用需在仓库 Settings → Pages 把 Source 设为 **GitHub Actions**

自定义域名时：设置 `DOCS_HOSTNAME`（SEO / sitemap 用），并把 `DOCS_BASE` 改为 `/`。

## 部署（Vercel）

仓库根目录的 `vercel.json` 已把构建参数写死，**导入仓库即可，无需在面板里改设置**：

| 配置项 | 值 |
| --- | --- |
| Framework Preset | Other（`framework: null`） |
| Install Command | `npm ci` |
| Build Command | `npm run docs:build` |
| Output Directory | `docs/.vuepress/dist` |
| Node.js | 20 及以上（跟随 `engines`） |

两种接入方式：

1. **网页导入**：<https://vercel.com/new> → 选 `hh127/inkline-docs` → Deploy。之后每次 push 到 `main` 自动部署，PR 生成预览站。
2. **CLI**：`npx vercel@latest --prod`（首次会引导登录并关联项目）。

要点：

- **不需要**设置 `DOCS_BASE`：Vercel 部署在根路径，默认 `base: '/'` 即为正确值（GitHub Pages 才需要 `/仓库名/`）。
- sitemap 与 og:url 的域名由 `config.ts` 自动推导：`DOCS_HOSTNAME` > Vercel 注入的 `VERCEL_PROJECT_PRODUCTION_URL`/`VERCEL_URL` > 主域名，**通常无需手工配置**。
- `github.io` 与 Vercel 双站共用同一份 `main` 产物，只是 `base` 不同；主站以 Vercel 自定义域名为准。

### 自定义域名：inkline.mrlining.cn

`config.ts` 中 `CANONICAL_HOSTNAME` 已固定为 `https://inkline.mrlining.cn/`，**每一页都会注入 `<link rel="canonical">` 指向该域名的对应路径**，因此 `github.io`、`*.vercel.app`、自定义域名三个入口不会被视为重复站点。

接入步骤：

1. **DNS**（域名解析在腾讯云 EdgeOne / DNSPod）：添加记录
   | 主机记录 | 类型 | 记录值 |
   | --- | --- | --- |
   | `inkline` | `CNAME` | `cname.vercel-dns.com` |

   不要动根域 `mrlining.cn` 现有的 CNAME/A 与 MX，邮箱与现有网站不受影响。
2. **Vercel** → 项目 → Settings → Domains → 添加 `inkline.mrlining.cn`，按提示等待证书签发（自动 HTTPS）。
3. 设为 **Primary domain**，`*.vercel.app` 保留作为备用入口即可（canonical 已指向主域名，无需额外 301）。

> 注意：`hostname` 是**构建期**写入产物的，绑定域名后必须重新部署一次（Deployments → Redeploy，不要用缓存），否则旧的 sitemap/robots 仍写旧地址。

> 已知小瑕疵：GitHub Pages 项目页（`base=/inkline-docs/`）下，`@vuepress/plugin-sitemap` 生成的 `robots.txt` 中 `Sitemap:` 行会把 base 拼两次（`/inkline-docs/inkline-docs/sitemap.xml`）。这是插件对 project pages 的既有行为，`sitemap.xml` 正文的 `<loc>` 是正确的；主站走 Vercel（`base=/`）不受影响。

## 内容规范（重要）

- 每页必须有 `title` 与 `description` frontmatter（首页与 404 除外）。
- 功能页开头标注「适用形态（WPS JS 4.67 / Excel VBA 4.66）」。
- 不出现内部信息：`AI_REVIEW`、真机验证清单、竞品名称、本机路径、运行日志；`npm run docs:check` 会拦截。
- 图片先压缩（单图 ≤ 300 KB，GIF ≤ 3 MB），截图必须先脱敏。

## 许可证

- 站点代码：MIT
- 文档内容：随本站仓库以 MIT 方式提供，可自由引用与改编，请保留出处链接
- 说明：仓库尚未附 `LICENSE` 全文文件，正式对外分发前需补齐；以产品仓库 README 的 MIT 徽章与
  [`about/license`](docs/about/license.md) 页面口径为准。
