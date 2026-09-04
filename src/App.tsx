import { useMemo, useRef, useState } from 'react'
import { Bell, ChevronDown, Download, FileSearch, LayoutDashboard, Library, Menu, MessageSquareText, Network, Radar, Upload, WandSparkles } from 'lucide-react'
import './App.css'
import { demoEvidence, demoJobs } from './data/demoData'
import type { DecisionLog, DecisionStatus, Evidence, InterviewRecord, Job, PortfolioSection } from './domain/types'
import { useLocalStorage } from './hooks/useLocalStorage'
import { buildMatches, calculateScore, resolveMatchesWithDecisions } from './lib/engine'
import { parseStoredDecisions, parseStoredEvidence, parseStoredInterviews, parseStoredJobs, parseStoredPortfolio, parseStoredSelectedJobId, parseWorkspaceImport } from './lib/workspace'
import { Dashboard } from './pages/Dashboard'
import { Intelligence } from './pages/Intelligence'
import { JobDetail } from './pages/JobDetail'
import { MatchMatrix } from './pages/MatchMatrix'
import { EvidenceLibrary } from './pages/EvidenceLibrary'
import { PortfolioStudio } from './pages/PortfolioStudio'
import { InterviewReview } from './pages/InterviewReview'

export type View = 'dashboard' | 'intelligence' | 'detail' | 'match' | 'evidence' | 'portfolio' | 'interview'

const navItems = [
  { id: 'dashboard' as View, label: '总览', eyebrow: 'Overview', icon: LayoutDashboard },
  { id: 'intelligence' as View, label: '职位情报', eyebrow: 'Intelligence', icon: Radar },
  { id: 'detail' as View, label: '岗位解析', eyebrow: 'Job Detail', icon: FileSearch },
  { id: 'match' as View, label: '证据匹配', eyebrow: 'Job × Evidence', icon: Network },
  { id: 'evidence' as View, label: '证据库', eyebrow: 'Evidence Library', icon: Library },
  { id: 'portfolio' as View, label: '作品集工坊', eyebrow: 'Portfolio Studio', icon: WandSparkles },
  { id: 'interview' as View, label: '面试复盘', eyebrow: 'Interview Review', icon: MessageSquareText },
]

function App() {
  const [view, setView] = useState<View>('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const [jobs, setJobs] = useLocalStorage<Job[]>('roleproof.jobs.v1', demoJobs, parseStoredJobs)
  const [evidence, setEvidence] = useLocalStorage<Evidence[]>('roleproof.evidence.v1', demoEvidence, parseStoredEvidence)
  const [selectedJobId, setSelectedJobId] = useLocalStorage('roleproof.selected-job.v1', demoJobs[0].id, parseStoredSelectedJobId)
  const [decisions, setDecisions] = useLocalStorage<DecisionLog[]>('roleproof.decisions.v1', [], parseStoredDecisions)
  const [portfolio, setPortfolio] = useLocalStorage<PortfolioSection[]>('roleproof.portfolio.v1', [], parseStoredPortfolio)
  const [interviews, setInterviews] = useLocalStorage<InterviewRecord[]>('roleproof.interviews.v1', [], parseStoredInterviews)
  const fileRef = useRef<HTMLInputElement>(null)

  const scoredJobs = useMemo(() => jobs.map((job) => ({ ...job, score: calculateScore(job, resolveMatchesWithDecisions(buildMatches(job, evidence), decisions, evidence), evidence).total })), [jobs, evidence, decisions])
  const selectedJob = scoredJobs.find((job) => job.id === selectedJobId) ?? scoredJobs[0] ?? demoJobs[0]
  const matches = useMemo(() => resolveMatchesWithDecisions(buildMatches(selectedJob, evidence), decisions, evidence), [selectedJob, evidence, decisions])
  const score = useMemo(() => calculateScore(selectedJob, matches, evidence), [selectedJob, matches, evidence])
  const currentNav = navItems.find((item) => item.id === view) ?? navItems[0]
  const verifiedEvidenceCount = evidence.filter((item) => item.verification === 'verified').length
  const evidenceCompleteness = evidence.length ? Math.round(verifiedEvidenceCount / evidence.length * 100) : 0
  const attachedMaterialCount = evidence.flatMap((item) => item.links).filter((link) => link.url.trim() && link.url !== '#').length

  const navigate = (next: View) => {
    setView(next)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const chooseJob = (id: string, destination: View = 'detail') => {
    setSelectedJobId(id)
    navigate(destination)
  }

  const recordDecision = (targetType: DecisionLog['targetType'], targetId: string, status: DecisionStatus, note = '', evidenceIds?: string[]) => {
    setDecisions((items) => [
      { id: `D-${Date.now()}`, targetType, targetId, status, note, evidenceIds, createdAt: new Date().toISOString() },
      ...items.filter((item) => !(item.targetType === targetType && item.targetId === targetId)),
    ])
  }

  const exportWorkspace = () => {
    const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), jobs: scoredJobs, evidence, decisions, portfolio, interviews }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `roleproof-workspace-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const importWorkspace = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = parseWorkspaceImport(JSON.parse(String(reader.result)))
        setJobs(data.jobs)
        setEvidence(data.evidence)
        setDecisions(data.decisions)
        setPortfolio(data.portfolio)
        setInterviews(data.interviews)
        setSelectedJobId(data.jobs.some((job) => job.id === selectedJobId) ? selectedJobId : data.jobs[0].id)
      } catch { window.alert('导入失败：请选择 RoleProof 导出的 JSON 文件。') }
    }
    reader.readAsText(file)
  }

  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
      <button className="brand" onClick={() => navigate('dashboard')}><span className="brand-mark">R</span><span><strong>RoleProof</strong><small>职证台</small></span></button>
      <div className="mode-card"><i /><span><strong>Demo / Rule Mode</strong><small>无需 API Key，完整闭环可用</small></span></div>
      <nav>{navItems.map((item) => { const Icon = item.icon; return <button className={view === item.id ? 'active' : ''} key={item.id} onClick={() => navigate(item.id)}><Icon size={18} /><span><small>{item.eyebrow}</small>{item.label}</span></button> })}</nav>
      <div className="sidebar-footer"><div className="progress-ring"><span>{evidenceCompleteness}%</span></div><span><strong>证据档案完整度</strong><small>{evidence.length} 个项目 · {attachedMaterialCount} 份已挂材料</small></span></div>
    </aside>
    {menuOpen && <button className="mobile-overlay" aria-label="关闭菜单" onClick={() => setMenuOpen(false)} />}
    <main>
      <header className="topbar">
        <button className="icon-button mobile-menu" onClick={() => setMenuOpen(true)}><Menu size={20} /></button>
        <div className="page-heading"><small>{currentNav.eyebrow}</small><strong>{currentNav.label}</strong></div>
        <div className="topbar-actions">
          <label className="job-switcher"><span>{selectedJob.company}</span><select value={selectedJob.id} onChange={(event) => setSelectedJobId(event.target.value)}>{scoredJobs.map((job) => <option key={job.id} value={job.id}>{job.company} · {job.title}</option>)}</select><ChevronDown size={15} /></label>
          <button className="icon-button" title="导入" onClick={() => fileRef.current?.click()}><Upload size={18} /></button><input ref={fileRef} hidden type="file" accept="application/json" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ''; importWorkspace(file) }} />
          <button className="icon-button" title="导出" onClick={exportWorkspace}><Download size={18} /></button><button className="icon-button notification"><Bell size={18} /><i /></button><div className="avatar">PM</div>
        </div>
      </header>
      <div className="content">
        {view === 'dashboard' && <Dashboard jobs={scoredJobs} evidence={evidence} decisions={decisions} interviews={interviews} chooseJob={chooseJob} navigate={navigate} />}
        {view === 'intelligence' && <Intelligence jobs={scoredJobs} chooseJob={chooseJob} onCreate={(job) => setJobs((items) => [job, ...items])} />}
        {view === 'detail' && <JobDetail key={selectedJob.id} job={selectedJob} score={score.total} onUpdate={(job) => setJobs((items) => items.map((item) => item.id === job.id ? job : item))} navigate={navigate} />}
        {view === 'match' && <MatchMatrix job={selectedJob} evidence={evidence} decisions={decisions} recordDecision={recordDecision} navigate={navigate} />}
        {view === 'evidence' && <EvidenceLibrary evidence={evidence} onCreate={(item) => setEvidence((items) => [item, ...items])} />}
        {view === 'portfolio' && <PortfolioStudio job={selectedJob} evidence={evidence} portfolio={portfolio} setPortfolio={setPortfolio} decisions={decisions} recordDecision={recordDecision} />}
        {view === 'interview' && <InterviewReview job={selectedJob} evidence={evidence} decisions={decisions} interviews={interviews} setInterviews={setInterviews} recordDecision={recordDecision} />}
      </div>
    </main>
  </div>
}

export default App
