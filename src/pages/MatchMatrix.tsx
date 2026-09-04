import { Check, ChevronDown, ChevronRight, CircleAlert, Pencil, WandSparkles, X } from 'lucide-react'
import { useState } from 'react'
import type { View } from '../App'
import type { DecisionLog, DecisionStatus, Evidence, Job } from '../domain/types'
import { PanelHeading } from '../components/Shared'
import { requirementLabels } from '../components/labels'
import { buildMatches, calculateScore, resolveMatchesWithDecisions } from '../lib/engine'

const statusLabel: Record<DecisionStatus, string> = { pending: '待确认', accepted: '已采纳', edited: '已编辑', rejected: '已驳回' }

type Props = {
  job: Job
  evidence: Evidence[]
  decisions: DecisionLog[]
  recordDecision: (type: DecisionLog['targetType'], id: string, status: DecisionStatus, note?: string, evidenceIds?: string[]) => void
  navigate: (view: View) => void
}

export function MatchMatrix({ job, evidence, decisions, recordDecision, navigate }: Props) {
  const [expanded, setExpanded] = useState<string | null>(job.requirements[0]?.id ?? null)
  const evidenceMap = new Map(evidence.map((item) => [item.id, item]))
  const matches = resolveMatchesWithDecisions(buildMatches(job, evidence), decisions, evidence)
  const score = calculateScore(job, matches, evidence)
  const breakdown = [['硬性要求覆盖', score.hardRequirement, 40], ['项目证据强度', score.evidenceStrength, 30], ['领域相关性', score.domainRelevance, 15], ['岗位偏好', score.preferenceFit, 10], ['证据完整度', score.evidenceCompleteness, 5]] as const

  const editMatch = (requirementId: string, currentIds: string[]) => {
    const entered = window.prompt('输入要保留的 Evidence ID，多个 ID 用逗号分隔：', currentIds.join(', '))
    if (entered === null) return
    const evidenceIds = Array.from(new Set(entered.split(/[,，]/).map((id) => id.trim()).filter((id) => evidenceMap.has(id))))
    recordDecision('match', requirementId, 'edited', `人工保留 ${evidenceIds.length} 条证据`, evidenceIds)
  }

  return <>
    <section className="section-intro compact"><div><span className="section-kicker">03 / Job × Evidence</span><h1>每一个“匹配”，都要能<strong>点开证据。</strong></h1><p>{job.company} · {job.title}</p></div><button className="secondary" onClick={() => navigate('portfolio')}>生成岗位作品集 <WandSparkles size={16} /></button></section>
    <div className="score-layout"><section className="panel score-card"><div className="score-gauge" style={{ '--score': `${score.total * 3.6}deg` } as React.CSSProperties}><div><strong>{score.total}</strong><span>/ 100</span></div></div><div><span className="status-badge success"><i />推荐准备</span><h2>证据匹配度</h2><p>不是模型神秘分数。右侧五项子分严格相加得到总分。</p></div></section><section className="panel score-breakdown">{breakdown.map(([label, value, max]) => <div key={label}><span>{label}</span><i><b style={{ width: `${value / max * 100}%` }} /></i><strong>{value}<small> / {max}</small></strong></div>)}</section></div>
    <section className="panel matrix-panel"><PanelHeading title="要求—证据矩阵" subtitle="规则引擎先给建议；你必须逐条接受、编辑或驳回" /><div className="matrix-head"><span>岗位要求</span><span>匹配证据</span><span>强度</span><span>人工状态</span><span /></div>{job.requirements.map((requirement) => {
      const match = matches.find((item) => item.requirementId === requirement.id)!
      const decision = decisions.find((item) => item.targetType === 'match' && item.targetId === requirement.id)
      const linked = match.evidenceIds.map((id) => evidenceMap.get(id)).filter(Boolean) as Evidence[]
      const open = expanded === requirement.id
      return <div className={`matrix-item ${open ? 'expanded' : ''}`} key={requirement.id}>
        <button className="matrix-row" onClick={() => setExpanded(open ? null : requirement.id)}><span className="requirement-cell"><em>{requirementLabels[requirement.kind]}</em><strong>{requirement.text}</strong><small>{requirement.keywords.join(' · ')}</small></span><span className="evidence-cell">{linked.length ? linked.map((item) => <i key={item.id}><b>{item.id}</b>{item.project}</i>) : <i className="empty-evidence"><CircleAlert size={14} />暂无直接证据</i>}</span><span className="strength"><i>{[1, 2, 3, 4, 5].map((level) => <b className={level <= match.strength ? 'on' : ''} key={level} />)}</i><small>{match.strength}/5</small></span><span><span className={`decision-state ${decision?.status ?? 'pending'}`}>{statusLabel[decision?.status ?? 'pending']}</span></span><span>{open ? <ChevronDown size={17} /> : <ChevronRight size={17} />}</span></button>
        {open && <div className="matrix-detail"><div className="reason-box"><small>规则解释 · Confidence {match.confidence}%</small><p>{match.reason}</p>{match.gap && <span><CircleAlert size={14} />{match.gap}</span>}</div><div className="linked-cards">{linked.map((item) => <div key={item.id}><span>{item.id} · {item.verification === 'verified' ? 'Verified' : 'Partial'}</span><strong>{item.title}</strong><p>{item.action}</p><small>{item.result}</small></div>)}</div><div className="decision-actions"><span>人工确认：</span><button onClick={() => recordDecision('match', requirement.id, 'accepted')}><Check size={15} />接受</button><button onClick={() => editMatch(requirement.id, match.evidenceIds)}><Pencil size={14} />编辑后采用</button><button onClick={() => recordDecision('match', requirement.id, 'rejected')}><X size={15} />驳回</button></div></div>}
      </div>
    })}</section>
  </>
}
