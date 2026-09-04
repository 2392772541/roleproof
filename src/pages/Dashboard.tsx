import { ArrowUpRight, BriefcaseBusiness, CheckCircle2, ChevronRight, ClipboardCheck, Database, GitBranch, MessageSquareText, ShieldCheck, Sparkles, WandSparkles } from 'lucide-react'
import type { View } from '../App'
import type { DecisionLog, Evidence, InterviewRecord, Job } from '../domain/types'
import { PanelHeading } from '../components/Shared'

export function Dashboard({ jobs, evidence, decisions, interviews, chooseJob, navigate }: { jobs: Job[]; evidence: Evidence[]; decisions: DecisionLog[]; interviews: InterviewRecord[]; chooseJob: (id: string, view?: View) => void; navigate: (view: View) => void }) {
  const stages = jobs.reduce<Record<string, number>>((acc, job) => ({ ...acc, [job.stage]: (acc[job.stage] ?? 0) + 1 }), {})
  const accepted = decisions.filter((item) => item.status === 'accepted' || item.status === 'edited').length
  return <>
    <section className="hero-panel"><div><div className="eyebrow"><Sparkles size={14} /> 让岗位匹配回到真实证据</div><h1>不是告诉你“匹配 86%”，<br />而是证明<strong>为什么匹配。</strong></h1><p>RoleProof 把职位要求、项目行动、成果指标和 GitHub 材料连接成可复核的求职工作流。</p><div className="hero-actions"><button className="primary" onClick={() => navigate('match')}>查看证据矩阵 <ArrowUpRight size={17} /></button><button className="secondary" onClick={() => navigate('intelligence')}>浏览职位情报</button></div></div>
      <div className="proof-visual"><div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" /><div className="proof-core"><ShieldCheck size={30} /><strong>Evidence<br />Grounded</strong><span>所有结论可追溯</span></div><span className="proof-node node-a"><BriefcaseBusiness size={15} /> JD</span><span className="proof-node node-b"><GitBranch size={15} /> GitHub</span><span className="proof-node node-c"><ClipboardCheck size={15} /> Decision</span></div>
    </section>
    <section className="metric-grid"><Metric icon={BriefcaseBusiness} label="跟踪职位" value={String(jobs.length).padStart(2, '0')} note={`${stages['面试中'] ?? 0} 个进入面试`} tone="violet" /><Metric icon={Database} label="项目证据" value={String(evidence.length).padStart(2, '0')} note={`${evidence.filter((item) => item.verification === 'verified').length} 个已验证项目`} tone="cyan" /><Metric icon={CheckCircle2} label="人工决策" value={String(decisions.length).padStart(2, '0')} note={`${accepted} 条已采纳`} tone="green" /><Metric icon={MessageSquareText} label="面试复盘" value={String(interviews.length).padStart(2, '0')} note="问题与证据持续回流" tone="amber" /></section>
    <div className="dashboard-grid"><section className="panel job-list-panel"><PanelHeading title="优先准备岗位" subtitle="按证据匹配和求职阶段排序" action="全部职位" onAction={() => navigate('intelligence')} /><div className="compact-job-list">{[...jobs].sort((a, b) => b.score - a.score).slice(0, 4).map((job) => <button key={job.id} className="compact-job" onClick={() => chooseJob(job.id, 'match')}><div className="company-logo">{job.company.slice(0, 1)}</div><div className="job-copy"><strong>{job.title}</strong><span>{job.company} · {job.location}</span></div><div className="score-pill"><strong>{job.score}</strong><span>匹配</span></div><ChevronRight size={17} /></button>)}</div></section>
      <section className="panel workflow-panel"><PanelHeading title="证据闭环" subtitle="AI 建议，人工确认，决策留痕" /><div className="workflow-steps">{[['01', '解析岗位', '把自然语言 JD 拆成结构化要求'], ['02', '匹配证据', '每条结论绑定合法 Evidence ID'], ['03', '人工决策', '接受、编辑或驳回 AI 建议'], ['04', '生成材料', '按岗位重排案例和面试故事']].map(([no, title, text], index) => <div className="workflow-step" key={no}><span>{no}</span><div><strong>{title}</strong><small>{text}</small></div>{index < 3 && <i />}</div>)}</div><button className="text-link" onClick={() => navigate('portfolio')}>进入作品集工坊 <WandSparkles size={15} /></button></section></div>
  </>
}

function Metric({ icon: Icon, label, value, note, tone }: { icon: typeof BriefcaseBusiness; label: string; value: string; note: string; tone: string }) {
  return <div className="metric-card"><span className={`metric-icon ${tone}`}><Icon size={19} /></span><div><small>{label}</small><strong>{value}</strong><p>{note}</p></div></div>
}

