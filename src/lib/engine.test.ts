import { describe, expect, it } from 'vitest'
import { demoEvidence, demoJobs } from '../data/demoData'
import { buildMatches, calculateScore, ensureEvidenceReferences, parseJD, resolveMatchesWithDecisions } from './engine'

describe('Rule Mode engine', () => {
  it('parses JD into structured requirements', () => {
    const requirements = parseJD('JTEST', '负责企业级 AI Agent 产品规划与工作流设计；建立模型评测体系；有教育行业经验优先。')
    expect(requirements).toHaveLength(3)
    expect(requirements.some((item) => item.kind === 'ai')).toBe(true)
    expect(requirements.some((item) => item.kind === 'nice')).toBe(true)
    expect(requirements.every((item) => item.jobId === 'JTEST')).toBe(true)
  })

  it('never references a missing Evidence ID', () => {
    const matches = buildMatches(demoJobs[0], demoEvidence)
    const validIds = new Set(demoEvidence.map((item) => item.id))
    expect(matches.flatMap((item) => item.evidenceIds).every((id) => validIds.has(id))).toBe(true)
    expect(ensureEvidenceReferences(['P014', 'NOT-EXISTS'], demoEvidence)).toEqual(['P014'])
  })

  it('keeps score parts equal to total and within 100', () => {
    const matches = buildMatches(demoJobs[0], demoEvidence)
    const score = calculateScore(demoJobs[0], matches, demoEvidence)
    const sum = score.hardRequirement + score.evidenceStrength + score.domainRelevance + score.preferenceFit + score.evidenceCompleteness
    expect(score.total).toBe(sum)
    expect(score.total).toBeGreaterThanOrEqual(0)
    expect(score.total).toBeLessThanOrEqual(100)
  })

  it('returns an explicit gap when no evidence matches', () => {
    const job = { ...demoJobs[0], requirements: [{ id: 'RX', jobId: 'J001', text: '火箭发动机燃烧室设计', kind: 'must' as const, weight: 10, keywords: ['火箭发动机'] }] }
    const [match] = buildMatches(job, demoEvidence)
    expect(match.strength).toBe(0)
    expect(match.evidenceIds).toEqual([])
    expect(match.gap).toContain('补充')
  })

  it('applies edited and rejected human decisions to evidence references', () => {
    const [suggested] = buildMatches(demoJobs[0], demoEvidence)
    expect(suggested.evidenceIds.length).toBeGreaterThan(0)
    const keptId = suggested.evidenceIds[0]
    const edited = resolveMatchesWithDecisions([suggested], [{ id: 'D1', targetType: 'match', targetId: suggested.requirementId, status: 'edited', note: '', evidenceIds: [keptId, 'MISSING'], createdAt: '2026-09-04' }], demoEvidence)
    expect(edited[0].evidenceIds).toEqual([keptId])

    const rejected = resolveMatchesWithDecisions([suggested], [{ id: 'D2', targetType: 'match', targetId: suggested.requirementId, status: 'rejected', note: '', createdAt: '2026-09-04' }], demoEvidence)
    expect(rejected[0].evidenceIds).toEqual([])
    expect(rejected[0].strength).toBe(0)
  })})
