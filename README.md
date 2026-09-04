# RoleProof 职证台

> 面向中国 AI 产品经理求职场景的职位情报、项目证据与岗位作品集工作台。

RoleProof 不用一个黑箱百分比告诉用户“你适合这个岗位”，也不会在缺少真实经历时替用户编造项目。它把每条岗位要求连接到真实的项目证据、个人行动、成果指标和材料地址，并将 AI 建议保留为可编辑、可拒绝、可追溯的中间结果。

## 产品截图

### 工作台总览

![RoleProof 工作台总览](docs/roleproof-overview.png)

### Job × Evidence 证据矩阵

![岗位要求与项目证据匹配矩阵](docs/roleproof-match.png)

### 岗位定制作品集

![岗位定制作品集](docs/roleproof-portfolio.png)

### 移动端

![RoleProof 移动端界面](docs/roleproof-mobile.png)

## 核心闭环

```text
职位情报
→ JD 结构化解析
→ 岗位要求 × 项目证据匹配
→ 人工 Accept / Edit / Reject
→ 岗位定制作品集
→ 面试准备
→ 面试复盘
→ 证据缺口补强
```

## 它解决什么问题

普通简历生成器通常把输入直接变成一段更好看的文本，但求职者仍然难以回答三个问题：

1. 这个岗位究竟要求什么？
2. 我的哪个项目能够证明我具备这项能力？
3. 生成出的描述是否来自真实材料，而不是模型补写？

RoleProof 把核心资产从“生成文本”改为“可核验的 Evidence（项目证据）”。作品集段落、匹配建议和面试问题都必须引用 Evidence ID；没有证据时显示 Gap，而不是自动包装。

## 当前可用能力

### 职位情报

- 录入公司、岗位、地点、薪资、阶段、标签、来源和完整 JD。
- 保存后自动执行中文 JD 结构化解析。
- 相同公司与岗位触发重复提醒，但不会未经确认自动覆盖。
- 支持多岗位切换和投递阶段管理。

### 岗位解析

- Rule Mode 在没有 API Key 的情况下完整运行。
- 将岗位要求拆为硬性要求、产品能力、AI 能力、领域能力和加分项。
- 支持人工修改要求原文、分类、权重和关键词。
- 原始 JD 始终保留，不被解析结果覆盖。

### Job × Evidence 证据矩阵

- 为每条 Requirement 推荐对应 Evidence。
- 显示匹配理由、关键词、证据强度和缺口。
- 支持 Accept、Edit、Reject 三种人工决策；Edit 可修改实际 Evidence ID，Reject 会约束评分和下游生成。
- 所有决定进入 Decision Log，避免 AI 建议被直接当作事实。

### 项目证据库

- 新建项目、证据标题、个人角色、项目介绍、真实行动和可验证结果。
- 保存能力标签、指标、验证状态、GitHub、Demo 和 PRD 地址。
- 支持按项目、能力与 Evidence ID 搜索。
- 示例中缺失的材料显示为“待补”，不会伪装成可访问链接。

### 作品集工坊

- 根据当前岗位和已确认的证据生成定制作品集。
- 强制检查作品集中的 Evidence ID 是否真实存在。
- 支持人工编辑；再次生成时保留已经编辑或确认的段落，避免内容丢失。
- 没有证据支撑的能力明确显示为待补缺口。

### 面试准备与复盘

- 根据岗位要求和证据生成针对性面试问题。
- 用户自己填写真实回答，AI 不代替用户编造经历。
- 记录信心、薄弱点和下一步补强行动。
- 将面试暴露的问题重新连接到证据库。

### 数据与隐私

- 数据默认保存在浏览器 `localStorage`，不会自动上传服务器。
- 支持职位、证据和决策记录的 JSON 导入导出。
- 内置数据均为演示数据，不代表真实招聘公司或真实业务成绩。

## 产品设计亮点

### 1. Evidence-grounded Generation

每条生成内容都应能回到 Evidence ID。这个约束用来降低“写得很好看，但无法在面试中证明”的风险。

### 2. Human-in-the-loop

AI 只负责提出建议；岗位要求校正、证据采用、作品集内容和面试回答都保留人工控制。

### 3. 显式 Gap

当项目证据不足时，系统显示缺口。缺口本身会成为下一步学习、补项目或补材料的任务。

### 4. 可解释评分

```text
硬性要求覆盖      0–40
项目证据强度      0–30
领域相关性        0–15
岗位偏好          0–10
证据完整度         0–5
----------------------
总分              0–100
```

总分由子分相加产生，不保存独立的黑箱分数。

## 快速运行

要求 Node.js 20 或更高版本。

```bash
npm install
npm run dev
```

终端会显示本地访问地址，通常为 `http://localhost:5173`。

## 质量检查

### 单元检查

```bash
npm run check
```

依次执行：

1. `oxlint` 静态检查。
2. `vitest run` 规则引擎测试。
3. TypeScript 编译。
4. Vite 生产构建。

### 完整检查

```bash
npm run check:all
```

在上述检查后继续执行 Playwright 端到端测试，覆盖：

- 桌面端和 390px 移动端。
- 职位录入与 JD 自动解析。
- Requirement 人工校正。
- Evidence 新建和搜索。
- 证据匹配与 Accept 决策。
- 岗位作品集生成及 Evidence ID 校验。
- 面试问题、回答和复盘，并验证再次生成不会覆盖人工内容。
- JSON 导出。
- Console Error、Page Error 和移动端页面宽度。

## GitHub Pages 部署

仓库包含 `.github/workflows/deploy-pages.yml`。推送到 `main` 后：

1. 打开 GitHub 仓库的 **Settings → Pages**。
2. 在 **Build and deployment** 中将 Source 设为 **GitHub Actions**。
3. 打开 **Actions**，确认 `Deploy RoleProof to GitHub Pages` 执行成功。
4. 部署完成后，将 Pages 地址补到仓库 About 和本 README 顶部。

Workflow 会在部署前执行 `npm ci`、`npm run check` 和生产构建。Vite 使用相对资源路径，因此不依赖固定仓库名。

## 项目结构

```text
src/
├─ components/        通用组件与录入表单
├─ data/              中文演示职位与项目证据
├─ domain/            Job、Requirement、Evidence 等领域模型
├─ hooks/             localStorage 持久化
├─ lib/               JD 解析、匹配、评分和生成规则
└─ pages/             七个核心工作台页面
e2e/                   Playwright 端到端测试
docs/
├─ PRD.md
├─ ai-boundary.md
├─ competitive-research.md
├─ data-model.md
├─ evaluation-plan.md
├─ case-study.md
└─ roleproof-*.png
.github/workflows/     GitHub Pages 自动部署
```

## 文档

- [PRD](docs/PRD.md)
- [产品案例复盘](docs/case-study.md)
- [数据模型](docs/data-model.md)
- [AI 能力边界](docs/ai-boundary.md)
- [评测方案](docs/evaluation-plan.md)
- [竞品研究](docs/competitive-research.md)
- [可行性与缺陷审计](docs/feasibility-and-bug-audit.md)

## 下一步路线

- 接入可替换的 OpenAI、DeepSeek、Gemini 和 Ollama Adapter。
- 增加材料附件和截图管理。
- 增加可打印、可分享的岗位作品集页面。
- 建立脱敏后的真实中文 JD 评估集。
- 增加解析准确率、证据采纳率和人工修改率仪表盘。
- 增加多设备同步与用户权限体系。

## 项目状态

截至 2026 年 9 月 4 日，核心离线闭环、数据导入导出、桌面/移动端测试与 GitHub Pages Workflow 已完成。在线地址需在仓库推送后由仓库所有者启用 GitHub Pages。

## License

MIT
