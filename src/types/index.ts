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
