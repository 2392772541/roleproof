import type { View } from '../App'

export const jobViews: View[] = ['detail', 'match', 'portfolio', 'interview']
const paths: Partial<Record<View, string>> = { dashboard: '/home', intelligence: '/jobs', evidence: '/evidence', project: '/about', evaluation: '/evaluation' }
const steps: Record<string, View> = { requirements: 'detail', evidence: 'match', materials: 'portfolio', interview: 'interview' }
export function routeFor(view: View, jobId: string): string {
  return `#${paths[view] ?? `/jobs/${encodeURIComponent(jobId)}/${Object.keys(steps).find((key) => steps[key] === view) ?? 'requirements'}`}`
}
export function parseRoute(hash: string): { view: View; jobId?: string; invalid?: boolean } {
  const path = hash.replace(/^#/, '') || '/home'
  const view = (Object.entries(paths).find(([, value]) => value === path)?.[0]) as View | undefined
  if (view) return { view }
  const match = /^\/jobs\/([^/]+)\/(requirements|evidence|materials|interview)$/.exec(path)
  if (match) {
    try { return { view: steps[match[2]], jobId: decodeURIComponent(match[1]) } } catch { /* malformed URL */ }
  }
  return { view: 'dashboard', invalid: true }
}
