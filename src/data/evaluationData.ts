import type { RequirementKind } from '../domain/types'

export interface EvaluationCase {
  id: string
  title: string
  sourceType: '合成研究样本'
  jd: string
  expectedTerms: string[]
  expectedKinds: RequirementKind[]
}

export const evaluationCases: EvaluationCase[] = [
  {
    id: 'EVAL-01',
    title: 'Agent 与安全执行',
    sourceType: '合成研究样本',
    jd: '负责企业级 AI Agent 产品规划与工作流设计；建立模型评测体系并推动版本迭代；关键动作需经过人工审批并保留审计记录。',
    expectedTerms: ['Agent', '工作流', '评测', '人工审批', '审计'],
    expectedKinds: ['ai', 'ai', 'responsibility'],
  },
  {
    id: 'EVAL-02',
    title: 'RAG 与可信回答',
    sourceType: '合成研究样本',
    jd: '负责企业知识库、RAG 检索与问答产品；设计引用校验、拒答和人工反馈机制；关注隐私、延迟与成本。',
    expectedTerms: ['RAG', '引用', '拒答', '人工反馈', '隐私', '延迟', '成本'],
    expectedKinds: ['ai', 'ai', 'ai'],
  },
  {
    id: 'EVAL-03',
    title: '产品基本功',
    sourceType: '合成研究样本',
    jd: '完成用户研究、需求分析、PRD 和原型设计；建立数据指标并持续迭代；推动算法、研发、设计与业务团队协作。',
    expectedTerms: ['用户研究', '需求分析', 'PRD', '原型', '数据指标', '迭代', '团队协作'],
    expectedKinds: ['product', 'product', 'responsibility'],
  },
  {
    id: 'EVAL-04',
    title: '内容可信与人工审核',
    sourceType: '合成研究样本',
    jd: '负责 AIGC 内容生成与行业情报产品；建立来源引用、事实核验与风险分层；设计人工审核、修改、驳回和反馈闭环。',
    expectedTerms: ['AIGC', '内容生成', '来源引用', '事实核验', '风险分层', '人工审核', '反馈'],
    expectedKinds: ['ai', 'ai', 'product'],
  },
]
