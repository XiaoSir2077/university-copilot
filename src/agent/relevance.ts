import type { NewsItem, SisterProfile } from '@/types'

// ─────────────────────────────────────────────────────────────────────────
// 资讯相关性评分引擎（原型版）：
// 把妹妹档案（专业 / 目标 / 兴趣）与每条资讯的关键词匹配，得出 0-100 相关度，
// 并给出命中理由。正式版会替换为 LLM 逐条分析，接口保持不变。
// ─────────────────────────────────────────────────────────────────────────

export interface RelevanceResult {
  score: number
  hits: string[]
  level: '高相关' | '相关' | '一般'
}

const TAG_BASE: Record<NewsItem['tag'], number> = {
  招生就业: 22,
  学术科研: 16,
  学校要闻: 14,
  校园生活: 8,
}

export function relevance(news: NewsItem, profile: SisterProfile): RelevanceResult {
  const haystacks: { text: string; label: string }[] = [
    { text: profile.college, label: profile.college },
    { text: profile.major, label: profile.major },
    { text: profile.campus, label: profile.campus },
    { text: profile.grade, label: profile.grade },
    ...profile.goals.map((g) => ({ text: g, label: g })),
    ...profile.interests.map((i) => ({ text: i, label: i })),
  ]

  const hits = new Set<string>()
  let score = TAG_BASE[news.tag]

  for (const kw of news.keywords) {
    for (const h of haystacks) {
      // 关键词与档案字段互相包含即算命中（如「AI 工具」命中关键词「AI」）
      if (kw && h.text && (h.text.includes(kw) || kw.includes(h.text))) {
        hits.add(kw)
        break
      }
    }
  }

  score += hits.size * 18
  score = Math.min(100, score)

  return {
    score,
    hits: Array.from(hits),
    level: score >= 55 ? '高相关' : score >= 32 ? '相关' : '一般',
  }
}

export function monthOf(date: string) {
  return date.slice(0, 7) // '2026-09'
}
