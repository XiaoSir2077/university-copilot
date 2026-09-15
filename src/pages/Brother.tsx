import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Heart,
  KanbanSquare,
  ListTodo,
  LogOut,
  MessageSquareHeart,
  RotateCcw,
  Send,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SUBJECTS } from '@/data/content'
import { actions, STATUS_COLOR, STATUS_LABEL, useAuth, useBoard } from '@/store/useBoard'
import { cn } from '@/lib/utils'
import type { AgentRequest, ReqStatus } from '@/types'

const ORDER: ReqStatus[] = ['pending', 'approved', 'in_progress', 'done', 'declined']

const PRIORITY_LABEL = { high: '高优先级', mid: '中优先级', low: '低优先级' } as const
const FEASIBILITY_LABEL = { high: '可行性高', medium: '可行性中', low: '需人工把关' } as const

function timeAgo(ts: number) {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1) return '刚刚'
  if (m < 60) return `${m} 分钟前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} 小时前`
  return `${Math.floor(h / 24)} 天前`
}

function StatCard({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: string }) {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-3.5 shadow-sm">
      <div className={cn('flex h-8 w-8 items-center justify-center rounded-xl', tone)}>{icon}</div>
      <p className="mt-2 text-2xl font-bold text-zinc-800">{value}</p>
      <p className="text-[11px] text-zinc-400">{label}</p>
    </div>
  )
}

function RequestCard({ r }: { r: AgentRequest }) {
  const [note, setNote] = useState('')
  const next = ORDER[Math.min(ORDER.indexOf(r.status) + 1, ORDER.length - 1)]

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 text-[10px]">
              {r.category}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {PRIORITY_LABEL[r.priority]}
            </Badge>
            <Badge
              variant="secondary"
              className={cn('text-[10px]', r.feasibility === 'low' ? 'bg-rose-50 text-rose-500' : 'bg-zinc-100 text-zinc-500')}
            >
              {FEASIBILITY_LABEL[r.feasibility]}
            </Badge>
          </div>
          <h3 className="mt-1.5 text-[15px] font-semibold text-zinc-800">{r.title}</h3>
          <p className="mt-0.5 text-xs text-zinc-400">原话：「{r.rawText}」</p>
        </div>
        <Badge variant="outline" className={cn('shrink-0 text-[10px]', STATUS_COLOR[r.status])}>
          {STATUS_LABEL[r.status]}
        </Badge>
      </div>

      <div className="mt-3 rounded-xl bg-amber-50/60 border border-amber-100 p-3 text-xs text-zinc-600">
        <span className="font-medium text-amber-600">🤖 管家评估：</span>
        {r.agentNote}
        <div className="mt-1 text-zinc-500">👉 建议下一步：{r.nextStep}</div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <Progress value={r.progress} className="h-2 flex-1" />
        <span className="text-xs font-medium text-zinc-500 w-9 text-right">{r.progress}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={r.progress}
        onChange={(e) => actions.setProgress(r.id, Number(e.target.value))}
        className="mt-1 w-full accent-indigo-500"
        aria-label="推进进度"
      />

      <div className="mt-2 flex flex-wrap gap-2">
        {r.status !== 'done' && (
          <Button
            size="sm"
            onClick={() => actions.setStatus(r.id, next)}
            className="rounded-full bg-indigo-500 hover:bg-indigo-600 h-8"
          >
            推进到「{STATUS_LABEL[next]}」
          </Button>
        )}
        {r.status !== 'declined' && r.status !== 'done' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => actions.setStatus(r.id, 'declined')}
            className="rounded-full h-8 text-zinc-500"
          >
            暂不推进
          </Button>
        )}
        {r.status === 'done' && (
          <span className="flex items-center gap-1 text-xs text-emerald-600">
            <CheckCircle2 className="h-4 w-4" /> 已完成，干得漂亮
          </span>
        )}
      </div>

      <div className="mt-3">
        <p className="text-[11px] font-medium text-zinc-500 mb-1.5">推进时间线</p>
        <div className="flex flex-col gap-1.5">
          {r.log.slice(-4).map((l, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-zinc-500">
              <Clock className="mt-0.5 h-3 w-3 shrink-0 text-zinc-300" />
              <span>
                {l.text} <span className="text-zinc-300">· {timeAgo(l.time)}</span>
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && note.trim()) {
                actions.addLog(r.id, note.trim())
                setNote('')
              }
            }}
            placeholder="记一条进展（回车提交，妹妹可见）"
            className="flex-1 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs outline-none focus:border-indigo-300"
          />
          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7 rounded-full"
            onClick={() => {
              if (note.trim()) {
                actions.addLog(r.id, note.trim())
                setNote('')
              }
            }}
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function BoardTab() {
  const board = useBoard()
  const counts = useMemo(() => {
    const c: Record<ReqStatus, number> = { pending: 0, approved: 0, in_progress: 0, done: 0, declined: 0 }
    board.requests.forEach((r) => c[r.status]++)
    return c
  }, [board.requests])

  const weekAgo = Date.now() - 7 * 86400000

  return (
    <div className="flex flex-col gap-3 pt-3">
      <div className="grid grid-cols-4 gap-2">
        <StatCard label="待评估" value={counts.pending} icon={<Clock className="h-4 w-4 text-amber-500" />} tone="bg-amber-50" />
        <StatCard label="推进中" value={counts.approved + counts.in_progress} icon={<TrendingUp className="h-4 w-4 text-violet-500" />} tone="bg-violet-50" />
        <StatCard label="已完成" value={counts.done} icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} tone="bg-emerald-50" />
        <StatCard label="本周新增" value={board.requests.filter((r) => r.createdAt > weekAgo).length} icon={<ListTodo className="h-4 w-4 text-sky-500" />} tone="bg-sky-50" />
      </div>

      {/* 状态漏斗条 */}
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-zinc-100">
        {(['pending', 'approved', 'in_progress', 'done'] as ReqStatus[]).map((s) => {
          const total = Math.max(board.requests.length, 1)
          const w = (counts[s] / total) * 100
          if (!w) return null
          return (
            <div
              key={s}
              className={cn(
                s === 'pending' && 'bg-amber-400',
                s === 'approved' && 'bg-sky-400',
                s === 'in_progress' && 'bg-violet-400',
                s === 'done' && 'bg-emerald-400',
              )}
              style={{ width: `${w}%` }}
              title={`${STATUS_LABEL[s]} ${counts[s]}`}
            />
          )
        })}
      </div>

      <div className="flex items-center justify-between pt-1">
        <p className="text-xs font-medium text-zinc-500">{board.profile.name}的诉求清单（按提交时间排序）</p>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-[11px] text-zinc-400"
          onClick={() => {
            if (window.confirm('清空全部数据并恢复演示初始状态？')) actions.reset()
          }}
        >
          <RotateCcw className="h-3 w-3 mr-1" /> 重置演示数据
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {board.requests.map((r) => (
          <RequestCard key={r.id} r={r} />
        ))}
        {board.requests.length === 0 && (
          <p className="py-10 text-center text-sm text-zinc-400">
            还没有诉求，{board.profile.name}跟 University Copilot 说「我想…」就会出现在这里
          </p>
        )}
      </div>
    </div>
  )
}

function StudyPanel() {
  const board = useBoard()
  return (
    <div className="flex flex-col gap-3 pt-3">
      {SUBJECTS.map((s) => {
        const done = s.tasks.filter((t) => board.studyDone[t.id]).length
        const pct = Math.round((done / s.tasks.length) * 100)
        return (
          <div key={s.id} className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-700">
                {s.emoji} {s.name}
              </p>
              <span className="text-xs text-zinc-400">
                {done}/{s.tasks.length}
              </span>
            </div>
            <Progress value={pct} className="mt-2.5 h-2" />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {s.tasks.map((t) => (
                <Badge
                  key={t.id}
                  variant="secondary"
                  className={cn(
                    'text-[10px] font-normal',
                    board.studyDone[t.id] ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-400',
                  )}
                >
                  {board.studyDone[t.id] ? '✓ ' : ''}
                  {t.title.split('·')[0]}
                </Badge>
              ))}
            </div>
          </div>
        )
      })}
      <p className="text-center text-[11px] text-zinc-400">学习打卡来自妹妹端的「学习」板块，实时同步</p>
    </div>
  )
}

function BrotherChatPanel() {
  const board = useBoard()
  const [reply, setReply] = useState('')
  const msgs = board.messages.filter((m) => m.channel === 'brother')

  return (
    <div className="flex flex-col gap-2 pt-3">
      <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
        <p className="text-[11px] text-zinc-400 mb-3">
          💌 {board.profile.name}在「私信」频道说的话
        </p>
        <div className="flex flex-col gap-2">
          {msgs.length === 0 && <p className="text-xs text-zinc-400 py-4 text-center">还没有悄悄话</p>}
          {msgs.map((m) => (
            <div key={m.id} className="flex gap-2 items-start">
              <span className="mt-0.5 text-sm">{m.role === 'sister' ? '👧' : '💬'}</span>
              <div className="rounded-xl bg-zinc-50 px-3 py-2 text-sm text-zinc-700 flex-1">
                {m.text}
                <span className="ml-2 text-[10px] text-zinc-300">{timeAgo(m.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <input
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && reply.trim()) {
              actions.brotherReply(reply.trim())
              setReply('')
            }
          }}
          placeholder={`以哥哥身份回复${board.profile.name}…（回车发送）`}
          className="flex-1 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-rose-300 shadow-sm"
        />
        <Button
          className="rounded-full bg-gradient-to-br from-indigo-500 to-blue-600"
          onClick={() => {
            if (reply.trim()) {
              actions.brotherReply(reply.trim())
              setReply('')
            }
          }}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default function Brother() {
  const auth = useAuth()
  const board = useBoard()
  const kidUsers = auth.users.filter((u) => u.role === 'kid')

  return (
    <div className="min-h-dvh bg-zinc-100/70 pb-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <header className="pt-6 pb-2">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-1 text-xs text-zinc-400">
              <ArrowLeft className="h-3.5 w-3.5" /> 返回
            </Link>
            <button
              onClick={auth.logout}
              className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-500 shadow-sm hover:text-rose-500"
            >
              <LogOut className="h-3.5 w-3.5" /> 退出登录
            </button>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-2xl font-bold text-zinc-800">
              哥哥的工作看板{' '}
              <span className="ml-1 align-middle text-[10px] font-normal text-zinc-400 border rounded-full px-2 py-0.5">
                BI · 原型
              </span>
            </h1>
            <Heart className="h-5 w-5 text-rose-400" />
          </div>

          {/* 查看对象切换：妹妹 / 弟弟 */}
          <div className="mt-3 flex gap-2">
            {kidUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => auth.setViewAs(u.id)}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-sm transition',
                  auth.activeUserId === u.id
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-600 font-medium'
                    : 'border-zinc-200 bg-white text-zinc-500 hover:border-indigo-200',
                )}
              >
                {u.id === 'u-meimei' ? '👧' : '👦'} {u.name}
              </button>
            ))}
            <span className="self-center text-[11px] text-zinc-400">
              当前查看：{board.profile.name} 的数据
            </span>
          </div>

          <p className="mt-2 text-xs text-zinc-400">
            各人的诉求、学习进度和悄悄话实时汇总在这里；切到谁就看谁的板。
          </p>
        </header>

        <Tabs defaultValue="board">
          <TabsList className="grid w-full grid-cols-3 rounded-full bg-zinc-200/60 p-1">
            <TabsTrigger value="board" className="rounded-full text-xs sm:text-sm">
              <KanbanSquare className="h-3.5 w-3.5 mr-1" /> 诉求看板
            </TabsTrigger>
            <TabsTrigger value="study" className="rounded-full text-xs sm:text-sm">
              📊 学习进度
            </TabsTrigger>
            <TabsTrigger value="chat" className="rounded-full text-xs sm:text-sm">
              <MessageSquareHeart className="h-3.5 w-3.5 mr-1" /> 悄悄话
            </TabsTrigger>
          </TabsList>
          <TabsContent value="board">
            <BoardTab />
          </TabsContent>
          <TabsContent value="study">
            <StudyPanel />
          </TabsContent>
          <TabsContent value="chat">
            <BrotherChatPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
