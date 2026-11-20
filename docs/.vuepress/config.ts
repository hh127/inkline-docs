import { defineUserConfig } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'
import { searchPlugin } from '@vuepress/plugin-search'
import { markdownChartPlugin } from '@vuepress/plugin-markdown-chart'

/**
 * 部署相关：
 * - 本地开发默认 base = '/'，hostname 为占位值
 * - CI 通过 DOCS_BASE / DOCS_HOSTNAME 注入 GitHub Pages 的实际地址（跟随仓库名，改名不用改代码）
 *
 * 说明：@vuepress/theme-default 已内置 medium-zoom / git / back-to-top / copy-code /
 * markdown-hint / seo / sitemap / prismjs 等插件，无需在 plugins 中重复注册；
 * 仅需额外加：本地搜索、Mermaid 图表。
 */
const base = process.env.DOCS_BASE || '/'

/**
 * hostname 用于 SEO / sitemap 的绝对地址，优先级：
 * 1. DOCS_HOSTNAME（显式指定，GitHub Actions 用这个）
 * 2. Vercel 注入的域名（生产 / 预览），部署到 Vercel 时无需手工配置
 * 3. GitHub Pages 项目页地址（兜底）
 */
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
const hostname =
  process.env.DOCS_HOSTNAME ||
  (vercelHost ? `https://${vercelHost}/` : 'https://hh127.github.io/inkline-docs/')

const guideSidebar = [
  '/guide/README.md',
  '/guide/concepts.md',
  {
    text: '安装',
    children: ['/guide/install-wps.md', '/guide/install-vba.md'],
  },
  '/guide/quickstart.md',
  '/guide/workflow.md',
  '/guide/settings.md',
  '/guide/faq.md',
]

const featuresSidebar = [
  '/features/README.md',
  {
    text: '审计与比对',
    children: ['/features/audit.md', '/features/highlight.md', '/features/diff.md'],
  },
  {
    text: '计算与阅读',
    children: ['/features/calc.md', '/features/custom-function.md', '/features/reading.md'],
  },
  {
    text: '统计与清洗',
    children: ['/features/dashboard.md', '/features/glodon.md'],
  },
  {
    text: '安全与交付',
    children: ['/features/privacy.md', '/features/export.md', '/features/import.md', '/features/audit-tools.md'],
  },
]

const deploySidebar = [
  '/deploy/README.md',
  '/deploy/wps-addin.md',
  '/deploy/vba-xlsm.md',
  '/deploy/upgrade.md',
  '/deploy/troubleshooting.md',
]

const devSidebar = [
  '/dev/README.md',
  {
    text: '架构',
    children: ['/dev/architecture-vba.md', '/dev/architecture-js.md', '/dev/host-adapter.md', '/dev/events.md'],
  },
  {
    text: '迁移与取舍',
    children: ['/dev/parity.md', '/dev/decision.md'],
  },
  {
    text: '工程实践',
    children: ['/dev/build-test.md', '/dev/custom-function-dev.md', '/dev/contributing.md', '/dev/known-issues.md'],
  },
  {
    text: '踩坑专栏',
    children: [
      '/dev/notes/README.md',
      '/dev/notes/platform-events.md',
      '/dev/notes/custom-function-value.md',
      '/dev/notes/sheet-sync.md',
      '/dev/notes/config-lock.md',
      '/dev/notes/dashboard-cdn.md',
      '/dev/notes/build-artifacts.md',
    ],
  },
  {
    text: '模块参考',
    children: [
      '/dev/module-ref/README.md',
      '/dev/module-ref/host.md',
      '/dev/module-ref/config.md',
      '/dev/module-ref/colors.md',
      '/dev/module-ref/events.md',
      '/dev/module-ref/bridge.md',
      '/dev/module-ref/audit.md',
      '/dev/module-ref/highlight.md',
      '/dev/module-ref/diff.md',
      '/dev/module-ref/calc.md',
      '/dev/module-ref/security.md',
      '/dev/module-ref/import.md',
      '/dev/module-ref/export.md',
      '/dev/module-ref/glodon.md',
      '/dev/module-ref/statistics.md',
      '/dev/module-ref/audit-tools.md',
      '/dev/module-ref/main.md',
    ],
  },
]

const changelogSidebar = ['/changelog/README.md', '/changelog/v4.67.md', '/changelog/v4.66.md', '/changelog/archive.md']

const aboutSidebar = ['/about/README.md', '/about/license.md', '/about/links.md']

export default defineUserConfig({
  lang: 'zh-CN',
  title: '智算墨斗',
  description: '工程造价与结算审计的 Excel / WPS 双引擎：实时审计链、字符级差异、算式可读化',
  base,
  head: [
    ['link', { rel: 'icon', href: '/images/logo.svg', type: 'image/svg+xml' }],
    ['meta', { name: 'keywords', content: '工程造价,结算审计,Excel插件,WPS加载项,工程量清单,审计追踪,算量核对' }],
  ],
  bundler: viteBundler(),
  pagePatterns: ['**/*.md', '!node_modules', '!internal/**'],
  theme: defaultTheme({
    hostname,
    logo: '/images/logo.svg',
    logoAlt: '智算墨斗 logo',
    repo: 'hh127/inkline-docs',
    docsRepo: 'hh127/inkline-docs',
    docsBranch: 'main',
    docsDir: 'docs',
    editLink: false,
    lastUpdated: true,
    contributors: true,
    navbar: [
      { text: '快速开始', link: '/guide/quickstart.html' },
      { text: '使用指南', link: '/guide/' },
      { text: '功能详解', link: '/features/' },
      { text: '部署运维', link: '/deploy/' },
      { text: '架构开发', link: '/dev/' },
      { text: '版本更新', link: '/changelog/' },
      { text: '关于', link: '/about/' },
    ],
    sidebar: {
      '/guide/': guideSidebar,
      '/features/': featuresSidebar,
      '/deploy/': deploySidebar,
      '/dev/': devSidebar,
      '/changelog/': changelogSidebar,
      '/about/': aboutSidebar,
    },
  }),
  plugins: [
    searchPlugin({
      locales: { '/': { placeholder: '搜索文档' } },
      isSearchable: (page) => page.path !== '/404.html',
    }),
    markdownChartPlugin({ mermaid: true }),
  ],
})
