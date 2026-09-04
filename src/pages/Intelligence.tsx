import { ChevronRight, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import type { View } from '../App'
import type { Job } from '../domain/types'
import { StatusBadge } from '../components/Shared'
import { AddJobModal } from '../components/ModalForms'

export function Intelligence({ jobs, chooseJob, onCreate }: { jobs: Job[]; chooseJob: (id: string, view?: View) => void; onCreate: (job: Job) => void }) {
  const [query, setQuery] = useState('')
  const [stage, setStage] = useState('全部')
  const [creating, setCreating] = useState(false)
  const filtered = jobs.filter((job) => (stage === '全部' || job.stage === stage) && `${job.company}${job.title}${job.tags.join('')}`.toLowerCase().includes(query.toLowerCase()))
  const create = (job: Job) => { onCreate(job); setCreating(false); chooseJob(job.id, 'detail') }
  return <><section className="section-intro"><div><span className="section-kicker">01 / Intelligence</span><h1>职位不是收藏夹，<br />而是一组可比较的<strong>机会假设。</strong></h1><p>保存来源和 JD 原文，先看证据缺口，再决定是否投入准备时间。</p></div><button className="primary" onClick={() => setCreating(true)}><Plus size={17} /> 录入职位</button></section>
    <section className="toolbar panel"><label className="search-box"><Search size={17} /><input placeholder="搜索公司、岗位或标签" value={query} onChange={(event) => setQuery(event.target.value)} /></label><div className="filter-tabs">{['全部', '关注', '准备中', '已投递', '面试中'].map((item) => <button key={item} className={stage === item ? 'active' : ''} onClick={() => setStage(item)}>{item}</button>)}</div><span className="result-count">{filtered.length} 个职位</span></section>
    <section className="job-table panel"><div className="table-row table-head"><span>岗位</span><span>关键标签</span><span>阶段</span><span>证据匹配</span><span>更新</span><span /></div>{filtered.map((job) => <button className="table-row" key={job.id} onClick={() => chooseJob(job.id, 'detail')}><span className="job-cell"><i>{job.company.slice(0, 1)}</i><span><strong>{job.title}</strong><small>{job.company} · {job.location}<br />{job.salary}</small></span></span><span className="tag-cell">{job.tags.map((tag) => <em key={tag}>{tag}</em>)}</span><span><StatusBadge value={job.stage} /></span><span className="match-bar"><i><b style={{ width: `${job.score}%` }} /></i><strong>{job.score}</strong></span><span className="muted">{job.updatedAt}</span><span><ChevronRight size={17} /></span></button>)}</section>
    {creating && <AddJobModal jobs={jobs} onClose={() => setCreating(false)} onCreate={create} />}
  </>
}
