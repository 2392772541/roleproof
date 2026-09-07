import { describe, expect, it } from 'vitest'
import { demoEvidence, demoJobs } from '../data/demoData'
import type { DecisionLog, Evidence, InterviewRecord, Job, PortfolioSection } from '../domain/types'
import { parseStoredJobs, parseWorkspaceImport } from './workspace'

const validWorkspace = (): { version: 1; exportedAt: string; jobs: Job[]; evidence: Evidence[]; decisions: DecisionLog[]; portfolio: PortfolioSection[]; interviews: InterviewRecord[] } => ({
  version: 1 as const,
  exportedAt: '2026-09-04T00:00:00.000Z',
  jobs: structuredClone(demoJobs),
  evidence: structuredClone(demoEvidence),
  decisions: [],
  portfolio: [],
  interviews: [],
})

describe('workspace validation', () => {
  it('rejects an empty job collection before it can replace current state', () => {
    const input = validWorkspace()
    input.jobs = []
    expect(() => parseWorkspaceImport(input)).toThrow(/结构不完整|字段类型错误/)
  })

  it('rejects incomplete exports instead of partially applying arrays', () => {
    expect(() => parseWorkspaceImport({ version: 1, jobs: demoJobs })).toThrow(/结构不完整|字段类型错误/)
  })

  it('rejects duplicate Evidence IDs', () => {
    const input = validWorkspace()
    input.evidence.push(structuredClone(input.evidence[0]))
    expect(() => parseWorkspaceImport(input)).toThrow(/重复 ID/)
  })

  it('rejects requirements attached to a different job', () => {
    const input = validWorkspace()
    input.jobs[0].requirements[0].jobId = 'OTHER-JOB'
    expect(() => parseWorkspaceImport(input)).toThrow(/jobId 不一致/)
  })

  it('filters unknown Evidence IDs and stale decisions during import', () => {
    const input = validWorkspace()
    input.portfolio = [{ id: 'PF-J001-1', title: '测试', body: '测试', evidenceIds: ['P001', 'MISSING'], status: 'pending' }]
    input.interviews = [{ id: 'IV-1', jobId: 'J001', question: '问题', answer: '', evidenceIds: ['MISSING'], confidence: 50, weakness: '', nextAction: '', status: 'pending' }]
    input.decisions = [{ id: 'D-1', targetType: 'match', targetId: 'MISSING-REQUIREMENT', status: 'accepted', note: '', createdAt: '2026-09-04T00:00:00.000Z' }]

    const parsed = parseWorkspaceImport(input)
    expect(parsed.portfolio[0].evidenceIds).toEqual(['P001'])
    expect(parsed.interviews[0].evidenceIds).toEqual([])
    expect(parsed.decisions).toEqual([])
  })

  it('rejects syntactically valid but empty cached jobs', () => {
    expect(() => parseStoredJobs([])).toThrow(/职位缓存无效/)
  })
})
