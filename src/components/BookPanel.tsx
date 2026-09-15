import { useState } from 'react'
import { BookOpen, ChevronRight, ListTree, Quote as QuoteIcon, StickyNote } from 'lucide-react'
import type { Book, BookChapter, OutlineNode } from '@/types'
import { cn } from '@/lib/utils'

// ── 思维导图树 ──────────────────────────────────────────────────────────
function TreeNode({ node, depth }: { node: OutlineNode; depth: number }) {
  const [open, setOpen] = useState(depth < 1)
  const hasKids = !!node.children?.length
  return (
    <div>
      <div
        className={cn('flex items-start gap-1.5 py-1', depth === 0 && 'mt-1 first:mt-0')}
        style={{ paddingLeft: depth * 22 }}
      >
        {hasKids ? (
          <button
            onClick={() => setOpen(!open)}
            className="mt-0.5 text-zinc-300 hover:text-zinc-500 shrink-0"
            aria-label={open ? '收起' : '展开'}
          >
            <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-90')} />
          </button>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <div className="min-w-0">
          <span className={cn('text-sm leading-relaxed', depth === 0 ? 'font-semibold text-zinc-800' : 'text-zinc-600')}>
            {node.text}
          </span>
          {node.note && <span className="ml-2 text-xs text-zinc-400">{node.note}</span>}
        </div>
      </div>
      {hasKids && open && (
        <div className="relative">
          {node.children!.map((c, i) => (
            <TreeNode key={i} node={c} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── 章节视图 ────────────────────────────────────────────────────────────
function ChapterView({ ch }: { ch: BookChapter }) {
  const hasNotes = !!ch.notes?.length
  const hasQuotes = !!ch.quotes?.length
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
          <ListTree className="h-3.5 w-3.5" /> 本章思维导图
          <span className="text-[10px] font-normal text-zinc-300">点 ▶ 可折叠</span>
        </p>
        <div className="border-l-2 border-emerald-100 pl-2">
          {ch.mindmap.map((n, i) => (
            <TreeNode key={i} node={n} depth={0} />
          ))}
        </div>
      </div>

      {hasNotes && (
        <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-sky-600">
            <StickyNote className="h-3.5 w-3.5" /> 读书笔记
          </p>
          <div className="flex flex-col gap-3">
            {ch.notes!.map((n, i) => (
              <div key={i}>
                <h4 className="text-sm font-semibold text-zinc-700">{n.heading}</h4>
                <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-zinc-600">{n.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasQuotes && (
        <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-violet-600">
            <QuoteIcon className="h-3.5 w-3.5" /> 原文摘抄
          </p>
          <div className="flex flex-col gap-2.5">
            {ch.quotes!.map((q, i) => (
              <blockquote key={i} className="rounded-xl bg-violet-50/60 border-l-4 border-violet-200 px-3 py-2">
                <p className="text-sm leading-relaxed text-zinc-700">{q.text}</p>
                <footer className="mt-1 text-[11px] text-zinc-400">
                  {q.page && <span>{q.page} · </span>}
                  {q.comment && <span className="text-violet-500">批注：{q.comment}</span>}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      )}

      {!hasNotes && !hasQuotes && (
        <p className="text-center text-[11px] text-zinc-300">笔记和原文摘抄整理中…</p>
      )}
    </div>
  )
}

// ── 教材入口（挂在学科详情页）────────────────────────────────────────
export default function BookPanel({ book }: { book: Book }) {
  const [chId, setChId] = useState(book.chapters[0]?.id)
  const ch = book.chapters.find((c) => c.id === chId) ?? book.chapters[0]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 p-3.5 shadow-sm">
        <BookOpen className="h-5 w-5 shrink-0 text-emerald-600" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-zinc-700">📖 教材精读 · 《{book.title}》</p>
          <p className="text-[11px] text-zinc-400">已整理 {book.chapters.length} 章 · 阅读笔记持续更新</p>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {book.chapters.map((c) => (
          <button
            key={c.id}
            onClick={() => setChId(c.id)}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
              c.id === ch.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'border border-zinc-200 bg-white text-zinc-500 hover:border-emerald-200 hover:text-emerald-600',
            )}
          >
            {c.no} {c.title}
          </button>
        ))}
      </div>

      {ch && <ChapterView ch={ch} />}
    </div>
  )
}
