export type RequirementKind = 'must' | 'nice' | 'responsibility' | 'ai' | 'product' | 'domain'
export type Strength = 0 | 1 | 2 | 3 | 4 | 5
export type VerificationStatus = 'verified' | 'partial' | 'unverified'
export type DecisionStatus = 'pending' | 'accepted' | 'edited' | 'rejected'
export type JobStage = '关注' | '准备中' | '已投递' | '面试中' | '已结束'

export interface JobSource {
  name: string
  url: string
  capturedAt: string
}

export interface Requirement {
  id: string
  jobId: string
  text: string
  kind: RequirementKind
  weight: number
  keywords: string[]
}

export interface Job {
  id: string
  company: string
  title: string
  location: string
  salary: string
  stage: JobStage
  score: number
  updatedAt: string
  tags: string[]
  source: JobSource
  jd: string
  requirements: Requirement[]
}

export interface EvidenceLink {
  label: string
  url: string
  type: 'github' | 'demo' | 'prd' | 'screenshot' | 'report'
}

export interface Evidence {
  id: string
  project: string
  title: string
  role: string
  capability: string[]
  action: string
  result: string
  summary: string
  verification: VerificationStatus
  links: EvidenceLink[]
  metrics: string[]
  updatedAt: string
}

export interface EvidenceMatch {
  requirementId: string
  evidenceIds: string[]
  strength: Strength
  confidence: number
  reason: string
  gap: string | null
}

export interface ScoreBreakdown {
  hardRequirement: number
  evidenceStrength: number
  domainRelevance: number
  preferenceFit: number
  evidenceCompleteness: number
  total: number
}

export interface DecisionLog {
  id: string
  targetType: 'match' | 'portfolio' | 'interview'
  targetId: string
  status: DecisionStatus
  note: string
  evidenceIds?: string[]
  createdAt: string
}

export interface PortfolioSection {
  id: string
  title: string
  body: string
  evidenceIds: string[]
  status: DecisionStatus
}

export interface InterviewRecord {
  id: string
  jobId: string
  question: string
  answer: string
  evidenceIds: string[]
  confidence: number
  weakness: string
  nextAction: string
  status: DecisionStatus
}
