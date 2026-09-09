import { useEffect, useMemo, useRef, useState } from 'react'
import { Download, FlaskConical, FolderKanban, LayoutDashboard, Library, Menu, Radar, RotateCcw, Upload } from 'lucide-react'
import './App.css'
import { demoEvidence, demoJobs } from './data/demoData'
import type { DecisionLog, DecisionStatus, Evidence, InterviewRecord, Job, PortfolioSection } from './domain/types'
import { useLocalStorage } from './hooks/useLocalStorage'
import { buildMatches, calculateScore, resolveMatchesWithDecisions } from './lib/engine'
import { parseStoredDecisions, parseStoredEvidence, parseStoredInterviews, parseStoredJobs, parseStoredPortfolio, parseStoredSelectedJobId, parseWorkspaceImport } from './lib/workspace'
import { WorkspaceHome } from './pages/WorkspaceHome'
import { AddJobModal } from './components/ModalForms'
import { JobWorkspace, JobNextStep } from './components/JobWorkspace'
import { jobViews, parseRoute, routeFor } from './lib/routes'
import './Workspace.css'
import { Intelligence } from './pages/Intelligence'
import { JobDetail } from './pages/JobDetail'
import { MatchMatrix } from './pages/MatchMatrix'
import { EvidenceLibrary } from './pages/EvidenceLibrary'
import { PortfolioStudio } from './pages/PortfolioStudio'
import { InterviewReview } from './pages/InterviewReview'
import { ProjectCase } from './pages/ProjectCase'
import { EvaluationLab } from './pages/EvaluationLab'

export type View = 'project' | 'evaluation' | 'dashboard' | 'intelligence' | 'detail' | 'match' | 'evidence' | 'portfolio' | 'interview'

const navItems = [
  { id: 'dashboard' as View, label: '工作台', eyebrow: 'Workspace', icon: LayoutDashboard },
  { id: 'intelligence' as View, label: '我的职位', eyebrow: 'Opportunities', icon: Radar },
  { id: 'evidence' as View, label: '项目证据库', eyebrow: 'My Evidence', icon: Library },
  { id: 'project' as View, label: '关于项目', eyebrow: 'About', icon: FolderKanban },
  { id: 'evaluation' as View, label: '评测实验室', eyebrow: 'Evaluation', icon: FlaskConical },
]

function App() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash))
  const view = route.view
  const [creating, setCreating] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [jobs, setJobs] = useLocalStorage<Job[]>('roleproof.jobs.v1', demoJobs, parseStoredJobs)
  const [evidence, setEvidence] = useLocalStorage<Evidence[]>('roleproof.evidence.v1', demoEvidence, parseStoredEvidence)
  const [selectedJobId, setSelectedJobId] = useLocalStorage('roleproof.selected-job.v1', demoJobs[0].id, parseStoredSelectedJobId)
  const [decisions, setDecisions] = useLocalStorage<DecisionLog[]>('roleproof.decisions.v1', [], parseStoredDecisions)
  const [portfolio, setPortfolio] = useLocalStorage<PortfolioSection[]>('roleproof.portfolio.v1', [], parseStoredPortfolio)
  const [interviews, setInterviews] = useLocalStorage<InterviewRecord[]>('roleproof.interviews.v1', [], parseStoredInterviews)
  const fileRef = useRef<HTMLInputElement>(null)

  const scoredJobs = useMemo(() => jobs.map((job) => ({ ...job, score: calculateScore(job, resolveMatchesWithDecisions(buildMatches(job, evidence), decisions, evidence), evidence).total })), [jobs, evidence, decisions])
  const selectedJob = scoredJobs.find((job) => job.id === (route.jobId ?? selectedJobId)) ?? scoredJobs[0] ?? demoJobs[0]
  const matches = useMemo(() => resolveMatchesWithDecisions(buildMatches(selectedJob, evidence), decisions, evidence), [selectedJob, evidence, decisions])
  const score = useMemo(() => calculateScore(selectedJob, matches, evidence), [selectedJob, matches, evidence])
  const inJob = jobViews.includes(view)
  const currentNav = navItems.find((item) => item.id === (inJob ? 'intelligence' : view)) ?? navItems[0]
  const notFound = route.invalid || !!(route.jobId && !jobs.some((job) => job.id === route.jobId))
  const verifiedEvidenceCount = evidence.filter((item) => item.verification === 'verified').length
  const evidenceCompleteness = evidence.length ? Math.round(verifiedEvidenceCount / evidence.length * 100) : 0
  const attachedMaterialCount = evidence.flatMap((item) => item.links).filter((link) => link.url.trim() && link.url !== '#').length

  useEffect(() => {
    const sync = () => { setRoute(parseRoute(window.location.hash)); setMenuOpen(false) }
    window.addEventListener('hashchange', sync)
    if (!window.location.hash) window.history.replaceState(null, '', '#/home')
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  useEffect(() => {
    document.title = `${inJob ? selectedJob.title + ' · ' : ''}${currentNav.label} · RoleProof`
    window.scrollTo({ top: 0 })
  }, [route, inJob, selectedJob.title, currentNav.label])

  const navigate = (next: View) => {
    window.location.hash = routeFor(next, selectedJob.id)
    setMenuOpen(false)
  }

  const chooseJob = (id: string, destination: View = 'detail') => {
    setSelectedJobId(id)
    window.location.hash = routeFor(destination, id)
  }
  const updateJob = (job: Job) => setJobs((items) => items.map((item) => item.id === job.id ? job : item))

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
        window.location.hash = '#/home'
      } catch { window.alert('导入失败：请选择 RoleProof 导出的 JSON 文件。') }
    }
    reader.readAsText(file)
  }

  const resetDemoWorkspace = () => {
    if (!window.confirm('恢复为当前公开演示数据？这会清除本浏览器中尚未导出的职位、证据、决策、作品集和面试记录。')) return
    setJobs(demoJobs)
    setEvidence(demoEvidence)
    setSelectedJobId(demoJobs[0].id)
    setDecisions([])
    setPortfolio([])
    setInterviews([])
    navigate('dashboard')
  }

  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
      <button className="brand" onClick={() => navigate('dashboard')}><span className="brand-mark">R</span><span><strong>RoleProof</strong><small>职证台</small></span></button>
      <div className="mode-card"><i /><span><strong>我的求职工作区</strong><small>本地保存 · 个人版</small></span></div>
      <nav aria-label="主导航">{navItems.map((item, index) => { const Icon = item.icon; return <div key={item.id}>{index === 3 && <div className="nav-divider">产品与方法</div>}<a className={currentNav.id === item.id ? 'active' : ''} aria-current={currentNav.id === item.id ? 'page' : undefined} href={routeFor(item.id, selectedJob.id)}><Icon size={18} /><span>{item.label}</span></a></div> })}</nav>
      <div className="sidebar-footer"><div className="progress-ring"><span>{evidenceCompleteness}%</span></div><span><strong>证据档案完整度</strong><small>{evidence.length} 个项目 · {attachedMaterialCount} 份已挂材料</small></span></div>
    </aside>
    {menuOpen && <button className="mobile-overlay" aria-label="关闭菜单" onClick={() => setMenuOpen(false)} />}
    <main>
      <header className="topbar">
        <button aria-label="打开菜单" className="icon-button mobile-menu" onClick={() => setMenuOpen(true)}><Menu size={20} /></button>
        <div className="page-heading"><small>{currentNav.eyebrow}</small><strong>{currentNav.label}</strong></div>
        <div className="topbar-actions">
          <span className="save-indicator"><i />当前浏览器工作区</span>
          <button className="icon-button" title="导入" onClick={() => fileRef.current?.click()}><Upload size={18} /></button><input ref={fileRef} hidden type="file" accept="application/json" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ''; importWorkspace(file) }} />
          <button className="icon-button" title="导出" onClick={exportWorkspace}><Download size={18} /></button><button className="icon-button" title="恢复演示数据" onClick={resetDemoWorkspace}><RotateCcw size={18} /></button><div className="avatar">PM</div>
        </div>
      </header>
      <div className={`content ${inJob ? 'job-content' : ''}`}>
        {notFound && <section className="empty-state panel"><h1>找不到这个页面或职位</h1><p>该职位可能来自其他设备，或尚未导入到当前浏览器。</p><a className="primary" href="#/jobs">返回职位列表</a></section>}
        {!notFound && inJob && <JobWorkspace job={selectedJob} view={view} decisions={decisions} portfolio={portfolio} interviews={interviews} onUpdate={updateJob} />}
        <div className="page-body" key={`${view}-${inJob ? selectedJob.id : ''}`}>

        {!notFound && view === 'project' && <ProjectCase />}
        {!notFound && view === 'evaluation' && <EvaluationLab />}
        {!notFound && view === 'dashboard' && <WorkspaceHome jobs={scoredJobs} evidence={evidence} decisions={decisions} portfolio={portfolio} interviews={interviews} onCreate={() => setCreating(true)} />}
        {!notFound && view === 'intelligence' && <Intelligence onUpdate={updateJob} jobs={scoredJobs} chooseJob={chooseJob} onCreate={(job) => setJobs((items) => [job, ...items])} />}
        {!notFound && view === 'detail' && <JobDetail key={selectedJob.id} job={selectedJob} score={score.total} onUpdate={updateJob} navigate={navigate} />}
        {!notFound && view === 'match' && <MatchMatrix job={selectedJob} evidence={evidence} decisions={decisions} recordDecision={recordDecision} navigate={navigate} />}
        {!notFound && view === 'evidence' && <EvidenceLibrary evidence={evidence} onCreate={(item) => setEvidence((items) => [item, ...items])} />}
        {!notFound && view === 'portfolio' && <PortfolioStudio job={selectedJob} evidence={evidence} portfolio={portfolio} setPortfolio={setPortfolio} decisions={decisions} recordDecision={recordDecision} />}
        {!notFound && view === 'interview' && <InterviewReview job={selectedJob} evidence={evidence} decisions={decisions} interviews={interviews} setInterviews={setInterviews} recordDecision={recordDecision} />}
        </div>
        {!notFound && inJob && <JobNextStep job={selectedJob} view={view} />}
      </div>
      {creating && <AddJobModal jobs={jobs} onClose={() => setCreating(false)} onCreate={(job) => { setJobs((items) => [job, ...items]); setCreating(false); chooseJob(job.id) }} />}
    </main>
  </div>
}

export default App
