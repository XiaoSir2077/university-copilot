import { useEffect, useState } from 'react'
import type { AgentRequest, BoardState, ChatMessage, ReqStatus, SisterProfile } from '@/types'
import { DEFAULT_PROFILE, SUBJECTS } from '@/data/content'

// ════════════════════════════════════════════════════════════════════════════
// 家庭看板 · 一体化 store：账号体系 + 按用户隔离数据 + 会话管理
//
// 原型阶段：数据存 localStorage、密码 SHA-256+盐哈希、会话存 sessionStorage。
// 正式版（P0 后端落地后）：整体迁到 PostgreSQL + argon2 + HttpOnly Cookie，
// 本文件的对外接口（useAuth / useBoard / actions）保持不变。
// ════════════════════════════════════════════════════════════════════════════

export type Role = 'admin' | 'kid' | 'viewer'

export interface UserAccount {
  id: string
  username: string
  name: string
  role: Role
  /** viewer 角色绑定观看的孩子 */
  viewTarget?: string
  passHash: string
}

interface FamilyDB {
  users: UserAccount[]
  boards: Record<string, BoardState>
}

interface Session {
  userId: string | null
  /** admin 正在以谁的身份查看 */
  viewAsId: string | null
}

const DB_KEY = 'family-board-v2'
const SES_KEY = 'family-board-session'
const LEGACY_KEY = 'sister-board-v1'

// 预计算的默认账号哈希（salt = username，sha256(salt:password)）
const SEED_USERS: (Omit<UserAccount, 'passHash'> & { password: string })[] = [
  { id: 'u-gege', username: 'gege', password: 'gege123', name: '哥哥', role: 'admin' },
  { id: 'u-meimei', username: 'meimei', password: 'meimei123', name: '妹妹', role: 'kid' },
  { id: 'u-didi', username: 'didi', password: 'didi123', name: '弟弟', role: 'kid' },
  {
    // 舅妈专用账号：已从弟弟的只读面板切出，登录后进入 /aunt 专属面板
    id: 'u-jiujiu',
    username: 'jiujiu',
    password: 'jiujiu123',
    name: '舅妈',
    role: 'viewer',
  },
]

const SEED_HASH: Record<string, string> = {
  gege: '9e1cbf0c3387bb43ed99a9b46ddc0d7e203bac67905527bf424cd2fe3ad06260',
  meimei: 'e085c3bdb15636dd830881337c0a507b7404fc20b406da9c4463527266eb6fd8',
  didi: 'c81050a5c556a7d8b6360d0375b7909559f877a9d4f6e6d685f2dfb0318faf6b',
  jiujiu: 'ea4b53904df3ddca8ab333ccd8da142b2a024d1c02b07679410fccdfd82c0cc1',
}

// ── 工具 ───────────────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// ── 种子数据 ────────────────────────────────────────────────────────────────
function seedSisterBoard(): BoardState {
  const now = Date.now()
  const mk = (daysAgo: number) => now - daysAgo * 86400000
  const requests: AgentRequest[] = [
    {
      id: uid(),
      title: '想要一份高数期中复习计划',
      rawText: '哥哥，我高数期中快到了，想要一份复习计划',
      category: '高数',
      feasibility: 'high',
      priority: 'high',
      agentNote: '期中临近，复习计划可行性高，建议哥哥本周内出计划。',
      nextStep: '哥哥确认后拆成每日任务，同步到学习板块',
      status: 'in_progress',
      progress: 45,
      createdAt: mk(6),
      updatedAt: mk(1),
      log: [
        { time: mk(6), text: '妹妹通过 University Copilot 提交' },
        { time: mk(5), text: '哥哥已确认，开始制定计划' },
        { time: mk(1), text: '微积分部分已整理完毕，线性代数进行中' },
      ],
    },
    {
      id: uid(),
      title: '托福 TPO 真题资料包',
      rawText: '我想托福听力多练练，能有 TPO 的资料吗',
      category: '托福',
      feasibility: 'high',
      priority: 'mid',
      agentNote: 'TPO 属公开备考资料，整理成本 low，可优先满足。',
      nextStep: '哥哥打包 TPO 1-75 听力音频 + 文本网盘链接',
      status: 'approved',
      progress: 10,
      createdAt: mk(4),
      updatedAt: mk(2),
      log: [
        { time: mk(4), text: '妹妹通过 University Copilot 提交' },
        { time: mk(2), text: '哥哥已同意，准备资料中' },
      ],
    },
    {
      id: uid(),
      title: '想换一台新 iPad',
      rawText: '哥哥我想要个新平板，现在的有点卡了',
      category: '生活',
      feasibility: 'low',
      priority: 'low',
      agentNote: '涉及花钱，标为需哥哥人工评估；建议妹妹补充预算和使用场景。',
      nextStep: '等待哥哥回复评估意见',
      status: 'pending',
      progress: 0,
      createdAt: mk(2),
      updatedAt: mk(2),
      log: [{ time: mk(2), text: '妹妹通过 University Copilot 提交' }],
    },
  ]
  const messages: ChatMessage[] = [
    {
      id: uid(),
      channel: 'brother',
      role: 'sister',
      text: '哥，这周生物实验报告好多😭',
      createdAt: mk(1) + 3600000,
    },
    {
      id: uid(),
      channel: 'agent',
      role: 'sister',
      text: '我想每天背 50 个托福单词，帮我监督一下',
      createdAt: mk(3),
    },
    {
      id: uid(),
      channel: 'agent',
      role: 'agent',
      text: '收到！这属于「学习习惯养成」类请求，可行性高。已帮你记入待办清单，会尽快跟进～',
      createdAt: mk(3) + 60000,
    },
  ]
  const studyDone: Record<string, boolean> = { m1: true, m2: true, b1: true, t1: true, t5: true }
  return { requests, messages, studyDone, profile: DEFAULT_PROFILE }
}

function seedBrotherBoard(): BoardState {
  const now = Date.now()
  const mk = (daysAgo: number) => now - daysAgo * 86400000
  const profile: SisterProfile = {
    name: '弟弟',
    grade: '2026 级本科 · 大一',
    college: '中南大学邓迪国际学院',
    major: '机械设计制造及其自动化',
    campus: '邓迪国际学院（全英文授课）',
    goals: ['高数线代打牢', 'C / Python 双修', '英语适应全英文授课', '每学期一个共学项目'],
    interests: ['机器人', 'AI 工具', '自动化'],
  }
  const requests: AgentRequest[] = [
    {
      id: uid(),
      title: '想要一份大一编程学习路线（C + Python）',
      rawText: '哥，C 语言和 Python 我先学哪个好？想要一份路线',
      category: '其他',
      feasibility: 'high',
      priority: 'mid',
      agentNote: '专业要求 C、AI 方向 Python，两者不冲突：C 跟课程走，Python 项目制自学。路线类诉求可行性高。',
      nextStep: '哥哥整理「C 跟课 + Python 项目」双线计划，配 DMOJ 练习源',
      status: 'in_progress',
      progress: 30,
      createdAt: mk(5),
      updatedAt: mk(1),
      log: [
        { time: mk(5), text: '弟弟通过 University Copilot 提交' },
        { time: mk(1), text: '路线初稿完成，Python 小项目选题中' },
      ],
    },
    {
      id: uid(),
      title: '想要 LLM API 小工具的项目点子',
      rawText: '哥，这学期共学项目做个调用大模型的小工具，有啥点子',
      category: '其他',
      feasibility: 'high',
      priority: 'mid',
      agentNote: '符合「项目制共学」约定，建议从他自己每天有痛点的场景选（课表/作业提醒类）。',
      nextStep: '哥哥出 3 个候选点子，周末和弟弟对齐',
      status: 'pending',
      progress: 0,
      createdAt: mk(1),
      updatedAt: mk(1),
      log: [{ time: mk(1), text: '弟弟通过 University Copilot 提交' }],
    },
  ]
  const messages: ChatMessage[] = [
    {
      id: uid(),
      channel: 'brother',
      role: 'sister',
      text: '哥，全英文上课有点吃力，专业课词汇听不懂',
      createdAt: mk(2),
    },
  ]
  const studyDone: Record<string, boolean> = { m1: true }
  return { requests, messages, studyDone, profile }
}

function seedDB(): FamilyDB {
  const users: UserAccount[] = SEED_USERS.map(({ password: _pw, ...u }) => ({
    ...u,
    passHash: SEED_HASH[u.username],
  }))
  const boards: Record<string, BoardState> = {
    'u-meimei': seedSisterBoard(),
    'u-didi': seedBrotherBoard(),
  }
  return { users, boards }
}

// ── 持久化 ─────────────────────────────────────────────────────────────────
let db: FamilyDB | null = null
const listeners = new Set<() => void>()

/** 老版本数据就地升级；返回是否发生过变更 */
function migrateDB(d: FamilyDB): boolean {
  // 舅妈账号切分：旧数据里显示名是「舅舅舅妈」且 viewTarget 指向弟弟
  const jiu = d.users.find((x) => x.id === 'u-jiujiu')
  if (jiu && (jiu.name !== '舅妈' || jiu.viewTarget)) {
    jiu.name = '舅妈'
    delete jiu.viewTarget
    return true
  }
  return false
}

function loadDB(): FamilyDB {
  if (db) return db
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) {
      db = JSON.parse(raw) as FamilyDB
      if (migrateDB(db)) saveDB()
      return db
    }
    // 迁移：旧版妹妹单机数据 → 妹妹账号
    const legacyRaw = localStorage.getItem(LEGACY_KEY)
    db = seedDB()
    if (legacyRaw) {
      try {
        const legacy = JSON.parse(legacyRaw) as BoardState
        db.boards['u-meimei'] = { ...db.boards['u-meimei'], ...legacy }
      } catch {
        /* ignore */
      }
    }
  } catch {
    db = seedDB()
  }
  saveDB()
  return db
}

function saveDB() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch {
    /* ignore */
  }
}

function emit() {
  listeners.forEach((l) => l())
}

function loadSession(): Session {
  try {
    const raw = sessionStorage.getItem(SES_KEY)
    if (raw) return JSON.parse(raw) as Session
  } catch {
    /* ignore */
  }
  return { userId: null, viewAsId: null }
}

let session = loadSession()

function saveSession() {
  try {
    sessionStorage.setItem(SES_KEY, JSON.stringify(session))
  } catch {
    /* ignore */
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === DB_KEY) {
      db = null
      loadDB()
      emit()
    }
  })
}

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

function useRerender() {
  const [, force] = useState(0)
  useEffect(() => subscribe(() => force((x) => x + 1)), [])
}

// ── 会话 / 鉴权 ─────────────────────────────────────────────────────────────
export function getCurrentUser(): UserAccount | null {
  const d = loadDB()
  return d.users.find((u) => u.id === session.userId) ?? null
}

/** 当前正在操作/查看的用户（admin 默认看第一个孩子，可 viewAs 切换） */
export function getActiveUserId(): string {
  const u = getCurrentUser()
  if (!u) return 'u-meimei'
  if (u.role === 'admin') {
    if (session.viewAsId) return session.viewAsId
    const firstKid = loadDB().users.find((x) => x.role === 'kid')
    return firstKid?.id ?? u.id
  }
  if (u.role === 'viewer') return u.viewTarget ?? u.id
  return u.id
}

export function useAuth() {
  useRerender()
  const d = loadDB()
  const currentUser = getCurrentUser()
  return {
    users: d.users.filter((u) => u.role !== 'admin'),
    currentUser,
    activeUserId: getActiveUserId(),
    viewAsId: session.viewAsId,
    async login(username: string, password: string): Promise<string | null> {
      const d2 = loadDB()
      const u = d2.users.find((x) => x.username === username.trim().toLowerCase())
      if (!u) return '账号不存在'
      const hash = await sha256(`${u.username}:${password}`)
      if (hash !== u.passHash) return '密码不对，再试一次'
      session = { userId: u.id, viewAsId: null }
      saveSession()
      emit()
      return null
    },
    logout() {
      session = { userId: null, viewAsId: null }
      saveSession()
      emit()
    },
    setViewAs(id: string | null) {
      session = { ...session, viewAsId: id }
      saveSession()
      emit()
    },
  }
}

// ── 业务数据 ────────────────────────────────────────────────────────────────
export function useBoard(): BoardState {
  useRerender()
  const d = loadDB()
  const id = getActiveUserId()
  if (!d.boards[id]) {
    d.boards[id] = { requests: [], messages: [], studyDone: {}, profile: DEFAULT_PROFILE }
    saveDB()
  }
  return d.boards[id]
}

export function useRole(): Role {
  useRerender()
  return getCurrentUser()?.role ?? 'kid'
}

export function useActiveUserId(): string {
  useRerender()
  return getActiveUserId()
}

function updateBoard(updater: (b: BoardState) => BoardState) {
  const d = loadDB()
  const id = getActiveUserId()
  const cur = d.boards[id] ?? {
    requests: [],
    messages: [],
    studyDone: {},
    profile: DEFAULT_PROFILE,
  }
  d.boards[id] = updater(cur)
  saveDB()
  emit()
}

export const actions = {
  addRequest(req: Omit<AgentRequest, 'id' | 'createdAt' | 'updatedAt' | 'log' | 'status' | 'progress'>) {
    const now = Date.now()
    const full: AgentRequest = {
      ...req,
      id: uid(),
      status: 'pending',
      progress: 0,
      createdAt: now,
      updatedAt: now,
      log: [{ time: now, text: '通过 University Copilot 提交' }],
    }
    updateBoard((b) => ({ ...b, requests: [full, ...b.requests] }))
    return full
  },
  addMessage(msg: Omit<ChatMessage, 'id' | 'createdAt'>) {
    const full: ChatMessage = { ...msg, id: uid(), createdAt: Date.now() }
    updateBoard((b) => ({ ...b, messages: [...b.messages, full] }))
    return full
  },
  setStatus(id: string, status: ReqStatus) {
    updateBoard((b) => ({
      ...b,
      requests: b.requests.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              updatedAt: Date.now(),
              log: [...r.log, { time: Date.now(), text: `状态更新为「${STATUS_LABEL[status]}」` }],
            }
          : r,
      ),
    }))
  },
  setProgress(id: string, progress: number) {
    updateBoard((b) => ({
      ...b,
      requests: b.requests.map((r) => (r.id === id ? { ...r, progress, updatedAt: Date.now() } : r)),
    }))
  },
  addLog(id: string, text: string) {
    updateBoard((b) => ({
      ...b,
      requests: b.requests.map((r) =>
        r.id === id
          ? { ...r, log: [...r.log, { time: Date.now(), text: `哥哥：${text}` }], updatedAt: Date.now() }
          : r,
      ),
    }))
  },
  toggleStudy(taskId: string) {
    updateBoard((b) => ({ ...b, studyDone: { ...b.studyDone, [taskId]: !b.studyDone[taskId] } }))
  },
  setProfile(profile: SisterProfile) {
    updateBoard((b) => ({ ...b, profile }))
  },
  brotherReply(text: string) {
    actions.addMessage({ channel: 'brother', role: 'brother', text })
  },
  reset(boardId?: string) {
    const d = loadDB()
    const id = boardId ?? getActiveUserId()
    if (id === 'u-didi') d.boards[id] = seedBrotherBoard()
    else d.boards[id] = seedSisterBoard()
    saveDB()
    emit()
  },
}

export const STATUS_LABEL: Record<ReqStatus, string> = {
  pending: '待评估',
  approved: '已批准',
  in_progress: '推进中',
  done: '已完成',
  declined: '暂不推进',
}

export const STATUS_COLOR: Record<ReqStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-sky-100 text-sky-700 border-sky-200',
  in_progress: 'bg-violet-100 text-violet-700 border-violet-200',
  done: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  declined: 'bg-zinc-100 text-zinc-500 border-zinc-200',
}

export { SUBJECTS }
