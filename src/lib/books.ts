import type { Book, BookChapter } from '@/types'

// ─────────────────────────────────────────────────────────────────────────
// 教材内容加载器：构建时把 src/content/books/ 下的 md 全部打包进来。
// 新增一本书 = 新建 <id>/meta.json + 若干章节 .md；新增一章 = 丢一个 .md。
// ─────────────────────────────────────────────────────────────────────────

interface BookMeta {
  title: string
  emoji?: string
  /** @deprecated 书房内容已全员共享，此字段不再使用，仅为兼容旧 meta.json */
  userId?: string
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

function parseChapter(id: string, raw: string, format: 'md' | 'html'): BookChapter | null {
  const m = raw.match(FRONTMATTER_RE)
  if (!m) {
    console.warn(`[books] ${id} 缺少 JSON frontmatter，已跳过`)
    return null
  }
  let fm: ChapterFrontmatter
  try {
    fm = JSON.parse(m[1]) as ChapterFrontmatter
  } catch (e) {
    console.warn(`[books] ${id} frontmatter 不是合法 JSON，已跳过`, e)
    return null
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

function loadBooks(): Book[] {
  const books: Book[] = []
  for (const [path, meta] of Object.entries(metaFiles)) {
    const bookId = path.match(/books\/([^/]+)\//)?.[1]
    if (!bookId) continue
    const chapters: BookChapter[] = []
    for (const [cpath, raw] of Object.entries(chapterFiles)) {
      const cm = cpath.match(/books\/([^/]+)\/(.+)\.md$/)
      if (!cm || cm[1] !== bookId) continue
      const ch = parseChapter(cm[2], raw, 'md')
      if (ch) chapters.push(ch)
    }
    for (const [cpath, raw] of Object.entries(chapterHtmlFiles)) {
      const cm = cpath.match(/books\/([^/]+)\/(.+)\.html$/)
      if (!cm || cm[1] !== bookId) continue
      const ch = parseChapter(cm[2], raw, 'html')
      if (ch) chapters.push(ch)
    }
    chapters.sort((a, b) => a.order - b.order)
    books.push({ id: bookId, title: meta.title, emoji: meta.emoji, userId: meta.userId, chapters })
  }
  return books
}

export const BOOKS: Book[] = loadBooks()

export function booksOfUser(_userId?: string): Book[] {
  // 家庭书房模型：内容层全员共享，不按用户过滤。
  // 保留此函数名是为兼容既有调用点，后续清理。
  return BOOKS
}
