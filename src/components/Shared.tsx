import { ChevronRight } from 'lucide-react'
export function PanelHeading({ title, subtitle, action, onAction }: { title: string; subtitle: string; action?: string; onAction?: () => void }) {
  return <div className="panel-heading"><div><h2>{title}</h2><p>{subtitle}</p></div>{action && <button className="text-link" onClick={onAction}>{action}<ChevronRight size={14} /></button>}</div>
}

export function StatusBadge({ value }: { value: string }) {
  const cls = value === '面试中' ? 'success' : value === '已投递' ? 'violet' : value === '准备中' ? 'warning' : 'neutral'
  return <span className={`status-badge ${cls}`}><i />{value}</span>
}

