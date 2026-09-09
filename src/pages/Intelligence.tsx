import { ChevronRight, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import type { View } from '../App'
import type { Job, JobStage } from '../domain/types'
import { StatusBadge } from '../components/Shared'
import { routeFor } from '../lib/routes'
import { AddJobModal } from '../components/ModalForms'

export function Intelligence({ jobs, chooseJob, onCreate, onUpdate }: { onUpdate: (job: Job) => void; jobs: Job[]; chooseJob: (id: string, view?: View) => void; onCreate: (job: Job) => void }) {
  const [query, setQuery] = useState('')
  const [layout, setLayout] = useState<'list' | 'board'>('board')
  const [stage, setStage] = useState('全部')
  const [creating, setCreating] = useState(false)
  const filtered = jobs.filter((job) => (stage === '全部' || job.stage === stage) && `${job.company}${job.title}${job.tags.join('')}`.toLowerCase().includes(query.toLowerCase()))
  const create = (job: Job) => { onCreate(job); setCreating(false); chooseJob(job.id, 'detail') }
  return <><section className="section-intro"><div><span className="section-kicker">OPPORTUNITIES</span><h1>我的职位</h1><p>追踪每个机会的进展，进入职位后继续准备专属材料。</p></div><button className="primary" onClick={() => setCreating(true)}><Plus size={17} /> 录入职位</button></section>
    <section className="toolbar panel"><label className="search-box"><Search size={17} /><input placeholder="搜索公司、岗位或标签" value={query} onChange={(event) => setQuery(event.target.value)} /></label><div className="filter-tabs">{['全部', '关注', '准备中', '已投递', '面试中', '已结束'].map((item) => <button key={item} className={stage === item ? 'active' : ''} onClick={() => setStage(item)}>{item}</button>)}</div><span className="result-count">{filtered.length} 个职位</span></section>
    <div className="view-options"><span>阶段由你记录，不会自动发送投递。</span><div><button aria-pressed={layout === 'board'} onClick={() => setLayout('board')}>看板</button><button aria-pressed={layout === 'list'} onClick={() => setLayout('list')}>列表</button></div></div>
    {!filtered.length && <div className="empty-state panel"><h2>没有符合条件的职位</h2><p>更换搜索词或阶段，或录入一个新机会。</p></div>}
    {layout === 'board' ? <section className="opportunity-board" aria-label="求职阶段看板">{(['关注', '准备中', '已投递', '面试中', '已结束'] as JobStage[]).filter((s) => stage === '全部' || s === stage).map((column) => <div className="board-column" key={column}><header><i /><h2>{column}</h2><span>{filtered.filter((j) => j.stage === column).length}</span></header>{filtered.filter((j) => j.stage === column).map((job) => <article className="opportunity-card" key={job.id}><a href={routeFor('detail', job.id)}><span className="company-logo">{job.company.slice(0, 1)}</span><small>{job.company}</small><h3>{job.title}</h3><p>{job.location} · {job.salary}</p><div className="tag-cell">{job.tags.slice(0, 3).map((tag) => <em key={tag}>{tag}</em>)}</div><div className="card-bottom"><span>{job.requirements.length} 条岗位要求</span><b>进入准备 →</b></div></a><label>阶段<select aria-label={`修改阶段：${job.company}`} value={job.stage} onChange={(e) => onUpdate({ ...job, stage: e.target.value as JobStage, updatedAt: new Date().toISOString().slice(0, 10) })}>{['关注', '准备中', '已投递', '面试中', '已结束'].map((s) => <option key={s}>{s}</option>)}</select></label></article>)}{!filtered.some((j) => j.stage === column) && <p className="board-empty">暂无职位</p>}</div>)}</section> : <section className="job-table panel"><div className="table-row table-head"><span>岗位</span><span>关键标签</span><span>阶段</span><span>证据匹配</span><span>更新</span><span /></div>{filtered.map((job) => <button className="table-row" key={job.id} onClick={() => chooseJob(job.id, 'detail')}><span className="job-cell"><i>{job.company.slice(0, 1)}</i><span><strong>{job.title}</strong><small>{job.company} · {job.location}<br />{job.salary}</small></span></span><span className="tag-cell">{job.tags.map((tag) => <em key={tag}>{tag}</em>)}</span><span><StatusBadge value={job.stage} /></span><span className="match-bar"><i><b style={{ width: `${job.score}%` }} /></i><strong>{job.score}</strong></span><span className="muted">{job.updatedAt}</span><span><ChevronRight size={17} /></span></button>)}</section>}
    {creating && <AddJobModal jobs={jobs} onClose={() => setCreating(false)} onCreate={create} />}
  </>
}
