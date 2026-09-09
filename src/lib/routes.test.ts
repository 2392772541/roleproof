import { describe, expect, it } from 'vitest'
import { parseRoute, routeFor } from './routes'

describe('职位路由', () => {
  it('支持包含中文和斜杠的职位 ID，保留岗位上下文', () => {
    expect(parseRoute(routeFor('portfolio', '岗位/A 中文'))).toEqual({ view: 'portfolio', jobId: '岗位/A 中文' })
  })
  it('主页与职位步骤有不同的明确地址', () => {
    expect(parseRoute('')).toEqual({ view: 'dashboard' })
    expect(parseRoute('#/jobs/J002/interview')).toEqual({ view: 'interview', jobId: 'J002' })
    expect(parseRoute('#/jobs')).toEqual({ view: 'intelligence' })
  })
  it('未知路径和损坏编码不回退到另一个职位', () => {
    expect(parseRoute('#/jobs/%zz/requirements').invalid).toBe(true)
    expect(parseRoute('#/jobs/J001/unknown').invalid).toBe(true)
  })
})
