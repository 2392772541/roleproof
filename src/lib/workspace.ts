import { z } from 'zod'
import type { DecisionLog, Evidence, InterviewRecord, Job, PortfolioSection } from '../domain/types'

const requirementKindSchema = z.enum(['must', 'nice', 'responsibility', 'ai', 'product', 'domain'])
const decisionStatusSchema = z.enum(['pending', 'accepted', 'edited', 'rejected'])
const jobStageSchema = z.enum(['关注', '准备中', '已投递', '面试中', '已结束'])
const verificationSchema = z.enum(['verified', 'partial', 'unverified'])

const requirementSchema = z.object({
  id: z.string().trim().min(1),
  jobId: z.string().trim().min(1),
  text: z.string().trim().min(1),
  kind: requirementKindSchema,
  weight: z.number().finite().min(1).max(10),
  keywords: z.array(z.string().trim().min(1)).max(20),
}).strict()

const jobSchema = z.object({
  id: z.string().trim().min(1),
  company: z.string().trim().min(1),
  title: z.string().trim().min(1),
  location: z.string(),
  salary: z.string(),
  stage: jobStageSchema,
  score: z.number().finite().min(0).max(100),
  updatedAt: z.string(),
  tags: z.array(z.string()),
  source: z.object({ name: z.string().trim().min(1), url: z.string(), capturedAt: z.string().trim().min(1) }).strict(),
  jd: z.string().trim().min(1),
  requirements: z.array(requirementSchema).min(1),
}).strict()

const evidenceLinkSchema = z.object({
  label: z.string().trim().min(1),
  url: z.string(),
  type: z.enum(['github', 'demo', 'prd', 'screenshot', 'report']),
}).strict()

const evidenceSchema = z.object({
  id: z.string().trim().min(1),
  project: z.string().trim().min(1),
  title: z.string().trim().min(1),
  role: z.string().trim().min(1),
  capability: z.array(z.string().trim().min(1)).min(1),
  action: z.string().trim().min(1),
  result: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  verification: verificationSchema,
  links: z.array(evidenceLinkSchema),
  metrics: z.array(z.string()),
  updatedAt: z.string().trim().min(1),
}).strict()

const decisionSchema = z.object({
  id: z.string().trim().min(1),
  targetType: z.enum(['match', 'portfolio', 'interview']),
  targetId: z.string().trim().min(1),
  status: decisionStatusSchema,
  note: z.string(),
  evidenceIds: z.array(z.string().trim().min(1)).optional(),
  createdAt: z.string().trim().min(1),
}).strict()

const portfolioSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string(),
  body: z.string(),
  evidenceIds: z.array(z.string().trim().min(1)),
  status: decisionStatusSchema,
}).strict()

const interviewSchema = z.object({
  id: z.string().trim().min(1),
  jobId: z.string().trim().min(1),
  question: z.string().trim().min(1),
  answer: z.string(),
  evidenceIds: z.array(z.string().trim().min(1)),
  confidence: z.number().finite().min(0).max(100),
  weakness: z.string(),
  nextAction: z.string(),
  status: decisionStatusSchema,
}).strict()

const workspaceSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string().optional(),
  jobs: z.array(jobSchema).min(1),
  evidence: z.array(evidenceSchema),
  decisions: z.array(decisionSchema),
  portfolio: z.array(portfolioSchema),
  interviews: z.array(interviewSchema),
}).strict()

export interface WorkspaceData {
  jobs: Job[]
  evidence: Evidence[]
  decisions: DecisionLog[]
  portfolio: PortfolioSection[]
  interviews: InterviewRecord[]
}

function assertUniqueIds(items: Array<{ id: string }>, label: string) {
  const seen = new Set<string>()
  for (const item of items) {
    if (seen.has(item.id)) throw new Error(`${label} 存在重复 ID：${item.id}`)
    seen.add(item.id)
  }
}

function validateRelations(data: WorkspaceData) {
  assertUniqueIds(data.jobs, '职位')
  assertUniqueIds(data.evidence, '证据')
  assertUniqueIds(data.decisions, '决策记录')
  assertUniqueIds(data.portfolio, '作品集段落')
  assertUniqueIds(data.interviews, '面试记录')

  const requirementIds = new Set<string>()
  for (const job of data.jobs) {
    for (const requirement of job.requirements) {
      if (requirement.jobId !== job.id) throw new Error(`岗位要求 ${requirement.id} 的 jobId 不一致`)
      if (requirementIds.has(requirement.id)) throw new Error(`岗位要求存在重复 ID：${requirement.id}`)
      requirementIds.add(requirement.id)
    }
  }

  const jobIds = new Set(data.jobs.map((item) => item.id))
  const evidenceIds = new Set(data.evidence.map((item) => item.id))
  for (const record of data.interviews) {
    if (!jobIds.has(record.jobId)) throw new Error(`面试记录 ${record.id} 引用了不存在的职位`)
  }

  return {
    ...data,
    portfolio: data.portfolio.map((section) => ({ ...section, evidenceIds: section.evidenceIds.filter((id) => evidenceIds.has(id)) })),
    interviews: data.interviews.map((record) => ({ ...record, evidenceIds: record.evidenceIds.filter((id) => evidenceIds.has(id)) })),
    decisions: data.decisions.filter((decision) => {
      if (decision.targetType === 'match') return requirementIds.has(decision.targetId)
      if (decision.targetType === 'portfolio') return data.portfolio.some((item) => item.id === decision.targetId)
      return data.interviews.some((item) => item.id === decision.targetId)
    }),
  }
}

export function parseWorkspaceImport(input: unknown): WorkspaceData {
  const parsed = workspaceSchema.safeParse(input)
  if (!parsed.success) throw new Error('工作区文件结构不完整或字段类型错误')
  return validateRelations(parsed.data as WorkspaceData)
}

export function parseStoredJobs(input: unknown): Job[] {
  const parsed = z.array(jobSchema).min(1).safeParse(input)
  if (!parsed.success) throw new Error('职位缓存无效')
  const jobs = parsed.data as Job[]
  validateRelations({ jobs, evidence: [], decisions: [], portfolio: [], interviews: [] })
  return jobs
}

export function parseStoredEvidence(input: unknown): Evidence[] {
  const parsed = z.array(evidenceSchema).safeParse(input)
  if (!parsed.success) throw new Error('证据缓存无效')
  const evidence = parsed.data as Evidence[]
  assertUniqueIds(evidence, '证据')
  return evidence
}

export const parseStoredDecisions = (input: unknown) => z.array(decisionSchema).parse(input) as DecisionLog[]
export const parseStoredPortfolio = (input: unknown) => z.array(portfolioSchema).parse(input) as PortfolioSection[]
export const parseStoredInterviews = (input: unknown) => z.array(interviewSchema).parse(input) as InterviewRecord[]
export const parseStoredSelectedJobId = (input: unknown) => z.string().min(1).parse(input)
