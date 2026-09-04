import type { Evidence, EvidenceMatch, Job, Requirement, RequirementKind, ScoreBreakdown } from '../domain/types'

const taxonomy: Array<{ kind: RequirementKind; keywords: string[] }> = [
  { kind: 'ai', keywords: ['Agent', '智能体', 'RAG', '大模型', 'Prompt', '评测', '模型', '工具调用', 'Embedding'] },
  { kind: 'product', keywords: ['需求分析', 'PRD', '原型', '用户研究', '指标', '迭代', '产品规划'] },
  { kind: 'domain', keywords: ['教育', '电商', '营销', '金融', '医疗', 'B端', '企业', '内容'] },
  { kind: 'nice', keywords: ['优先', '加分', '最好', '熟悉'] },
]

const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, '')

export function parseJD(jobId: string, jd: string): Requirement[] {
  const pieces = jd
    .split(/[。；;\n]/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 6)

  return pieces.map((text, index) => {
    const matched = taxonomy.find((group) => group.keywords.some((word) => normalize(text).includes(normalize(word))))
    const nice = /优先|加分|熟悉/.test(text)
    const kind: RequirementKind = nice ? 'nice' : matched?.kind ?? (index < 2 ? 'must' : 'responsibility')
    const keywords = taxonomy
      .flatMap((group) => group.keywords)
      .filter((word) => normalize(text).includes(normalize(word)))
      .slice(0, 4)
    return {
      id: `${jobId}-AUTO-${index + 1}`,
      jobId,
      text,
      kind,
      weight: kind === 'must' ? 10 : kind === 'nice' ? 5 : kind === 'ai' ? 9 : 7,
      keywords: keywords.length ? keywords : text.split(/[、，,]/).slice(0, 2),
    }
  })
}

function evidenceText(evidence: Evidence) {
  return normalize([
    evidence.project,
    evidence.title,
    evidence.summary,
    evidence.action,
    evidence.result,
    ...evidence.capability,
    ...evidence.metrics,
  ].join(' '))
}

export function matchRequirement(requirement: Requirement, evidenceList: Evidence[]): EvidenceMatch {
  const candidates = evidenceList
    .map((evidence) => {
      const haystack = evidenceText(evidence)
      const hits = requirement.keywords.filter((keyword) => haystack.includes(normalize(keyword)))
      const semanticHints = requirement.kind === 'ai'
        ? evidence.capability.filter((item) => /RAG|Agent|评估|审核|幻觉|模型|Prompt/.test(item))
        : requirement.kind === 'product'
          ? evidence.capability.filter((item) => /产品|工作流|数据|HITL|B端/.test(item))
          : []
      const topicalScore = hits.length * 2 + Math.min(semanticHints.length, 2)
      const verificationBoost = topicalScore > 0 ? (evidence.verification === 'verified' ? 1 : evidence.verification === 'partial' ? 0.4 : 0) : 0
      return { evidence, score: topicalScore + verificationBoost, hits }
    })
    .filter((candidate) => candidate.score > 0.4)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)

  if (!candidates.length) {
    return {
      requirementId: requirement.id,
      evidenceIds: [],
      strength: 0,
      confidence: 28,
      reason: '当前证据库没有找到能够直接支撑该要求的项目材料。',
      gap: '建议补充真实项目、PRD、Demo、指标或复盘材料。',
    }
  }

  const top = candidates[0]
  const strength = Math.max(1, Math.min(5, Math.round(top.score))) as EvidenceMatch['strength']
  const confidence = Math.min(96, 48 + Math.round(top.score * 9))
  const matchedWords = Array.from(new Set(candidates.flatMap((item) => item.hits)))
  return {
    requirementId: requirement.id,
    evidenceIds: candidates.map((candidate) => candidate.evidence.id),
    strength,
    confidence,
    reason: matchedWords.length
      ? `证据中出现 ${matchedWords.join('、')}，且项目行动与成果可被材料验证。`
      : '项目能力类型与岗位要求接近，但仍需人工确认场景是否真正一致。',
    gap: strength >= 4 ? null : '相关性存在，但建议补充更直接的业务指标或岗位同领域案例。',
  }
}

export function buildMatches(job: Job, evidenceList: Evidence[]) {
  return job.requirements.map((requirement) => matchRequirement(requirement, evidenceList))
}

export function calculateScore(job: Job, matches: EvidenceMatch[], evidenceList: Evidence[]): ScoreBreakdown {
  const lookup = new Map(matches.map((match) => [match.requirementId, match]))
  const must = job.requirements.filter((item) => item.kind === 'must' || item.kind === 'ai')
  const weightedCoverage = (items: Requirement[]) => {
    const max = items.reduce((sum, item) => sum + item.weight * 5, 0) || 1
    const actual = items.reduce((sum, item) => sum + item.weight * (lookup.get(item.id)?.strength ?? 0), 0)
    return actual / max
  }

  const hardRequirement = Math.round(weightedCoverage(must) * 40)
  const evidenceStrength = Math.round((matches.reduce((sum, item) => sum + item.strength, 0) / Math.max(1, matches.length * 5)) * 30)
  const domainItems = job.requirements.filter((item) => item.kind === 'domain')
  const domainRelevance = Math.round(weightedCoverage(domainItems) * 15)
  const preferenceItems = job.requirements.filter((item) => item.kind === 'nice' || item.kind === 'product')
  const preferenceFit = Math.round(weightedCoverage(preferenceItems) * 10)
  const usedIds = new Set(matches.flatMap((item) => item.evidenceIds))
  const completenessRatio = usedIds.size
    ? Array.from(usedIds).filter((id) => evidenceList.find((item) => item.id === id)?.verification === 'verified').length / usedIds.size
    : 0
  const evidenceCompleteness = Math.round(completenessRatio * 5)
  const total = hardRequirement + evidenceStrength + domainRelevance + preferenceFit + evidenceCompleteness
  return { hardRequirement, evidenceStrength, domainRelevance, preferenceFit, evidenceCompleteness, total }
}

export function ensureEvidenceReferences(ids: string[], evidenceList: Evidence[]) {
  const valid = new Set(evidenceList.map((item) => item.id))
  return ids.filter((id) => valid.has(id))
}

