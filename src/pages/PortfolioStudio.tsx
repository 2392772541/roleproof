import { Check, Pencil, RefreshCw, ShieldCheck, WandSparkles, X } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'
import type { DecisionLog, DecisionStatus, Evidence, Job, PortfolioSection } from '../domain/types'
import { requirementLabels } from '../components/labels'
import { buildMatches, ensureEvidenceReferences } from '../lib/engine'

const statusLabel: Record<DecisionStatus, string> = { pending: '待确认', accepted: '已采纳', edited: '已编辑', rejected: '已驳回' }

export function PortfolioStudio({ job, evidence, portfolio, setPortfolio, decisions, recordDecision }: { job: Job; evidence: Evidence[]; portfolio: PortfolioSection[]; setPortfolio: Dispatch<SetStateAction<PortfolioSection[]>>; decisions: DecisionLog[]; recordDecision: (type: DecisionLog['targetType'], id: string, status: DecisionStatus, note?: string) => void }) {
  const generate = () => {
    const matches = buildMatches(job, evidence)
    const rankedIds = Array.from(new Set([...matches].sort((a, b) => b.strength - a.strength).flatMap((item) => item.evidenceIds))).slice(0, 3)
    const selected = rankedIds.map((id) => evidence.find((item) => item.id === id)).filter(Boolean) as Evidence[]
    const sections = selected.map((item, index): PortfolioSection => ({ id: `PF-${job.id}-${index + 1}`, title: `${index + 1}. ${item.project}｜${item.title}`, body: `针对「${job.title}」强调：${item.summary}\n\n我的角色：${item.role}\n关键行动：${item.action}\n结果：${item.result}`, evidenceIds: ensureEvidenceReferences([item.id], evidence), status: 'pending' }))
    setPortfolio((items) => [...items.filter((item) => !item.id.includes(`PF-${job.id}-`)), ...sections])
  }
  const current = portfolio.filter((item) => item.id.includes(`PF-${job.id}-`))
  const updateStatus = (section: PortfolioSection, status: DecisionStatus) => { setPortfolio((items) => items.map((item) => item.id === section.id ? { ...item, status } : item)); recordDecision('portfolio', section.id, status) }
  return <><section className="section-intro"><div><span className="section-kicker">05 / Portfolio Studio</span><h1>同一份经历，<br />为不同岗位讲<strong>不同重点。</strong></h1><p>生成内容只能引用已存在的 Evidence ID，默认待确认，不会自动写入主档案。</p></div><button className="primary" onClick={generate}><RefreshCw size={16} /> 生成岗位版本</button></section><div className="portfolio-layout"><aside className="panel brief-card"><span className="section-kicker">Target Job</span><h2>{job.title}</h2><p>{job.company} · {job.location}</p><div className="brief-tags">{job.requirements.slice(0, 5).map((item) => <span key={item.id}>{item.keywords[0] ?? requirementLabels[item.kind]}</span>)}</div><div className="guardrail"><ShieldCheck size={18} /><div><strong>生成护栏</strong><small>不存在的 Evidence ID 会被过滤；所有段落默认 Pending。</small></div></div></aside><section className="portfolio-editor">{!current.length ? <div className="empty-state panel"><WandSparkles size={30} /><h2>还没有岗位定制版本</h2><p>系统会根据匹配强度重排项目，并突出与岗位要求直接相关的行动和结果。</p><button className="primary" onClick={generate}>生成第一版</button></div> : current.map((section) => { const decision = decisions.find((item) => item.targetType === 'portfolio' && item.targetId === section.id); return <article className="portfolio-section panel" key={section.id}><header><span>AI Generated · {statusLabel[decision?.status ?? section.status]}</span><div><button onClick={() => updateStatus(section, 'accepted')}><Check size={14} /></button><button onClick={() => updateStatus(section, 'edited')}><Pencil size={14} /></button><button onClick={() => updateStatus(section, 'rejected')}><X size={14} /></button></div></header><h2>{section.title}</h2><textarea value={section.body} onChange={(event) => setPortfolio((items) => items.map((item) => item.id === section.id ? { ...item, body: event.target.value, status: 'edited' } : item))} /><footer><span>Based on:</span>{section.evidenceIds.map((id) => <em key={id}>{id}</em>)}</footer></article> })}</section></div></>
}

