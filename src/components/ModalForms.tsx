import { AlertTriangle, Plus, X } from 'lucide-react'
import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import type { Evidence, Job, JobStage, Requirement, RequirementKind, VerificationStatus } from '../domain/types'
import { parseJD } from '../lib/engine'

const today = () => new Date().toISOString().slice(0, 10)
const splitList = (value: string) => value.split(/[，,、\n]/).map((item) => item.trim()).filter(Boolean)
const idSuffix = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`.toUpperCase()

function Modal({ title, eyebrow, description, children, onClose }: { title: string; eyebrow: string; description: string; children: ReactNode; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <header className="modal-header"><div><span className="section-kicker">{eyebrow}</span><h2 id="modal-title">{title}</h2><p>{description}</p></div><button className="icon-button" type="button" aria-label="关闭" onClick={onClose}><X size={18} /></button></header>
      {children}
    </section>
  </div>
}

function Field({ label, hint, required, children, wide = false }: { label: string; hint?: string; required?: boolean; children: ReactNode; wide?: boolean }) {
  return <label className={`form-field ${wide ? 'wide' : ''}`}><span>{label}{required && <b> *</b>}</span>{children}{hint && <small>{hint}</small>}</label>
}

export function AddJobModal({ jobs, onClose, onCreate }: { jobs: Job[]; onClose: () => void; onCreate: (job: Job) => void }) {
  const [form, setForm] = useState({ company: '', title: '', location: '', salary: '', stage: '关注' as JobStage, sourceName: '手动录入', sourceUrl: '', tags: '', jd: '' })
  const duplicate = useMemo(() => jobs.find((job) => job.company.trim().toLowerCase() === form.company.trim().toLowerCase() && job.title.trim().toLowerCase() === form.title.trim().toLowerCase()), [form.company, form.title, jobs])
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const company = form.company.trim()
    const title = form.title.trim()
    const jd = form.jd.trim()
    if (!company || !title || !jd) {
      window.alert('公司、岗位名称和 JD 不能为空。')
      return
    }
    const id = `J-${idSuffix()}`
    const requirements = parseJD(id, jd)
    if (!requirements.length) {
      window.alert('JD 内容过短，暂时无法拆解出有效岗位要求。')
      return
    }
    onCreate({
      id,
      company, title, location: form.location.trim() || '地点待确认', salary: form.salary.trim() || '薪资面议',
      stage: form.stage, score: 0, updatedAt: '刚刚', tags: splitList(form.tags),
      source: { name: form.sourceName.trim() || '手动录入', url: form.sourceUrl.trim() || '#', capturedAt: today() },
      jd, requirements,
    })
  }
  return <Modal title="录入目标职位" eyebrow="New Intelligence" description="保留原始 JD 和来源，系统只在副本上做结构化解析。" onClose={onClose}>
    <form onSubmit={submit}>
      {duplicate && <div className="duplicate-warning"><AlertTriangle size={18} /><div><strong>发现相似职位：{duplicate.company} · {duplicate.title}</strong><span>建议先检查已有记录并手动合并；系统不会自动覆盖。继续提交会新增一条独立职位。</span></div></div>}
      <div className="form-grid">
        <Field label="公司" required><input required value={form.company} onChange={(e) => update('company', e.target.value)} placeholder="例如：某科技公司" /></Field>
        <Field label="岗位名称" required><input required value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="例如：AI 产品经理" /></Field>
        <Field label="地点"><input value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="北京·海淀" /></Field>
        <Field label="薪资"><input value={form.salary} onChange={(e) => update('salary', e.target.value)} placeholder="25–35K·14薪" /></Field>
        <Field label="求职阶段"><select value={form.stage} onChange={(e) => update('stage', e.target.value)}>{['关注', '准备中', '已投递', '面试中', '已结束'].map((item) => <option key={item}>{item}</option>)}</select></Field>
        <Field label="标签" hint="使用逗号分隔"><input value={form.tags} onChange={(e) => update('tags', e.target.value)} placeholder="Agent，B端，工作流" /></Field>
        <Field label="来源名称"><input value={form.sourceName} onChange={(e) => update('sourceName', e.target.value)} /></Field>
        <Field label="来源地址"><input type="url" value={form.sourceUrl} onChange={(e) => update('sourceUrl', e.target.value)} placeholder="https://..." /></Field>
        <Field label="JD 原文" required wide hint="提交后自动拆成岗位要求，仍可逐条人工修正。"><textarea required value={form.jd} onChange={(e) => update('jd', e.target.value)} placeholder="粘贴完整职位描述……" /></Field>
      </div>
      <footer className="modal-actions"><button type="button" className="secondary" onClick={onClose}>取消</button><button type="submit" className="primary"><Plus size={16} />{duplicate ? '仍然新增' : '保存并解析'}</button></footer>
    </form>
  </Modal>
}

export function AddEvidenceModal({ onClose, onCreate }: { onClose: () => void; onCreate: (evidence: Evidence) => void }) {
  const [form, setForm] = useState({ project: '', title: '', role: '', summary: '', action: '', result: '', capability: '', metrics: '', verification: 'unverified' as VerificationStatus, github: '', demo: '', prd: '' })
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const requiredValues = [form.project, form.title, form.role, form.summary, form.action, form.result]
    if (requiredValues.some((value) => !value.trim()) || !splitList(form.capability).length) {
      window.alert('项目名称、证据标题、角色、介绍、行动、结果和能力标签不能为空。')
      return
    }
    const links = [
      form.github.trim() && { label: 'GitHub', url: form.github.trim(), type: 'github' as const },
      form.demo.trim() && { label: '产品 Demo', url: form.demo.trim(), type: 'demo' as const },
      form.prd.trim() && { label: 'PRD', url: form.prd.trim(), type: 'prd' as const },
    ].filter(Boolean) as Evidence['links']
    onCreate({ id: `P-${idSuffix()}`, project: form.project.trim(), title: form.title.trim(), role: form.role.trim(), summary: form.summary.trim(), action: form.action.trim(), result: form.result.trim(), capability: splitList(form.capability), metrics: splitList(form.metrics), verification: form.verification, links, updatedAt: today() })
  }
  return <Modal title="新建项目证据" eyebrow="New Evidence" description="把项目介绍拆成角色、行动、结果和可核验材料，而不是只写一句宣传语。" onClose={onClose}>
    <form onSubmit={submit}>
      <div className="form-grid">
        <Field label="项目名称" required><input required value={form.project} onChange={(e) => update('project', e.target.value)} placeholder="例如：RoleProof" /></Field>
        <Field label="证据标题" required><input required value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="一句话说明核心成果" /></Field>
        <Field label="我的角色" required><input required value={form.role} onChange={(e) => update('role', e.target.value)} placeholder="AI 产品经理 / 产品负责人" /></Field>
        <Field label="验证状态"><select value={form.verification} onChange={(e) => update('verification', e.target.value)}><option value="unverified">Unverified · 尚无材料</option><option value="partial">Partial · 部分材料</option><option value="verified">Verified · 材料完整</option></select></Field>
        <Field label="项目介绍" required wide><textarea required value={form.summary} onChange={(e) => update('summary', e.target.value)} placeholder="它为谁解决什么问题，为什么值得做？" /></Field>
        <Field label="真实行动" required wide><textarea required value={form.action} onChange={(e) => update('action', e.target.value)} placeholder="你亲自完成了哪些产品工作和关键决策？" /></Field>
        <Field label="可验证结果" required wide><textarea required value={form.result} onChange={(e) => update('result', e.target.value)} placeholder="交付物、测试结果、业务数据或用户反馈。" /></Field>
        <Field label="能力标签" required hint="使用逗号分隔"><input required value={form.capability} onChange={(e) => update('capability', e.target.value)} placeholder="工作流，评测，HITL" /></Field>
        <Field label="结果指标" hint="使用逗号分隔"><input value={form.metrics} onChange={(e) => update('metrics', e.target.value)} placeholder="6 个页面，4 条自动化测试" /></Field>
        <Field label="GitHub 地址"><input type="url" value={form.github} onChange={(e) => update('github', e.target.value)} placeholder="https://github.com/..." /></Field>
        <Field label="在线 Demo"><input type="url" value={form.demo} onChange={(e) => update('demo', e.target.value)} placeholder="https://..." /></Field>
        <Field label="PRD 地址" wide><input type="url" value={form.prd} onChange={(e) => update('prd', e.target.value)} placeholder="https://..." /></Field>
      </div>
      <footer className="modal-actions"><button type="button" className="secondary" onClick={onClose}>取消</button><button type="submit" className="primary"><Plus size={16} />保存证据</button></footer>
    </form>
  </Modal>
}

export function EditRequirementModal({ requirement, onClose, onSave }: { requirement: Requirement; onClose: () => void; onSave: (requirement: Requirement) => void }) {
  const [form, setForm] = useState({ text: requirement.text, kind: requirement.kind, weight: requirement.weight, keywords: requirement.keywords.join('，') })
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const text = form.text.trim()
    const keywords = splitList(form.keywords)
    const weight = Number(form.weight)
    if (!text || !keywords.length || !Number.isFinite(weight) || weight < 1 || weight > 10) {
      window.alert('要求原文、1–10 的权重和至少一个匹配关键词不能为空。')
      return
    }
    onSave({ ...requirement, text, kind: form.kind, weight, keywords })
  }
  return <Modal title="校正岗位要求" eyebrow="Human Review" description="AI 解析结果只是草稿，最终分类、权重和关键词由你确认。" onClose={onClose}>
    <form onSubmit={submit}>
      <div className="form-grid">
        <Field label="要求原文" required wide><textarea required value={form.text} onChange={(e) => setForm((value) => ({ ...value, text: e.target.value }))} /></Field>
        <Field label="要求类型"><select value={form.kind} onChange={(e) => setForm((value) => ({ ...value, kind: e.target.value as RequirementKind }))}>{['must', 'nice', 'responsibility', 'ai', 'product', 'domain'].map((kind) => <option value={kind} key={kind}>{kind}</option>)}</select></Field>
        <Field label="权重（1–10）"><input required type="number" min="1" max="10" value={form.weight} onChange={(e) => setForm((value) => ({ ...value, weight: Number(e.target.value) }))} /></Field>
        <Field label="匹配关键词" required wide hint="关键词直接参与证据匹配，请保留最能代表要求的 2–5 个词。"><input required value={form.keywords} onChange={(e) => setForm((value) => ({ ...value, keywords: e.target.value }))} /></Field>
      </div>
      <footer className="modal-actions"><button type="button" className="secondary" onClick={onClose}>取消</button><button type="submit" className="primary">保存校正</button></footer>
    </form>
  </Modal>
}
