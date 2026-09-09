import { Check, Download, Pencil, RefreshCw, ShieldCheck, WandSparkles, X } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'
import type { DecisionLog, DecisionStatus, Evidence, Job, PortfolioSection } from '../domain/types'
import { requirementLabels } from '../components/labels'
import { buildMatches, ensureEvidenceReferences, resolveMatchesWithDecisions } from '../lib/engine'

const statusLabel: Record<DecisionStatus, string> = { pending: '待确认', accepted: '已采纳', edited: '已编辑', rejected: '已驳回' }

export function PortfolioStudio({ job, evidence, portfolio, setPortfolio, decisions, recordDecision }: { job: Job; evidence: Evidence[]; portfolio: PortfolioSection[]; setPortfolio: Dispatch<SetStateAction<PortfolioSection[]>>; decisions: DecisionLog[]; recordDecision: (type: DecisionLog['targetType'], id: string, status: DecisionStatus, note?: string) => void }) {
  const generate = () => {
    const matches = resolveMatchesWithDecisions(buildMatches(job, evidence), decisions, evidence)
    const eligibleMatches = matches.filter((match) => match.evidenceIds.length > 0)
    const rankedIds = Array.from(new Set([...eligibleMatches].sort((a, b) => b.strength - a.strength).flatMap((item) => item.evidenceIds))).slice(0, 3)
    const selected = rankedIds.map((id) => evidence.find((item) => item.id === id)).filter(Boolean) as Evidence[]
    const sections = selected.map((item, index): PortfolioSection => ({ id: `PF-${job.id}-${index + 1}`, title: `${index + 1}. ${item.project}｜${item.title}`, body: `针对「${job.title}」强调：${item.summary}\n\n我的角色：${item.role}\n关键行动：${item.action}\n结果：${item.result}`, evidenceIds: ensureEvidenceReferences([item.id], evidence), status: 'pending' }))
    setPortfolio((items) => {
      const currentById = new Map(items.filter((item) => item.id.includes(`PF-${job.id}-`)).map((item) => [item.id, item]))
      const merged = sections.map((section) => {
        const existing = currentById.get(section.id)
        return existing && existing.status !== 'pending' ? existing : section
      })
      return [...items.filter((item) => !item.id.includes(`PF-${job.id}-`)), ...merged]
    })
  }
  const current = portfolio.filter((item) => item.id.includes(`PF-${job.id}-`))
  const downloadable = current.filter((section) => section.body.trim() && (section.status === 'accepted' || section.status === 'edited'))
  const download = () => {
    const text = `# ${job.company} · ${job.title}\n\n` + downloadable.map((section) => `## ${section.title}\n\n${section.body}\n\n材料来源：\n${section.evidenceIds.map((id) => evidence.find((e) => e.id === id)).filter((e) => e !== undefined).map((e) => e.links.map((l) => `- [${l.label}](${l.url})`).join('\n')).join('\n')}`).join('\n\n')
    const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }))
    const a = document.createElement('a'); a.href = url; a.download = `RoleProof-${job.id}-投递材料.md`; a.click(); URL.revokeObjectURL(url)
  }
  const updateStatus = (section: PortfolioSection, status: DecisionStatus) => { setPortfolio((items) => items.map((item) => item.id === section.id ? { ...item, status } : item)); recordDecision('portfolio', section.id, status) }
  return <><section className="section-intro"><div><span className="section-kicker">05 / Portfolio Studio</span><h1>整理投递材料</h1><p>从已有项目整理草稿。请核实个人贡献和结果，确认后下载用于投递。</p></div><button className="primary" onClick={generate}><RefreshCw size={16} /> 生成岗位版本</button></section><div className="material-export panel"><span>{downloadable.length} 段材料可导出 · 待确认和已驳回内容不会导出</span><button className="secondary" disabled={!downloadable.length} onClick={download}><Download size={16} />下载投递材料</button></div><div className="portfolio-layout"><aside className="panel brief-card"><span className="section-kicker">Target Job</span><h2>{job.title}</h2><p>{job.company} · {job.location}</p><div className="brief-tags">{job.requirements.slice(0, 5).map((item) => <span key={item.id}>{item.keywords[0] ?? requirementLabels[item.kind]}</span>)}</div><div className="guardrail"><ShieldCheck size={18} /><div><strong>生成护栏</strong><small>不存在的 Evidence ID 会被过滤；所有段落默认 Pending。</small></div></div></aside><section className="portfolio-editor">{!current.length ? <div className="empty-state panel"><WandSparkles size={30} /><h2>还没有岗位定制版本</h2><p>系统会根据匹配强度重排项目，并突出与岗位要求直接相关的行动和结果。</p><button className="primary" onClick={generate}>生成第一版</button></div> : current.map((section) => { return <article className="portfolio-section panel" key={section.id}><header><span>规则草稿 · {statusLabel[section.status]}</span><div><button aria-label="确认这段材料" onClick={() => updateStatus(section, 'accepted')}><Check size={14} /></button><button aria-label="标记为已编辑" onClick={() => updateStatus(section, 'edited')}><Pencil size={14} /></button><button aria-label="驳回这段材料" onClick={() => updateStatus(section, 'rejected')}><X size={14} /></button></div></header><h2>{section.title}</h2><textarea value={section.body} onChange={(event) => setPortfolio((items) => items.map((item) => item.id === section.id ? { ...item, body: event.target.value, status: 'edited' } : item))} /><footer><span>Based on:</span>{section.evidenceIds.map((id) => <em key={id}>{id}</em>)}</footer></article> })}</section></div></>
}
