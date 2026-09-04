import { BarChart3, ExternalLink, Plus, Search, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import type { Evidence } from '../domain/types'
import { AddEvidenceModal } from '../components/ModalForms'

const isUsableLink = (url: string) => url.trim() !== '' && url !== '#'

export function EvidenceLibrary({ evidence, onCreate }: { evidence: Evidence[]; onCreate: (evidence: Evidence) => void }) {
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const filtered = evidence.filter((item) => `${item.id}${item.project}${item.title}${item.capability.join('')}`.toLowerCase().includes(query.toLowerCase()))
  const create = (item: Evidence) => { onCreate(item); setCreating(false); setQuery(item.id) }
  return <><section className="section-intro"><div><span className="section-kicker">04 / Evidence Library</span><h1>项目不是一句介绍，<br />而是一组<strong>可核验的事实。</strong></h1><p>把角色、真实行动、结果指标和材料地址拆开保存。</p></div><button className="primary" onClick={() => setCreating(true)}><Plus size={17} /> 新建证据</button></section><section className="toolbar panel"><label className="search-box"><Search size={17} /><input placeholder="搜索项目、能力或 Evidence ID" value={query} onChange={(event) => setQuery(event.target.value)} /></label><span className="result-count">{filtered.length} 个项目</span></section><section className="evidence-grid">{filtered.map((item) => <article className="evidence-card panel" key={item.id}><div className="evidence-top"><span className="evidence-id">{item.id}</span><span className={`verification ${item.verification}`}><ShieldCheck size={13} />{item.verification === 'verified' ? 'Verified' : item.verification === 'partial' ? 'Partial' : 'Unverified'}</span></div><span className="evidence-project">{item.project}</span><h2>{item.title}</h2><p>{item.summary}</p><div className="capability-list">{item.capability.map((capability) => <em key={capability}>{capability}</em>)}</div><div className="evidence-facts"><div><small>我的角色</small><strong>{item.role}</strong></div><div><small>真实行动</small><span>{item.action}</span></div><div><small>可验证结果</small><span>{item.result}</span></div></div><div className="metric-chips">{item.metrics.map((metric) => <span key={metric}><BarChart3 size={13} />{metric}</span>)}</div><footer>{item.links.length ? item.links.map((link, index) => isUsableLink(link.url) ? <a key={`${link.type}-${link.url}-${index}`} href={link.url} target="_blank" rel="noreferrer"><ExternalLink size={13} />{link.label}</a> : <span className="missing-link" key={`${link.type}-${index}`}>{link.label}</span>) : <span className="missing-link">尚未添加材料地址</span>}<small>更新 {item.updatedAt}</small></footer></article>)}</section>
    {creating && <AddEvidenceModal onClose={() => setCreating(false)} onCreate={create} />}
  </>
}
