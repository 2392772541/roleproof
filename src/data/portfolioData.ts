export interface PortfolioProject {
  id: string
  name: string
  tagline: string
  problem: string
  users: string
  role: string
  decisions: string[]
  delivery: string[]
  proof: Array<{ label: string; url: string }>
  verifiedMetrics: string[]
  limitations: string[]
  interviewValue: string[]
}

export const portfolioProjects: PortfolioProject[] = [
  {
    id: 'roleproof',
    name: 'RoleProof 职证台',
    tagline: '把岗位要求与个人项目证据连接成可审核的求职决策工作流。',
    problem: '简历生成工具容易把“表达优化”误当作“能力证明”：用户看见匹配分，却无法说明是哪条项目事实支撑了结论，也无法区分模型建议与真实经历。',
    users: '投递 AI 产品经理、Agent 产品经理和 AIGC 产品经理的中国求职者。',
    role: '个人独立项目：产品定义、数据建模、交互设计、规则引擎、前端实现、测试与发布。',
    decisions: [
      '将核心对象从生成文案改为 Evidence，所有下游内容必须引用合法 Evidence ID。',
      'AI 匹配默认 Pending，用户必须 Accept / Edit / Reject；人工决定真实改变评分与下游生成。',
      '没有证据时显示 Gap，不用语言包装掩盖能力缺口。',
      '先用无需 API Key 的 Rule Mode保证面试现场可重复演示，再为模型 Adapter 保留协议。',
    ],
    delivery: ['7 个工作台页面', '严格 Schema 与关系校验', '桌面与 390px 移动端流程', 'GitHub Pages 自动部署', 'PRD、案例复盘、评测与 AI 边界文档'],
    proof: [
      { label: '在线 Demo', url: 'https://2392772541.github.io/roleproof/' },
      { label: 'GitHub', url: 'https://github.com/2392772541/roleproof' },
      { label: '案例复盘', url: 'https://github.com/2392772541/roleproof/blob/main/docs/case-study.md' },
      { label: '评测方案', url: 'https://github.com/2392772541/roleproof/blob/main/docs/evaluation-plan.md' },
    ],
    verifiedMetrics: ['12 条 Vitest 测试', '26 个桌面/移动端 E2E 用例运行', '5 维可解释评分', '100% Evidence ID 合法性校验'],
    limitations: ['默认数据保存在 localStorage', '尚未接入真实招聘平台', '规则解析不能替代复杂语义模型', '尚无真实求职用户样本与转化数据'],
    interviewValue: ['问题定义与 MVP 取舍', 'Human-in-the-loop', 'AI 可信度与证据链', '评测与回归测试', '从原型到公开部署'],
  },
  {
    id: 'flowerops',
    name: 'FlowerOps AI 花掌柜',
    tagline: '面向鲜切花经营的可解释 AI 决策与安全执行工作台。',
    problem: '经营系统中的 AI 如果只给建议，没有业务证据、权限校验、人工审批和幂等执行，就无法安全进入采购、库存和应收等高影响流程。',
    users: '鲜切花批发、社区花店与花艺工作室的经营者和岗位协作者。',
    role: '个人独立项目：业务建模、AI 动作边界、审批流程、状态机、原型实现与测试。',
    decisions: [
      '把 AI 输出定义为“动作提案”而不是直接执行指令。',
      '每个提案必须展示经营证据、预期影响、风险和将要发生的写操作。',
      '采购只创建草稿，不自动发送供应商；退款、核销、调价等高风险动作由人工完成。',
      '用状态机、权限矩阵和幂等键阻止跳级、重复执行和越权写入。',
    ],
    delivery: ['经营总览与异常诊断', 'AI 决策中心', '采购、库存、订单、客户与应收', '审计中心', '可导出的合成演示数据'],
    proof: [
      { label: '在线 Demo', url: 'https://2392772541.github.io/flowerops-ai/' },
      { label: 'GitHub', url: 'https://github.com/2392772541/flowerops-ai' },
      { label: '面试讲解稿', url: 'https://github.com/2392772541/flowerops-ai/blob/main/docs/interview-story.md' },
      { label: 'AI 边界', url: 'https://github.com/2392772541/flowerops-ai/blob/main/docs/AI-boundary.md' },
    ],
    verifiedMetrics: ['43 条领域规则与治理测试', '8 个业务页面', '6 类角色权限', '审批到审计的完整闭环'],
    limitations: ['业务数据全部为合成演示数据', '预测规则为透明 MVP 规则而非行业模型', '未连接真实 ERP、支付和供应商系统'],
    interviewValue: ['B 端业务建模', 'Agent 安全执行', '权限与审计', '异常到行动的闭环', '高风险动作的人机分工'],
  },
  {
    id: 'signaldesk',
    name: 'SignalDesk 知竞台',
    tagline: '把碎片化 AI 动态转成可追溯、可审核、能驱动产品决策的竞争情报。',
    problem: 'RSS 与 AI 摘要只能回答“发生了什么”，无法持续回答证据来自哪里、多个信号是否属于同一事件、判断是否被人工确认，以及最终影响了哪个产品决策。',
    users: '需要持续跟踪 AI 行业、竞品能力和产品机会的产品经理与研究人员。',
    role: '个人独立项目：信息架构、事件数据模型、审核规则、报告流程、前端实现与质量验证。',
    decisions: [
      '区分原始信号、行业事件、AI 判断、人工修订和产品决策，避免来源事实与模型推断混在一起。',
      '未审核事件不能进入正式周报；已被报告或决策引用的事件不能直接驳回。',
      '报告只引用已审核事件，并保留原始证据地址、审核备注和人工修订内容。',
      '把情报终点从“生成摘要”推进到负责人、行动状态和历史复盘。',
    ],
    delivery: ['信号收件箱', '事件证据工作台', '竞品能力矩阵', '人工审核队列', '周报与产品决策日志'],
    proof: [
      { label: '在线 Demo', url: 'https://2392772541.github.io/signaldesk-ai-intelligence-workbench/' },
      { label: 'GitHub', url: 'https://github.com/2392772541/signaldesk-ai-intelligence-workbench' },
      { label: '面试讲解稿', url: 'https://github.com/2392772541/signaldesk-ai-intelligence-workbench/blob/main/docs/interview-guide.md' },
      { label: '竞品研究', url: 'https://github.com/2392772541/signaldesk-ai-intelligence-workbench/blob/main/docs/competitive-research.md' },
    ],
    verifiedMetrics: ['28 条规则/持久化/界面回归测试', '8 类竞品能力维度', '事件引用与审核状态关系校验', '桌面与移动端截图证据'],
    limitations: ['默认新闻与指标为模拟数据', '尚未接入定时采集和真实 RSS', '当前影响判断由规则模式演示'],
    interviewValue: ['竞品研究方法', '来源可信度', 'AI 审核工作流', '从洞察到决策', '数据关系与一致性'],
  },
]

export const interviewCapabilityMap = [
  { capability: '问题定义与业务价值', evidence: '三个项目均从具体业务风险出发，而不是从“接入大模型”出发', demo: '项目档案 → 问题与用户', interviewer: '为什么值得做？不用 AI 能否解决？' },
  { capability: 'MVP 与优先级', evidence: 'Rule Mode、localStorage、合成数据优先保证闭环和可演示性', demo: '项目档案 → 关键产品决策', interviewer: '为什么先做这些，没做哪些？' },
  { capability: 'AI 能力边界', evidence: '建议与事实分离；高风险写入必须审批；未审核结论不可发布', demo: '证据匹配 / FlowerOps / SignalDesk', interviewer: '模型错了会怎样？谁负责最终决策？' },
  { capability: 'Evaluation', evidence: '固定测试、关系校验、桌面/移动 E2E、错误场景回归', demo: '评测证据与 GitHub Actions', interviewer: '你如何判断 AI 功能真的变好？' },
  { capability: '产品落地能力', evidence: 'React 原型、文档、测试、GitHub、在线 Demo 形成公开证据包', demo: '直接打开 Demo 与仓库', interviewer: '你具体做了什么，如何证明？' },
]

export const researchSources = [
  { label: '百度招聘', url: 'https://talent.baidu.com/jobs/list', note: '用于核对大模型、智能体、评测与平台类产品岗位的职责表述。' },
  { label: '字节跳动招聘', url: 'https://jobs.bytedance.com/experienced/position', note: '用于核对 AI 产品规划、跨团队落地、数据指标和行业场景要求。' },
  { label: '腾讯招聘', url: 'https://careers.tencent.com/search.html', note: '用于核对平台产品、商业化、用户研究和技术理解要求。' },
  { label: 'OpenAI Evaluation best practices', url: 'https://platform.openai.com/docs/guides/evaluation-best-practices', note: '用于设计任务级评测、持续回归和人工标注基线。' },
]
