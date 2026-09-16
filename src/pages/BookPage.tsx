import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileText,
  ListTree,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import MarkdownView from '@/components/MarkdownView'
import QuizView from '@/components/QuizView'
import { BOOKS } from '@/lib/books'
import { cn } from '@/lib/utils'

// 教材精读页（runoob 式三栏布局）：左侧章节目录 / 中间正文 / 右侧本书信息
export default function BookPage() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const book = BOOKS.find((b) => b.id === bookId)

  const progressKey = `book-progress-${bookId}`
  const [idx, setIdx] = useState(() => {
    const saved = book ? Number(localStorage.getItem(`book-progress-${book.id}`)) : 0
    return Number.isInteger(saved) && saved >= 0 ? saved : 0
  })
  const [mode, setMode] = useState<'notes' | 'quiz'>('notes')

  const chapters = book?.chapters ?? []
  const ch = chapters[Math.min(idx, chapters.length - 1)]
  const prev = idx > 0 ? chapters[idx - 1] : null
  const next = idx < chapters.length - 1 ? chapters[idx + 1] : null

  // 切换章节时：回到顶部、回到笔记视图、记录阅读进度
  useEffect(() => {
    if (!book) return
    localStorage.setItem(progressKey, String(idx))
    setMode('notes')
    window.scrollTo({ top: 0 })
  }, [idx, book, progressKey])

  if (!book || !ch) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-10 text-center">
        <p className="text-sm text-zinc-400">这本书不存在或还没有整理好。</p>
        <button onClick={() => navigate('/#study')} className="mt-3 text-xs text-emerald-600 underline">
          返回学习首页
        </button>
      </div>
    )
  }

  const goChapter = (i: number) => setIdx(Math.max(0, Math.min(i, chapters.length - 1)))

  const chapterNav = (side: 'top' | 'bottom') => (
    <div className="flex items-center justify-between gap-3">
      {prev ? (
        <button
          onClick={() => goChapter(idx - 1)}
          className="flex min-w-0 items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600 shadow-sm transition-colors hover:border-emerald-300 hover:text-emerald-700"
        >
          <ChevronLeft className="h-4 w-4 shrink-0" />
          <span className="truncate">{prev.no} {prev.title}</span>
        </button>
      ) : (
        <span />
      )}
      {side === 'top' && <span className="hidden text-[11px] text-zinc-300 sm:block">{idx + 1} / {chapters.length}</span>}
      {next ? (
        <button
          onClick={() => goChapter(idx + 1)}
          className="flex min-w-0 items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600 shadow-sm transition-colors hover:border-emerald-300 hover:text-emerald-700"
        >
          <span className="truncate">{next.no} {next.title}</span>
          <ChevronRight className="h-4 w-4 shrink-0" />
        </button>
      ) : (
        <span />
      )}
    </div>
  )

  const quizBtn = (
    <button
      onClick={() => setMode(mode === 'quiz' ? 'notes' : 'quiz')}
      className={cn(
        'flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-medium shadow-sm transition-colors',
        mode === 'quiz' ? 'bg-emerald-600 text-white' : 'border border-zinc-200 bg-white text-zinc-600 hover:border-emerald-300 hover:text-emerald-700',
      )}
    >
      <ClipboardCheck className="h-4 w-4" />
      {mode === 'quiz' ? '返回笔记' : ch.quiz.length > 0 ? `本章测试（${ch.quiz.length} 题）` : '本章测试'}
    </button>
  )

  return (
    <div className="min-h-dvh bg-zinc-50 pb-20">
      {/* 顶栏 */}
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6">
          <button
            onClick={() => navigate('/#study')}
            className="flex shrink-0 items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-500 shadow-sm transition-colors hover:border-emerald-200 hover:text-emerald-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> 返回学习首页
          </button>
          <p className="min-w-0 flex-1 truncate text-center text-sm font-semibold text-zinc-700">
            {book.emoji} 《{book.title}》
          </p>
          <span className="hidden w-24 sm:block" />
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 pt-5 sm:px-6">
        {/* 左栏：章节目录（桌面端固定） */}
        <aside className="sticky top-[61px] hidden h-[calc(100dvh-81px)] w-60 shrink-0 self-start overflow-y-auto lg:block">
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            <p className="flex items-center gap-1.5 border-b border-emerald-100 bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-semibold text-white">
              <BookOpen className="h-4 w-4" /> 章节目录
            </p>
            <nav className="py-1.5">
              {chapters.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => goChapter(i)}
                  className={cn(
                    'block w-full border-l-2 px-4 py-2.5 text-left text-[13px] leading-snug transition-colors',
                    i === idx
                      ? 'border-emerald-500 bg-emerald-50 font-medium text-emerald-700'
                      : 'border-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700',
                  )}
                >
                  <span className={cn('mr-1.5', i === idx ? 'text-emerald-500' : 'text-zinc-300')}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {c.no} {c.title}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* 中栏：正文 */}
        <main className="min-w-0 flex-1">
          {/* 移动端章节目录：横滑 chips */}
          <div className="mb-4 lg:hidden">
            <p className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-zinc-400">
              <ListTree className="h-3.5 w-3.5" /> 章节目录
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {chapters.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => goChapter(i)}
                  className={cn(
                    'shrink-0 rounded-full px-3 py-1.5 text-xs transition-colors',
                    i === idx
                      ? 'bg-emerald-600 font-medium text-white shadow-sm'
                      : 'border border-zinc-200 bg-white text-zinc-500',
                  )}
                >
                  {c.no} {c.title}
                </button>
              ))}
            </div>
          </div>

          {chapterNav('top')}

          <div className="my-4 rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm sm:p-7">
            {mode === 'notes' ? (
              <>
                <h1 className="mb-1 text-xl font-bold text-zinc-800">
                  {ch.no} {ch.title}
                </h1>
                <p className="mb-5 flex items-center gap-1 text-[11px] text-zinc-400">
                  <FileText className="h-3.5 w-3.5" /> 原文笔记 · 阅读笔记持续更新
                </p>
                <MarkdownView md={ch.body} />
              </>
            ) : (
              <>
                <h1 className="mb-1 text-xl font-bold text-zinc-800">{ch.no} 本章测试</h1>
                <p className="mb-5 text-[11px] text-zinc-400">完成测试后可以回到笔记继续阅读</p>
                <QuizView quiz={ch.quiz} />
              </>
            )}
          </div>

          {chapterNav('bottom')}
        </main>

        {/* 右栏：本书信息 */}
        <aside className="sticky top-[61px] hidden h-[calc(100dvh-81px)] w-52 shrink-0 self-start overflow-y-auto xl:block">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-zinc-600">本书信息</p>
            <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">
              共 {chapters.length} 章 · 当前第 {idx + 1} 章
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${((idx + 1) / chapters.length) * 100}%` }}
              />
            </div>
            <div className="mt-4">{quizBtn}</div>
          </div>
          <p className="mt-3 text-center text-[10px] text-zinc-300">University Copilot</p>
        </aside>
      </div>

      {/* 移动端浮动测试按钮 */}
      <div className="fixed bottom-5 right-4 xl:hidden">
        <button
          onClick={() => setMode(mode === 'quiz' ? 'notes' : 'quiz')}
          className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2.5 text-xs font-medium text-white shadow-lg transition-colors hover:bg-emerald-700"
        >
          <ClipboardCheck className="h-4 w-4" />
          {mode === 'quiz' ? '返回笔记' : '本章测试'}
        </button>
      </div>
    </div>
  )
}
