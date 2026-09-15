# 家庭学习看板 · 项目规划（v0.1 草案）

> 从单机原型（sister-board）演进为多人、多角色、可协作维护的 GitHub 项目。
> 本文件是规划阶段的共同决策基础，未定稿；标注 ❓ 处需要一家人确认。

---

## 1. 目标与范围

**一句话**：一个哥哥搭、弟弟妹妹各用各的、舅舅舅妈能旁观的「学习资讯 + 陪伴推进」系统。

| 成员 | 角色 | 能看到/用到什么 |
|---|---|---|
| 哥哥（我） | Admin | 全部内容；诉求看板（BI）；资讯源与定时任务管理；所有档案的编辑权 |
| 妹妹 | Kid | 东师官方时间线、与我有关（AI 解读）、学习打卡、AI 管家对话、和哥哥聊聊 |
| 弟弟 | Kid | 邓迪学院/机械相关资讯时间线、与我有关、他自己的学习线（高数/线代/编程/CAD…）、AI 管家、和哥哥聊聊 |
| 舅舅舅妈 | Viewer（只读） | 弟弟相关的资讯看板（自动收集的邓迪学院机械类内容）＋弟弟学习进度概览；无对话、无诉求功能 |

**本期新增需求拆解**

1. GitHub 项目，哥哥 + 弟弟共同维护（代码层面协作）
2. 登录机制：每人独立账号密码，登录后只见自己的内容（管理员除外）
3. 现有「妹妹的内容」全部归入妹妹账号下
4. 新增弟弟板块：自动化收集**中南大学邓迪学院 × 机械及其自动化**相关内容
5. 权限体系：按角色/归属隔离视图

---

## 2. 总体架构

```
┌────────────────────────────────────────────────────────────┐
│                     浏览器（手机/平板/电脑）                  │
│         React SPA（现有 sister-board 演进）                  │
└──────────────────────┬─────────────────────────────────────┘
                       │ HTTPS / JSON (JWT)
┌──────────────────────▼─────────────────────────────────────┐
│                  后端 API 服务（Node.js / Hono）              │
│  ┌──────────┬───────────┬──────────┬───────────┬─────────┐ │
│  │  auth    │  news     │ requests │  study    │ chat /  │ │
│  │  登录鉴权 │  资讯+解读 │  诉求看板 │  学习打卡  │ agent   │ │
│  └──────────┴───────────┴──────────┴───────────┴─────────┘ │
│  定时任务：资讯采集 cron（东师 + 邓迪学院 + 通用源）            │
└──────┬──────────────────────┬───────────────────────────────┘
       │                      │
┌──────▼───────┐      ┌───────▼────────┐      ┌──────────────┐
│  PostgreSQL  │      │  LLM 服务       │      │  对象存储     │
│ (用户/资讯/   │      │  火山方舟 API    │      │  (教材PDF/   │
│  诉求/对话)   │      │  摘要/相关性/   │      │   图片笔记)   │
└──────────────┘      │  自测题生成     │      └──────────────┘
                      └────────────────┘
```

**核心设计原则**

- **按人隔离数据**：所有业务表带 `owner_id`（内容归属）与 `audience`（可见范围），鉴权在中间件统一做，不靠前端隐藏
- **资讯流水线与展示解耦**：采集 → 去重 → LLM 摘要/相关性 → 入库 → 各端拉取；学校可配置化（东师、邓迪学院只是第一批源）
- **AI 全部走可替换接口**：规则引擎仅留在「离线降级」路径，正式链路一律调 LLM（火山方舟）

---

## 3. 技术选型（建议方案 + 备选）

| 层 | 建议 | 备选 | 理由 |
|---|---|---|---|
| 前端 | 现有 React + Vite + Tailwind + shadcn（沿用） | Next.js | 复用原型 90% 组件；弟弟上手门槛低 |
| 后端 | Node.js + Hono（轻量、TS 全栈同语言） | FastAPI（Python）/ tRPC | 和前端同语言，弟弟不用切技术栈 |
| 数据库 | PostgreSQL（Docker 自托管） | SQLite（单机期）→ Supabase | 家庭规模 SQLite 都够，但 PG 一步到位不折腾迁移 |
| 鉴权 | 用户名+密码（argon2 哈希）+ JWT Cookie | 魔法链接 / OAuth | 家人场景用户名密码最朴素可靠 |
| 部署 | 家用电脑/云主机 Docker + Cloudflare Tunnel（免费、HTTPS 自带） | 云服务器+域名+备案 | 免公网 IP、免备案；❓需要确认家里网络/预算 |
| LLM | 火山方舟（doubao 系列） | OpenAI 兼容端点 | 国内稳定、有现成插件生态；成本可控 |
| 采集 | 后端 cron + fetch + Readability 抽取 | RSSHub / 爬虫框架 | 官网无 RSS，以定时抓取 + 正文抽取为主 |

**GitHub 侧**

- **私有仓库**（家庭数据、登录信息相关代码；公开无收益有暴露面）
- 分支模型：`main`（可部署）+ `dev`（日常）+ 功能分支 PR 合入
- GitHub Actions：lint + typecheck + build + 单测，PR 必须绿
- Issue 模板（功能/bug/内容源申请），弟弟认领「邓迪学院资讯源」「机械学习板块」模块

---

## 4. 数据模型（核心表）

```
users            id, username, password_hash, display_name, role(admin|kid|viewer), avatar_emoji
profiles         user_id, school, college, major, grade, campus, goals[], interests[]
news_items       id, source_name, source_url, title, summary, published_at, tags[],
                 keywords[], impact_text, action_text, relevance_json,   ← LLM 产出
                 target_user_id,   ← 主要给谁看（妹妹/弟弟）
                 audience[],        ← ['kid','viewer','admin'] 可见范围
                 fetched_at, hash(去重)
requests         id, owner_id, title, raw_text, category, feasibility, priority,
                 agent_note, next_step, status, progress, log[]
messages         id, channel('agent'|'brother'), owner_id, role, text, created_at
subjects/tasks   id, owner_id, name, emoji, goal / task: id, title, minutes, tip
study_progress   owner_id, task_id, done_at
documents        id, owner_id, title, type(book|notes), meta       ← 教材原文（后续阶段）
sections         document_id, parent_id, title, order, content     ← 章节树
annotations      section_id, author_id, anchor, note_text, kind    ← 哥哥笔记
```

---

## 5. 权限矩阵（中间件强制）

| 功能 | Admin | Kid（本人） | Kid（他人） | Viewer |
|---|---|---|---|---|
| 资讯时间线（与我有关） | 全部 | 仅 `target_user_id = 自己` 的 | ✗ | 仅 audience 含 viewer 且 target 为对应孩子的 |
| 学习打卡 | 全部读写 | 自己读写 | ✗ | 只读 |
| 诉求看板 / AI 管家对话 | 全部 | 自己 | ✗ | ✗ |
| 和哥哥聊聊 | 收发 | 发（对自己的哥哥） | ✗ | ✗ |
| 档案编辑 | 全部 | 只读（可提议修改，走诉求） | ✗ | ✗ |
| 用户/账号管理、资讯源配置 | ✔ | ✗ | ✗ | ✗ |

舅舅舅妈 = Viewer，且**只绑定弟弟**：他们看到的「与我有关」按弟弟档案（邓迪学院 · 机械及其自动化）解读。

---

## 6. 自动化收集流水线（弟弟板块同款，妹妹板块复用）

```
cron（每天 07:23 / 19:47 两次）→
  抓取源列表（可配置：邓迪学院官网通知、中南大学教务/学院页、UoD 相关页）→
  正文抽取 + hash 去重 →
  LLM 结构化：{标题, 摘要, 日期, 分类, 关键词, 相关性解读, 建议行动} →
  按 profile 打分定 target/audience →
  入库 + 哥哥端「新资讯待审」提示（初期人工把关，稳定后可自动发布）
```

- 采集失败的源进入「源健康度」面板（哥哥可见），弟弟维护源列表时参考
- LLM 调用成本：每次采集约 10-20 条 × 数千 token，火山方舟低成本模型完全可覆盖（每月个位数元级）

---

## 7. 分期路线图

| 阶段 | 内容 | 产出物 | 建议节奏 |
|---|---|---|---|
| **P0 地基** | GitHub 私有库初始化 + 后端骨架 + 登录/鉴权 + 用户表 | 能登录、能看到「按人隔离」的空壳 | 1-2 周 |
| **P1 妹妹内容迁移** | 现原型数据层 localStorage → API；东师资讯、学习、诉求、对话全量迁入妹妹账号 | 妹妹账号登录后 = 现在的完整体验 | 1 周 |
| **P2 弟弟板块** | 弟弟账号 + 邓迪学院/机械资讯源接入 + 按弟弟档案的「与我有关」 | 弟弟看到属于自己的时间线；舅舅舅妈 viewer 账号可看 | 2 周 |
| **P3 教材资料库** | 教材 PDF 上传 → 章节拆解 → 哥哥批注 → 妹妹/弟弟互动阅读页 | 第一本教材（动物学）上线 | 2-3 周 |
| **P4 AI 管家真实化** | LLM 接入对话/诉求评估/自测题生成，规则引擎降级为兜底 | 管家真正变聪明 | 1-2 周 |
| **P5 移动体验 + 运维** | PWA、部署稳定化、备份策略（数据库每日导出到网盘/对象存储） | 妹妹手机桌面图标级体验 | 持续 |

---

## 8. 仓库结构（建议）

```
family-board/
├─ apps/
│  ├─ web/            # React SPA（由 sister-board 迁移）
│  └─ api/            # Hono 后端 + cron 采集器
├─ packages/
│  ├─ shared/         # 类型、权限常量、LLM prompt 模板
│  └─ config/         # 资讯源配置（弟弟维护的主战场之一）
├─ docs/              # 架构图、数据字典、运维手册
├─ .github/workflows/ # CI
└─ docker-compose.yml # api + web + postgres 一键起
```

**弟弟的协作切入点**（由浅入深）：① `packages/config` 资讯源配置与验证 ② 邓迪学院板块前端 ③ 采集器鲁棒性（去重/正文抽取）④ 机械学习板块内容。

---

## 9. 安全与隐私基线

- 密码 argon2 哈希，登录失败限速；JWT 放 HttpOnly Cookie
- `.env` 一律 gitignore，仓库只留 `.env.example`；数据库不进 git
- 私有仓库 + 分支保护（main 需 PR + CI 绿）
- HTTPS 必须（Cloudflare Tunnel 自带）；不采集需登录才能看的校内系统
- 数据库每日自动备份（cron + rclone 到网盘），保留 30 天

---

## 10. 待确认清单 ❓

1. **部署在哪**：家里电脑 24h 开机 + Cloudflare Tunnel？还是买台云服务器（约 ¥100/年 级）？
2. **仓库归属**：用谁的 GitHub 账号开组织/仓库？命名（如 `family-board`）？
3. **舅舅舅妈的使用形态**：手机浏览器收藏打开即可，还是也要「装个图标」的体验（PWA）？
4. **弟弟的账号信息**：用户名/初始密码你来定，还是我先占位后由你改？
5. **邓迪学院资讯源**：除学院官网外，弟弟有没有已知的公众号/群通知渠道？（公众号抓取受限，以官网+教务系统公开页为主）
6. **LLM 预算与 key**：用火山方舟（需要 API key）还是你有别的现成渠道？

---

*规划起草：2026-09-15 · 基于 sister-board 原型现状与弟弟背景材料（邓迪学院机械及其自动化 · 全英文授课 · 大一）*
