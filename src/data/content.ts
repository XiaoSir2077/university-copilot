import type { NewsItem, SisterProfile, Subject } from '@/types'

// ── 妹妹档案（默认设定，哥哥可在「与我有关」看板中随时修改）──────────────
export const DEFAULT_PROFILE: SisterProfile = {
  name: '妹妹',
  grade: '2026 级本科',
  college: '生命科学学院',
  major: '生物科学（师范）',
  campus: '净月校区',
  goals: ['托福 100+', '保研', '进实验室做科研', 'GPA 3.7+'],
  interests: ['AI 工具', '读书', '羽毛球', '志愿服务'],
}

// ── 学校资讯：整理自东北师范大学官网 / 招生网公开信息（2026-09 检索）────
// impact / action 为 AI 结合妹妹档案撰写的相关性解读。
export const NEWS: NewsItem[] = [
  {
    id: 'n3',
    title: '东序琢玉 师道兴邦——东北师范大学向党和人民报告',
    summary:
      '学校发布办学成果报告，回顾八十载文脉与新时代育人成就，致敬第 42 个教师节。',
    date: '2026-09-11',
    source: '东北师范大学官网',
    url: 'https://www.nenu.edu.cn/yjds/a2026.htm',
    tag: '学校要闻',
    keywords: ['师范', '师道', '育人', '校史'],
    impact:
      '这是理解东师「师范底色」的最好材料：你是师范专业，培养目标、就业方向、学校资源都在这里。读懂它能帮你从大一定位自己四年后的出口（读研 / 从教 / 考编）。',
    action: '抽 20 分钟读一遍报告全文，写 3 句自己的理解，以后教育实习面试用得上。',
  },
  {
    id: 'n1',
    title: '东北师范大学举行 2026 级学生开学典礼',
    summary:
      '2026 级新同学正式加入东师大家庭，校长寄语新生“勤奋创新、为人师表”，开启大学生活新篇章。',
    date: '2026-09-07',
    source: '东北师范大学官网',
    url: 'https://www.nenu.edu.cn/yjds/a2026.htm',
    tag: '学校要闻',
    keywords: ['2026级', '新生', '开学典礼', '本科生', '迎新'],
    impact:
      '这就是你的开学典礼——大学生活正式起点。开学前两周的信息密度最高：班级群、辅导员、选课通知、宿舍安排都在这段时间发布，错过任何一条都可能影响入学手续和选课。',
    action: '确认班级群和辅导员联系方式已加好，把学院迎新安排标进日历。',
  },
  {
    id: 'n2',
    title: '我校教师在《Science》报道手性高张力小环合成重要进展',
    summary:
      '化学学院团队在《Science》发表研究成果，报道手性高张力小环合成的重要进展，展现东师科研实力。',
    date: '2026-09',
    source: '东北师范大学官网',
    url: 'https://www.nenu.edu.cn/yjds/a2026.htm',
    tag: '学术科研',
    keywords: ['科研', '实验室', '保研', '学术', '化学', '生物', '论文'],
    impact:
      '和你生物专业强相关：学科交叉的科研氛围意味着大创项目、进实验室的机会比想象中多。科研经历是保研和申请交换的硬通货，越早进组越好。',
    action: '记下这件事，10 月关注「大学生创新创业训练项目」申报通知，先联系一位任课老师聊聊进组。',
  },
  {
    id: 'n9',
    title: '东北师范大学 80 周年校庆公告（第二号）',
    summary:
      '建校 80 周年校庆进入倒计时，学校发布第二号公告，预告校庆年期间系列学术、文化活动安排。',
    date: '2026-08',
    source: '东北师范大学官网',
    url: 'https://www.nenu.edu.cn/yjds/a2026/a2026n8y.htm',
    tag: '学校要闻',
    keywords: ['校庆', '80周年', '校史', '活动', '校友', '志愿'],
    impact:
      '全年最大的校园事件。校庆年有密集的名家讲座、校友返校和纪念活动——是低成本见大牛、攒讲座学分、认识校友资源的窗口期；志愿者招募也是综测加分项。',
    action: '关注校庆后续公告（第三号），有志愿者或学生工作人员招募就报名。',
  },
  {
    id: 'n11',
    title: '图书馆「声声」不息，书香永传主题活动开启',
    summary:
      '校图书馆推出阅读推广系列活动，含朗读、共读与读书笔记征集，参与可获积分与纪念周边。',
    date: '2026-08-14',
    source: '东北师范大学通知公告',
    url: 'https://www.nenu.edu.cn/tzgg.htm',
    tag: '校园生活',
    keywords: ['图书馆', '读书', '活动', '书香', '笔记'],
    impact:
      '直接福利：读书活动通常有赠书、积分和综测加分。你本来就有读书计划，顺手参加零成本；写读书笔记的习惯对托福写作也是隐性训练。',
    action: '这周末去一次图书馆，借一本专业相关的科普书，报名一个共读活动。',
  },
  {
    id: 'n10',
    title: '首届东北四校「国优计划」研究生学位授予仪式在校举行',
    summary:
      '东北四校联合培养的国家优秀中小学教师培养计划（国优计划）首届研究生完成学业，学位授予仪式在我校举行。',
    date: '2026-06',
    source: '东北师范大学官网',
    url: 'https://www.nenu.edu.cn/yjds/a2026/a2026n8y.htm',
    tag: '学校要闻',
    keywords: ['研究生', '国优计划', '教师教育', '学位', '保研', '师范'],
    impact:
      '国家层面的教师培养计划落在东师，说明师范方向研究生学历的含金量在持续加码——这直接关系你 4 年后的保研 / 读研选择，值得提前知道这条路径存在。',
    action: '先收藏了解即可，大二再深入研究「国优计划」的选拔条件。',
  },
  {
    id: 'n5',
    title: '教育人工智能微专业招生简章发布',
    summary:
      '信息科学与技术学院开设教育人工智能微专业，面向全校招生，适合对 AI+教育感兴趣的同学辅修。',
    date: '2026-05-28',
    source: '信息科学与技术学院',
    url: 'https://ist.nenu.edu.cn/index/xytz/48.htm',
    tag: '招生就业',
    keywords: ['AI', '人工智能', '微专业', '辅修', '计算机', '教育'],
    impact:
      '和你的 AI 兴趣 + 师范方向高度契合：教育 AI 是「生物师范 × 技术」差异化的完美交叉点。微专业学分成本低于双学位，是简历和申请交换的加分项。',
    action: '查简章确认报名条件、学分要求和上课时间，跟哥哥聊聊要不要报。',
  },
  {
    id: 'n4',
    title: '东北师大新增 2 个双学士学位项目（2026 年获批）',
    summary:
      '新增“经济学-统计学”“政治学与行政学”双学士学位项目，为本科生提供跨学科培养新路径。',
    date: '2026-05-29',
    source: '东北师范大学本科招生网',
    url: 'https://zsb.nenu.edu.cn/phone/xwdt.htm',
    tag: '招生就业',
    keywords: ['双学位', '辅修', '跨学科', '本科', '统计'],
    impact:
      '与你专业不直接对口，但透露了学校的辅修政策风向：跨学科组合越来越受鼓励。如果想补数据分析能力（对科研和保研都有用），统计学方向值得关注——只是学分压力和绩点风险要先评估。',
    action: '先不着急决定，大一下学期结合绩点情况再评估是否辅修。',
  },
  {
    id: 'n6',
    title: '国家级一流课程，东北师大 +19！',
    summary: '学校再添 19 门国家级一流本科课程，课程建设水平持续提升，选课时可重点关注。',
    date: '2026-02',
    source: '东北师范大学官网',
    url: 'https://www.nenu.edu.cn/yjds/a2026.htm',
    tag: '学校要闻',
    keywords: ['选课', '课程', '本科', '绩点', '成绩'],
    impact:
      '直接影响你的选课质量：一流课程师资更稳、考核更规范，同样 effort 下更容易拿好成绩，GPA 3.7+ 的目标很大程度靠选课时把关。',
    action: '下学期选课前，先查目标课程的国家级/省级一流课程名单再下手。',
  },
  {
    id: 'n7',
    title: '东师学子再登中央广播电视总台春节档舞台',
    summary: '我校学生登上总台春节档节目舞台，展现东师学子的艺术风采与综合素质。',
    date: '2026-02-24',
    source: '东北师范大学本科招生网',
    url: 'https://zsb.nenu.edu.cn/phone/xwdt/37.htm',
    tag: '校园生活',
    keywords: ['文艺', '舞台', '艺术', '活动', '社团'],
    impact:
      '学校文艺资源和平台比想象中好：艺术团、大型活动经历既是社交入口也是综测加分项，对师范生还是台风和表达能力的训练。',
    action: '有兴趣就关注校大学生艺术团的春季招新，先去试一次课。',
  },
  {
    id: 'n8',
    title: '东师学子出征米兰冬奥会，为国争光',
    summary: '我校学子入选中国体育代表团出征米兰冬奥会，在冰雪赛场上展现中国青年风采。',
    date: '2026-02-08',
    source: '东北师范大学本科招生网',
    url: 'https://zsb.nenu.edu.cn/phone/xwdt/37.htm',
    tag: '校园生活',
    keywords: ['体育', '冰雪', '冬奥', '志愿', '羽毛球'],
    impact:
      '东师的冰雪体育是特色资源（身在长春别浪费）。体育成绩和体育活动都进综测，保持运动习惯也是你托福备考长跑的体力保障。',
    action: '把这学期的体育测试要求和场馆开放时间存进学习板块，每周固定两次运动。',
  },
]

export const SCHOOL_LINKS = [
  { name: '学校主页', url: 'https://www.nenu.edu.cn/' },
  { name: '本科招生网', url: 'https://zsb.nenu.edu.cn/' },
  { name: '研究生院', url: 'https://yjsy.nenu.edu.cn/' },
  { name: '通知公告', url: 'https://www.nenu.edu.cn/tzgg.htm' },
  { name: '本科招生电话', url: 'tel:0431-85098500' },
]

// ── 学习板块 ─────────────────────────────────────────────────────────────
export const SUBJECTS: Subject[] = [
  {
    id: 'math',
    name: '高等数学',
    emoji: '📐',
    color: 'from-sky-400 to-blue-600',
    goal: '跟住校内进度，期末冲刺 90+',
    tasks: [
      { id: 'm1', title: '函数与极限 · 刷题 30 道', minutes: 60, tip: '重点：等价无穷小、两个重要极限' },
      { id: 'm2', title: '导数与微分 · 刷题 30 道', minutes: 60, tip: '复合函数链式法则别跳步' },
      { id: 'm3', title: '中值定理与导数应用', minutes: 45, tip: '罗尔 / 拉格朗日 / 泰勒要会互相转化' },
      { id: 'm4', title: '不定积分 · 换元与分部', minutes: 60, tip: '每天 10 道保持手感' },
      { id: 'm5', title: '定积分及应用', minutes: 45, tip: '注意对称性与几何意义' },
      { id: 'm6', title: '微分方程入门', minutes: 40, tip: '一阶线性先求通解再代入' },
    ],
  },
  {
    id: 'bio',
    name: '生物学',
    emoji: '🧬',
    color: 'from-emerald-400 to-teal-600',
    goal: '搭好知识框架，为专业课打底',
    tasks: [
      { id: 'b1', title: '细胞结构与功能', minutes: 40, tip: '画一张细胞器分工思维导图' },
      { id: 'b2', title: '细胞代谢：呼吸与光合', minutes: 50, tip: '对比记忆两大代谢的场所与产物' },
      { id: 'b3', title: '遗传的分子基础', minutes: 45, tip: 'DNA 复制 / 转录 / 翻译画流程图' },
      { id: 'b4', title: '基因表达调控', minutes: 40, tip: '原核乳糖操纵子是经典考点' },
      { id: 'b5', title: '生物进化与多样性', minutes: 35, tip: '现代进化理论四大要点' },
    ],
  },
  {
    id: 'toefl',
    name: '托福',
    emoji: '🌍',
    color: 'from-violet-400 to-purple-600',
    goal: '目标 100+，每天听力磨耳朵',
    tasks: [
      { id: 't1', title: '听力 · TPO 精听 1 套', minutes: 60, tip: '听不懂的句子逐句听写' },
      { id: 't2', title: '阅读 · 长难句分析 10 句', minutes: 40, tip: '先抓主干再找修饰' },
      { id: 't3', title: '口语 · 独立题 2 道录音', minutes: 30, tip: '说完回听，检查卡顿和语法' },
      { id: 't4', title: '写作 · 综合写作 1 篇', minutes: 50, tip: '听力材料里的三个点要记全' },
      { id: 't5', title: '词汇 · 学术词汇 100 个', minutes: 30, tip: '用词根词缀批量记忆' },
    ],
  },
]

// ── 弟弟的学习板块（中南邓迪 · 机械设计制造及其自动化 · 全英文授课）──────────
export const DIDI_SUBJECTS: Subject[] = [
  {
    id: 'eng-math',
    name: '工科数学分析',
    emoji: '📐',
    color: 'from-sky-400 to-blue-600',
    goal: '全英文教材跟住节奏，期末冲 85+',
    tasks: [
      { id: 'em1', title: 'Limits & Continuity · 课后习题一组', minutes: 60, tip: 'ε-δ 定义要会用英文表述' },
      { id: 'em2', title: 'Derivatives · 链式法则刷题', minutes: 50, tip: '注意 implicit differentiation' },
      { id: 'em3', title: 'Integrals · 换元与分部积分', minutes: 60, tip: '每天保持 10 题手感' },
      { id: 'em4', title: '专业词汇整理 · 数学英文术语 30 个', minutes: 30, tip: '考试读题速度全靠它' },
    ],
  },
  {
    id: 'physics',
    name: '大学物理（力学）',
    emoji: '⚙️',
    color: 'from-amber-400 to-orange-600',
    goal: '力学是机械的基础，打牢受力分析',
    tasks: [
      { id: 'p1', title: '运动学与牛顿定律 · 习题一组', minutes: 50, tip: '画图！受力分析图先行' },
      { id: 'p2', title: '动量与能量 · 典型题 10 道', minutes: 45, tip: '守恒条件先判断再列式' },
      { id: 'p3', title: '刚体转动 · 概念 + 习题', minutes: 50, tip: '转动惯量公式对比记忆' },
    ],
  },
  {
    id: 'eng-drawing',
    name: '工程图学 / 制图',
    emoji: '📏',
    color: 'from-emerald-400 to-teal-600',
    goal: '空间想象 + 规范作图，机械人基本功',
    tasks: [
      { id: 'd1', title: '三视图练习 · 徒手 + 尺规各 3 组', minutes: 45, tip: '长对正、高平齐、宽相等' },
      { id: 'd2', title: 'CAD 软件熟悉 · 画简单零件图', minutes: 60, tip: '先把图层和标注规范建好' },
    ],
  },
  {
    id: 'academic-eng',
    name: '学术英语（全英文授课适应）',
    emoji: '🌍',
    color: 'from-violet-400 to-purple-600',
    goal: '听懂全英文课堂，敢于开口提问',
    tasks: [
      { id: 'a1', title: '课前预习 · 把下节课 PPT 生词扫一遍', minutes: 40, tip: '带着问题听课效率翻倍' },
      { id: 'a2', title: '课后复盘 · 用英文写 5 句课堂要点', minutes: 30, tip: '写不出 = 没听懂，回去重看' },
      { id: 'a3', title: '听力磨耳朵 · 英语科技视频 20 分钟', minutes: 25, tip: '推荐工程类科普频道' },
    ],
  },
]
