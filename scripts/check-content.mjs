/**
 * 文档站内容自检脚本（无第三方依赖）
 *
 * 检查项：
 *  1. 相对链接可解析（.md / .html / 目录 / 图片）
 *  2. 每页 frontmatter 含 title、description
 *  3. 图片体积（>500 KB 报错，>300 KB 警告）
 *  4. 敏感/内部信息关键词（发布红线）
 *  5. 版本号一致（首页与版本页 frontmatter）
 *
 * 用法：node scripts/check-content.mjs
 */
import { readFile, readdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, relative, dirname, resolve, extname, posix } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const DOCS = join(ROOT, 'docs')
const PUBLIC = join(DOCS, '.vuepress', 'public')

const errors = []
const warnings = []
const pages = []

const SENSITIVE = [
  ['AI_REVIEW', '内部评审目录'],
  ['真机验证清单', '内部验收清单'],
  ['反编译', '合规红线：不描述逆向过程'],
  ['反混淆', '合规红线：不描述逆向过程'],
  ['酷造价', '合规红线：不点名竞品'],
  ['D:\\github', '内部本机路径'],
  ['access.log', '运行日志不入文档'],
  ['迁移缺口', '内部迁移台账'],
]

async function walk(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.vuepress')) continue
    const p = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(p)))
    else out.push(p)
  }
  return out
}

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return null
  const fm = {}
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (!kv) continue
    fm[kv[1]] = kv[2].replace(/^["']|["']$/g, '').trim()
  }
  return fm
}

/** 把站点内链接解析为实际文件，返回 null 表示外部/锚点链接 */
function resolveLink(fromFile, target) {
  const clean = target.split('#')[0].split('?')[0]
  if (!clean) return null
  if (/^(https?:|mailto:|tel:|javascript:)/i.test(clean)) return null
  if (clean.startsWith('//')) return null

  const candidates = []
  if (clean.startsWith('/')) {
    const rel = clean.slice(1)
    const asFile = join(DOCS, rel)
    candidates.push(asFile)
    if (rel.endsWith('/')) candidates.push(join(asFile, 'README.md'), join(asFile, 'index.md'))
    if (rel.endsWith('.html')) {
      const md = asFile.slice(0, -5) + '.md'
      candidates.push(md, join(DOCS, rel.slice(0, -5), 'README.md'))
    }
    if (!extname(rel)) {
      candidates.push(join(asFile, 'README.md'), join(asFile, 'index.md'))
    }
  } else {
    const abs = resolve(dirname(fromFile), clean)
    candidates.push(abs)
    if (clean.endsWith('/')) candidates.push(join(abs, 'README.md'), join(abs, 'index.md'))
    if (clean.endsWith('.html')) {
      candidates.push(abs.slice(0, -5) + '.md', join(abs.slice(0, -5), 'README.md'))
    }
    if (!extname(clean)) candidates.push(join(abs, 'README.md'), join(abs, 'index.md'))
  }
  return candidates.find((c) => existsSync(c)) ? null : clean
}

async function main() {
  const files = (await walk(DOCS)).filter((f) => f.endsWith('.md'))
  if (files.length === 0) errors.push('docs/ 下没有找到任何 .md')

  const skipFm = new Set(['docs/404.md', 'docs/README.md'])
  const versions = []

  for (const file of files) {
    const rel = posix.normalize(relative(ROOT, file).split('\\').join('/'))
    const text = await readFile(file, 'utf8')
    pages.push(rel)

    // frontmatter
    const fm = parseFrontmatter(text)
    if (!skipFm.has(rel)) {
      if (!fm) errors.push(`${rel}: 缺少 frontmatter`)
      else {
        if (!fm.title) errors.push(`${rel}: frontmatter 缺少 title`)
        if (!fm.description) errors.push(`${rel}: frontmatter 缺少 description`)
      }
    }
    if (fm?.version) versions.push([rel, fm.version])

    // 敏感词
    for (const [word, why] of SENSITIVE) {
      if (text.includes(word)) errors.push(`${rel}: 命中敏感词「${word}」（${why}）`)
    }

    // 链接
    for (const m of text.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      const missing = resolveLink(file, m[1])
      if (missing) errors.push(`${rel}: 链接无法解析 -> ${m[1]}`)
    }
    // 图片
    for (const m of text.matchAll(/!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      const missing = resolveLink(file, m[1])
      if (missing) errors.push(`${rel}: 图片无法解析 -> ${m[1]}`)
    }
  }

  // 图片体积
  if (existsSync(PUBLIC)) {
    for (const file of await walk(PUBLIC)) {
      const size = (await stat(file)).size
      const rel = posix.normalize(relative(ROOT, file).split('\\').join('/'))
      if (size > 500 * 1024) errors.push(`${rel}: 图片 ${(size / 1024 / 1024).toFixed(1)} MB，超过 500 KB 上限`)
      else if (size > 300 * 1024) warnings.push(`${rel}: 图片 ${(size / 1024).toFixed(0)} KB，建议压缩到 300 KB 内`)
    }
  }

  // 版本一致性
  if (versions.length > 1) {
    const uniq = [...new Set(versions.map(([, v]) => v))]
    if (uniq.length > 1) {
      errors.push(`版本号不一致：${versions.map(([f, v]) => `${f}=${v}`).join(', ')}`)
    }
  }

  console.log(`\n检查 ${pages.length} 个页面，${versions.length} 处版本声明`)
  for (const w of warnings) console.log(`⚠️  ${w}`)
  for (const e of errors) console.log(`❌ ${e}`)
  if (errors.length) {
    console.log(`\n失败：${errors.length} 个错误，${warnings.length} 个警告\n`)
    process.exit(1)
  }
  console.log(`\n通过：0 个错误，${warnings.length} 个警告\n`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
