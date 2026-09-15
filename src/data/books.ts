import type { Book } from '@/types'

// ─────────────────────────────────────────────────────────────────────────
// 教材精读数据。每加一章 = 在 chapters 数组里追加一个对象，界面自动渲染。
// 思维导图用嵌套 OutlineNode 表达：text 是节点文字，children 是子节点，
// note 字段可放哥哥的批注（界面里以小字展示）。
// 以后内容多了可以迁到后端/文件存储，结构不用改。
// ─────────────────────────────────────────────────────────────────────────

export const BOOKS: Book[] = [
  {
    id: 'zoology',
    title: '动物学',
    subjectId: 'bio',
    chapters: [
      {
        id: 'zoo-ch1',
        no: '第一章',
        title: '生命的本质',
        mindmap: [
          {
            text: '生命是什么？',
            children: [
              {
                text: '7大基本属性',
                children: [
                  { text: '化学独特性', note: '四大生物大分子' },
                  { text: '复杂性与层级组织', note: '11个层级 + 涌现性' },
                  { text: '繁殖', note: '遗传 vs 变异的矛盾' },
                  { text: '遗传程序', note: 'DNA + 遗传密码的普遍性' },
                  { text: '新陈代谢', note: '合成 + 分解 + 能量转换' },
                  { text: '发育', note: '生命周期 + 变态' },
                  { text: '环境互动', note: '生态学 + 应激性' },
                ],
              },
              {
                text: '生命遵守物理定律',
                children: [
                  { text: '热力学第一定律', note: '能量守恒' },
                  { text: '热力学第二定律', note: '熵增 → 生命是耗散结构' },
                ],
              },
              { text: '生命的起源', note: '达尔文进化论 + 孟德尔遗传学' },
            ],
          },
          {
            text: '动物学是什么？',
            children: [
              { text: '研究对象：动物界的多样性' },
              {
                text: '两大研究方法',
                children: [
                  { text: '实验科学', note: '近因：怎么运作的' },
                  { text: '进化科学', note: '远因：为什么会变成这样' },
                ],
              },
              { text: '科学方法', note: '观察 → 假设 → 验证 → 结论' },
            ],
          },
          {
            text: '进化论：生物学的核心框架',
            children: [
              {
                text: "达尔文的5大理论",
                children: [
                  { text: '物种演变', note: 'perpetual change' },
                  { text: '共同祖先', note: 'common descent' },
                  { text: '物种增殖', note: 'multiplication of species' },
                  // TODO: 哥补充完整（图片只截到这里，还有 2 个理论 + 后续分支）
                ],
              },
            ],
          },
        ],
        // 读书笔记正文：按小节追加 { heading, body }
        notes: [],
        // 原文摘抄：{ text, page?, comment? }
        quotes: [],
      },
    ],
  },
]
