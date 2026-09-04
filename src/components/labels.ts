import type { Requirement } from '../domain/types'
export const requirementLabels: Record<Requirement['kind'], string> = {
  must: '硬性要求', nice: '加分项', responsibility: '岗位职责', ai: 'AI 能力', product: '产品能力', domain: '行业经验',
}
