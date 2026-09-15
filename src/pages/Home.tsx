import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowLeft,
  Bell,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Circle,
  ExternalLink,
  Flame,
  GraduationCap,
  Link2,
  LogOut,
  Pencil,
  Sparkles,
  Target,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { NEWS, SCHOOL_LINKS, SUBJECTS } from '@/data/content'
import { DIDI_LINKS, DIDI_NEWS } from '@/data/newsDidi'
import { actions, useAuth, useActiveUserId, useBoard, useRole } from '@/store/useBoard'
import { monthOf, relevance } from '@/agent/relevance'
import FloatingChat from '@/components/FloatingChat'
import { cn } from '@/lib/utils'
import type { NewsItem, SisterProfile, Subject } from '@/types'

function greeting() {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 12) return '早上好'
  if (h < 18) return '下午好'
  return '晚上好'
}

const TAG_STYLE: Record<NewsItem['tag'], string> = {
  学校要闻: 'bg-emerald-50 text-emerald-600',
  学术科研: 'bg-sky-50 text-sky-600',
  招生就业: 'bg-amber-50 text-amber-600',
  校园生活: 'bg-pink-50 text-pink-500',
}

function NewsMeta({ n }: { n: NewsItem }) {
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <Badge variant="secondary" className={cn('text-[10px]', TAG_STYLE[n.tag])}>
          {n.tag}
        </Badge>
        <span className="flex items-center gap-1 text-[11px] text-zinc-400">
          <CalendarDays className="h-3 w-3" /> {n.date}
        </span>
      </div>
      <h3 className="mt-2 text-[15px] font-semibold leading-snug text-zinc-800">{n.title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-zinc-500">{n.summary}</p>
      <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
        <span>{n.source}</span>
        <ExternalLink className="h-3.5 w-3.5" />
      </div>
    </>
  )
}

// ── 看板一：学校官方（时间线）───────────────────────────────────────────
function OfficialTab() {
  const isDidi = useActiveUserId() === 'u-didi'
  const feed = isDidi ? DIDI_NEWS : NEWS
  const links = isDidi ? DIDI_LINKS : SCHOOL_LINKS

  const groups = useMemo(() => {
    const sorted = [...feed].sort((a, b) => (a.date < b.date ? 1 : -1))
    const map = new Map<string, NewsItem[]>()
    for (const n of sorted) {
      const m = monthOf(n.date)
      if (!map.has(m)) map.set(m, [])
      map.get(m)!.push(n)
    }
    return Array.from(map.entries())
  }, [feed])

  return (
    <div className="pt-4">
      <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium opacity-90">
          <GraduationCap className="h-4 w-4" /> {isDidi ? '邓迪学院 · 机械及其自动化' : '东师官方资讯'} · 按时间线整理
        </div>
        <p className="mt-1 text-xs opacity-80">
          持续从学校官网、招生网等渠道检索，按月份归档，点卡片可看原文。
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-6">
        {groups.map(([month, items]) => (
          <div key={month} className="flex gap-4">
            {/* 时间线节点 */}
            <div className="flex w-14 shrink-0 flex-col items-center">
              <div className="rounded-xl bg-emerald-600 px-2 py-1.5 text-center text-[11px] font-bold text-white shadow-sm">
                {month.slice(0, 4)}
                <br />
                {month.slice(5)}月
              </div>
              <div className="mt-1 w-px flex-1 bg-emerald-200" />
            </div>
            {/* 本月资讯 */}
            <div className="grid flex-1 grid-cols-1 gap-3 pb-2 lg:grid-cols-2">
              {items.map((n) => (
                <a
                  key={n.id}
                  href={n.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-emerald-100 h-fit"
                >
                  <NewsMeta n={n} />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-700">
          <Link2 className="h-4 w-4 text-emerald-600" /> 常用入口
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {links.map((l) => (
            <a
              key={l.name}
              href={l.url}
              target={l.url.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-full bg-zinc-50 px-3.5 py-2 text-xs text-zinc-600 hover:bg-emerald-50"
            >
              {l.name} <ExternalLink className="h-3 w-3 text-zinc-300" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 妹妹档案编辑 ─────────────────────────────────────────────────────────
function ProfileDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const board = useBoard()
  const [form, setForm] = useState<SisterProfile>(board.profile)
  const [goalsText, setGoalsText] = useState(board.profile.goals.join('，'))
  const [interestsText, setInterestsText] = useState(board.profile.interests.join('，'))

  const split = (s: string) =>
    s
      .split(/[,，、;；]/)
      .map((x) => x.trim())
      .filter(Boolean)

  const save = () => {
    actions.setProfile({ ...form, goals: split(goalsText), interests: split(interestsText) })
    onOpenChange(false)
  }

  const field = (label: string, key: keyof SisterProfile) => (
    <div className="grid gap-1.5">
      <Label className="text-xs text-zinc-500">{label}</Label>
      <Input
        value={form[key] as string}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="h-9"
      />
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">编辑妹妹档案</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {field('怎么称呼她', 'name')}
          {field('年级', 'grade')}
          {field('学院', 'college')}
          {field('专业', 'major')}
          {field('校区', 'campus')}
          <div className="grid gap-1.5">
            <Label className="text-xs text-zinc-500">目标（用逗号分隔）</Label>
            <Input value={goalsText} onChange={(e) => setGoalsText(e.target.value)} className="h-9" />
          </div>
          <div className="grid gap-1.5 col-span-2">
            <Label className="text-xs text-zinc-500">兴趣（用逗号分隔）</Label>
            <Input value={interestsText} onChange={(e) => setInterestsText(e.target.value)} className="h-9" />
          </div>
        </div>
        <p className="text-[11px] text-zinc-400">
          「与我有关」看板会按这份档案重新计算每条资讯的相关度。正式版将由 AI 结合档案逐条撰写解读。
        </p>
        <DialogFooter>
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button className="rounded-full bg-emerald-600 hover:bg-emerald-700" onClick={save}>
            保存并重新分析
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── 看板二：与我有关（AI 相关性解读）────────────────────────────────────
function RelevantTab({ readOnly }: { readOnly: boolean }) {
  const board = useBoard()
  const [editing, setEditing] = useState(false)
  const p = board.profile
  const feed = useActiveUserId() === 'u-didi' ? DIDI_NEWS : NEWS

  const scored = useMemo(
    () =>
      feed.map((n) => ({ news: n, rel: relevance(n, p) })).sort(
        (a, b) => b.rel.score - a.rel.score || (a.news.date < b.news.date ? 1 : -1),
      ),
    [feed, p],
  )

  const levelStyle = (level: string) =>
    level === '高相关'
      ? 'bg-rose-50 text-rose-500 border-rose-100'
      : level === '相关'
        ? 'bg-amber-50 text-amber-600 border-amber-100'
        : 'bg-zinc-100 text-zinc-400 border-zinc-100'

  return (
    <div className="pt-4">
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* 左栏：档案 */}
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-rose-400 to-pink-600 p-4 text-white shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium opacity-90">📇 {p.name}的档案</p>
              {!readOnly && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px] hover:bg-white/30"
                >
                  <Pencil className="h-3 w-3" /> 编辑
                </button>
              )}
            </div>
            <h3 className="mt-2 text-lg font-bold">
              {p.name} · {p.grade}
            </h3>
            <p className="text-xs text-white/85">
              {p.college} · {p.major}
            </p>
            <p className="text-xs text-white/85">{p.campus}</p>
            <div className="mt-3">
              <p className="text-[11px] text-white/70">🎯 目标</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {p.goals.map((g) => (
                  <span key={g} className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
                    {g}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-2">
              <p className="text-[11px] text-white/70">✨ 兴趣</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {p.interests.map((i) => (
                  <span key={i} className="rounded-full bg-white/15 px-2 py-0.5 text-[10px]">
                    {i}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm text-[11px] leading-relaxed text-zinc-500">
            <p className="flex items-center gap-1 font-medium text-zinc-600 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> 这个看板怎么来的
            </p>
            <p className="mt-1.5">
              从学校官网抓取资讯后，AI 结合 TA 的档案（专业 / 目标 / 兴趣）逐条解读：判断哪条与 TA
              有关、有什么影响、建议做什么。修改档案后相关度会重新计算。
            </p>
            <p className="mt-1.5 text-zinc-400">原型说明：相关度由本地规则引擎打分，解读文字为 AI 预撰写；正式版将接入 LLM 实时分析。</p>
          </div>
        </div>

        {/* 右栏：按相关度排序的资讯解读 */}
        <div className="flex flex-col gap-3">
          {scored.map(({ news: n, rel }) => (
            <div
              key={n.id}
              className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary" className={cn('text-[10px]', TAG_STYLE[n.tag])}>
                      {n.tag}
                    </Badge>
                    <span className="text-[11px] text-zinc-400">{n.date}</span>
                  </div>
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1.5 block text-[15px] font-semibold leading-snug text-zinc-800 hover:text-emerald-600"
                  >
                    {n.title} <ExternalLink className="inline h-3 w-3 text-zinc-300" />
                  </a>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge variant="outline" className={cn('text-[10px]', levelStyle(rel.level))}>
                    {rel.level === '高相关' && <Flame className="mr-0.5 h-3 w-3" />}
                    {rel.level}
                  </Badge>
                  <span className="text-[11px] font-medium text-zinc-400">{rel.score}%</span>
                </div>
              </div>

              <Progress value={rel.score} className="mt-2 h-1" />

              {rel.hits.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1">
                  <span className="text-[10px] text-zinc-400">命中：</span>
                  {rel.hits.map((h) => (
                    <span key={h} className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] text-rose-500">
                      {h}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <div className="rounded-xl bg-sky-50/70 border border-sky-100 p-3">
                  <p className="text-[11px] font-medium text-sky-600">📌 对你有什么影响</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-600">{n.impact}</p>
                </div>
                <div className="rounded-xl bg-emerald-50/70 border border-emerald-100 p-3">
                  <p className="text-[11px] font-medium text-emerald-600">
                    <Target className="mr-0.5 inline h-3 w-3" /> 建议行动
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-600">{n.action}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ProfileDialog open={editing} onOpenChange={setEditing} />
    </div>
  )
}

// ── 学习板块 ─────────────────────────────────────────────────────────────
function SubjectCard({ s, onOpen }: { s: Subject; onOpen: () => void }) {
  const board = useBoard()
  const done = s.tasks.filter((t) => board.studyDone[t.id]).length
  const pct = Math.round((done / s.tasks.length) * 100)
  return (
    <button
      onClick={onOpen}
      className="relative overflow-hidden rounded-2xl p-4 text-left text-white shadow-md transition hover:shadow-lg"
    >
      <div className={cn('absolute inset-0 bg-gradient-to-br', s.color)} />
      <div className="relative">
        <div className="flex items-start justify-between">
          <span className="text-2xl">{s.emoji}</span>
          <Badge className="bg-white/20 text-white border-0 text-[10px] hover:bg-white/20">
            {done}/{s.tasks.length} 完成
          </Badge>
        </div>
        <h3 className="mt-2 text-lg font-bold">{s.name}</h3>
        <p className="text-[11px] text-white/80 mt-0.5">{s.goal}</p>
        <Progress value={pct} className="mt-3 h-1.5 bg-white/25 [&>div]:bg-white" />
        <p className="mt-1.5 text-[10px] text-white/75">本周进度 {pct}%</p>
      </div>
    </button>
  )
}

function SubjectDetail({
  s,
  onBack,
  readOnly,
}: {
  s: Subject
  onBack: () => void
  readOnly: boolean
}) {
  const board = useBoard()
  const done = s.tasks.filter((t) => board.studyDone[t.id]).length
  const pct = Math.round((done / s.tasks.length) * 100)

  return (
    <div className="pt-4 flex flex-col gap-3 max-w-2xl">
      <div className={cn('rounded-2xl bg-gradient-to-br p-4 text-white shadow-md', s.color)}>
        <button onClick={onBack} className="flex items-center gap-1 text-xs text-white/85">
          <ArrowLeft className="h-3.5 w-3.5" /> 返回学习首页
        </button>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-3xl">{s.emoji}</span>
          <div>
            <h2 className="text-xl font-bold">{s.name}</h2>
            <p className="text-xs text-white/80">{s.goal}</p>
          </div>
        </div>
        <Progress value={pct} className="mt-3 h-2 bg-white/25 [&>div]:bg-white" />
        <p className="mt-1 text-[11px] text-white/80">
          {done}/{s.tasks.length} · 完成 {pct}%
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {s.tasks.map((t) => {
          const checked = !!board.studyDone[t.id]
          return (
            <button
              key={t.id}
              onClick={() => !readOnly && actions.toggleStudy(t.id)}
              className={cn(
                'flex items-start gap-3 rounded-2xl border bg-white p-3.5 text-left shadow-sm transition-colors',
                checked ? 'border-emerald-100 bg-emerald-50/40' : 'border-zinc-100 hover:border-zinc-200',
                readOnly && 'cursor-default',
              )}
            >
              {checked ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
              ) : (
                <Circle className="mt-0.5 h-5 w-5 shrink-0 text-zinc-300" />
              )}
              <div className="flex-1">
                <p className={cn('text-sm font-medium', checked ? 'text-zinc-400 line-through' : 'text-zinc-800')}>
                  {t.title}
                </p>
                {t.tip && <p className="mt-0.5 text-[11px] text-zinc-400">💡 {t.tip}</p>}
              </div>
              <Badge variant="secondary" className="text-[10px] shrink-0 mt-0.5">
                {t.minutes}min
              </Badge>
            </button>
          )
        })}
      </div>

      <p className="text-center text-[11px] text-zinc-400 pb-20">
        打卡数据会同步到哥哥的看板，完成的每一步他都看得见 ✨
      </p>
    </div>
  )
}

function StudyTab({ readOnly }: { readOnly: boolean }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const open = useMemo(() => SUBJECTS.find((s) => s.id === openId), [openId])

  if (open) return <SubjectDetail s={open} onBack={() => setOpenId(null)} readOnly={readOnly} />

  return (
    <div className="pt-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 rounded-2xl bg-white border border-zinc-100 p-3.5 shadow-sm text-xs text-zinc-500">
        <BookOpenCheck className="h-4 w-4 text-violet-500" />
        {readOnly ? '学习打卡情况（只读）' : '每完成一项打一次卡，哥哥那边会实时看到学习进度～'}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SUBJECTS.map((s) => (
          <SubjectCard key={s.id} s={s} onOpen={() => setOpenId(s.id)} />
        ))}
      </div>
      <p className="text-center text-[11px] text-zinc-400">
        更多学科正在路上；后续这里会升级为「哥哥笔记 + 教材原文」的互动学习页
      </p>
    </div>
  )
}

// ── 页面 ─────────────────────────────────────────────────────────────────
export default function Home() {
  const board = useBoard()
  const auth = useAuth()
  const role = useRole()
  const readOnly = role === 'viewer'
  const active = board.requests.filter((r) => r.status === 'pending' || r.status === 'in_progress').length

  return (
    <div className="min-h-dvh bg-zinc-50 pb-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* 顶部 */}
        <header className="pt-6 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-800">
                University <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">Copilot</span>
              </h1>
              <p className="mt-0.5 text-xs text-zinc-400">
                {greeting()}，{board.profile.name}
                {readOnly && (
                  <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-400">只读</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="h-5 w-5 text-zinc-400" />
                {active > 0 && !readOnly && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] text-white">
                    {active}
                  </span>
                )}
              </div>
              {role === 'kid' && (
                <Link
                  to="/brother"
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-500 shadow-sm hover:border-indigo-200 hover:text-indigo-500"
                >
                  哥哥入口
                </Link>
              )}
              <button
                onClick={auth.logout}
                title="退出登录"
                className="rounded-full border border-zinc-200 bg-white p-2 text-zinc-400 shadow-sm hover:text-rose-500"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <Tabs
          defaultValue={window.location.hash === '#relevant' ? 'relevant' : 'official'}
          onValueChange={(v) => history.replaceState(null, '', `#${v}`)}
        >
          <TabsList className="grid w-full max-w-lg grid-cols-3 rounded-full bg-zinc-200/60 p-1">
            <TabsTrigger value="official" className="rounded-full text-sm">
              🏫 东师官方
            </TabsTrigger>
            <TabsTrigger value="relevant" className="rounded-full text-sm">
              🎯 与我有关
            </TabsTrigger>
            <TabsTrigger value="study" className="rounded-full text-sm">
              📚 学习
            </TabsTrigger>
          </TabsList>
          <TabsContent value="official">
            <OfficialTab />
          </TabsContent>
          <TabsContent value="relevant">
            <RelevantTab readOnly={readOnly} />
          </TabsContent>
          <TabsContent value="study">
            <StudyTab readOnly={readOnly} />
          </TabsContent>
        </Tabs>
      </div>

      {!readOnly && role === 'kid' && <FloatingChat />}
    </div>
  )
}
