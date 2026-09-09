import type { DecisionLog, InterviewRecord, Job, PortfolioSection } from '../domain/types'

export function getReadiness(job: Job, decisions: DecisionLog[], portfolio: PortfolioSection[], interviews: InterviewRecord[]) {
  const reviewed = job.requirements.filter((requirement) => decisions.some((d) => d.targetType === 'match' && d.targetId === requirement.id && d.status !== 'pending')).length
  const materials = portfolio.filter((p) => p.id.startsWith(`PF-${job.id}-`))
  const readyMaterials = materials.filter((p) => p.body.trim() && (p.status === 'accepted' || p.status === 'edited'))
  const answers = interviews.filter((i) => i.jobId === job.id && i.answer.trim())
  const next = reviewed < job.requirements.length ? 'match' : !readyMaterials.length ? 'portfolio' : 'interview'
  return { reviewed, materials, readyMaterials, answers, next: next as 'match' | 'portfolio' | 'interview', percent: Math.round((Number(reviewed === job.requirements.length) + Number(readyMaterials.length > 0) + Number(answers.length > 0)) / 3 * 100) }
}
