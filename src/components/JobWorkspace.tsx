import { ArrowLeft, ArrowRight, Check, ExternalLink } from 'lucide-react'
import type { View } from '../App'
import type { DecisionLog, InterviewRecord, Job, JobStage, PortfolioSection } from '../domain/types'
import { getReadiness } from '../lib/readiness'
import { routeFor } from '../lib/routes'

const jobSteps = [{ view: 'detail' as View, label: '岗位要求' }, { view: 'match' as View, label: '证据核对' }, { view: 'portfolio' as View, label: '投递材料' }, { view: 'interview' as View, label: '面试复盘' }]
export function JobWorkspace({ job, view, decisions, portfolio, interviews, onUpdate }: { job: Job; view: View; decisions: DecisionLog[]; portfolio: PortfolioSection[]; interviews: InterviewRecord[]; onUpdate: (job: Job) => void }) {
  const progress = getReadiness(job, decisions, portfolio, interviews)
  return <section className="job-context"><a className="back-link" href="#/jobs"><ArrowLeft size={15} />返回职位列表</a><div className="job-context-heading"><div><span>{job.company}</span><h2>{job.title}</h2><p>{job.location} · {job.salary}</p></div><label className="stage-control">求职阶段<select aria-label="更新求职阶段" value={job.stage} onChange={(e) => onUpdate({ ...job, stage: e.target.value as JobStage, updatedAt: new Date().toISOString().slice(0, 10) })}>{['关注', '准备中', '已投递', '面试中', '已结束'].map((s) => <option key={s}>{s}</option>)}</select></label></div>
    <div className="job-context-meta"><span>证据已核对 <b>{progress.reviewed}/{job.requirements.length}</b></span><span>已确认材料 <b>{progress.readyMaterials.length}</b></span><span>已填写回答 <b>{progress.answers.length}</b></span>{/^https?:\/\//.test(job.source.url) && <a href={job.source.url} target="_blank" rel="noreferrer">招聘来源 <ExternalLink size={12} /></a>}</div>
    <div className="job-guidance"><span>{progress.next === 'match' ? `还有 ${job.requirements.length - progress.reviewed} 条要求待核对，确认匹配是否能被真实项目证明。` : progress.next === 'portfolio' ? '证据核对已完成，接下来整理并确认可用于投递的项目材料。' : '材料已就绪，继续记录回答、发现薄弱点并补充证据。'}</span>{view !== progress.next && <a href={routeFor(progress.next, job.id)}>继续准备 <ArrowRight size={13} /></a>}</div>
    <nav className="job-tabs" aria-label="职位准备步骤">{jobSteps.map((s, index) => <a key={s.view} href={routeFor(s.view, job.id)} aria-current={view === s.view ? 'page' : undefined} className={view === s.view ? 'active' : ''}><span>{index === 1 && progress.reviewed === job.requirements.length || index === 2 && progress.readyMaterials.length > 0 || index === 3 && progress.answers.length > 0 ? <Check size={13} /> : `0${index + 1}`}</span>{s.label}</a>)}</nav>
  </section>
}
export function JobNextStep({ job, view }: { job: Job; view: View }) {
  const index = jobSteps.findIndex((s) => s.view === view)
  const next = jobSteps[index + 1]
  return <footer className="job-next-step"><span>当前内容归属：{job.company} · {job.title}</span>{next ? <a className="primary" href={routeFor(next.view, job.id)}>下一步：{next.label}<ArrowRight size={16} /></a> : <a className="secondary" href="#/home">返回工作台<ArrowRight size={16} /></a>}</footer>
}
