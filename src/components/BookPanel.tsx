import { useState } from 'react'
import { BookOpen, ClipboardCheck, FileText } from 'lucide-react'
import type { Book } from '@/types'
import MarkdownView from '@/components/MarkdownView'
import QuizView from '@/components/QuizView'
import { cn } from '@/lib/utils'

// ── 教材精读：书 → 章节 → 「原文笔记」/「本章测试」双 Tab ─────────────────
export default function BookPanel({ book }: { book: Book }) {
  const [chId, setChId] = useState(book.chapters[0]?.id)
  const [tab, setTab] = useState<'notes' | 'quiz'>('notes')
  const ch = book.chapters.find((c) => c.id === chId) ?? book.chapters[0]

  if (!ch) return null

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 p-3.5 shadow-sm">
        <BookOpen className="h-5 w-5 shrink-0 text-emerald-600" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-zinc-700">
            📖 教材精读 · 《{book.title}》
          </p>
          <p className="text-[11px] text-zinc-400">已整理 {book.chapters.length} 章 · 阅读笔记持续更新</p>
        </div>
      </div>

      {/* 章节切换 */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {book.chapters.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setChId(c.id)
              setTab('notes')
            }}
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

      {/* 笔记 / 测试 Tab */}
      <div className="flex gap-1.5">
        <button
          onClick={() => setTab('notes')}
          className={cn(
            'flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
            tab === 'notes' ? 'bg-zinc-700 text-white' : 'border border-zinc-200 bg-white text-zinc-500',
          )}
        >
          <FileText className="h-3.5 w-3.5" /> 原文笔记
        </button>
        <button
          onClick={() => setTab('quiz')}
          className={cn(
            'flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
            tab === 'quiz' ? 'bg-zinc-700 text-white' : 'border border-zinc-200 bg-white text-zinc-500',
          )}
        >
          <ClipboardCheck className="h-3.5 w-3.5" /> 本章测试
          {ch.quiz.length > 0 && (
            <span className={cn('ml-0.5 rounded-full px-1.5 text-[10px]', tab === 'quiz' ? 'bg-white/25' : 'bg-zinc-100')}>
              {ch.quiz.length}题
            </span>
          )}
        </button>
      </div>

      {tab === 'notes' ? (
        <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
          <MarkdownView md={ch.body} />
        </div>
      ) : (
        <QuizView quiz={ch.quiz} />
      )}
    </div>
  )
}
