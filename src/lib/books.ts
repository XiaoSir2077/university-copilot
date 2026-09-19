import type { Book, BookChapter } from '@/types'

// ─────────────────────────────────────────────────────────────────────────
// 教材内容加载器：构建时把 src/content/books/ 下的 md/html 全部打包进来。
// 新增一本书 = 新建 <id>/meta.json + 章节文件；新增一章 = 直接把 .md/.html
// 拖进对应书文件夹即可：没有 frontmatter 时会自动识别——
// 标题取 HTML 的 <title>（| 之前的部分）或 md 的第一个一级标题，
// 排序取文件名里的第一个数字（如 "1.xxx.html"、"ch2.md"）。
// ─────────────────────────────────────────────────────────────────────────

interface BookMeta {
  title: string
  emoji?: string
  /** @deprecated 书房内容已全员共享，此字段不再使用，仅为兼容旧 meta.json */
  userId?: string
  /** 可见用户 id 白名单；缺省 = 家庭全员共享 */
  audience?: string[]
  /** 舅妈面板分区：work=工作，growth=学习成长 */
  space?: 'work' | 'growth'
  /** 卡片渐变配色（Tailwind 类，如 "from-sky-500 to-blue-700"）；缺省用默认绿色 */
  tone?: string
}

interface ChapterFrontmatter {
  no: string
  title: string
  order: number
  quiz?: BookChapter['quiz']
}

const metaFiles = import.meta.glob<BookMeta>('../content/books/*/meta.json', {
  eager: true,
  import: 'default',
})
const chapterFiles = import.meta.glob<string>('../content/books/*/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})
const chapterHtmlFiles = import.meta.glob<string>('../content/books/*/*.html', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/

/** 去掉文件开头的 BOM、空行与 HTML 注释（如生成器水印） */
function stripLeadingNoise(raw: string): string {
  return raw
    .replace(/^﻿/, '') // 去掉文件开头的 BOM（U+FEFF）
    .replace(/^(?:\s*<!--[\s\S]*?-->\s*)+/, '')
    .replace(/^\s+/, '')
}

/** 无 frontmatter 时的兜底：文件名里的第一个数字当排序，标题取 <title>/一级标题/文件名 */
function inferChapterMeta(id: string, raw: string, format: 'md' | 'html') {
  const order = parseInt(id.match(/\d+/)?.[0] ?? '0', 10) || 0
  let title = ''
  if (format === 'html') {
    const t = raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
    if (t) title = t.split(/[|｜]/)[0].trim()
  } else {
    const h = raw.match(/^#\s+(.+)$/m)?.[1]
    if (h) title = h.trim()
  }
  if (!title) title = id.replace(/^\d+[.\s、-]*/, '').trim() || id
  return { no: '', title, order }
}

function parseChapter(id: string, raw: string, format: 'md' | 'html'): BookChapter {
  const m = raw.match(FRONTMATTER_RE)
  if (m) {
    let fm: ChapterFrontmatter
    try {
      fm = JSON.parse(m[1]) as ChapterFrontmatter
    } catch (e) {
      console.warn(`[books] ${id} frontmatter 不是合法 JSON，已按无文件头处理`, e)
      fm = {} as ChapterFrontmatter
    }
    return {
      id,
      no: fm.no ?? '',
      title: fm.title ?? id,
      order: fm.order ?? 0,
      format,
      body: raw.slice(m[0].length),
      quiz: Array.isArray(fm.quiz) ? fm.quiz : [],
    }
  }
  // 直接拖进来的章节：没有 frontmatter 也能呈现
  const meta = inferChapterMeta(id, raw, format)
  return { id, format, quiz: [], body: stripLeadingNoise(raw), ...meta }
}

function loadBooks(): Book[] {
  const books: Book[] = []
  for (const [path, meta] of Object.entries(metaFiles)) {
    const bookId = path.match(/books\/([^/]+)\//)?.[1]
    if (!bookId) continue
    const chapters: BookChapter[] = []
    for (const [cpath, raw] of Object.entries(chapterFiles)) {
      const cm = cpath.match(/books\/([^/]+)\/(.+)\.md$/)
      if (!cm || cm[1] !== bookId) continue
      chapters.push(parseChapter(cm[2], raw, 'md'))
    }
    for (const [cpath, raw] of Object.entries(chapterHtmlFiles)) {
      const cm = cpath.match(/books\/([^/]+)\/(.+)\.html$/)
      if (!cm || cm[1] !== bookId) continue
      chapters.push(parseChapter(cm[2], raw, 'html'))
    }
    chapters.sort((a, b) => a.order - b.order)
    books.push({ id: bookId, title: meta.title, emoji: meta.emoji, userId: meta.userId, audience: meta.audience, space: meta.space, tone: meta.tone, chapters })
  }
  return books
}

export const BOOKS: Book[] = loadBooks()

export function booksOfUser(userId?: string): Book[] {
  // 默认全员共享；meta.json 里声明了 audience 的书仅白名单用户可见。
  return BOOKS.filter((b) => !b.audience || (userId ? b.audience.includes(userId) : false))
}
