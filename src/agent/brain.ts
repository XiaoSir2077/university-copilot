import type { AgentRequest, Category } from '@/types'

// ─────────────────────────────────────────────────────────────────────────
// 原型阶段的本地规则引擎：模拟「AI 管家」对妹妹诉求的评估。
// 正式版会替换为真实的 LLM Agent，接口保持不变（evaluateSisterInput）。
// ─────────────────────────────────────────────────────────────────────────

export interface AgentReply {
  kind: 'request' | 'chat'
  text: string
  request?: Omit<AgentRequest, 'id' | 'createdAt' | 'updatedAt' | 'log' | 'status' | 'progress'>
}

const CATEGORY_RULES: { category: Category; pattern: RegExp; titleHint: string }[] = [
  { category: '高数', pattern: /高数|数学|微积分|线代|线性代数|概率|高微/, titleHint: '高数学习相关' },
  { category: '生物', pattern: /生物|细胞|遗传|基因|实验|生化/, titleHint: '生物学习相关' },
  { category: '托福', pattern: /托福|toefl|ielts|雅思|听力|口语|出国|留学|gre/i, titleHint: '语言考试相关' },
  { category: '学校', pattern: /学校|东师|选课|宿舍|食堂|社团|成绩单|转专业|保研|奖学金/, titleHint: '校园事务相关' },
  { category: '生活', pattern: /平板|手机|电脑|买|衣服|鞋|演唱会|旅游|零花钱|聚餐/, titleHint: '生活消费相关' },
]

const INTENT_PATTERN = /我想|我要|帮我|能不能|可不可以|希望|想要|需要|麻烦|申请|计划|资料/

function makeTitle(text: string, category: Category): string {
  const clean = text.replace(/哥哥|姐|喂|呀|呢|吧|啊|哦|！|!|。|，|,/g, '').trim()
  const short = clean.length > 24 ? clean.slice(0, 24) + '…' : clean
  return short || CATEGORY_RULES.find((r) => r.category === category)?.titleHint || '新的诉求'
}

export function evaluateSisterInput(text: string): AgentReply {
  const trimmed = text.trim()
  if (!trimmed) {
    return { kind: 'chat', text: '在呢～想说什么都可以，比如「我想……」我就会帮你记下来并跟进。' }
  }

  const isRequest = INTENT_PATTERN.test(trimmed)

  if (!isRequest) {
    return {
      kind: 'chat',
      text: '收到～有什么想做的事，直接说「我想……」就行，我会帮你评估可行性并排进待办；如果只是想聊聊，就切到「私信」频道哦。',
    }
  }

  let category: Category = '其他'
  for (const r of CATEGORY_RULES) {
    if (r.pattern.test(trimmed)) {
      category = r.category
      break
    }
  }

  const urgent = /急|马上|明天|后天|截止|ddl|考试|期中|期末|deadline/i.test(trimmed)
  const costsMoney = /买|平板|手机|电脑|花钱|经费/.test(trimmed)
  const isStudy = category === '高数' || category === '生物' || category === '托福'

  const feasibility: AgentRequest['feasibility'] = costsMoney ? 'low' : isStudy ? 'high' : 'medium'
  const priority: AgentRequest['priority'] = urgent ? 'high' : isStudy ? 'mid' : 'low'

  const agentNote =
    feasibility === 'low'
      ? '这件事涉及额外开销，已标记为「需人工评估」，建议结合预算再确认。'
      : feasibility === 'high'
        ? (urgent ? '时间比较紧，可行性高，建议优先处理。' : '可行性高，属于学习计划类诉求，可以推进。')
        : '可行性中等，建议确认细节后再推进。'

  const nextStep =
    category === '高数' || category === '生物'
      ? '确认后拆成每日学习任务，同步到学习板块打卡'
      : category === '托福'
        ? '整理对应 TPO/资料包，挂到学习板块的托福清单'
        : category === '学校'
          ? '核实学校官方信息后回复'
          : category === '生活'
            ? '等待评估预算与必要性'
            : '等待确认后再安排'

  const request: AgentReply['request'] = {
    title: makeTitle(trimmed, category),
    rawText: trimmed,
    category,
    feasibility,
    priority,
    agentNote,
    nextStep,
  }

  return {
    kind: 'request',
    text:
      `明白啦！我帮你把这件事记下来了 📋\n` +
      `· 分类：${category}\n` +
      `· 可行性：${feasibility === 'high' ? '高' : feasibility === 'medium' ? '中' : '需要再评估'}\n` +
      `· 优先级：${priority === 'high' ? '高' : priority === 'mid' ? '中' : '低'}\n` +
      `已加入待办清单，处理进度我会随时同步给你～`,
    request,
  }
}
