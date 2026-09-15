# University Copilot

给弟弟妹妹各自的大学学习看板：学校资讯时间线、AI 解读「与我有关」、学习打卡、AI 管家对话，以及哥哥侧的工作看板（诉求推进 BI）。舅舅舅妈以只读身份关注弟弟的板块。

> 当前状态：**P0/P1 原型** —— 单机本地存储 + 前端规则引擎，账号体系与数据隔离已按正式架构落地。
> 演进规划见 [docs/PLAN.md](docs/PLAN.md)。

## 功能

| 角色 | 账号（原型默认） | 能看到什么 |
|---|---|---|
| 哥哥（Admin） | `gege` / `gege123` | 工作看板 `/brother`：切换查看妹妹/弟弟的诉求、推进状态、学习进度、悄悄话 |
| 妹妹（Kid） | `meimei` / `meimei123` | 东师官方资讯时间线、与我有关（AI 解读）、学习打卡、AI 管家、和哥哥聊聊 |
| 弟弟（Kid） | `didi` / `didi123` | 邓迪学院·机械资讯时间线、与我有关、学习打卡、AI 管家、和哥哥聊聊 |
| 舅舅舅妈（Viewer） | `jiujiu` / `jiujiu123` | 只读观看弟弟的板块（无对话、无编辑） |

## 技术栈

React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui · react-router v7 · 本地状态自研 store（localStorage + sessionStorage，接口已按后端化设计）

## 快速开始

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 产物在 dist/
```

开发调试直达登录（原型功能，正式版移除）：`http://localhost:3000/?u=meimei&p=meimei123`

## 目录结构

```
src/
├─ pages/          # Login / Home（三个看板）/ Brother（BI 看板）
├─ components/     # FloatingChat（AI 管家 + 和哥哥聊聊）
├─ store/          # useBoard.ts：账号 + 会话 + 按用户隔离的数据层
├─ agent/          # brain.ts（诉求评估规则引擎）/ relevance.ts（资讯相关性评分）
├─ data/           # content.ts（东师资讯/学科）/ newsDidi.ts（邓迪资讯）
└─ types/          # 共享类型
docs/PLAN.md       # 多用户/后端化/自动化收集的完整规划
```

## 协作规范（哥哥 + 弟弟）

- **分支模型**：`main`（可部署，受保护）· `dev`（日常集成分支）· `feature/xxx`（功能分支，从 `dev` 切出）
- **提交流程**：功能分支开发 → 发 PR 到 `dev` → 至少一人 Review → 合并；`main` 只接受从 `dev` 的 PR
- **Commit 约定**：`feat: xxx` / `fix: xxx` / `docs: xxx` / `chore: xxx`，一句话说清做了什么
- **Issue 用法**：功能需求开 `feature` 标签，bug 开 `bug`，内容源需求（想盯的学校/网站）开 `content-source`
- **弟弟的切入点**：`src/data/newsDidi.ts`（邓迪资讯源维护）→ 邓迪板块前端 → 采集器（P2）

## 安全须知

- 本仓库为**私有仓库**，不含真实敏感数据；`.env*` 一律不进 git
- 原型默认密码仅用于演示，上后端（P0 正式版）时全部重置并改用 argon2 + HTTPS
- `?u=&p=` 直达登录为开发调试功能，部署前移除

## 路线图

- [x] P0 账号体系 + 按角色隔离视图
- [x] P1 妹妹内容全量迁入
- [x] P2a 弟弟板块资讯源（邓迪学院 × 机械）
- [ ] P2b 资讯自动采集流水线（定时抓取 → LLM 分析 → 入库）
- [ ] P3 教材资料库（PDF 拆解 + 哥哥批注 + 互动学习页）
- [ ] P4 AI 管家接真实 LLM
- [ ] P5 后端化（PostgreSQL + Hono）+ 部署 + PWA
