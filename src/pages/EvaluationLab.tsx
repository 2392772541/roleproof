import { AlertTriangle, CheckCircle2, FlaskConical, Quote, Target } from 'lucide-react'
import { evaluationCases } from '../data/evaluationData'
import { requirementLabels } from '../components/labels'
import { parseJD } from '../lib/engine'

const normalized = (value: string) => value.toLowerCase().replace(/\s+/g, '')

export function EvaluationLab() {
  const results = evaluationCases.map((item) => {
    const parsed = parseJD(item.id, item.jd)
    const parsedText = normalized(parsed.map((requirement) => requirement.text).join(' '))
    const coveredTerms = item.expectedTerms.filter((term) => parsedText.includes(normalized(term)))
    const kindHits = item.expectedKinds.filter((kind, index) => parsed[index]?.kind === kind).length
    const exactQuotes = parsed.filter((requirement) => item.jd.includes(requirement.text)).length
    return { item, parsed, coveredTerms, kindHits, exactQuotes }
  })

  const totalTerms = results.reduce((sum, result) => sum + result.item.expectedTerms.length, 0)
  const coveredTerms = results.reduce((sum, result) => sum + result.coveredTerms.length, 0)
  const totalRequirements = results.reduce((sum, result) => sum + result.parsed.length, 0)
  const kindHits = results.reduce((sum, result) => sum + result.kindHits, 0)
  const exactQuotes = results.reduce((sum, result) => sum + result.exactQuotes, 0)
  const termCoverage = Math.round(coveredTerms / totalTerms * 100)
  const kindAccuracy = Math.round(kindHits / totalRequirements * 100)
  const quoteTraceability = Math.round(exactQuotes / totalRequirements * 100)
  const unsupportedAdditions = totalRequirements - exactQuotes

  return <>
    <section className="section-intro compact"><div><span className="section-kicker">03 / Evaluation Lab</span><h1>不说“AI 很准”，<br />直接展示<strong>固定样本、评分规则和 Bad Case。</strong></h1><p>以下结果由浏览器实时调用当前 Rule Mode 计算，不是手填业务指标。样本与人工标签由项目作者构造，只用于回归和方法演示。</p></div></section>
    <section className="truth-banner panel"><FlaskConical size={22}/><div><strong>评测边界</strong><p>这不是线上大模型成绩，也不代表真实用户效果。它验证的是当前离线解析器能否保留原文、覆盖预期术语并正确分类；后续接入模型 Adapter 时，沿用同一数据结构做版本对比。</p></div></section>
    <section className="eval-metrics">
      <Metric icon={Target} label="术语覆盖率" value={`${termCoverage}%`} note={`${coveredTerms}/${totalTerms} 个人工期望术语被保留`} />
      <Metric icon={CheckCircle2} label="分类准确率" value={`${kindAccuracy}%`} note={`${kindHits}/${totalRequirements} 条类型与人工标签一致`} />
      <Metric icon={Quote} label="原文可追溯" value={`${quoteTraceability}%`} note={`${exactQuotes}/${totalRequirements} 条为 JD 原句`} />
      <Metric icon={AlertTriangle} label="无依据新增" value={String(unsupportedAdditions)} note="解析器未补写 JD 中不存在的要求" />
    </section>
    <section className="panel eval-panel"><div className="panel-heading"><div><h2>固定回归集</h2><p>每次修改解析规则后，重新计算并检查错误类型，而不是只看几个成功例子。</p></div></div><div className="eval-list">{results.map(({ item, parsed, coveredTerms: hits, kindHits: correct }) => <article className="eval-case" key={item.id}><header><span>{item.id} · {item.sourceType}</span><strong>{item.title}</strong><p>{item.jd}</p></header><div className="eval-summary"><span className={hits.length === item.expectedTerms.length ? 'pass' : 'warn'}>术语 {hits.length}/{item.expectedTerms.length}</span><span className={correct === parsed.length ? 'pass' : 'warn'}>分类 {correct}/{parsed.length}</span><span className="neutral">原句 {parsed.filter((entry) => item.jd.includes(entry.text)).length}/{parsed.length}</span></div><div className="eval-requirements">{parsed.map((requirement, index) => <div key={requirement.id}><span>{String(index + 1).padStart(2, '0')}</span><p>{requirement.text}</p><em className={requirement.kind === item.expectedKinds[index] ? 'pass' : 'warn'}>{requirementLabels[requirement.kind]} → 期望 {requirementLabels[item.expectedKinds[index]]}</em></div>)}</div></article>)}</div></section>
    <section className="panel eval-backlog"><div><AlertTriangle size={19}/><div><strong>从 Bad Case 得出的下一步</strong><p>当前主要缺陷不是漏掉原文，而是“引用校验、拒答、隐私、内容可信、人工审核”等语义会被规则误分。下一版应补充领域 taxonomy，并用模型 Adapter + 结构化 Schema 做对照实验。</p></div></div><ol><li>新增可信 AI、治理与人工审核词表，先修复可解释的规则基线。</li><li>保存 Prompt、模型、知识和工具版本，避免不同实验不可复现。</li><li>邀请 3–5 位真实求职者校正标签，区分作者标签与用户共识。</li><li>新增 requirement-level precision、人工修改率、延迟与调用成本。</li></ol></section>
  </>
}

function Metric({ icon: Icon, label, value, note }: { icon: typeof Target; label: string; value: string; note: string }) {
  return <div className="panel eval-metric"><Icon size={18}/><small>{label}</small><strong>{value}</strong><p>{note}</p></div>
}
