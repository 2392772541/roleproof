import type { Evidence, Job } from '../domain/types'

export const demoEvidence: Evidence[] = [
  {
    id: 'P001', project: 'RoleProof 职证台', title: '岗位要求 × 项目证据的可解释匹配与人工审核闭环',
    role: '个人独立项目｜产品定义、交互、规则引擎、前端、测试与发布',
    capability: ['AI Evaluation', '证据引用', 'HITL', '求职产品', '数据建模', 'Agent 边界'],
    action: '定义 Job、Requirement、Evidence、Match、Decision Log 和 Interview Record；将 AI 建议设为待确认，落实接受、编辑、驳回对评分与下游生成的真实约束。',
    result: '完成 7 个工作台页面、严格导入校验、12 条单元测试、22 个桌面/移动端 E2E 用例运行，并发布 GitHub Pages。',
    summary: '解决“简历写得更好看但无法证明”的问题：所有岗位匹配、作品集段落和面试问题都回到合法 Evidence ID；没有证据时显示 Gap。',
    verification: 'verified',
    links: [
      { label: 'GitHub', url: 'https://github.com/2392772541/roleproof', type: 'github' },
      { label: '在线 Demo', url: 'https://2392772541.github.io/roleproof/', type: 'demo' },
      { label: '案例复盘', url: 'https://github.com/2392772541/roleproof/blob/main/docs/case-study.md', type: 'report' },
      { label: '评测方案', url: 'https://github.com/2392772541/roleproof/blob/main/docs/evaluation-plan.md', type: 'report' },
    ],
    metrics: ['7 个核心页面', '12 条 Vitest', '22 个 E2E 运行', '5 维解释评分'], updatedAt: '2026-09-07',
  },
  {
    id: 'P002', project: 'FlowerOps AI 花掌柜', title: '从经营异常到人工审批、安全执行和审计的 Agent 工作流',
    role: '个人独立项目｜业务建模、产品流程、AI 权限、状态机与原型实现',
    capability: ['Agent 工作流', 'B端产品', '权限与审计', 'HITL', '数据指标', '安全执行'],
    action: '把订单、花束配方、批次库存、采购、客户和应收串联为经营事实；AI 只能形成带证据、风险和预期影响的动作提案，高风险写入经过策略校验与人工批准。',
    result: '完成 8 个业务页面、6 类角色权限、采购草稿与幂等执行闭环，并以 43 条领域规则和治理测试验证关键边界。',
    summary: '证明如何让 Agent 进入真实业务流程但不直接获得数据库写权限；价值不在聊天，而在“异常—诊断—提案—审批—执行—审计”。',
    verification: 'verified',
    links: [
      { label: 'GitHub', url: 'https://github.com/2392772541/flowerops-ai', type: 'github' },
      { label: '在线 Demo', url: 'https://2392772541.github.io/flowerops-ai/', type: 'demo' },
      { label: '面试讲解稿', url: 'https://github.com/2392772541/flowerops-ai/blob/main/docs/interview-story.md', type: 'report' },
      { label: 'AI 边界', url: 'https://github.com/2392772541/flowerops-ai/blob/main/docs/AI-boundary.md', type: 'prd' },
    ],
    metrics: ['43 条测试', '8 个业务页面', '6 类角色权限', '审批到审计闭环'], updatedAt: '2026-09-07',
  },
  {
    id: 'P003', project: 'SignalDesk 知竞台', title: '从多来源信号到人工审核、周报和产品决策的情报闭环',
    role: '个人独立项目｜信息架构、数据模型、审核规则、报告流程与前端实现',
    capability: ['情报分析', '竞品研究', '数据治理', 'HITL', '自动化', '来源可信度'],
    action: '区分原始信号、行业事件、AI 判断、人工修订与产品决策；未审核事件不能进入周报，已被报告或决策引用的事件不能被直接驳回。',
    result: '完成信号收件箱、事件证据、竞品矩阵、审核队列、周报和决策日志，并通过 28 条规则/持久化/界面回归测试。',
    summary: '把“RSS + AI 摘要”升级为可追溯的竞争情报产品：不仅告诉用户发生了什么，还保留证据、判断状态、责任人和后续行动。',
    verification: 'verified',
    links: [
      { label: 'GitHub', url: 'https://github.com/2392772541/signaldesk-ai-intelligence-workbench', type: 'github' },
      { label: '在线 Demo', url: 'https://2392772541.github.io/signaldesk-ai-intelligence-workbench/', type: 'demo' },
      { label: '面试讲解稿', url: 'https://github.com/2392772541/signaldesk-ai-intelligence-workbench/blob/main/docs/interview-guide.md', type: 'report' },
      { label: '竞品研究', url: 'https://github.com/2392772541/signaldesk-ai-intelligence-workbench/blob/main/docs/competitive-research.md', type: 'report' },
    ],
    metrics: ['28 条回归测试', '8 类竞品能力', '审核后才能发布', '桌面与移动端验证'], updatedAt: '2026-09-07',
  },
]

export const demoJobs: Job[] = [
  {
    id: 'J001', company: '公开岗位研究样本 A', title: 'AI 产品经理（Agent / B端工作流）', location: '中国｜城市不限', salary: '不作为投递记录', stage: '准备中', score: 0, updatedAt: '2026-09-07', tags: ['Agent', 'B端', '工作流', '评测'],
    source: { name: '多份公开招聘页能力归纳｜非单一原始 JD', url: 'https://jobs.bytedance.com/experienced/position', capturedAt: '2026-09-07' },
    jd: '该样本用于能力准备而非冒充真实投递：负责 AI Agent 产品规划与企业工作流设计；能够完成用户研究、需求分析、PRD、原型和跨团队落地；理解 RAG、工具调用、模型能力边界与安全策略；建立任务成功率、准确率、延迟、成本和人工接管率等评测指标；有可现场演示、可提供 GitHub 与评测证据的个人项目。',
    requirements: [
      { id: 'R001', jobId: 'J001', text: '能从企业场景定义 AI Agent 产品规划与端到端工作流', kind: 'must', weight: 10, keywords: ['Agent', '工作流', 'B端'] },
      { id: 'R002', jobId: 'J001', text: '能完成用户研究、需求分析、PRD、原型和跨团队落地', kind: 'product', weight: 9, keywords: ['用户研究', 'PRD', '产品'] },
      { id: 'R003', jobId: 'J001', text: '理解 RAG、工具调用、权限、审计和模型能力边界', kind: 'ai', weight: 10, keywords: ['Agent', '权限', '审计', '边界'] },
      { id: 'R004', jobId: 'J001', text: '能建立任务成功率、质量、延迟、成本与人工接管的评测体系', kind: 'ai', weight: 10, keywords: ['AI Evaluation', '评测', '指标'] },
      { id: 'R005', jobId: 'J001', text: '有可运行 Demo、GitHub、文档与测试证据', kind: 'nice', weight: 8, keywords: ['GitHub', 'Demo', '测试'] },
    ],
  },
  {
    id: 'J002', company: '公开岗位研究样本 B', title: '大模型产品经理（评测与平台）', location: '中国｜城市不限', salary: '不作为投递记录', stage: '关注', score: 0, updatedAt: '2026-09-07', tags: ['大模型', 'Evaluation', '平台'],
    source: { name: '公开招聘入口能力归纳｜非单一原始 JD', url: 'https://talent.baidu.com/jobs/list', capturedAt: '2026-09-07' },
    jd: '该样本用于面试能力校验：负责大模型能力评估、产品化和版本迭代；定义测试集、评分准则、错误分类和人工标注基线；对比 Prompt、模型、知识与工具版本；理解结构化输出、幻觉、拒答、隐私、成本和延迟；能把评测结果转成产品优先级与迭代路线。',
    requirements: [
      { id: 'R101', jobId: 'J002', text: '建立测试集、评分准则、错误分类和人工标注基线', kind: 'must', weight: 10, keywords: ['AI Evaluation', '评测', '测试'] },
      { id: 'R102', jobId: 'J002', text: '能比较 Prompt、模型、知识和工具版本并驱动迭代', kind: 'ai', weight: 10, keywords: ['Prompt', '模型', '迭代'] },
      { id: 'R103', jobId: 'J002', text: '理解幻觉、拒答、隐私、成本、延迟和降级策略', kind: 'ai', weight: 9, keywords: ['边界', '安全执行', '来源可信度'] },
      { id: 'R104', jobId: 'J002', text: '把评测结果转成产品优先级与路线图', kind: 'product', weight: 9, keywords: ['产品', '数据指标', '决策'] },
    ],
  },
  {
    id: 'J003', company: '公开岗位研究样本 C', title: 'AI 产品经理（行业情报 / 内容可信）', location: '中国｜城市不限', salary: '不作为投递记录', stage: '关注', score: 0, updatedAt: '2026-09-07', tags: ['AIGC', '情报', '可信度', 'HITL'],
    source: { name: '公开招聘入口能力归纳｜非单一原始 JD', url: 'https://careers.tencent.com/search.html', capturedAt: '2026-09-07' },
    jd: '该样本用于作品集准备：能够围绕信息采集、内容生成或知识问答定义用户问题；建立来源引用、事实与推断分层、人工审核和反馈闭环；用数据指标评估准确性、覆盖率、人工修改率和内容风险；推动产品从信息处理进入可执行决策。',
    requirements: [
      { id: 'R201', jobId: 'J003', text: '围绕信息采集、内容生成或知识问答定义真实用户问题', kind: 'must', weight: 10, keywords: ['情报分析', '用户研究', '产品'] },
      { id: 'R202', jobId: 'J003', text: '建立来源引用、事实与推断分层和内容可信度机制', kind: 'ai', weight: 10, keywords: ['证据引用', '来源可信度', '数据治理'] },
      { id: 'R203', jobId: 'J003', text: '设计人工审核、修改、驳回和反馈闭环', kind: 'product', weight: 9, keywords: ['HITL', '审核', '反馈'] },
      { id: 'R204', jobId: 'J003', text: '用准确性、覆盖率和人工修改率驱动产品迭代', kind: 'ai', weight: 9, keywords: ['评测', '数据指标', '迭代'] },
    ],
  },
]
