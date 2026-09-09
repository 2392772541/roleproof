import { ArrowRight, BriefcaseBusiness, CheckCircle2, FileText, Plus } from 'lucide-react'
import type { View } from '../App'
import type { DecisionLog, Evidence, InterviewRecord, Job, PortfolioSection } from '../domain/types'
import { getReadiness } from '../lib/readiness'
import { routeFor } from '../lib/routes'

export function WorkspaceHome({ jobs, evidence, decisions, portfolio, interviews, onCreate }: { jobs: Job[]; evidence: Evidence[]; decisions: DecisionLog[]; portfolio: PortfolioSection[]; interviews: InterviewRecord[]; onCreate: () => void }) {
  const active = jobs.filter((j) => j.stage !== '已结束')
  const tasks = active.map((job) => ({ job, progress: getReadiness(job, decisions, portfolio, interviews) }))
  const nextNames: Partial<Record<View, string>> = { match: '核对岗位证据', portfolio: '整理投递材料', interview: '练习面试回答' }
  return <div className="workspace-home">
    <section className="workspace-welcome"><div><span className="section-kicker">MY WORKSPACE</span><h1>把下一个机会，准备好。</h1><p>从真实职位出发，把项目经历变成有依据的面试回答。</p></div><button className="primary" onClick={onCreate}><Plus size={17} />录入职位</button></section>
    <div className="home-metrics">{[[BriefcaseBusiness, active.length, '进行中的职位'], [CheckCircle2, jobs.filter((j) => j.stage === '面试中').length, '面试中的机会'], [FileText, evidence.length, '可复用项目证据']].map(([Icon, count, label]) => { const MetricIcon = Icon as typeof FileText; return <div key={String(label)}><MetricIcon size={21} /><strong>{String(count).padStart(2, '0')}</strong><span>{String(label)}</span></div> })}</div>
    <div className="home-layout"><section className="panel next-tasks"><header><div><h2>继续准备</h2><p>每份职位都有独立进度和材料。</p></div><a href="#/jobs">所有职位 <ArrowRight size={14} /></a></header>{tasks.length ? tasks.map(({ job, progress }) => <a className="task-row" key={job.id} href={routeFor(progress.next, job.id)}><span className="company-logo">{job.company.slice(0, 1)}</span><div><small>{job.company} · {job.stage}</small><h3>{job.title}</h3><p>{nextNames[progress.next]} <span>· 已核对 {progress.reviewed}/{job.requirements.length} 条要求</span></p></div><ArrowRight size={18} /></a>) : <div className="empty-state"><h3>没有进行中的职位</h3><p>录入一份目标 JD，开始准备下一次面试。</p><button className="primary" onClick={onCreate}>录入职位</button></div>}</section>
      <aside className="home-guide"><span className="section-kicker">你的准备路径</span><h2>从岗位到面试，<br />每一步都有产出。</h2><ol><li><strong>保存真实职位</strong><p>留下 JD 原文和招聘来源。</p></li><li><strong>核对项目证据</strong><p>确认哪些经历能证明岗位能力。</p></li><li><strong>带走投递材料</strong><p>编辑、确认并下载岗位专属材料。</p></li></ol><a href="#/evidence">管理我的项目证据 <ArrowRight size={15} /></a></aside></div>
    <div className="workspace-note"><span className="local-dot" />个人工作区 · 数据保存在当前浏览器，换设备前请导出备份。预置职位为研究样本。</div>
  </div>
}
