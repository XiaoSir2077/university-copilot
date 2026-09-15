import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import BookPanel from '@/components/BookPanel'
import { BOOKS } from '@/lib/books'

// 教材精读独立页：/book/<bookId>
export default function BookPage() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const book = BOOKS.find((b) => b.id === bookId)

  if (!book) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-10 text-center">
        <p className="text-sm text-zinc-400">这本书不存在或还没有整理好。</p>
        <button onClick={() => navigate('/#study')} className="mt-3 text-xs text-emerald-600 underline">
          返回学习首页
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-zinc-50 pb-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <header className="flex items-center gap-2 pt-5 pb-1">
          <button
            onClick={() => navigate('/#study')}
            className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-500 shadow-sm hover:border-emerald-200 hover:text-emerald-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> 返回学习首页
          </button>
        </header>
        <div className="pt-2">
          <BookPanel book={book} />
        </div>
      </div>
    </div>
  )
}
