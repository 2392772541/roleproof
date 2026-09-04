import { ArrowUpRight, Link2, MapPin, Pencil, Sparkles } from 'lucide-react'
import { useState } from 'react'
import type { View } from '../App'
import type { Job, Requirement } from '../domain/types'
import { PanelHeading } from '../components/Shared'
import { requirementLabels } from '../components/labels'
import { EditRequirementModal } from '../components/ModalForms'
import { parseJD } from '../lib/engine'

export function JobDetail({ job, score, onUpdate, navigate }: { job: Job; score: number; onUpdate: (job: Job) => void; navigate: (view: View) => void }) {
  const [jd, setJd] = useState(job.jd)
  const [editing, setEditing] = useState(false)
  const [editingRequirement, setEditingRequirement] = useState<Requirement | null>(null)
  const parse = () => { const parsed = parseJD(job.id, jd); onUpdate({ ...job, jd, requirements: parsed.length ? parsed : job.requirements, updatedAt: '刚刚' }); setEditing(false) }
  const saveRequirement = (requirement: Requirement) => { onUpdate({ ...job, requirements: job.requirements.map((item) => item.id === requirement.id ? requirement : item), updatedAt: '刚刚' }); setEditingRequirement(null) }
  return <><section className="job-hero panel"><div className="company-logo large">{job.company.slice(0, 1)}</div><div className="job-hero-copy"><span className="section-kicker">02 / Job Detail</span><h1>{job.title}</h1><p>{job.company} <span>·</span> <MapPin size={14} /> {job.location} <span>·</span> {job.salary}</p><div className="tag-cell">{job.tags.map((tag) => <em key={tag}>{tag}</em>)}</div></div><div className="hero-score"><small>当前匹配</small><strong>{score}<sup>%</sup></strong><span>基于现有证据</span></div></section>
    <div className="two-column detail-layout"><section className="panel jd-panel"><PanelHeading title="职位原文" subtitle={`来源：${job.source.name} · ${job.source.capturedAt}`} action={editing ? '取消编辑' : '编辑原文'} onAction={() => setEditing(!editing)} />{editing ? <textarea className="jd-editor" value={jd} onChange={(event) => setJd(event.target.value)} /> : <div className="jd-text">{job.jd}</div>}{editing && <button className="primary" onClick={parse}><Sparkles size={16} /> 规则解析并保存</button>}<div className="source-foot"><Link2 size={15} /><span>保存来源、采集日期和原文，避免后续改写丢失岗位语境。</span></div></section>
      <section className="panel requirement-panel"><PanelHeading title="结构化要求" subtitle={`${job.requirements.length} 条要求 · 可人工校正`} /><div className="requirement-list">{job.requirements.map((requirement, index) => <div className="requirement-item" key={requirement.id}><span className={`kind-dot kind-${requirement.kind}`}>{String(index + 1).padStart(2, '0')}</span><div><small>{requirementLabels[requirement.kind]} · 权重 {requirement.weight}</small><strong>{requirement.text}</strong><p>{requirement.keywords.map((word) => <em key={word}>{word}</em>)}</p></div><button className="icon-button small" aria-label={`编辑要求：${requirement.text}`} onClick={() => setEditingRequirement(requirement)}><Pencil size={14} /></button></div>)}</div><button className="primary full" onClick={() => navigate('match')}>进入证据匹配 <ArrowUpRight size={16} /></button></section></div>
    {editingRequirement && <EditRequirementModal requirement={editingRequirement} onClose={() => setEditingRequirement(null)} onSave={saveRequirement} />}
  </>
}
