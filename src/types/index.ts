export type ReqStatus = 'pending' | 'approved' | 'in_progress' | 'done' | 'declined'

export type Category = '高数' | '生物' | '托福' | '学校' | '生活' | '其他'

export interface AgentRequest {
  id: string
  title: string
  rawText: string
  category: Category
  feasibility: 'high' | 'medium' | 'low'
  priority: 'high' | 'mid' | 'low'
  agentNote: string
  nextStep: string
  status: ReqStatus
  progress: number // 0-100
  createdAt: number
  updatedAt: number
  log: { time: number; text: string }[]
}

export type ChatChannel = 'agent' | 'brother'

export interface ChatMessage {
  id: string
  channel: ChatChannel
  role: 'sister' | 'agent' | 'brother'
  text: string
  createdAt: number
}

export interface NewsItem {
  id: string
  title: string
  summary: string
  date: string
  source: string
  url: string
  tag: '学校要闻' | '招生就业' | '学术科研' | '校园生活'
  keywords: string[]
  /** AI 结合妹妹档案撰写的相关性解读 */
  impact: string
  /** 建议妹妹采取的行动 */
  action: string
}

export interface SisterProfile {
  name: string
  grade: string
  college: string
  major: string
  campus: string
  goals: string[]
  interests: string[]
}

// ── 教材精读（Markdown / HTML 双格式驱动）────────────────────────────────
/**
 * 内容约定：src/content/books/<书id>/meta.json 放书籍元数据，
 * 同目录下每个 .md 或 .html 文件是一个章节，文件头用 JSON frontmatter 描述章节：
 *
 * ---
 * {"no":"第一章","title":"生命的本质","order":1,
 *  "quiz":[{"type":"choice","q":"…","choices":["A","B","C","D"],"answer":0,"explain":"…"},
 *          {"type":"qa","q":"…","a":"参考答案"}]}
 * ---
 *
 * 两种正文格式：
 * - .md   → 普通 Markdown 渲染（快速笔记、方便 git diff）
 * - .html → 完整独立 HTML 文档（可用 Trae 等工具生成精美排版），
 *           在 sandbox iframe 中渲染，样式与主应用完全隔离
 *
 * 新增一章 = 丢一个 .md 或 .html 文件进去，构建后自动出现。
 */

/** 选择题（自动判分）或自答题（点击看参考答案） */
export type QuizItem =
  | { type: 'choice'; q: string; choices: string[]; answer: number; explain?: string }
  | { type: 'qa'; q: string; a: string; explain?: string }

export interface BookChapter {
  id: string
  no: string // 「第一章」
  title: string
  order: number
  /** 正文格式：md = Markdown；html = 完整 HTML 文档（iframe 渲染） */
  format: 'md' | 'html'
  /** 正文（已去掉 frontmatter）：Markdown 源码或完整 HTML 文档 */
  body: string
  quiz: QuizItem[]
}

export interface Book {
  id: string
  title: string
  emoji?: string
  /** 归属用户（只给该用户展示） */
  userId: string
  chapters: BookChapter[]
}

export interface StudyTask {
  id: string
  title: string
  minutes: number
  tip?: string
}

export interface Subject {
  id: string
  name: string
  emoji: string
  color: string
  goal: string
  tasks: StudyTask[]
}

export interface BoardState {
  requests: AgentRequest[]
  messages: ChatMessage[]
  studyDone: Record<string, boolean>
  profile: SisterProfile
}
