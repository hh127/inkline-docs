# 智算墨斗 · 文档站（docs site）

智算墨斗（SmartQuant InkLine）的官方文档网站仓库，独立于产品主仓库
[`SmartQuant-InkLine`](https://github.com/hh127/SmartQuant-InkLine)。

- 站点：VuePress 2.x，简体中文，GitHub Pages 部署
- 内容：产品介绍 / 快速开始 / 使用指南 / 功能详解 / 部署运维 / 架构开发 / 版本更新
- 文档面向：造价与结算审计人员、部署管理员、二次开发者

## 规划

建站方案（信息架构、45 篇页面清单、配置骨架、里程碑与验收标准）已完成，
见产品侧规划文档《智算墨斗-VuePress文档站规划》。

## 预期结构（待创建）

```text
docs/
├── .vuepress/            # 站点配置、主题样式、静态资源
├── README.md             # 首页
├── guide/                # 快速开始与使用指南
├── features/             # 功能详解（12 篇）
├── deploy/               # 部署与排障
├── dev/                  # 架构与开发（含模块参考、踩坑专栏）
├── changelog/            # 版本更新
└── about/                # 关于 / 许可证 / 外链
```

## 本地开发（脚手架就绪后）

```bash
npm install
npm run docs:dev      # http://localhost:8080
npm run docs:build    # 产物 docs/.vuepress/dist
```

## 许可证

文档内容与站点代码的许可证待定（推荐：代码 MIT / 文档 CC BY 4.0）。
