# 智算墨斗 · 文档站（docs site）

智算墨斗（SmartQuant InkLine）的官方文档网站，独立仓库，基于 **VuePress 2** 构建，部署到 GitHub Pages。

- 产品主仓库：[`hh127/SmartQuant-InkLine`](https://github.com/hh127/SmartQuant-InkLine)
- 站点结构：产品介绍 / 快速开始 / 使用指南 / 功能详解 / 部署运维 / 架构开发 / 版本更新 / 关于
- 当前状态：**M0 脚手架完成**（70 页骨架、导航侧栏、搜索、Mermaid、内容自检、Pages 流水线）

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
├── guide/                # 快速开始与使用指南
├── features/             # 功能详解（12 篇）
├── deploy/               # 部署与排障
├── dev/                  # 架构与开发（模块参考、踩坑专栏）
├── changelog/            # 版本更新与版本口径
└── about/                # 关于 / 许可证 / 外链
```

各页面当前为占位页，内容按《智算墨斗-VuePress文档站规划》的页面清单推进：
P0（v1.0 上线必需）→ P1（两周内补齐）→ P2（模块参考等可选页面）。

## 部署（GitHub Pages）

`.github/workflows/docs.yml` 已就绪：

- push 到 `main` → 构建 + 内容自检 → 部署 Pages
- PR → 只做构建与自检，不部署
- `base` 通过 `DOCS_BASE` 环境变量跟随仓库名，**仓库改名无需改代码**
- 首次使用需在仓库 Settings → Pages 把 Source 设为 **GitHub Actions**

自定义域名时：设置 `DOCS_HOSTNAME`（SEO / sitemap 用），并把 `DOCS_BASE` 改为 `/`。

## 内容规范（重要）

- 每页必须有 `title` 与 `description` frontmatter（首页与 404 除外）。
- 功能页开头标注「适用形态（WPS JS 4.67 / Excel VBA 4.66）」。
- 不出现内部信息：`AI_REVIEW`、真机验证清单、竞品名称、本机路径、运行日志；`npm run docs:check` 会拦截。
- 图片先压缩（单图 ≤ 300 KB，GIF ≤ 3 MB），截图必须先脱敏。

## 许可证

站点代码与文档内容的授权方式待定（建议：代码 MIT / 文档 CC BY 4.0）。
