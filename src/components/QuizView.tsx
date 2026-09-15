import { useState } from 'react'
import { CheckCircle2, ChevronRight, RotateCcw, Target, XCircle } from 'lucide-react'
import type { QuizItem } from '@/types'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export default function QuizView({ quiz }: { quiz: QuizItem[] }) {
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null) // choice 已选
  const [revealed, setRevealed] = useState(false) // qa 已看答案
  const [correct, setCorrect] = useState(0)
  const [finished, setFinished] = useState(false)

  if (quiz.length === 0) {
    return <p className="py-8 text-center text-xs text-zinc-400">本章测验题整理中…</p>
  }

  const item = quiz[idx]
  const total = quiz.length
  const answered = picked !== null || revealed

  const next = () => {
    if (idx + 1 >= total) setFinished(true)
    else {
      setIdx(idx + 1)
      setPicked(null)
      setRevealed(false)
    }
  }

  if (finished) {
    const pct = Math.round((correct / total) * 100)
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-zinc-100 bg-white p-6 text-center shadow-sm">
        <span className="text-4xl">{pct >= 80 ? '🎉' : pct >= 60 ? '💪' : '📚'}</span>
        <p className="text-lg font-bold text-zinc-800">
          答对 {correct} / {total} 题
        </p>
        <p className="text-xs text-zinc-400">
          {pct >= 80 ? '掌握得很好，可以预习下一章了！' : pct >= 60 ? '基本掌握，错题再翻一遍笔记。' : '别急，回到笔记把薄弱的地方再看一遍。'}
        </p>
        <button
          onClick={() => {
            setIdx(0)
            setPicked(null)
            setRevealed(false)
            setCorrect(0)
            setFinished(false)
          }}
          className="mt-1 flex items-center gap-1 rounded-full border border-zinc-200 px-4 py-1.5 text-xs text-zinc-500 hover:border-emerald-200 hover:text-emerald-600"
        >
          <RotateCcw className="h-3.5 w-3.5" /> 再测一遍
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 shrink-0 text-rose-500" />
        <span className="text-xs text-zinc-400">
          第 {idx + 1} / {total} 题{item.type === 'qa' && ' · 自答题'}
        </span>
        <div className="flex-1">
          <Progress value={((idx + (answered ? 1 : 0)) / total) * 100} className="h-1.5" />
        </div>
      </div>

      <p className="text-[15px] font-medium leading-relaxed text-zinc-800">{item.q}</p>

      {item.type === 'choice' ? (
        <div className="flex flex-col gap-2">
          {item.choices.map((c, i) => {
            const isPicked = picked === i
            const showRight = picked !== null && i === item.answer
            const showWrong = isPicked && i !== item.answer
            return (
              <button
                key={i}
                disabled={picked !== null}
                onClick={() => {
                  setPicked(i)
                  if (i === item.answer) setCorrect((n) => n + 1)
                }}
                className={cn(
                  'flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors',
                  showRight && 'border-emerald-300 bg-emerald-50 text-emerald-700',
                  showWrong && 'border-rose-300 bg-rose-50 text-rose-600',
                  picked === null && 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50',
                  picked !== null && !isPicked && i !== item.answer && 'border-zinc-100 text-zinc-400',
                )}
              >
                {showRight ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                ) : showWrong ? (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                ) : (
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-zinc-300 text-[10px] text-zinc-400">
                    {String.fromCharCode(65 + i)}
                  </span>
                )}
                <span>{c}</span>
              </button>
            )
          })}
        </div>
      ) : (
        <div>
          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              className="rounded-full border border-zinc-200 px-4 py-1.5 text-xs text-zinc-500 hover:border-sky-200 hover:text-sky-600"
            >
              心里想好答案后，点我看参考答案
            </button>
          ) : (
            <div className="rounded-xl border border-sky-100 bg-sky-50/70 px-3.5 py-2.5">
              <p className="text-[11px] font-medium text-sky-600">参考答案</p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-700">{item.a}</p>
            </div>
          )}
        </div>
      )}

      {answered && (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {item.type === 'choice' && (
              <p className={cn('text-xs font-medium', picked === item.answer ? 'text-emerald-600' : 'text-rose-500')}>
                {picked === item.answer ? '回答正确！' : `正确答案：${String.fromCharCode(65 + item.answer)}`}
              </p>
            )}
            {item.explain && <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{item.explain}</p>}
          </div>
          <button
            onClick={next}
            className="flex shrink-0 items-center gap-0.5 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 px-4 py-1.5 text-xs font-medium text-white hover:opacity-90"
          >
            {idx + 1 >= total ? '完成' : '下一题'} <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
