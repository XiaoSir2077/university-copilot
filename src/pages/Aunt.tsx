import { Link } from 'react-router'
import { Briefcase, ChevronRight, FileText, LogOut, Sprout } from 'lucide-react'
import { useAuth } from '@/store/useBoard'
import { booksOfUser } from '@/lib/books'
import type { Book } from '@/types'

// 舅妈专属面板：按「工作 / 学习成长」分区的书架。
// 新增内容只需在 src/content/books/ 加书并在 meta.json 标注 space，这里自动出现。

function greeting() {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 12) return '早上好'
  if (h < 18) return '下午好'
  return '晚上好'
}

const SECTIONS: {
  key: 'work' | 'growth'
  title: string
  subtitle: string
  icon: typeof Briefcase
  tone: string
}[] = [
  {
    key: 'work',
    title: '工作',
    subtitle: '备课 · 出题 · 教学资源',
    icon: Briefcase,
    tone: 'bg-amber-100 text-amber-600',
  },
  {
    key: 'growth',
    title: '学习成长',
    subtitle: '外刊阅读 · 英语共学',
    icon: Sprout,
    tone: 'bg-emerald-100 text-emerald-600',
  },
]

function BookCard({ book }: { book: Book }) {
  return (
    <Link
      to={`/book/${book.id}`}
      className="group block rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-2xl">
          {book.emoji ?? '📘'}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-zinc-800">{book.title}</h3>
          <p className="mt-0.5 text-[11px] text-zinc-400">{book.chapters.length} 个章节</p>
        </div>
        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-zinc-300 group-hover:text-amber-500" />
      </div>
      <ul className="mt-3 space-y-1.5 border-t border-zinc-50 pt-3">
        {book.chapters.slice(0, 3).map((c) => (
          <li key={c.id} className="flex items-center gap-2 text-xs text-zinc-500">
            <FileText className="h-3 w-3 shrink-0 text-zinc-300" />
            <span className="truncate">
              {c.no ? `${c.no} · ` : ''}
              {c.title}
            </span>
          </li>
        ))}
      </ul>
    </Link>
  )
}

export default function Aunt() {
  const auth = useAuth()
  // 只展示标注了 space 的书；audience 过滤沿用 booksOfUser
  const books = booksOfUser('u-jiujiu').filter((b) => b.space === 'work' || b.space === 'growth')

  return (
    <div className="min-h-dvh bg-gradient-to-b from-amber-50/70 via-zinc-50 to-zinc-50 pb-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-8">
        {/* 顶部 */}
        <header className="pt-6 pb-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-400">University Copilot · 舅妈空间</p>
            <button
              onClick={auth.logout}
              title="退出登录"
              className="rounded-full border border-zinc-200 bg-white p-2 text-zinc-400 shadow-sm hover:text-rose-500"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* 欢迎区 */}
        <section className="mt-3 overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 p-7 text-white shadow-lg shadow-amber-200/60">
          <p className="text-sm opacity-90">{greeting()}，舅妈</p>
          <h1 className="mt-1 text-2xl font-bold">今天想做点什么？</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/85">
            这里是您的专属空间：备课用的教案和练习题、自己提升用的外刊和英语材料，都在下面。点开就能用，新内容会自动出现。
          </p>
        </section>

        {/* 分区书架 */}
        <div className="mt-8 space-y-10">
          {SECTIONS.map((s) => {
            const items = books.filter((b) => b.space === s.key)
            if (items.length === 0) return null // 没有内容的分区（如家庭）暂不展示
            return (
              <section key={s.key}>
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.tone}`}>
                    <s.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-zinc-800">{s.title}</h2>
                    <p className="text-[11px] text-zinc-400">{s.subtitle}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {items.map((b) => (
                    <BookCard key={b.id} book={b} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
